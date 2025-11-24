import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Unlock, Zap, Brain, Key, Radio, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Navigation */}
      <nav className="border-b border-border/50 glass sticky top-0 z-50 shadow-premium-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-smooth" />
                <Shield className="h-7 w-7 text-primary relative z-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  AudioGuard
                </h1>
                <p className="text-xs text-muted-foreground">Smart Watermarking</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" asChild className="hover:bg-primary/10 transition-smooth">
                <Link to="/encode">
                  <Lock className="h-4 w-4 mr-2" />
                  Encoder
                </Link>
              </Button>
              <Button variant="ghost" asChild className="hover:bg-secondary/10 transition-smooth">
                <Link to="/decode">
                  <Unlock className="h-4 w-4 mr-2" />
                  Decoder
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Hero Section */}
          <div className="text-center space-y-8 animate-fade-in-up">
            <Badge className="gradient-primary px-4 py-2 text-sm font-semibold shadow-glow-primary">
              <Sparkles className="h-3 w-3 mr-2 inline" />
              Next-Gen Audio Protection
            </Badge>
            
            <div className="space-y-6">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-30 animate-pulse-glow" />
                <div className="relative p-8 bg-gradient-glass rounded-3xl shadow-premium-xl">
                  <Shield className="h-20 w-20 text-primary drop-shadow-2xl" />
                </div>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold">
                <span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-lg">
                  AudioGuard
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Revolutionary AI-powered audio watermarking system. Securely embed and extract 
                <span className="text-primary font-semibold"> hidden audio signatures </span>
                with military-grade encryption and reversible technology.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Badge variant="outline" className="px-4 py-2 glass border-primary/30">
                <Brain className="h-4 w-4 mr-2 text-primary" />
                AI-Powered
              </Badge>
              <Badge variant="outline" className="px-4 py-2 glass border-secondary/30">
                <Zap className="h-4 w-4 mr-2 text-secondary" />
                Lightning Fast
              </Badge>
              <Badge variant="outline" className="px-4 py-2 glass border-accent/30">
                <Key className="h-4 w-4 mr-2 text-accent" />
                Secure Keys
              </Badge>
              <Badge variant="outline" className="px-4 py-2 glass border-success/30">
                <Radio className="h-4 w-4 mr-2 text-success" />
                Lossless Quality
              </Badge>
            </div>
          </div>

          {/* Main Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="gradient-glass border-border/50 hover:border-primary/50 hover-lift shadow-premium-lg group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-smooth" />
              <CardContent className="p-10 space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="relative w-fit">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-smooth" />
                    <div className="relative p-4 bg-gradient-card rounded-2xl shadow-premium-md">
                      <Lock className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                      Audio Encoder
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Upload two audio files and leverage <span className="text-primary font-medium">OpenAI Whisper</span> for 
                      transcription. Embed the transcript as an encrypted, reversible watermark with a unique decoding key.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-lg mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">AI Transcription</p>
                      <p className="text-xs text-muted-foreground">Whisper-powered speech-to-text</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-lg mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Secure Embedding</p>
                      <p className="text-xs text-muted-foreground">SHA-256 encrypted watermarks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-lg mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Key Generation</p>
                      <p className="text-xs text-muted-foreground">Unique decoding credentials</p>
                    </div>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full gradient-primary hover:opacity-90 transition-smooth shadow-glow-primary text-base font-semibold">
                  <Link to="/encode">
                    Start Encoding
                    <Lock className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="gradient-glass border-border/50 hover:border-secondary/50 hover-lift shadow-premium-lg group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-5 transition-smooth" />
              <CardContent className="p-10 space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="relative w-fit">
                    <div className="absolute inset-0 bg-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-smooth" />
                    <div className="relative p-4 bg-gradient-card rounded-2xl shadow-premium-md">
                      <Unlock className="h-10 w-10 text-secondary" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold mb-2 bg-gradient-secondary bg-clip-text text-transparent">
                      Audio Decoder
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Upload watermarked audio with its decoding key. Extract the hidden watermark, validate authenticity, 
                      and <span className="text-secondary font-medium">reconstruct the original</span> secret audio using AI synthesis.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-secondary/10 rounded-lg mt-0.5">
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Watermark Extraction</p>
                      <p className="text-xs text-muted-foreground">Decode embedded signatures</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-secondary/10 rounded-lg mt-0.5">
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Key Validation</p>
                      <p className="text-xs text-muted-foreground">Verify authenticity & integrity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-secondary/10 rounded-lg mt-0.5">
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">AI Reconstruction</p>
                      <p className="text-xs text-muted-foreground">TTS-powered audio synthesis</p>
                    </div>
                  </div>
                </div>

                <Button asChild size="lg" variant="secondary" className="w-full hover:bg-secondary/80 transition-smooth shadow-premium-md text-base font-semibold">
                  <Link to="/decode">
                    Start Decoding
                    <Unlock className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Technical Overview */}
          <Card className="gradient-glass border-primary/30 shadow-premium-xl overflow-hidden relative">
            <div className="absolute inset-0 shimmer" />
            <CardContent className="p-10 relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">How AudioGuard Works</h3>
                <p className="text-muted-foreground">Enterprise-grade watermarking pipeline</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4 group">
                  <div className="relative mx-auto w-fit">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-smooth" />
                    <div className="relative p-6 bg-gradient-card rounded-2xl shadow-premium-md">
                      <Brain className="h-12 w-12 text-primary mx-auto" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">AI Transcription</h4>
                    <p className="text-sm text-muted-foreground">
                      OpenAI Whisper converts secret audio to text with 95%+ accuracy across 99 languages
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-4 group">
                  <div className="relative mx-auto w-fit">
                    <div className="absolute inset-0 bg-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-smooth" />
                    <div className="relative p-6 bg-gradient-card rounded-2xl shadow-premium-md">
                      <Key className="h-12 w-12 text-secondary mx-auto" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-secondary mb-2">Secure Embedding</h4>
                    <p className="text-sm text-muted-foreground">
                      Transcript embedded as reversible metadata with SHA-256 hash verification
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-4 group">
                  <div className="relative mx-auto w-fit">
                    <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-smooth" />
                    <div className="relative p-6 bg-gradient-card rounded-2xl shadow-premium-md">
                      <Zap className="h-12 w-12 text-accent mx-auto" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-accent mb-2">AI Reconstruction</h4>
                    <p className="text-sm text-muted-foreground">
                      OpenAI TTS recreates the original audio from transcript with natural voice synthesis
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 glass mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built with <span className="text-primary">Lovable Cloud</span> • Powered by <span className="text-primary">OpenAI</span></p>
            <p className="mt-2">© 2024 AudioGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
