import { useEffect, useRef, useState } from "react";
import {
  Download,
  Loader2,
  Pause,
  PauseCircle,
  Play,
  PlayCircle,
  RefreshCcw,
  Repeat2,
  Rewind,
  Shuffle,
  Wand2,
} from "lucide-react";
import * as Tone from "tone";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "./components/button";
import { Slider } from "./components/slider";
import { Switch } from "./components/switch";
import { getAnalyser } from "@/audio/engine";

interface Props {
  onToggle: () => void;
  onStop: () => void;
  isPlaying: boolean;
  bpm: number;
  swing: number;
}

export const TransportBar = ({ onToggle, onStop, isPlaying, bpm, swing }: Props) => {
  const setBpm = useAppStore((state) => state.setBpm);
  const setSwing = useAppStore((state) => state.setSwing);
  const regenerate = useAppStore((state) => state.regenerate);
  const variation = useAppStore((state) => state.variation);
  const ui = useAppStore((state) => state.ui);
  const setApplyNextBar = useAppStore((state) => state.setApplyNextBar);
  const exportWav = useAppStore((state) => state.exportWav);
  const pauseTransport = useAppStore((state) => state.pause);
  const setStopPreviewPlayback = useAppStore((state) => state.setStopPreviewPlayback);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [previewState, setPreviewState] = useState<"idle" | "loading" | "ready" | "playing">("idle");
  const previewUrlRef = useRef<string | undefined>(undefined);
  const playerRef = useRef<Tone.Player | null>(null);
  const previewStateRef = useRef(previewState);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    previewStateRef.current = previewState;
  }, [previewState]);

  useEffect(() => {
    setStopPreviewPlayback(handleStopPreview);
    return () => {
      setStopPreviewPlayback(undefined);
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
        playerRef.current = null;
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [setStopPreviewPlayback]);

  const handleRenderPreview = async (autoPlay = false) => {
    if (previewState === "loading") return;
    setPreviewState("loading");
    try {
      if (isPlaying) {
        pauseTransport();
      }
      await Tone.start();
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
        playerRef.current = null;
      }
      const blob = await exportWav(48000, true);
      if (!blob) {
        setPreviewState("idle");
        return;
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      const player = new Tone.Player({
        url,
        autostart: autoPlay,
        loop: false,
        onload: () => setPreviewState(autoPlay ? "playing" : "ready"),
        onstop: () => setPreviewState(previewUrlRef.current ? "ready" : "idle"),
      });
      const analyser = getAnalyser();
      if (analyser) {
        const inputNode = (analyser as unknown as { input?: AudioNode }).input ?? analyser;
        player.connect(inputNode as unknown as AudioNode);
      }
      player.connect(Tone.Destination);
      playerRef.current = player;
      if (!autoPlay) {
        setPreviewState("ready");
      }
    } catch {
      setPreviewState("idle");
    }
  };

  const handleStopPreview = () => {
    if (playerRef.current) {
      playerRef.current.stop();
    }
    setPreviewState(previewUrl ? "ready" : "idle");
  };

  const handleTogglePreview = async () => {
    const player = playerRef.current;
    if (!player || !previewUrl) {
      await handleRenderPreview(true);
      return;
    }
    if (isPlaying) {
      pauseTransport();
    }
    if (previewState === "playing") {
      handleStopPreview();
    } else {
      try {
        await Tone.start();
        player.start();
        setPreviewState("playing");
      } catch {
        setPreviewState("ready");
      }
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 text-sm">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              handleStopPreview();
              onToggle();
            }}
            variant="default"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={onStop}>
            <Rewind className="h-4 w-4" />
          </Button>
          <div className="rounded-md border border-border/70 bg-card/60 px-3 py-2">
            <div className="text-[10px] uppercase text-muted-foreground">BPM</div>
            <div className="flex items-center gap-2">
              <Slider
                className="w-32"
                min={80}
                max={170}
                step={1}
                value={[bpm]}
                onValueChange={([val]) => setBpm(val)}
              />
              <span className="w-10 text-right text-xs">{bpm}</span>
            </div>
          </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-border/70 bg-card/60 px-3 py-2">
            <div className="text-[10px] uppercase text-muted-foreground">Swing</div>
            <div className="flex items-center gap-2">
              <Slider
                className="w-24"
                min={0}
                max={0.25}
                step={0.005}
                value={[swing]}
                onValueChange={([val]) => setSwing(val)}
              />
              <span className="w-8 text-right text-xs">{(swing * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border/70 bg-card/60 px-3 py-2">
            <div className="text-[10px] uppercase text-muted-foreground">Render preview</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRenderPreview(false)}
              disabled={previewState === "loading"}
              title="Re-render HQ preview"
            >
              {previewState === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant={previewUrl ? "default" : "secondary"}
              onClick={handleTogglePreview}
              disabled={previewState === "loading"}
              className="gap-1"
              title="Play/Pause rendered preview"
            >
              {previewState === "playing" ? (
                <PauseCircle className="h-4 w-4" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={!previewUrl || previewState === "loading"}
              onClick={() => {
                if (!previewUrl) return;
                const a = document.createElement("a");
                a.href = previewUrl;
                a.download = "bitandplay-preview.wav";
                a.click();
              }}
              title="Download rendered preview"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => regenerate()}>
            <Repeat2 className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button size="sm" variant="ghost" onClick={() => variation()}>
            <Shuffle className="mr-2 h-4 w-4" />
            Variation
          </Button>
          <div className="rounded-md border border-border/70 bg-card/60 px-3 py-2 text-xs text-muted-foreground">
            Bar-safe updates
            <Switch
              className="ml-2"
              checked={ui.applyNextBar}
              onCheckedChange={(checked) => setApplyNextBar(checked)}
            />
          </div>
          <div className="rounded-md border border-border/70 bg-card/60 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Audio stable
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
