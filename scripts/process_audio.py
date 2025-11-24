#!/usr/bin/env python3
"""
Simple audio processing CLI using pydub + soundfile.
Operations supported: convert format, resample, change channels, normalize, change bit depth.

Notes:
- pydub requires ffmpeg installed on your system for reading many formats.
- soundfile (pysoundfile) requires libsndfile installed for writing certain formats.

This script uses pydub for in-memory audio manipulation and soundfile for exporting
high-quality files with explicit subtypes.
"""

import argparse
import os
import math
from typing import Optional

import numpy as np
from pydub import AudioSegment
import soundfile as sf


def load_audio(path: str) -> AudioSegment:
    return AudioSegment.from_file(path)


def normalize_segment(seg: AudioSegment, target_dBFS: float = -20.0) -> AudioSegment:
    change = target_dBFS - seg.dBFS if seg.dBFS is not None else 0.0
    return seg.apply_gain(change)


def resample_segment(seg: AudioSegment, target_sr: int) -> AudioSegment:
    return seg.set_frame_rate(target_sr)


def set_channels(seg: AudioSegment, channels: int) -> AudioSegment:
    return seg.set_channels(channels)


def _audiosegment_to_numpy(seg: AudioSegment) -> np.ndarray:
    # returns float32 numpy array in range [-1.0, 1.0], shape (n_frames, channels)
    samples = seg.get_array_of_samples()
    arr = np.array(samples)
    channels = seg.channels
    if channels > 1:
        arr = arr.reshape((-1, channels))
    else:
        arr = arr.reshape((-1, 1))

    # convert integer PCM to float32
    sample_width = seg.sample_width  # bytes per sample
    max_val = float(2 ** (8 * sample_width - 1))
    arr = arr.astype('float32') / max_val
    return arr


def export_with_soundfile(seg: AudioSegment, out_path: str, subtype: Optional[str] = None, format: Optional[str] = None):
    arr = _audiosegment_to_numpy(seg)
    sr = seg.frame_rate

    # Infer format from extension if not provided
    if format is None:
        _, ext = os.path.splitext(out_path)
        format = ext.replace('.', '').upper() if ext else None

    sf.write(out_path, arr, sr, subtype=subtype, format=format)


def choose_subtype(bitdepth: Optional[int], float_fmt: bool = False) -> Optional[str]:
    if float_fmt:
        return 'FLOAT'
    if bitdepth is None:
        return None
    mapping = {
        16: 'PCM_16',
        24: 'PCM_24',
        32: 'PCM_32'
    }
    return mapping.get(bitdepth, None)


def parse_args():
    p = argparse.ArgumentParser(description='Process audio files with pydub + soundfile')
    p.add_argument('input', help='Input audio file')
    p.add_argument('output', help='Output audio file path')
    p.add_argument('--sr', type=int, help='Target sample rate, e.g. 16000')
    p.add_argument('--channels', type=int, choices=[1, 2], help='Target channels (1 or 2)')
    p.add_argument('--normalize', type=float, nargs='?', const=-20.0,
                   help='Normalize to target dBFS (default -20 dBFS if flag used without value)')
    p.add_argument('--bitdepth', type=int, choices=[16, 24, 32], help='PCM bit depth for output (uses soundfile subtype)')
    p.add_argument('--float', dest='float_fmt', action='store_true', help='Export as 32-bit float samples')
    p.add_argument('--format', type=str, help='Explicit format for soundfile (WAV, FLAC, etc)')
    return p.parse_args()


def main():
    args = parse_args()

    seg = load_audio(args.input)

    if args.normalize is not None:
        seg = normalize_segment(seg, args.normalize)

    if args.sr is not None:
        seg = resample_segment(seg, args.sr)

    if args.channels is not None:
        seg = set_channels(seg, args.channels)

    subtype = choose_subtype(args.bitdepth, args.float_fmt)

    # If user didn't specify format, infer from output extension
    fmt = args.format.upper() if args.format else None

    # Ensure output dir exists
    out_dir = os.path.dirname(args.output)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)

    export_with_soundfile(seg, args.output, subtype=subtype, format=fmt)
    print(f'Wrote {args.output} (sr={seg.frame_rate}, channels={seg.channels}, width={seg.sample_width*8} bits)')


if __name__ == '__main__':
    main()
