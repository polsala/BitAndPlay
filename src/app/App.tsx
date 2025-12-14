import { useEffect, useMemo, useState } from "react";
import { Sparkles, Volume2 } from "lucide-react";
import { getAnalyser, initAudio } from "@/audio/engine";
import { VisualizerCanvas } from "@/viz/VisualizerCanvas";
import { useAppStore } from "@/store/useAppStore";
import { TopBar } from "@/ui/TopBar";
import { RightPanel } from "@/ui/RightPanel";
import { TransportBar } from "@/ui/TransportBar";
import { Button } from "@/ui/components/button";
import { StudioView } from "@/studio/StudioView";

export const AppShell = () => {
  const [analyser, setAnalyser] = useState<ReturnType<typeof getAnalyser>>();
  const song = useAppStore((state) => state.song);
  const ui = useAppStore((state) => state.ui);
  const visualizerScene = useAppStore((state) => state.visualizerScene);
  const visualizerQuality = useAppStore((state) => state.visualizerQuality);
  const play = useAppStore((state) => state.play);
  const pause = useAppStore((state) => state.pause);
  const stop = useAppStore((state) => state.stop);
  const playing = useAppStore((state) => state.playing);
  const prepareAudio = useAppStore((state) => state.prepareAudio);
  const toggleCinema = useAppStore((state) => state.toggleCinema);

  useEffect(() => {
    if (ui.overlay === "ready") {
      setAnalyser(getAnalyser());
    }
  }, [ui.overlay]);

  useEffect(() => {
    // Pre-warm Tone so that share links load immediately after gesture
    initAudio().catch(() => undefined);
  }, []);

  const handleToggle = () => {
    playing ? pause() : play();
  };

  const overlay = useMemo(() => {
    if (ui.overlay === "ready") return null;
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="rounded-xl border border-border bg-card/80 px-8 py-6 text-center shadow-glow">
          <div className="mb-3 flex items-center justify-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            Click to enable audio
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Browsers require a user gesture to start the audio engine.
          </p>
          <Button onClick={prepareAudio}>Enable</Button>
        </div>
      </div>
    );
  }, [ui.overlay, prepareAudio]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b0f1a] to-[#0a0d15] text-foreground">
      <TopBar />
      <main className="flex min-h-screen flex-col pt-12">
        <div className="flex flex-1 flex-row">
          <section className="relative flex-1 min-w-0">
            {ui.mode === "studio" ? (
              <StudioView />
            ) : (
              <>
                <VisualizerCanvas
                  analyser={analyser}
                  scene={visualizerScene}
                  quality={visualizerQuality}
                />
                <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-muted-foreground shadow-glow">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-3.5 w-3.5 text-primary" />
                    {song.preset} · {song.key} {song.scale}
                  </div>
                </div>
              </>
            )}
            {overlay}
            {ui.cinema && (
              <div className="absolute right-4 top-4 z-40">
                <Button size="sm" variant="secondary" onClick={toggleCinema} className="shadow-glow">
                  Exit cinema
                </Button>
              </div>
            )}
          </section>
          <RightPanel />
        </div>
      </main>
      <TransportBar
        onToggle={handleToggle}
        onStop={stop}
        isPlaying={playing}
        bpm={song.bpm}
        swing={song.swing}
      />
    </div>
  );
};
