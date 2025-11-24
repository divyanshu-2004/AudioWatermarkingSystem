#!/usr/bin/env python3
"""
Extract a secret audio previously embedded by `lsb_embed.py`.

This expects the secret was embedded using LSB steganography and that the carrier
and secret parameters (channels, sample rate) match or were used as in the carrier.
"""

import argparse
import os
import gzip
import json
import base64
import numpy as np
import soundfile as sf

try:
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.primitives import hashes
    from cryptography.fernet import Fernet, InvalidToken
    from cryptography.hazmat.backends import default_backend
    _HAS_CRYPTO = True
except Exception:
    _HAS_CRYPTO = False


def derive_fernet_key(password: bytes, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=390000,
        backend=default_backend(),
    )
    key = kdf.derive(password)
    return base64.urlsafe_b64encode(key)


def read_int16_wave(path: str):
    data, sr = sf.read(path, dtype='int16')
    if data.ndim == 1:
        data = data.reshape(-1, 1)
    return data, sr


def extract_bits_from_carrier(carrier: np.ndarray, lsb_bits: int, secret_bits_len: int = None):
    flat = carrier.flatten()
    u = flat.astype(np.uint16)
    # Extract lsb_bits
    if lsb_bits == 1:
        bits = (u & 1).astype(np.uint8)
    else:
        # extract lsb_bits into values per sample and then expand to bits
        values = (u & ((1 << lsb_bits) - 1)).astype(np.uint8)
        # convert each value to bits (big-endian inside the small field)
        bits = np.unpackbits(values.astype(np.uint8))
        # unpackbits produces 8 bits per value, we only need lsb_bits per value located at the end
        bits = bits.reshape(-1, 8)[:, -lsb_bits:].reshape(-1)

    if secret_bits_len is not None:
        bits = bits[:secret_bits_len]

    return bits


def bits_to_int16_array(bits: np.ndarray, channels: int):
    total_bits = bits.size
    if total_bits % 16 != 0:
        bits = np.pad(bits, (0, 16 - (total_bits % 16)), constant_values=0)
    bytes_arr = np.packbits(bits)
    u16 = bytes_arr.view(np.uint16)
    arr = u16.astype(np.int16)
    if channels > 1:
        arr = arr.reshape((-1, channels))
    else:
        arr = arr.reshape((-1, 1))
    return arr


def main():
    p = argparse.ArgumentParser(description='Extract secret audio from carrier')
    p.add_argument('watermarked', help='Watermarked carrier file (wav)')
    p.add_argument('out_secret', help='Output extracted secret wav file')
    p.add_argument('--lsb', type=int, default=1, help='LSB bits used during embedding')
    p.add_argument('--secret-samples', type=int, default=0, help='(Optional) number of secret frames to extract. If omitted, extracts as much as capacity allows and trims padded zeros.')
    p.add_argument('--password', type=str, default=None, help='Password to decrypt the embedded payload (if it was encrypted)')
    args = p.parse_args()

    carrier, sr = read_int16_wave(args.watermarked)
    channels = carrier.shape[1]
    bits = extract_bits_from_carrier(carrier, args.lsb)

    # Convert bits back to bytes
    # Trim to full bytes
    nbits = bits.size
    pad = (8 - (nbits % 8)) % 8
    if pad:
        bits = np.pad(bits, (0, pad), constant_values=0)
    byte_arr = np.packbits(bits)
    final_bytes = byte_arr.tobytes()

    # If password supplied, assume encrypted and first 16 bytes are salt
    if args.password:
        if not _HAS_CRYPTO:
            raise SystemExit('cryptography package is required to decrypt; add it to python-requirements.txt')
        if len(final_bytes) < 17:
            raise SystemExit('Embedded payload too small to contain salt + token')
        salt = final_bytes[:16]
        token = final_bytes[16:]
        key = derive_fernet_key(args.password.encode('utf-8'), salt)
        f = Fernet(key)
        try:
            payload = f.decrypt(token)
        except Exception as e:
            raise SystemExit(f'Failed to decrypt payload: {e}')
    else:
        payload = final_bytes

    # Attempt decompression (if compressed). If not compressed, this will raise and we fallback.
    try:
        payload2 = gzip.decompress(payload)
    except Exception:
        payload2 = payload

    if len(payload2) < 4:
        raise SystemExit('Payload too small to contain header')

    header_len = int.from_bytes(payload2[:4], 'big')
    header_json = payload2[4:4 + header_len]
    meta = json.loads(header_json.decode('utf-8'))
    secret_bytes = payload2[4 + header_len:]

    # Build numpy array
    arr = np.frombuffer(secret_bytes, dtype=np.int16)
    channels_meta = int(meta.get('channels', channels))
    frames = int(meta.get('frames', arr.size // channels_meta))
    if channels_meta > 1:
        arr = arr.reshape((frames, channels_meta))
    else:
        arr = arr.reshape((frames, 1))

    out_dir = os.path.dirname(args.out_secret)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)

    out_sr = int(meta.get('sr', sr))
    sf.write(args.out_secret, arr, out_sr, subtype='PCM_16', format='WAV')
    print(f'Extracted secret to {args.out_secret} (sr={out_sr}, channels={channels_meta}, frames={frames})')


if __name__ == '__main__':
    main()
