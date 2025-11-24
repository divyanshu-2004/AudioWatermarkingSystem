#!/usr/bin/env python3
"""
Embed a secret audio file into a carrier audio file using simple LSB steganography.

This tool currently supports PCM 16-bit WAV files as the carrier output. It will resample
and convert the secret audio to match the carrier's sample rate and channels using pydub
if needed.

WARNING: LSB steganography is fragile and not robust to lossy compression or format changes.
It is intended for offline experiments and POCs only.
"""

import argparse
import gzip
import json
import math
import os
import secrets
import base64
from typing import Tuple

import numpy as np
import soundfile as sf
from pydub import AudioSegment

try:
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.primitives import hashes
    from cryptography.fernet import Fernet
    from cryptography.hazmat.backends import default_backend
    _HAS_CRYPTO = True
except Exception:
    _HAS_CRYPTO = False


def read_int16_wave(path: str) -> Tuple[np.ndarray, int]:
    data, sr = sf.read(path, dtype='int16')
    # Ensure shape is (frames, channels)
    if data.ndim == 1:
        data = data.reshape(-1, 1)
    return data, sr


def resample_and_match(secret_path: str, target_sr: int, target_channels: int) -> np.ndarray:
    seg = AudioSegment.from_file(secret_path)
    if seg.frame_rate != target_sr:
        seg = seg.set_frame_rate(target_sr)
    if seg.channels != target_channels:
        seg = seg.set_channels(target_channels)

    samples = seg.get_array_of_samples()
    arr = np.array(samples, dtype=np.int16)
    if target_channels > 1:
        arr = arr.reshape((-1, target_channels))
    else:
        arr = arr.reshape((-1, 1))
    return arr


def to_bitstream(secret: np.ndarray) -> np.ndarray:
    # secret is int16 array shape (n_frames, channels); flatten and convert to bytes
    flat = secret.flatten()
    # Convert to raw bytes (int16 little-endian)
    raw = flat.tobytes()
    arr = np.frombuffer(raw, dtype=np.uint8)
    bits = np.unpackbits(arr)
    return bits


def derive_fernet_key(password: bytes, salt: bytes) -> bytes:
    # PBKDF2 to derive 32-byte key and base64-url encode for Fernet
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=390000,
        backend=default_backend(),
    )
    key = kdf.derive(password)
    return base64.urlsafe_b64encode(key)


def bits_to_int16_array(bits: np.ndarray, channels: int) -> np.ndarray:
    # bits length should be multiple of 16
    total_bits = bits.size
    if total_bits % 16 != 0:
        bits = np.pad(bits, (0, 16 - (total_bits % 16)), constant_values=0)
    bytes_arr = np.packbits(bits)
    # view as uint16 little endian
    u16 = bytes_arr.view(np.uint16)
    arr = u16.astype(np.int16)
    if channels > 1:
        arr = arr.reshape((-1, channels))
    else:
        arr = arr.reshape((-1, 1))
    return arr


def embed_lsb(carrier: np.ndarray, secret_bits: np.ndarray, lsb_bits: int) -> np.ndarray:
    # carrier is int16 array shape (n_frames, channels)
    flat = carrier.flatten()
    total_carrier_samples = flat.size
    capacity_bits = total_carrier_samples * lsb_bits
    if secret_bits.size > capacity_bits:
        raise ValueError(f"Secret too large ({secret_bits.size} bits) for carrier capacity ({capacity_bits} bits). Reduce secret length or increase carrier size or reduce lsb_bits")

    # Work on unsigned view
    u = flat.astype(np.uint16)
    # Clear the lowest lsb_bits
    mask = (~((1 << lsb_bits) - 1)) & 0xFFFF
    u = u & mask

    # Prepare secret bits padded to capacity
    padded = np.zeros(capacity_bits, dtype=np.uint8)
    padded[: secret_bits.size] = secret_bits

    # Pack lsb_bits into samples
    if lsb_bits == 1:
        u = u | padded.astype(np.uint16)
    else:
        # For multiple bits per sample, reshape
        u = u.copy()
        chunks = padded.reshape((-1, lsb_bits))
        values = np.packbits(chunks, axis=1, bitorder='big')
        # Since lsb_bits <= 8 ideally, take last byte
        values = values[:, -1].astype(np.uint16)
        u[: values.size] = u[: values.size] | values

    # Convert back to int16
    out = u.astype(np.int16).reshape(carrier.shape)
    return out


def main():
    p = argparse.ArgumentParser(description='Embed secret audio into carrier using LSB')
    p.add_argument('carrier', help='Carrier audio file (wav recommended)')
    p.add_argument('secret', help='Secret audio file to embed')
    p.add_argument('out', help='Output watermarked wav file (PCM 16)')
    p.add_argument('--lsb', type=int, default=1, help='Number of least-significant bits to use per sample (1-4 recommended)')
    p.add_argument('--compress', action='store_true', help='Gzip compress the secret before embedding')
    p.add_argument('--encrypt', action='store_true', help='Encrypt the secret with a password (requires cryptography)')
    p.add_argument('--password', type=str, default=None, help='Password for encryption/decryption (required when --encrypt is used)')
    args = p.parse_args()

    if args.lsb < 1 or args.lsb > 8:
        raise SystemExit('lsb must be between 1 and 8')

    carrier, sr = read_int16_wave(args.carrier)
    secret, sr_s = read_int16_wave(args.secret)

    if sr != sr_s or carrier.shape[1] != secret.shape[1]:
        # Resample/convert secret to match carrier
        secret = resample_and_match(args.secret, sr, carrier.shape[1])

    # Build payload: header (json) + raw int16 bytes
    header = {
        'frames': int(secret.shape[0]),
        'channels': int(secret.shape[1]),
        'sr': int(sr),
        'dtype': 'int16',
    }
    header_json = json.dumps(header).encode('utf-8')
    header_len = len(header_json).to_bytes(4, 'big')
    raw_bytes = secret.flatten().tobytes()
    payload = header_len + header_json + raw_bytes

    if args.compress:
        payload = gzip.compress(payload)

    if args.encrypt:
        if not _HAS_CRYPTO:
            raise SystemExit('cryptography package is required for --encrypt; add it to python-requirements.txt')
        if not args.password:
            raise SystemExit('--password is required when --encrypt is used')
        salt = secrets.token_bytes(16)
        key = derive_fernet_key(args.password.encode('utf-8'), salt)
        f = Fernet(key)
        token = f.encrypt(payload)
        final_bytes = salt + token
    else:
        final_bytes = payload

    arr = np.frombuffer(final_bytes, dtype=np.uint8)
    secret_bits = np.unpackbits(arr)

    out = embed_lsb(carrier, secret_bits, args.lsb)

    # Ensure output dir
    out_dir = os.path.dirname(args.out)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)

    sf.write(args.out, out, sr, subtype='PCM_16', format='WAV')
    size_kb = len(final_bytes) / 1024.0
    print(f'Embedded secret into {args.out} (sr={sr}, channels={out.shape[1]}, lsb={args.lsb}, payload={size_kb:.1f} KB)')


if __name__ == '__main__':
    main()
