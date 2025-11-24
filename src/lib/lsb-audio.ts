// LSB audio steganography utility for browser (TypeScript)
// Supports PCM 16-bit WAV files (RIFF) for offline encode/decode in React
// Only works with uncompressed PCM WAVs (no MP3, no float PCM)

// Helper: parse a WAV file and return {samples, sampleRate, numChannels, ...}
export async function decodeWavFile(file: File | ArrayBuffer): Promise<{
  samples: Int16Array;
  sampleRate: number;
  numChannels: number;
  wavHeader: ArrayBuffer;
  dataOffset: number;
}> {
  const buf = file instanceof File ? await file.arrayBuffer() : file;
  const dv = new DataView(buf);
  // Check RIFF header
  if (dv.getUint32(0, false) !== 0x52494646) throw new Error('Not a RIFF file');
  if (dv.getUint32(8, false) !== 0x57415645) throw new Error('Not a WAVE file');
  // Find 'fmt ' and 'data' chunks
  let fmtOffset = 12;
  let dataOffset = -1;
  let fmtLen = 0;
  let numChannels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  while (fmtOffset < buf.byteLength) {
    const chunkId = dv.getUint32(fmtOffset, false);
    const chunkLen = dv.getUint32(fmtOffset + 4, true);
    if (chunkId === 0x666d7420) { // 'fmt '
      fmtLen = chunkLen;
      numChannels = dv.getUint16(fmtOffset + 10, true);
      sampleRate = dv.getUint32(fmtOffset + 12, true);
      bitsPerSample = dv.getUint16(fmtOffset + 22, true);
    }
    if (chunkId === 0x64617461) { // 'data'
      dataOffset = fmtOffset + 8;
      break;
    }
    fmtOffset += 8 + chunkLen;
  }
  if (dataOffset < 0) throw new Error('No data chunk found');
  if (bitsPerSample !== 16) throw new Error('Only 16-bit PCM supported');
  const samples = new Int16Array(buf, dataOffset, (buf.byteLength - dataOffset) / 2);
  return { samples, sampleRate, numChannels, wavHeader: buf.slice(0, dataOffset), dataOffset };
}

// Helper: encode Int16Array samples as a WAV file (returns ArrayBuffer)
export function encodeWav(samples: Int16Array, sampleRate: number, numChannels: number): ArrayBuffer {
  const blockAlign = numChannels * 2;
  const byteRate = sampleRate * blockAlign;
  const dataLen = samples.length * 2;
  const buf = new ArrayBuffer(44 + dataLen);
  const dv = new DataView(buf);
  // RIFF header
  dv.setUint32(0, 0x52494646, false); // 'RIFF'
  dv.setUint32(4, 36 + dataLen, true);
  dv.setUint32(8, 0x57415645, false); // 'WAVE'
  // fmt chunk
  dv.setUint32(12, 0x666d7420, false); // 'fmt '
  dv.setUint32(16, 16, true); // PCM fmt chunk size
  dv.setUint16(20, 1, true); // PCM format
  dv.setUint16(22, numChannels, true);
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, byteRate, true);
  dv.setUint16(32, blockAlign, true);
  dv.setUint16(34, 16, true); // bits per sample
  // data chunk
  dv.setUint32(36, 0x64617461, false); // 'data'
  dv.setUint32(40, dataLen, true);
  // PCM data
  new Int16Array(buf, 44).set(samples);
  return buf;
}

// LSB embed: embed secret bits into carrier samples (returns new Int16Array)
export function embedLSB(
  carrier: Int16Array,
  secret: Uint8Array,
  lsbBits = 1
): Int16Array {
  if (lsbBits < 1 || lsbBits > 8) throw new Error('lsbBits must be 1-8');
  const totalBits = carrier.length * lsbBits;
  if (secret.length * 8 > totalBits) throw new Error('Secret too large for carrier');
  const out = new Int16Array(carrier);
  let bitIdx = 0;
  for (let i = 0; i < out.length; ++i) {
    let sample = out[i];
    for (let b = 0; b < lsbBits; ++b) {
      const byteIdx = (bitIdx >> 3);
      const bitInByte = 7 - (bitIdx & 7);
      const bit = byteIdx < secret.length ? (secret[byteIdx] >> bitInByte) & 1 : 0;
      sample = (sample & ~(1 << b)) | (bit << b);
      bitIdx++;
    }
    out[i] = sample;
  }
  return out;
}

// LSB extract: extract secret bits from carrier samples (returns Uint8Array)
export function extractLSB(
  carrier: Int16Array,
  secretBytes: number,
  lsbBits = 1
): Uint8Array {
  const totalBits = secretBytes * 8;
  const bits = new Uint8Array(totalBits);
  let bitIdx = 0;
  for (let i = 0; i < carrier.length && bitIdx < totalBits; ++i) {
    for (let b = 0; b < lsbBits && bitIdx < totalBits; ++b) {
      const bit = (carrier[i] >> b) & 1;
      bits[bitIdx++] = bit;
    }
  }
  // Pack bits into bytes
  const out = new Uint8Array(secretBytes);
  for (let i = 0; i < totalBits; ++i) {
    out[i >> 3] |= bits[i] << (7 - (i & 7));
  }
  return out;
}
