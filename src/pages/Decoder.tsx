import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Shield, ArrowLeft, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { decodeWavFile, extractLSB, encodeWav } from "@/lib/lsb-audio";
import { mp3ToWav, wavToMp3 } from "@/lib/ffmpeg-audio";
import FileUpload from "@/components/FileUpload";
import AudioPlayer from "@/components/AudioPlayer";

const Decoder = () => {
  const { toast } = useToast();
  const [watermarkedAudio, setWatermarkedAudio] = useState<File | null>(null);
  const [decodingKey, setDecodingKey] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ valid: boolean; extractedAudioUrl?: string; message: string } | null>(null);

  const handleDecode = async () => {
    if (!watermarkedAudio || !decodingKey.trim()) {
      toast({ title: "Missing information", description: "Upload audio and enter key (secret bytes)", variant: "destructive" });
      return;
    }
    setProcessing(true);
    setResult(null);
    setProgress(0);
    try {
      setProgress(20);
  // Convert MP3 to WAV if needed
  const isMp3 = watermarkedAudio.name.toLowerCase().endsWith('.mp3');
  const watermarkedWavFile = isMp3 ? new File([await mp3ToWav(watermarkedAudio)], 'watermarked.wav', { type: 'audio/wav' }) : watermarkedAudio;
  // Parse watermarked WAV
  const watermarkedWav = await decodeWavFile(watermarkedWavFile);
      setProgress(40);
      // Parse secretBytes from key (for now, user must enter the secret byte length)
      const secretBytes = parseInt(decodingKey.trim(), 10);
      if (isNaN(secretBytes) || secretBytes <= 0) throw new Error("Invalid secret bytes (key)");
      // Extract secret bytes
      const secret = extractLSB(watermarkedWav.samples, secretBytes, 1);
      // Convert to Int16Array
      const secretSamples = new Int16Array(secret.buffer);
  // Encode as WAV (assume mono, 44.1kHz for demo; could store meta in key)
  const secretWav = encodeWav(secretSamples, watermarkedWav.sampleRate, 1);
  // Convert output WAV to MP3 for download/playback
  const secretMp3 = await wavToMp3(new File([secretWav], 'secret.wav', { type: 'audio/wav' }));
  const url = URL.createObjectURL(secretMp3);
  setProgress(100);
  setResult({ valid: true, extractedAudioUrl: url, message: "Secret audio extracted successfully" });
  toast({ title: "Success!", description: "Secret audio extracted successfully" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setResult({ valid: false, message });
      toast({ title: "Decoding failed", description: message || "An error occurred", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
      </div>
      <nav className="border-b border-border/50 glass sticky top-0 z-50 shadow-premium-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild><Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
          <div className="flex items-center gap-3"><Shield className="h-6 w-6 text-secondary" /><h1 className="font-bold">Decoder</h1></div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10 space-y-6">
        <Card className="gradient-glass border-secondary/30 shadow-premium-lg">
          <CardHeader><CardTitle className="text-2xl bg-gradient-secondary bg-clip-text text-transparent">Upload & Decode</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Watermarked Audio</label>
              <FileUpload accept="audio/*" onFileSelect={setWatermarkedAudio} label="Upload audio" />
              {watermarkedAudio && <AudioPlayer file={watermarkedAudio} />}
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">Decoding Key</label>
              <Input placeholder="Enter key..." value={decodingKey} onChange={(e) => setDecodingKey(e.target.value)} className="font-mono" />
            </div>
            {processing && <Progress value={progress} className="h-2" />}
            <Button onClick={handleDecode} disabled={!watermarkedAudio || !decodingKey.trim() || processing} className="w-full gradient-secondary hover:opacity-90 shadow-glow-secondary" size="lg">
              {processing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Decoding...</> : "Start Decoding"}
            </Button>
          </CardContent>
        </Card>
        {result && (
          <Card className={`gradient-glass ${result.valid ? 'border-primary/50' : 'border-destructive/50'} shadow-premium-xl animate-fade-in-up`}>
            <CardHeader>{result.valid ? <CheckCircle2 className="h-6 w-6 text-primary inline mr-2" /> : <AlertCircle className="h-6 w-6 text-destructive inline mr-2" />}<CardTitle className="inline text-2xl">{result.valid ? "Success" : "Failed"}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">{result.message}</p>
              {result.valid && result.extractedAudioUrl && (
                <>
                  <audio controls src={result.extractedAudioUrl} />
                  <Button onClick={() => { const a = document.createElement("a"); a.href = result.extractedAudioUrl; a.download = "secret.mp3"; a.click(); }} className="w-full gradient-primary" size="lg"><Download className="mr-2 h-5 w-5" />Download Secret MP3</Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Decoder;
