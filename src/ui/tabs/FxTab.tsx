import { Waves, Volume2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Slider } from "../components/slider";
import { Switch } from "../components/switch";

export const FxTab = () => {
  const { headroom, setHeadroom, ui, toggleCinema } = useAppStore((state) => ({
    headroom: state.headroom,
    setHeadroom: state.setHeadroom,
    ui: state.ui,
    toggleCinema: state.toggleCinema,
  }));

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Waves className="h-4 w-4 text-primary" />
          Master chain
        </div>
        <p className="text-xs text-muted-foreground">
          Soft limiter and saturation are always on to keep the chip voices clean. Adjust overall
          headroom to fit your device.
        </p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Headroom</span>
            <span>{Math.round(headroom * 100)}%</span>
          </div>
          <Slider
            min={0.4}
            max={1.1}
            step={0.01}
            value={[headroom]}
            onValueChange={([val]) => setHeadroom(val)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Volume2 className="h-4 w-4 text-primary" />
          Cinema mode
        </div>
        <div className="flex items-center justify-between rounded-md border border-border/60 bg-white/5 px-3 py-2">
          <div>
            <div className="font-medium">Focus visuals</div>
            <div className="text-xs text-muted-foreground">
              Hide panels and keep transport + canvas only.
            </div>
          </div>
          <Switch checked={ui.cinema} onCheckedChange={toggleCinema} />
        </div>
      </div>
    </div>
  );
};
