import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Download,
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
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  // Convert File → Base64 Payload (ONLY raw bytes, no MIME)
  const fileToBase64Payload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const full = reader.result as string;
        resolve(full.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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
      const base64MainPayload = await fileToBase64Payload(mainAudio);
      setProgress(50);

      const base64HiddenPayload = await fileToBase64Payload(secretAudio);
      setProgress(80);

      const id = crypto.randomUUID();

      const data = {
        id,
        main: base64MainPayload,
        hidden: base64HiddenPayload,
        passkey,
        created: new Date().toISOString(),
      };

      localStorage.setItem(`audio_${id}`, JSON.stringify(data));

      // store original file for perfect download
      setOriginalUrl(URL.createObjectURL(mainAudio));
      setProgress(100);
      setResult({ id });

      toast({
        title: "Saved Successfully 🎉",
        description: "Audio pair stored in localStorage.",
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      </div>

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

      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10 space-y-6">
        <Card className="gradient-glass border-primary/30 shadow-premium-lg">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Upload Audio Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Main Audio</label>
                <FileUpload
                  accept="audio/*"
                  onFileSelect={setMainAudio}
                  label="Upload main audio"
                />
                {mainAudio && <AudioPlayer file={mainAudio} />}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Hidden Audio</label>
                <FileUpload
                  accept="audio/*"
                  onFileSelect={setSecretAudio}
                  label="Upload hidden audio"
                />
                {secretAudio && <AudioPlayer file={secretAudio} />}
              </div>
            </div>

            {processing && <Progress value={progress} className="h-2" />}

            {!result ? (
              <Button
                onClick={handleEncode2}
                disabled={!mainAudio || !secretAudio || processing}
                className="w-full gradient-primary hover:opacity-90 shadow-glow-primary"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Audio to Local Storage"
                )}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (!originalUrl || !mainAudio) return;
                  const a = document.createElement("a");
                  a.href = originalUrl;
                  a.download = mainAudio.name;
                  a.click();
                }}
                className="w-full gradient-secondary"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" /> Download Original Main
                Audio
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Encoder;
