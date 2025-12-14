import { useAppStore } from "@/store/useAppStore";
import { Button } from "../components/button";
import { Slider } from "../components/slider";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select";

const scenes: {
  id: "tunnel" | "grid" | "orbits" | "blackhole" | "bubbles" | "crazy";
  title: string;
  detail: string;
}[] = [
  { id: "tunnel", title: "Tunnel Spectrum", detail: "Cascading rings with band-driven depth." },
  { id: "grid", title: "Neon Grid", detail: "Bass warps the horizon, highs shimmer on tiles." },
  { id: "orbits", title: "Orbit Bars", detail: "Floating bars orbit with mid/hi modulation." },
  { id: "blackhole", title: "Black Hole", detail: "Particle spiral with glowing accretion swirl." },
  { id: "bubbles", title: "Interactive Bubbles", detail: "Grab and fling glowing bubbles with the beat." },
  { id: "crazy", title: "Crazy", detail: "Neon reactor core, kaleidoscope rings, shards & sparks." },
];

export const VisualizerTab = () => {
  const visualizerScene = useAppStore((state) => state.visualizerScene);
  const setVisualizerScene = useAppStore((state) => state.setVisualizerScene);
  const visualizerQuality = useAppStore((state) => state.visualizerQuality);
  const setVisualizerQuality = useAppStore((state) => state.setVisualizerQuality);

  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-3">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => setVisualizerScene(scene.id)}
            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
              visualizerScene === scene.id
                ? "border-primary/70 bg-primary/10 shadow-glow"
                : "border-border/60 bg-card/60 hover:border-primary/40"
            }`}
          >
            <div>
              <div className="font-semibold">{scene.title}</div>
              <p className="text-xs text-muted-foreground">{scene.detail}</p>
            </div>
            <div className="text-[10px] uppercase tracking-wide text-primary">Select</div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Quality</div>
            <div className="text-xs text-muted-foreground">Lower for older GPUs.</div>
          </div>
          <Select
            value={visualizerQuality}
            onValueChange={(v) => setVisualizerQuality(v as "low" | "med" | "high")}
          >
            <SelectTrigger className="w-28 capitalize">{visualizerQuality}</SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="med">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Motion smoothing</span>
            <span>gentle</span>
          </div>
          <Slider value={[0.7]} min={0.1} max={1} step={0.05} disabled />
          <p className="text-[11px] text-muted-foreground">
            Visualizer uses analyser smoothing internally to avoid jitter.
          </p>
        </div>
      </div>

      <Button variant="ghost" size="sm">
        Cinema mode (toggle in FX tab)
      </Button>
    </div>
  );
};
