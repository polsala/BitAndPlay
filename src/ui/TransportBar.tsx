import { Pause, Play, Repeat2, Rewind, Shuffle, Wand2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "./components/button";
import { Slider } from "./components/slider";
import { Switch } from "./components/switch";

interface Props {
  onToggle: () => void;
  onStop: () => void;
  isPlaying: boolean;
  bpm: number;
  swing: number;
}

export const TransportBar = ({ onToggle, onStop, isPlaying, bpm, swing }: Props) => {
  const { setBpm, setSwing, regenerate, variation, ui, setApplyNextBar } = useAppStore((state) => ({
    setBpm: state.setBpm,
    setSwing: state.setSwing,
    regenerate: state.regenerate,
    variation: state.variation,
    ui: state.ui,
    setApplyNextBar: state.setApplyNextBar,
  }));

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 text-sm">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onToggle} variant="default">
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
            Apply on bar
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
