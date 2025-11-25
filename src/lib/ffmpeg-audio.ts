import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

let ffmpegInstance: ReturnType<typeof createFFmpeg> | null = null;
let isLoaded = false;
async function getFFmpeg() {
  if (!ffmpegInstance) {
    ffmpegInstance = createFFmpeg({
      log: true,
      // corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
      corePath: "/ffmpeg-core/ffmpeg-core.js",
      wasmPath: "/ffmpeg-core/ffmpeg-core.wasm", // ADD THIS
    });

    // await ffmpegInstance.load();
  }

  if (!isLoaded) {
    console.log("FFmpeg loading…");
    await ffmpegInstance.load();
    isLoaded = true;
    console.log("FFmpeg loaded ✔");
  }

  return ffmpegInstance;
}

export async function mp3ToWav(mp3File: File | Blob): Promise<Blob> {
  const ffmpeg = await getFFmpeg();
  console.log("this is runnig")
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
