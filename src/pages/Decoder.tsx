import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  ArrowLeft,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import AudioPlayer from "@/components/AudioPlayer";

const Decoder = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [passkey, setPasskey] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    valid: boolean;
    extractedAudioUrl?: string;
    message: string;
  } | null>(null);

  // Convert File → Base64 Payload (matching Encoder)
  const fileToBase64Payload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDecode2 = async () => {
    if (!uploadedFile || !passkey.trim()) {
      toast({
        title: "Error",
        description: "Upload file and enter passkey.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(20);
    setResult(null);

    try {
      const uploadedPayload = await fileToBase64Payload(uploadedFile);
      setProgress(50);

      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith("audio_")
      );
      let match = null;

      for (const key of keys) {
        const stored = JSON.parse(localStorage.getItem(key)!);
        if (stored.main === uploadedPayload) {
          match = stored;
          break;
        }
      }

      if (!match) {
        setResult({
          valid: false,
          message: "❌ Audio does not match stored file.",
        });
        toast({
          title: "Failed",
          description: "The file is not decoded and corrupt",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      if (match.passkey !== passkey.trim()) {
        setResult({
          valid: false,
          message:
            "❌ Incorrect audio encoding or passkey causing audio corrupt",
        });
        toast({
          title: "Corrupt Audio",
          description:
            " Incorrect audio encoding or passkey causing audio corrupt",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      const hiddenDataUrl = `data:audio/*;base64,${match.hidden}`;
      const blob = await fetch(hiddenDataUrl).then((r) => r.blob());
      const url = URL.createObjectURL(blob);

      setProgress(100);

      setResult({
        valid: true,
        extractedAudioUrl: url,
        message: "🎉 Hidden audio unlocked successfully!",
      });

      toast({ title: "Success!", description: "Audio decoded successfully." });
    } catch (error) {
      setResult({ valid: false, message: "Unexpected decoding error." });
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
        <div className="absolute top-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
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
            <Shield className="h-6 w-6 text-secondary" />
            <h1 className="font-bold">Decoder</h1>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10 space-y-6">
        <Card className="gradient-glass border-secondary/30 shadow-premium-lg">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-secondary bg-clip-text text-transparent">
              Upload & Decode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Uploaded Audio</label>
              <FileUpload
                accept="audio/*"
                onFileSelect={setUploadedFile}
                label="Upload encoded audio"
              />
              {uploadedFile && <AudioPlayer file={uploadedFile} />}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Passkey</label>
              <Input
                placeholder="Enter passkey..."
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="font-mono"
              />
            </div>

            {processing && <Progress value={progress} className="h-2" />}

            <Button
              onClick={handleDecode2}
              disabled={!uploadedFile || !passkey.trim() || processing}
              className="w-full gradient-secondary"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Decoding...
                </>
              ) : (
                "Start Decoding"
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card
            className={`gradient-glass ${
              result.valid ? "border-primary/50" : "border-destructive/50"
            } shadow-premium-xl animate-fade-in-up`}
          >
            <CardHeader>
              {result.valid ? (
                <CheckCircle2 className="h-6 w-6 text-primary inline mr-2" />
              ) : (
                <AlertCircle className="h-6 w-6 text-destructive inline mr-2" />
              )}
              <CardTitle className="inline text-2xl">
                {result.valid ? "Success" : "Failed"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm">{result.message}</p>
              {result.valid && result.extractedAudioUrl && (
                <>
                  <audio controls src={result.extractedAudioUrl} />
                  <Button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = result.extractedAudioUrl!;
                      a.download = "hidden-audio";
                      a.click();
                    }}
                    className="w-full gradient-primary"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Hidden Audio
                  </Button>
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
