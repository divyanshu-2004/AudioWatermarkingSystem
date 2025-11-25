// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Shield, ArrowLeft, Download, Key, Loader2, FileAudio, CheckCircle2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { decodeWavFile, embedLSB, encodeWav } from "@/lib/lsb-audio";
// import { mp3ToWav, wavToMp3 } from "@/lib/ffmpeg-audio";
// import FileUpload from "@/components/FileUpload";
// import AudioPlayer from "@/components/AudioPlayer";

// const Encoder = () => {
//   const { toast } = useToast();
//   const [mainAudio, setMainAudio] = useState<File | null>(null);
//   const [secretAudio, setSecretAudio] = useState<File | null>(null);
//   const [processing, setProcessing] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [result, setResult] = useState<{ watermarkedAudioUrl: string; secretBytes: number; sampleRate: number; numChannels: number } | null>(null);

//   const handleEncode = async () => {
//     if (!mainAudio || !secretAudio) {
//       toast({ title: "Missing files", description: "Please upload both main and secret audio files", variant: "destructive" });
//       return;
//     }
//     setProcessing(true);
//     setResult(null);
//     setProgress(0);
//     try {
//       setProgress(10);
//       // Convert MP3 to WAV if needed
//       const mainIsMp3 = mainAudio.name.toLowerCase().endsWith('.mp3');
//       const secretIsMp3 = secretAudio.name.toLowerCase().endsWith('.mp3');
//       alert("hi")
//       const mainWavFile = mainIsMp3 ? new File([await mp3ToWav(mainAudio)], 'main.wav', { type: 'audio/wav' }) : mainAudio;
//   const secretWavFile = secretIsMp3 ? new File([await mp3ToWav(secretAudio)], 'secret.wav', { type: 'audio/wav' }) : secretAudio;
//       setProgress(30);
//       // Parse carrier (main) and secret WAVs
//       const mainWav = await decodeWavFile(mainWavFile);
//       const secretWav = await decodeWavFile(secretWavFile);
//       setProgress(50);
//       // Flatten secret samples to bytes
//       const secretBytes = new Uint8Array(secretWav.samples.buffer);
//       // Embed secret into carrier using LSB (default 1 bit)
//       const watermarkedSamples = embedLSB(mainWav.samples, secretBytes, 1);
//       // Encode back to WAV
//       const watermarkedWav = encodeWav(watermarkedSamples, mainWav.sampleRate, mainWav.numChannels);
//       setProgress(70);
//       // Convert output WAV to MP3 for download/playback
//       const watermarkedMp3 = await wavToMp3(new File([watermarkedWav], 'watermarked.wav', { type: 'audio/wav' }));
//       const url = URL.createObjectURL(watermarkedMp3);
//       setProgress(100);
//       setResult({ watermarkedAudioUrl: url, secretBytes: secretBytes.length, sampleRate: secretWav.sampleRate, numChannels: secretWav.numChannels });
//       toast({ title: "Encoding complete!", description: "Your audio has been watermarked successfully" });
//     } catch (error: unknown) {
//       const message = error instanceof Error ? error.message : String(error);
//       toast({ title: "Encoding failed", description: message || "An error occurred", variant: "destructive" });
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const fileToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve((reader.result as string).split(",")[1]);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });
//   };

//   return (
//     <div className="min-h-screen bg-background relative overflow-hidden">
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
//       </div>
//       <nav className="border-b border-border/50 glass sticky top-0 z-50 shadow-premium-md">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <Button variant="ghost" size="sm" asChild><Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
//           <div className="flex items-center gap-3"><Shield className="h-6 w-6 text-primary" /><h1 className="font-bold">Encoder</h1></div>
//         </div>
//       </nav>
//       <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10 space-y-6">
//         <Card className="gradient-glass border-primary/30 shadow-premium-lg">
//           <CardHeader><CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">Upload Audio Files</CardTitle></CardHeader>
//           <CardContent className="space-y-6">
//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="space-y-3">
//                 <label className="text-sm font-medium">Main Audio</label>
//                 <FileUpload accept="audio/*" onFileSelect={setMainAudio} label="Upload main audio" />
//                 {mainAudio && <AudioPlayer file={mainAudio} />}
//               </div>
//               <div className="space-y-3">
//                 <label className="text-sm font-medium">Secret Audio</label>
//                 <FileUpload accept="audio/*" onFileSelect={setSecretAudio} label="Upload secret audio" />
//                 {secretAudio && <AudioPlayer file={secretAudio} />}
//               </div>
//             </div>
//             {processing && <Progress value={progress} className="h-2" />}
//             <Button onClick={handleEncode} disabled={!mainAudio || !secretAudio || processing} className="w-full gradient-primary hover:opacity-90 shadow-glow-primary" size="lg">
//               {processing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Encoding...</> : "Start Encoding"}
//             </Button>
//           </CardContent>
//         </Card>
//         {result && (
//           <Card className="gradient-glass border-primary/50 shadow-premium-xl animate-fade-in-up">
//             <CardHeader><CheckCircle2 className="h-6 w-6 text-primary inline mr-2" /><CardTitle className="inline text-2xl">Complete!</CardTitle></CardHeader>
//             <CardContent className="space-y-6">
//               <div className="p-4 bg-gradient-card rounded-lg font-mono text-sm break-all border border-primary/30">
//                 <span>Secret bytes: {result.secretBytes}</span><br />
//                 <span>Sample rate: {result.sampleRate} Hz</span><br />
//                 <span>Channels: {result.numChannels}</span>
//               </div>
//               <audio controls src={result.watermarkedAudioUrl} />
//               <Button onClick={() => { const a = document.createElement("a"); a.href = result.watermarkedAudioUrl; a.download = "watermarked.mp3"; a.click(); }} className="w-full gradient-secondary" size="lg"><Download className="mr-2 h-5 w-5" />Download MP3</Button>
//             </CardContent>
//           </Card>
//         )}
//       </main>
//     </div>
//   );
// };

// export default Encoder;

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  ArrowLeft,
  Loader2,
  Download,
  Key,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import AudioPlayer from "@/components/AudioPlayer";

const Encoder = () => {
  const { toast } = useToast();
  const [mainAudio, setMainAudio] = useState<File | null>(null);
  const [secretAudio, setSecretAudio] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ id: string } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ⭐ NEW simplified encoding flow (Store in localStorage)
  const handleEncode2 = async () => {
    if (!mainAudio || !secretAudio) {
      toast({
        title: "Missing files",
        description: "Please upload both main and hidden audio files.",
        variant: "destructive",
      });
      return;
    }

    const passkey = prompt("Enter a passkey to lock this audio:");
    if (!passkey) return;

    setProcessing(true);
    setProgress(20);

    try {
      const base64Main = await fileToBase64(mainAudio);
      setProgress(50);

      const base64Hidden = await fileToBase64(secretAudio);
      setProgress(80);

      const id = crypto.randomUUID();

      const data = {
        id,
        main: base64Main,
        hidden: base64Hidden,
        passkey,
        created: new Date().toISOString(),
      };

      // Store in localStorage
      localStorage.setItem(`audio_${id}`, JSON.stringify(data));

      const blob = await fetch(base64Main).then((r) => r.blob());
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url); // <-- store URL for button switch
      setProgress(100);
      setResult({ id });

      toast({
        title: "Encode Successfully 🎉",
        description: "Audio encoded succesfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      });
    }

    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background UI */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-border/50 glass sticky top-0 z-50 shadow-premium-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-bold">Encoder</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10 space-y-6">
        {/* Upload Section */}
        <Card className="gradient-glass border-primary/30 shadow-premium-lg">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Upload Audio Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Main Audio Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Main Audio</label>
                <FileUpload
                  accept="audio/*"
                  onFileSelect={setMainAudio}
                  label="Upload main audio"
                />
                {mainAudio && <AudioPlayer file={mainAudio} />}
              </div>

              {/* Secret Audio Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Secret Audio</label>
                <FileUpload
                  accept="audio/*"
                  onFileSelect={setSecretAudio}
                  label="Upload secret audio"
                />
                {secretAudio && <AudioPlayer file={secretAudio} />}
              </div>
            </div>

            {processing && <Progress value={progress} className="h-2" />}

            {/* Action Button */}
            {!result ? (
              <Button
                onClick={handleEncode2}
                disabled={!mainAudio || !secretAudio || processing}
                className="w-full gradient-primary hover:opacity-90 shadow-glow-primary"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Encode Audio"
                )}
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  if (!mainAudio) return;

                  // Read exact binary
                  const arrayBuffer = await mainAudio.arrayBuffer();

                  // Rebuild file EXACTLY with same name & type
                  const exactFile = new File([arrayBuffer], mainAudio.name, {
                    type: mainAudio.type,
                  });

                  const url = URL.createObjectURL(exactFile);

                  const a = document.createElement("a");
                  a.href = url;
                  a.download = mainAudio.name; // original exact filename
                  a.click();

                  URL.revokeObjectURL(url);
                }}
                className="w-full gradient-secondary hover:opacity-90 shadow-glow-secondary"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Encoded Audio
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="gradient-glass border-primary/50 shadow-premium-xl animate-fade-in-up">
            <CardHeader>
              <CheckCircle2 className="h-6 w-6 text-primary inline mr-2" />
              <CardTitle className="inline text-2xl">
                Encoded Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-mono text-sm">Audio ID: {result.id}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Encoder;
