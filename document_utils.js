/**
 * FormaLux Converter - Document Processing Engine
 * High-performance, offline document conversion suite:
 * - PDF -> DOCX (Microsoft Word)
 * - PDF -> XLSX (Microsoft Excel)
 * - PDF -> TXT (Plain Text)
 * - DOCX -> PDF (Document to PDF)
 * - Pic -> PDF (Images to PDF)
 * - PDF -> Pic (PDF to Image pages)
 * - PDF Joiner (Merge multiple PDFs)
 * - PDF Compress (Optimize & minify PDF)
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { PDFParse } = require('pdf-parse');
const docx = require('docx');
const exceljs = require('exceljs');
const mammoth = require('mammoth');

/**
 * Extract clean text and page segments from PDF
 */
async function parsePdfText(pdfPath) {
  const bytes = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: bytes });
  try {
    const textRes = await parser.getText();
    return textRes.text || '';
  } finally {
    try { await parser.destroy(); } catch (_) {}
  }
}

/**
 * Convert PDF to Microsoft Word (.docx)
 */
async function convertPdfToDocx(srcPath, outputPath) {
  if (!fs.existsSync(srcPath)) throw new Error(`Source file does not exist: ${srcPath}`);
  const rawText = await parsePdfText(srcPath);

  const rawLines = rawText.split(/\r?\n/);
  const paragraphs = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      paragraphs.push(new docx.Paragraph({
        children: [],
        spacing: { after: 100 }
      }));
      continue;
    }

    // Ignore solitary page marker lines like "-- 1 of 5 --"
    if (/^--\s*\d+\s+of\s+\d+\s*--$/.test(trimmed)) {
      continue;
    }

    paragraphs.push(new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: trimmed,
          font: 'Segoe UI',
          size: 24 // 12pt font
        })
      ],
      spacing: { after: 120, line: 276 }
    }));
  }

  if (paragraphs.length === 0) {
    paragraphs.push(new docx.Paragraph({
      children: [
        new docx.TextRun({ text: 'No text extracted from document.', font: 'Segoe UI', size: 24 })
      ]
    }));
  }

  const doc = new docx.Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
        }
      },
      children: paragraphs
    }]
  });

  const buffer = await docx.Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  return { success: true, outputPath, size: buffer.length };
}

/**
 * Convert PDF to Microsoft Excel (.xlsx)
 */
async function convertPdfToExcel(srcPath, outputPath) {
  if (!fs.existsSync(srcPath)) throw new Error(`Source file does not exist: ${srcPath}`);
  const rawText = await parsePdfText(srcPath);

  const workbook = new exceljs.Workbook();
  workbook.creator = 'FormaLux Document Engine';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Extracted Sheet');
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let maxCols = 1;
  for (const line of lines) {
    if (/^--\s*\d+\s+of\s+\d+\s*--$/.test(line)) continue;

    // Detect column dividers: tabs, commas, semicolons, or 2+ consecutive spaces
    let cells;
    if (line.includes('\t')) {
      cells = line.split('\t').map(c => c.trim());
    } else if (line.includes(',') && line.split(',').length >= 2) {
      cells = line.split(',').map(c => c.trim());
    } else if (line.includes(';') && line.split(';').length >= 2) {
      cells = line.split(';').map(c => c.trim());
    } else {
      cells = line.split(/\s{2,}/).map(c => c.trim());
    }

    if (cells.length > maxCols) maxCols = cells.length;
    worksheet.addRow(cells);
  }

  if (worksheet.rowCount === 0) {
    worksheet.addRow(['No structured data extracted from PDF']);
  }

  // Adjust column widths automatically
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : '';
      if (val.length > maxLength) maxLength = Math.min(val.length + 3, 50);
    });
    column.width = maxLength;
  });

  await workbook.xlsx.writeFile(outputPath);
  return { success: true, outputPath };
}

/**
 * Convert PDF to Plain Text (.txt)
 */
async function convertPdfToText(srcPath, outputPath) {
  if (!fs.existsSync(srcPath)) throw new Error(`Source file does not exist: ${srcPath}`);
  const rawText = await parsePdfText(srcPath);
  fs.writeFileSync(outputPath, rawText, 'utf8');
  return { success: true, outputPath, length: rawText.length };
}

/**
 * Merge multiple PDFs into one combined PDF
 */
async function joinPdfs(inputPaths, outputPath) {
  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;

  for (const src of inputPaths) {
    if (!fs.existsSync(src)) continue;
    try {
      const bytes = fs.readFileSync(src);
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const indices = pdf.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(pdf, indices);
      copiedPages.forEach(p => mergedPdf.addPage(p));
      totalPages += copiedPages.length;
    } catch (e) {
      console.warn(`[DocumentEngine] Warning merging ${src}:`, e.message);
    }
  }

  if (totalPages === 0) {
    throw new Error('No valid pages found across the provided PDF files.');
  }

  const mergedBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedBytes);
  return { success: true, outputPath, totalPages };
}

/**
 * Compress / Optimize a PDF file
 */
async function compressPdf(srcPath, outputPath) {
  if (!fs.existsSync(srcPath)) throw new Error(`Source file does not exist: ${srcPath}`);
  const originalBytes = fs.readFileSync(srcPath);
  const pdf = await PDFDocument.load(originalBytes, { ignoreEncryption: true });

  const optimizedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false
  });

  // If optimized version is smaller, write it; otherwise write original
  if (optimizedBytes.length < originalBytes.length) {
    fs.writeFileSync(outputPath, optimizedBytes);
  } else {
    fs.writeFileSync(outputPath, originalBytes);
  }

  return { success: true, outputPath, savedBytes: Math.max(0, originalBytes.length - optimizedBytes.length) };
}

/**
 * Convert PDF pages to image file(s)
 */
async function convertPdfToPic(srcPath, outputPath) {
  if (!fs.existsSync(srcPath)) throw new Error(`Source file does not exist: ${srcPath}`);
  const bytes = fs.readFileSync(srcPath);
  const parser = new PDFParse({ data: bytes });

  try {
    const ss = await parser.getScreenshot({ imageBuffer: true });
    if (!ss.pages || ss.pages.length === 0) {
      throw new Error('No pages could be rendered from the PDF.');
    }

    const ext = path.extname(outputPath) || '.png';
    const baseNoExt = outputPath.slice(0, outputPath.length - ext.length);

    if (ss.pages.length === 1) {
      fs.writeFileSync(outputPath, Buffer.from(ss.pages[0].data));
    } else {
      ss.pages.forEach((page, idx) => {
        const pageTarget = idx === 0 ? outputPath : `${baseNoExt}_page_${idx + 1}${ext}`;
        fs.writeFileSync(pageTarget, Buffer.from(page.data));
      });
    }

    return { success: true, outputPath, pageCount: ss.pages.length };
  } finally {
    try { await parser.destroy(); } catch (_) {}
  }
}

/**
 * Convert Images to a single PDF
 */
async function convertImagesToPdf(imagePaths, outputPath, BrowserWindow) {
  const inputs = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  const validImages = inputs.filter(f => fs.existsSync(f));
  if (validImages.length === 0) throw new Error('No valid image files provided.');

  const pdfDoc = await PDFDocument.create();
  let embeddedCount = 0;

  for (const imgPath of validImages) {
    try {
      const ext = path.extname(imgPath).toLowerCase();
      const imgBytes = fs.readFileSync(imgPath);
      let img;

      if (ext === '.jpg' || ext === '.jpeg') {
        img = await pdfDoc.embedJpg(imgBytes);
      } else if (ext === '.png') {
        img = await pdfDoc.embedPng(imgBytes);
      }

      if (img) {
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height
        });
        embeddedCount++;
      }
    } catch (e) {
      console.warn(`[DocumentEngine] Direct embed failed for ${imgPath}:`, e.message);
    }
  }

  // If direct embedding succeeded for all images, save and return
  if (embeddedCount === validImages.length && embeddedCount > 0) {
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    return { success: true, outputPath, totalPages: embeddedCount };
  }

  // Fallback via BrowserWindow for webp, bmp, gif or other image formats
  if (BrowserWindow) {
    const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
    const imgHtml = validImages.map(f => {
      const u = 'file:///' + f.replace(/\\/g, '/').replace(/'/g, '%27');
      return `<div style="page-break-after:always;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:0;"><img src="${u}" style="max-width:100%;max-height:100%;object-fit:contain;" /></div>`;
    }).join('');

    await win.loadURL(`data:text/html;charset=utf-8,<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;">${imgHtml}</body></html>`);
    await new Promise(r => setTimeout(r, 600));
    const data = await win.webContents.printToPDF({ printBackground: true, margins: { marginType: 'none' } });
    win.destroy();
    fs.writeFileSync(outputPath, data);
    return { success: true, outputPath, totalPages: validImages.length };
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  return { success: true, outputPath, totalPages: embeddedCount };
}

/**
 * Convert Microsoft Word (.docx) to PDF
 */
async function convertDocxToPdf(srcPath, outputPath, BrowserWindow) {
  if (!fs.existsSync(srcPath)) throw new Error(`Source DOCX file does not exist: ${srcPath}`);
  if (!BrowserWindow) throw new Error('BrowserWindow required for rendering DOCX to PDF');

  const { value: htmlContent } = await mammoth.convertToHtml({ path: srcPath });

  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page {
          margin: 20mm;
          size: A4 portrait;
        }
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
          font-size: 13.5px;
          line-height: 1.6;
          color: #1e293b;
          padding: 0;
          margin: 0;
          background: #ffffff;
        }
        h1 { font-size: 24px; color: #0f172a; margin-top: 24px; margin-bottom: 12px; }
        h2 { font-size: 19px; color: #1e293b; margin-top: 20px; margin-bottom: 10px; }
        h3 { font-size: 16px; color: #334155; margin-top: 16px; margin-bottom: 8px; }
        p { margin: 0 0 12px 0; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
        th { background: #f8fafc; font-weight: 700; }
        img { max-width: 100%; height: auto; display: block; margin: 12px auto; }
        blockquote { border-left: 4px solid #3b82f6; margin: 12px 0; padding-left: 12px; color: #475569; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(styledHtml));
  await new Promise(r => setTimeout(r, 600));

  const pdfData = await win.webContents.printToPDF({
    printBackground: true,
    margins: { marginType: 'standard' }
  });
  win.destroy();

  fs.writeFileSync(outputPath, pdfData);
  return { success: true, outputPath };
}

module.exports = {
  convertPdfToDocx,
  convertPdfToExcel,
  convertPdfToText,
  joinPdfs,
  compressPdf,
  convertPdfToPic,
  convertImagesToPdf,
  convertDocxToPdf
};

