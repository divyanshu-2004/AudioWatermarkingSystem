import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  file?: File;
  base64?: string;
}

const AudioPlayer = ({ file, base64 }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (base64) {
      setAudioUrl(`data:audio/mpeg;base64,${base64}`);
    }
  }, [file, base64]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg border border-border">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
      />
      <Button
        size="sm"
        variant="ghost"
        onClick={togglePlay}
        className="hover:bg-primary/10"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <div className="flex-1 text-sm text-muted-foreground">
        {file?.name || "Audio preview"}
      </div>
    </div>
  );
};

export default AudioPlayer;
