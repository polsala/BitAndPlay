import { useAppStore } from "@/store/useAppStore";
import { Button } from "../components/button";
import { Slider } from "../components/slider";
import { Switch } from "../components/switch";

const quantizeOptions: Array<[string, 0.125 | 0.25 | 0.5]> = [
  ["1/32", 0.125],
  ["1/16", 0.25],
  ["1/8", 0.5],
];

export const EditTab = () => {
  const song = useAppStore((state) => state.song);
  const toggleTrackMute = useAppStore((state) => state.toggleTrackMute);
  const setQuantize = useAppStore((state) => state.setQuantize);
  const setSwing = useAppStore((state) => state.setSwing);

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="mb-2 text-xs uppercase text-muted-foreground">Tracks</div>
        <div className="space-y-2">
          {song.tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between rounded-md border border-border/60 bg-white/5 px-3 py-2"
            >
              <div>
                <div className="text-sm font-semibold">{track.name}</div>
                <div className="text-xs text-muted-foreground">
                  {track.role} · {track.synth}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!track.mute}
                  onCheckedChange={(checked) => toggleTrackMute(track.id, !checked)}
                />
                <Button
                  size="sm"
                  variant={track.mute ? "secondary" : "ghost"}
                  onClick={() => toggleTrackMute(track.id, !(track.mute ?? false))}
                >
                  {track.mute ? "Unmute" : "Mute"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Timing</div>
            <p className="text-xs text-muted-foreground">Quantize and humanize</p>
          </div>
          <div className="flex gap-2">
            {quantizeOptions.map(([label, value]) => (
              <Button
                key={value}
                size="sm"
                variant={song.quantize === value ? "secondary" : "ghost"}
                onClick={() => setQuantize(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Swing</span>
            <span>{Math.round(song.swing * 1000) / 10}%</span>
          </div>
          <Slider
            value={[song.swing]}
            min={0}
            max={0.25}
            step={0.005}
            onValueChange={([value]) => setSwing(value)}
          />
        </div>
      </div>
    </div>
  );
};
