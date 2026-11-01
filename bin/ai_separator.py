import os
import sys

# Maximize multi-threading performance across all CPU cores
cpu_count = os.cpu_count() or 4
os.environ["OMP_NUM_THREADS"] = str(cpu_count)
os.environ["MKL_NUM_THREADS"] = str(cpu_count)
os.environ["OPENBLAS_NUM_THREADS"] = str(cpu_count)
os.environ["VECLIB_MAXIMUM_THREADS"] = str(cpu_count)
os.environ["NUMEXPR_NUM_THREADS"] = str(cpu_count)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import argparse
import shutil
import logging
import torch

try:
    torch.set_num_threads(cpu_count)
except Exception:
    pass

# Monkey-patch tqdm to stream fine-grained chunk progress to stdout
import tqdm
original_tqdm = tqdm.tqdm

class FormaLuxTqdm(original_tqdm):
    def update(self, n=1):
        res = super().update(n)
        if self.total and self.total > 0:
            pct = int((self.n / self.total) * 100)
            mapped = 20 + int(pct * 0.72)
            print(f"PROGRESS: {mapped}", flush=True)
            print(f"STATUS: عزل بالذكاء الاصطناعي مقطع {self.n} من {self.total}...", flush=True)
        return res

tqdm.tqdm = FormaLuxTqdm

def main():
    parser = argparse.ArgumentParser(description="FormaLux AI Vocal & Music Separator")
    parser.add_argument("--input", required=True, help="Input audio file path")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    parser.add_argument("--vocals-path", required=False, help="Explicit target path for vocals")
    parser.add_argument("--music-path", required=False, help="Explicit target path for music/instrumental")
    parser.add_argument("--model-dir", required=False, help="Path to models directory")
    parser.add_argument("--ffmpeg-dir", required=False, help="Directory containing ffmpeg.exe and ffprobe.exe")
    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    if args.ffmpeg_dir:
        ffmpeg_dir = os.path.abspath(args.ffmpeg_dir)
        os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

    # Locate model directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    default_model_dir = os.path.join(script_dir, "models")
    model_dir = os.path.abspath(args.model_dir) if args.model_dir else default_model_dir
    if not os.path.exists(model_dir):
        if os.path.exists("C:/tmp/audio-separator-models"):
            model_dir = "C:/tmp/audio-separator-models"

    print("PROGRESS: 5", flush=True)
    print("STATUS: جاري تهيئة محرك الذكاء الاصطناعي...", flush=True)

    from audio_separator.separator import Separator

    separator = Separator(
        model_file_dir=model_dir,
        output_dir=output_dir,
        output_format="MP3",
        log_level=logging.WARNING,
        mdx_params={
            'hop_length': 1024,
            'segment_size': 256,
            'overlap': 0.15,
            'batch_size': 1,
            'enable_denoise': False
        }
    )

    print("PROGRESS: 12", flush=True)
    print("STATUS: جاري تحميل موديل UVR-MDX-Net HQ...", flush=True)

    # UVR-MDX-NET-Inst_HQ_3: Top tier state-of-the-art AI separation (Vocals + Instrumental in one pass)
    model_name = "UVR-MDX-NET-Inst_HQ_3.onnx"
    separator.load_model(model_name)

    print("PROGRESS: 20", flush=True)
    print("STATUS: جاري تحليل الطيف الصوتي وعزل المسارات...", flush=True)

    # Perform AI separation
    outputs = separator.separate(input_path)

    print("PROGRESS: 94", flush=True)
    print("STATUS: جاري استخراج وحفظ الملفات النهائية...", flush=True)

    vocals_file = None
    inst_file = None

    for fname in outputs:
        full = os.path.join(output_dir, fname)
        if "(Vocals)" in fname:
            vocals_file = full
        elif "(Instrumental)" in fname:
            inst_file = full

    base_name = os.path.splitext(os.path.basename(input_path))[0]
    target_vocals = os.path.abspath(args.vocals_path) if args.vocals_path else os.path.join(output_dir, f"{base_name} - الصوت فقط.mp3")
    target_music = os.path.abspath(args.music_path) if args.music_path else os.path.join(output_dir, f"{base_name} - الموسيقى فقط.mp3")

    if vocals_file and os.path.exists(vocals_file):
        if os.path.exists(target_vocals):
            try:
                os.remove(target_vocals)
            except Exception:
                pass
        shutil.move(vocals_file, target_vocals)

    if inst_file and os.path.exists(inst_file):
        if os.path.exists(target_music):
            try:
                os.remove(target_music)
            except Exception:
                pass
        shutil.move(inst_file, target_music)

    print("PROGRESS: 100", flush=True)
    print("STATUS: اكتمل العزل بنجاح", flush=True)
    print(f"VOCALS_OUT: {target_vocals}", flush=True)
    print(f"MUSIC_OUT: {target_music}", flush=True)

if __name__ == "__main__":
    main()
