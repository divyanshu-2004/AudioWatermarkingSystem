Audio processing helper (pydub + soundfile)

Files added
- `scripts/process_audio.py` - CLI script to resample, change channels, normalize and export audio using pydub for manipulation and soundfile for export.
- `python-requirements.txt` - Python deps for the script.

Quick setup
1. Install system dependencies:
   - ffmpeg (required by pydub for decoding/encoding common formats)
   - libsndfile (recommended for SoundFile/pysoundfile)

On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install ffmpeg libsndfile1
```

2. Create a virtualenv and install Python deps:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r python-requirements.txt
```

Examples

- Convert to WAV 16-bit, 16 kHz mono and normalize to -20 dBFS:

```bash
python3 scripts/process_audio.py input.mp3 output.wav --sr 16000 --channels 1 --bitdepth 16 --normalize -20
```

- Export as 32-bit float FLAC (note: FLAC typically is integer PCM; check your format/subtype support):

```bash
python3 scripts/process_audio.py input.wav output.flac --float --sr 44100
```

Notes and caveats
- pydub will rely on ffmpeg for reading many container formats (mp3, m4a, etc.)
- soundfile supports a number of formats and subtypes; if you need a specific PCM subtype (PCM_24 etc.), use `--bitdepth` or `--float`.
- This script is intentionally small and conservative. For heavy-duty processing (batching, streaming large files), consider chunked processing to avoid large memory usage.

If you want, I can:
- add a small unit test or smoke test that runs on a committed placeholder sample (if you add one),
- add batch processing support, or
- integrate this into a small Makefile/JS task that can be invoked from your project root.

LSB steganography tools
-----------------------

Two small scripts were added for an offline proof-of-concept to embed a secret WAV into a carrier WAV using least-significant-bit steganography:

- `scripts/lsb_embed.py carrier.wav secret.wav out_watermarked.wav [--lsb N]`
   - Embeds `secret.wav` into `carrier.wav`. The secret is resampled and channel-matched to the carrier if needed (requires ffmpeg for pydub).
   - Default `--lsb` is 1 (use 1 LSB bit per sample). Increasing `lsb` increases capacity but degrades audio quality.

- `scripts/lsb_extract.py watermarked.wav out_secret.wav [--lsb N] [--secret-samples M]`
   - Extracts the secret from the watermarked file. If you know the exact number of secret frames, pass `--secret-samples` to trim precisely.

Notes and limitations
- These are simple POCs. LSB steganography is fragile and will be destroyed by lossy recompression or format conversions.
- The tools assume PCM 16-bit output (WAV) for the watermarked file.
- If you need a more robust offline approach (compression, encryption, or audio-domain embedding), we can prototype echo-hiding or spread-spectrum embedding; that is more complex and will require additional testing.

Example
-------
1. Embed (carrier and secret can be common audio formats; secret will be converted to match carrier):

```bash
python3 scripts/lsb_embed.py carrier.wav secret.wav watermarked.wav --lsb 1
```

2. Extract:

```bash
python3 scripts/lsb_extract.py watermarked.wav extracted_secret.wav --lsb 1
```

Encryption and compression options
---------------------------------

The embed/extract tools support optional gzip compression and password-based encryption (Fernet).

- To compress the secret before embedding:

```bash
python3 scripts/lsb_embed.py carrier.wav secret.wav watermarked.wav --lsb 1 --compress
```

- To encrypt the compressed payload (password required):

```bash
python3 scripts/lsb_embed.py carrier.wav secret.wav watermarked.wav --lsb 1 --compress --encrypt --password "my-pass"
```

- To extract and decrypt:

```bash
python3 scripts/lsb_extract.py watermarked.wav extracted_secret.wav --lsb 1 --password "my-pass"
```

Notes:
- Encryption requires the `cryptography` Python package (added to `python-requirements.txt`).
- The script stores a small JSON header (frames/channels/sample-rate) before the payload so the extractor can reconstruct the raw PCM 16-bit samples.
- If you use encryption, the extractor expects the first 16 bytes of embedded payload to be the random salt used for PBKDF2.
