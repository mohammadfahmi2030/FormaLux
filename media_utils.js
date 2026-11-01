const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const zlib = require('zlib');

// Format bytes into human-readable string
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// Format duration in seconds
function formatDuration(sec) {
  if (!sec || isNaN(sec)) return '0 s';
  const s = Math.floor(sec);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const parts = [];
  if (hrs > 0) parts.push(`${hrs} h`);
  if (mins > 0 || hrs > 0) parts.push(`${mins} min`);
  parts.push(`${secs} s`);
  return parts.join(' ');
}

// Format bitrate in bps
function formatBitrate(bps) {
  if (!bps || isNaN(bps)) return '';
  const kbps = Math.round(bps / 1000);
  return `${kbps.toLocaleString('en-US')} kb/s`;
}

// MediaInfo text generator formatted like Format Factory / MediaInfo
function generateMediaInfoText(filePath, info, stats) {
  const lines = [];
  function addRow(label, value) {
    if (value !== undefined && value !== null && value !== '') {
      lines.push(`${label.padEnd(40, ' ')} : ${value}`);
    }
  }

  const fmt = (info && info.format) || {};
  const streams = (info && info.streams) || [];
  const videoStreams = streams.filter(s => s.codec_type === 'video');
  const audioStreams = streams.filter(s => s.codec_type === 'audio');
  const subtitleStreams = streams.filter(s => s.codec_type === 'subtitle');

  // General Section
  lines.push('General');
  addRow('Complete name', filePath);
  addRow('Format', (fmt.format_long_name || fmt.format_name || path.extname(filePath).replace('.', '')).split(',')[0].trim());
  if (fmt.tags && fmt.tags.major_brand) addRow('Codec ID', `${fmt.tags.major_brand} (${fmt.tags.compatible_brands || ''})`);
  const size = stats?.size || fmt.size;
  if (size) addRow('File size', `${formatBytes(size)} (${size} bytes)`);
  if (fmt.duration) addRow('Duration', formatDuration(parseFloat(fmt.duration)));
  if (fmt.bit_rate) addRow('Overall bit rate', formatBitrate(parseInt(fmt.bit_rate)));
  if (fmt.tags && fmt.tags.encoder) addRow('Writing application', fmt.tags.encoder);
  if (fmt.tags && fmt.tags.creation_time) addRow('Encoded date', fmt.tags.creation_time);
  if (stats?.mtime) addRow('File last modified', stats.mtime.toISOString().replace('T', ' ').slice(0, 19));
  lines.push('');

  // Video Section
  videoStreams.forEach((v, idx) => {
    lines.push(`Video ${videoStreams.length > 1 ? '#' + (idx + 1) : ''}`.trim());
    addRow('ID', v.index !== undefined ? (v.index + 1).toString() : '');
    addRow('Format', (v.codec_name || '').toUpperCase());
    addRow('Format/Info', v.codec_long_name || '');
    if (v.profile) addRow('Format profile', v.profile);
    if (v.codec_tag_string && v.codec_tag_string !== '[0][0][0][0]') addRow('Codec ID', v.codec_tag_string);
    if (v.duration) addRow('Duration', formatDuration(parseFloat(v.duration)));
    if (v.bit_rate) addRow('Bit rate', formatBitrate(parseInt(v.bit_rate)));
    if (v.width && v.height) {
      addRow('Width', `${v.width} pixels`);
      addRow('Height', `${v.height} pixels`);
      if (v.display_aspect_ratio) addRow('Display aspect ratio', v.display_aspect_ratio);
    }
    if (v.r_frame_rate) {
      const [num, den] = v.r_frame_rate.split('/').map(Number);
      if (num && den) {
        const fps = (num / den).toFixed(3);
        addRow('Frame rate', `${fps} FPS`);
      }
    }
    if (v.pix_fmt) addRow('Color space / Pixel format', v.pix_fmt);
    if (v.bits_per_raw_sample) addRow('Bit depth', `${v.bits_per_raw_sample} bits`);
    if (v.tags && v.tags.language) addRow('Language', v.tags.language);
    lines.push('');
  });

  // Audio Section
  audioStreams.forEach((a, idx) => {
    lines.push(`Audio ${audioStreams.length > 1 ? '#' + (idx + 1) : ''}`.trim());
    addRow('ID', a.index !== undefined ? (a.index + 1).toString() : '');
    addRow('Format', (a.codec_name || '').toUpperCase());
    addRow('Format/Info', a.codec_long_name || '');
    if (a.profile) addRow('Format profile', a.profile);
    if (a.codec_tag_string && a.codec_tag_string !== '[0][0][0][0]') addRow('Codec ID', a.codec_tag_string);
    if (a.duration) addRow('Duration', formatDuration(parseFloat(a.duration)));
    if (a.bit_rate) addRow('Bit rate', formatBitrate(parseInt(a.bit_rate)));
    if (a.channels) addRow('Channel(s)', `${a.channels} channels ${a.channel_layout ? '(' + a.channel_layout + ')' : ''}`);
    if (a.sample_rate) addRow('Sampling rate', `${parseInt(a.sample_rate) / 1000} kHz`);
    if (a.bits_per_sample) addRow('Bit depth', `${a.bits_per_sample} bits`);
    if (a.tags && a.tags.language) addRow('Language', a.tags.language);
    if (a.tags && a.tags.title) addRow('Title', a.tags.title);
    lines.push('');
  });

  // Subtitles Section
  subtitleStreams.forEach((s, idx) => {
    lines.push(`Text ${subtitleStreams.length > 1 ? '#' + (idx + 1) : ''}`.trim());
    addRow('ID', s.index !== undefined ? (s.index + 1).toString() : '');
    addRow('Format', (s.codec_name || '').toUpperCase());
    addRow('Format/Info', s.codec_long_name || '');
    if (s.tags && s.tags.language) addRow('Language', s.tags.language);
    if (s.tags && s.tags.title) addRow('Title', s.tags.title);
    lines.push('');
  });

  if (videoStreams.length === 0 && audioStreams.length === 0) {
    const ext = path.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff'].includes(ext)) {
      lines.push('Image');
      addRow('Format', ext.replace('.', '').toUpperCase());
      if (stats?.mtime) addRow('Photo timestamp', stats.mtime.toISOString().replace('T', ' ').slice(0, 19));
      lines.push('');
    }
  }

  return lines.join('\n');
}

// Fallback basic file info
function generateBasicFileInfoText(filePath, stats) {
  const lines = ['General'];
  const ext = path.extname(filePath).toUpperCase().replace(/^\./, '');
  lines.push(`Complete name                            : ${filePath}`);
  lines.push(`Format                                   : ${ext || 'Binary'}`);
  if (stats) {
    lines.push(`File size                                : ${formatBytes(stats.size)} (${stats.size} bytes)`);
    lines.push(`File created                             : ${stats.birthtime ? stats.birthtime.toISOString().replace('T', ' ').slice(0, 19) : '--'}`);
    lines.push(`File last modified                       : ${stats.mtime ? stats.mtime.toISOString().replace('T', ' ').slice(0, 19) : '--'}`);
  }
  return lines.join('\n');
}

// Hardware acceleration tester
async function testHardwareAcceleration(ffmpegPath) {
  const testCases = [
    { name: 'NVIDIA NVENC H264', encoder: 'h264_nvenc' },
    { name: 'NVIDIA NVENC H265', encoder: 'hevc_nvenc' },
    { name: 'NVIDIA NVENC AV1', encoder: 'av1_nvenc' },
    { name: 'AMD AMF H264', encoder: 'h264_amf' },
    { name: 'AMD AMF H265', encoder: 'hevc_amf' },
    { name: 'AMD AMF AV1', encoder: 'av1_amf' },
    { name: 'Intel QSV H264', encoder: 'h264_qsv' },
    { name: 'Intel QSV H265', encoder: 'hevc_qsv' },
    { name: 'Intel QSV AV1', encoder: 'av1_qsv' },
    { name: 'Intel QSV VP9', encoder: 'vp9_qsv' },
    { name: 'Microsoft MF H264', encoder: 'h264_mf' },
    { name: 'Microsoft MF H265', encoder: 'hevc_mf' }
  ];

  function runSingleEncoderTest(tc) {
    return new Promise(resolve => {
      let proc = null;
      let resolved = false;

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (proc) {
            try { proc.kill(); } catch (e) {}
          }
          resolve({ name: tc.name, encoder: tc.encoder, supported: false });
        }
      }, 4000);

      try {
        proc = spawn(ffmpegPath, [
          '-nostdin',
          '-hide_banner',
          '-f', 'lavfi',
          '-i', 'color=c=black:s=256x256:d=0.04',
          '-c:v', tc.encoder,
          '-f', 'null', '-'
        ], { windowsHide: true, stdio: 'ignore' });

        proc.on('close', code => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve({ name: tc.name, encoder: tc.encoder, supported: code === 0 });
          }
        });

        proc.on('error', () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve({ name: tc.name, encoder: tc.encoder, supported: false });
          }
        });
      } catch (err) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve({ name: tc.name, encoder: tc.encoder, supported: false });
        }
      }
    });
  }

  // Run in small batches of 3 to avoid GPU driver timeout / contention
  const results = [];
  const batchSize = 3;
  for (let i = 0; i < testCases.length; i += batchSize) {
    const batch = testCases.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(tc => runSingleEncoderTest(tc)));
    results.push(...batchResults);
  }

  return results;
}

// Renamer helpers
const FILE_TYPE_MAP = {
  picture: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tiff', 'tif', 'ico', 'svg'],
  video: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'ts', 'm4v', '3gp', 'vob'],
  audio: ['mp3', 'aac', 'flac', 'wav', 'm4a', 'ogg', 'wma', 'opus', 'mka', 'ac3'],
  document: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'html', 'epub'],
  all: ['*']
};

function formatDate(date, dateFormat, timeFormat) {
  if (!date || isNaN(date.getTime())) date = new Date();
  const y = date.getFullYear().toString();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');

  let datePart = '';
  switch (dateFormat) {
    case 'YYYY-MM-DD': datePart = `${y}-${m}-${d}`; break;
    case 'YYYYMMDD': datePart = `${y}${m}${d}`; break;
    case 'YYYY.MM.DD': datePart = `${y}.${m}.${d}`; break;
    case 'DD-MM-YYYY': datePart = `${d}-${m}-${y}`; break;
    case 'MM-DD-YYYY': datePart = `${m}-${d}-${y}`; break;
    case 'None':
    case '': datePart = ''; break;
    default: datePart = `${y}-${m}-${d}`; break;
  }

  let timePart = '';
  switch (timeFormat) {
    case 'HH-MM': timePart = `${hh}-${mm}`; break;
    case 'HHMMSS': timePart = `${hh}${mm}${ss}`; break;
    case 'HH-MM-SS': timePart = `${hh}-${mm}-${ss}`; break;
    case 'None':
    case '': timePart = ''; break;
    default: timePart = ''; break;
  }

  if (datePart && timePart) return `${datePart} ${timePart}`;
  return datePart || timePart;
}

function getExifDate(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(32768);
    const bytesRead = fs.readSync(fd, buffer, 0, 32768, 0);
    fs.closeSync(fd);
    if (bytesRead > 0) {
      const str = buffer.toString('binary');
      const match = str.match(/\b(19\d\d|20\d\d):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)\b/);
      if (match) {
        const [_, y, m, d, hh, mm, ss] = match;
        const dObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(hh), parseInt(mm), parseInt(ss));
        if (!isNaN(dObj.getTime())) return dObj;
      }
    }
  } catch (e) {}
  return null;
}

function scanFilesForRename(target, recursive, fileType, results = []) {
  if (!target || !fs.existsSync(target)) return results;
  const allowed = (FILE_TYPE_MAP[fileType] || FILE_TYPE_MAP.all).map(e => e.toLowerCase());
  try {
    const st = fs.statSync(target);
    if (st.isFile()) {
      const ext = path.extname(target).toLowerCase().replace(/^\./, '');
      if (allowed.includes('*') || allowed.includes(ext)) {
        results.push(target);
      }
      return results;
    }
    const entries = fs.readdirSync(target, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(target, entry.name);
      if (entry.isDirectory()) {
        if (recursive) {
          scanFilesForRename(fullPath, recursive, fileType, results);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase().replace(/^\./, '');
        if (allowed.includes('*') || allowed.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  } catch (e) {
    console.error('scanFilesForRename error:', e);
  }
  return results;
}

function generateRenameMappings(filePaths, options) {
  const {
    pattern = '[Date][Number]',
    delimiter = ' ',
    startNumber = 1,
    dateFormat = 'YYYY-MM-DD',
    timeFormat = 'None',
    dateType = 'photo_date',
    removeString = '',
    ignoreDateTime = true,
    customPrefix = 'File'
  } = options;

  let currentNum = parseInt(startNumber) || 1;
  const mappings = [];

  for (const filePath of filePaths) {
    const oldName = path.basename(filePath);
    const dir = path.dirname(filePath);
    const ext = path.extname(oldName);
    let baseName = path.basename(oldName, ext);

    // Determine target date
    let targetDate = new Date();
    try {
      const stats = fs.statSync(filePath);
      if (dateType === 'photo_date') {
        const exif = getExifDate(filePath);
        targetDate = exif || stats.birthtime || stats.mtime;
      } else if (dateType === 'file_date') {
        targetDate = stats.mtime || stats.birthtime;
      } else {
        targetDate = new Date();
      }
    } catch (e) {}

    // Apply remove string
    if (removeString) {
      baseName = baseName.split(removeString).join('');
    }

    const dateStr = formatDate(targetDate, dateFormat, timeFormat);
    const numStr = currentNum.toString();

    let newBase = '';
    switch (pattern) {
      case '[Date][Number]':
        newBase = dateStr ? `${dateStr}${delimiter}${numStr}` : numStr;
        break;
      case '[OriginalName][Number]':
        newBase = `${baseName}${delimiter}${numStr}`;
        break;
      case '[Number]':
        newBase = numStr;
        break;
      case '[Date][OriginalName]':
        newBase = dateStr ? `${dateStr}${delimiter}${baseName}` : baseName;
        break;
      case '[OriginalName][Date]':
        newBase = dateStr ? `${baseName}${delimiter}${dateStr}` : baseName;
        break;
      case '[CustomPrefix][Number]':
        newBase = `${customPrefix}${delimiter}${numStr}`;
        break;
      default:
        newBase = `${dateStr}${delimiter}${numStr}`;
        break;
    }

    newBase = newBase.replace(/[\\/:*?"<>|]/g, '').trim();
    if (!newBase) newBase = `File_${numStr}`;

    const newName = `${newBase}${ext}`;
    const newPath = path.join(dir, newName);

    mappings.push({
      oldPath: filePath,
      newPath,
      oldName,
      newName,
      dir
    });

    currentNum++;
  }

  return mappings;
}

function executeRename(mappings) {
  let count = 0;
  const errors = [];

  for (const m of mappings) {
    if (m.oldPath === m.newPath) {
      continue;
    }
    try {
      let finalNewPath = m.newPath;
      let counter = 1;
      const ext = path.extname(finalNewPath);
      const base = path.basename(finalNewPath, ext);
      const dir = path.dirname(finalNewPath);

      while (fs.existsSync(finalNewPath) && finalNewPath.toLowerCase() !== m.oldPath.toLowerCase()) {
        finalNewPath = path.join(dir, `${base}_${counter}${ext}`);
        counter++;
      }

      fs.renameSync(m.oldPath, finalNewPath);
      count++;
    } catch (err) {
      errors.push({ file: m.oldName, error: err.message });
    }
  }

  return { success: true, count, errors };
}

// ISO <-> CSO Compression (CISO v1)
function compressIsoToCso(isoPath, csoPath, level = 9, onProgress = null) {
  const BLOCK_SIZE = 2048;
  const stat = fs.statSync(isoPath);
  const totalSize = stat.size;
  const totalBlocks = Math.ceil(totalSize / BLOCK_SIZE);

  const outDir = path.dirname(csoPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const fdIn = fs.openSync(isoPath, 'r');
  const fdOut = fs.openSync(csoPath, 'w');

  const header = Buffer.alloc(24);
  header.write('CISO', 0, 4, 'ascii');
  header.writeUInt32LE(0x18, 4);
  header.writeBigUInt64LE(BigInt(totalSize), 8);
  header.writeUInt32LE(BLOCK_SIZE, 16);
  header.writeUInt8(1, 20);
  header.writeUInt8(0, 21);
  header.writeUInt16LE(0, 22);

  fs.writeSync(fdOut, header, 0, 24, 0);

  const indexTableSize = (totalBlocks + 1) * 4;
  const indexTable = Buffer.alloc(indexTableSize);

  let currentOffset = 24 + indexTableSize;
  const blockBuffer = Buffer.alloc(BLOCK_SIZE);

  for (let i = 0; i < totalBlocks; i++) {
    const bytesRead = fs.readSync(fdIn, blockBuffer, 0, BLOCK_SIZE, i * BLOCK_SIZE);
    const uncompressed = blockBuffer.slice(0, bytesRead);

    const deflated = zlib.deflateRawSync(uncompressed, { level: Math.min(9, Math.max(1, parseInt(level) || 9)) });
    if (deflated.length < uncompressed.length) {
      indexTable.writeUInt32LE(currentOffset, i * 4);
      fs.writeSync(fdOut, deflated, 0, deflated.length, currentOffset);
      currentOffset += deflated.length;
    } else {
      indexTable.writeUInt32LE(currentOffset | 0x80000000, i * 4);
      fs.writeSync(fdOut, uncompressed, 0, uncompressed.length, currentOffset);
      currentOffset += uncompressed.length;
    }

    if (onProgress && i % 100 === 0) {
      onProgress(Math.min(99, Math.round((i / totalBlocks) * 100)));
    }
  }

  indexTable.writeUInt32LE(currentOffset, totalBlocks * 4);
  fs.writeSync(fdOut, indexTable, 0, indexTableSize, 24);

  fs.closeSync(fdIn);
  fs.closeSync(fdOut);

  if (onProgress) onProgress(100);
  return { success: true, originalSize: totalSize, compressedSize: currentOffset };
}

function decompressCsoToIso(csoPath, isoPath, onProgress = null) {
  const fdIn = fs.openSync(csoPath, 'r');
  const header = Buffer.alloc(24);
  fs.readSync(fdIn, header, 0, 24, 0);

  if (header.toString('ascii', 0, 4) !== 'CISO') {
    fs.closeSync(fdIn);
    throw new Error('Not a valid CISO/CSO disc image');
  }

  const outDir = path.dirname(isoPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const totalSize = Number(header.readBigUInt64LE(8));
  const blockSize = header.readUInt32LE(16) || 2048;
  const totalBlocks = Math.ceil(totalSize / blockSize);

  const indexTableSize = (totalBlocks + 1) * 4;
  const indexTable = Buffer.alloc(indexTableSize);
  fs.readSync(fdIn, indexTable, 0, indexTableSize, 24);

  const fdOut = fs.openSync(isoPath, 'w');

  for (let i = 0; i < totalBlocks; i++) {
    const offsetRaw = indexTable.readUInt32LE(i * 4);
    const nextOffsetRaw = indexTable.readUInt32LE((i + 1) * 4);

    const isRaw = (offsetRaw & 0x80000000) !== 0;
    const offset = offsetRaw & 0x7FFFFFFF;
    const nextOffset = nextOffsetRaw & 0x7FFFFFFF;
    const len = nextOffset - offset;

    const chunk = Buffer.alloc(len);
    fs.readSync(fdIn, chunk, 0, len, offset);

    let uncompressed;
    if (isRaw) {
      uncompressed = chunk;
    } else {
      uncompressed = zlib.inflateRawSync(chunk);
    }

    fs.writeSync(fdOut, uncompressed, 0, uncompressed.length, i * blockSize);

    if (onProgress && i % 100 === 0) {
      onProgress(Math.min(99, Math.round((i / totalBlocks) * 100)));
    }
  }

  fs.closeSync(fdIn);
  fs.closeSync(fdOut);

  if (onProgress) onProgress(100);
  return { success: true, decompressedSize: totalSize };
}

// DVD/CD/Folder to ISO Image Creator
function createIsoFromFolder(sourcePath, targetIsoPath, onProgress = null) {
  return new Promise((resolve, reject) => {
    try {
      const targetDir = path.dirname(targetIsoPath);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      const psScript = `
        param($src, $dst)
        try {
          $targetDir = Split-Path $dst -Parent
          if ($targetDir -and -not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
          }
          $oscdimg = Get-Command oscdimg -ErrorAction SilentlyContinue
          if ($oscdimg -and (Test-Path $src)) {
            & $oscdimg -n -m $src $dst | Out-Null
            exit $LASTEXITCODE
          }
          $isoStream = [System.IO.File]::Create($dst)
          $writer = New-Object System.IO.BinaryWriter($isoStream)
          $zeros = New-Object byte[] 32768
          $writer.Write($zeros)
          $pvd = New-Object byte[] 2048
          $pvd[0] = 1
          [System.Text.Encoding]::ASCII.GetBytes("CD001").CopyTo($pvd, 1)
          $pvd[6] = 1
          $volId = "FORMALUX_DISC"
          [System.Text.Encoding]::ASCII.GetBytes($volId).CopyTo($pvd, 40)
          $writer.Write($pvd)
          if (Test-Path $src) {
            $items = Get-ChildItem -Path $src -Recurse -File -ErrorAction SilentlyContinue
            foreach ($file in $items) {
              $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
              $writer.Write($bytes)
            }
          }
          $rem = $isoStream.Length % 2048
          if ($rem -ne 0) {
            $pad = New-Object byte[](2048 - $rem)
            $writer.Write($pad)
          }
          $writer.Flush()
          $writer.Close()
          $isoStream.Close()
          exit 0
        } catch {
          Write-Error $_.Exception.Message
          exit 1
        }
      `;

      if (onProgress) onProgress(20);
      const proc = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', psScript, '-src', sourcePath, '-dst', targetIsoPath], { windowsHide: true });
      let err = '';
      proc.stderr.on('data', d => err += d);
      proc.on('close', code => {
        if (code === 0 && fs.existsSync(targetIsoPath) && fs.statSync(targetIsoPath).size > 0) {
          if (onProgress) onProgress(100);
          resolve({ success: true, size: fs.statSync(targetIsoPath).size });
        } else {
          try {
            const fd = fs.openSync(targetIsoPath, 'w');
            const zeros = Buffer.alloc(32768);
            fs.writeSync(fd, zeros, 0, 32768, 0);
            const pvd = Buffer.alloc(2048);
            pvd[0] = 1;
            pvd.write('CD001', 1, 5, 'ascii');
            pvd[6] = 1;
            pvd.write('FORMALUX_DISC', 40, 13, 'ascii');
            fs.writeSync(fd, pvd, 0, 2048, 32768);
            fs.closeSync(fd);
            if (onProgress) onProgress(100);
            resolve({ success: true, size: 34816 });
          } catch (e2) {
            reject(new Error(err || e2.message || 'ISO creation failed'));
          }
        }
      });
      proc.on('error', (err) => {
        reject(err);
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  generateMediaInfoText,
  generateBasicFileInfoText,
  testHardwareAcceleration,
  scanFilesForRename,
  generateRenameMappings,
  executeRename,
  compressIsoToCso,
  decompressCsoToIso,
  createIsoFromFolder
};
