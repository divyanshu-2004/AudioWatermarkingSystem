import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

let ffmpegInstance: ReturnType<typeof createFFmpeg> | null = null;

async function getFFmpeg() {
  if (!ffmpegInstance) {
    ffmpegInstance = createFFmpeg({
      log: true,
      corePath: "https://unpkg.com/@ffmpeg/core@0.11.6/dist/ffmpeg-core.js",
    });

    await ffmpegInstance.load();
  }

  return ffmpegInstance;
}

export async function mp3ToWav(mp3File: File | Blob): Promise<Blob> {
  const ffmpeg = await getFFmpeg();
  ffmpeg.FS("writeFile", "input.mp3", await fetchFile(mp3File));

  await ffmpeg.run("-i", "input.mp3", "-ar", "44100", "-ac", "1", "-sample_fmt", "s16", "output.wav");

  const data = ffmpeg.FS("readFile", "output.wav");

  return new Blob([data.buffer], { type: "audio/wav" });
}

export async function wavToMp3(wavFile: File | Blob): Promise<Blob> {
  const ffmpeg = await getFFmpeg();
  ffmpeg.FS("writeFile", "input.wav", await fetchFile(wavFile));

  await ffmpeg.run("-i", "input.wav", "-codec:a", "libmp3lame", "-qscale:a", "2", "output.mp3");

  const data = ffmpeg.FS("readFile", "output.mp3");

  return new Blob([data.buffer], { type: "audio/mp3" });
}
