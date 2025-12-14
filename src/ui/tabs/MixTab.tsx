import { Cpu, Shield, ShieldAlert } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Switch } from "../components/switch";
import { Button } from "../components/button";

export const MixTab = () => {
  const song = useAppStore((state) => state.song);
  const ui = useAppStore((state) => state.ui);
  const setApplyNextBar = useAppStore((state) => state.setApplyNextBar);
  const saveLocal = useAppStore((state) => state.saveLocal);
  const loadLocal = useAppStore((state) => state.loadLocal);

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-primary" />
          Playback safety
        </div>
        <div className="flex items-center justify-between rounded-md border border-border/60 bg-white/5 px-3 py-2">
          <div>
            <div className="font-medium">Apply changes on next bar</div>
            <div className="text-xs text-muted-foreground">
              Avoids clicks by rescheduling pattern rebuilds.
            </div>
          </div>
          <Switch checked={ui.applyNextBar} onCheckedChange={(val) => setApplyNextBar(val)} />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-md border border-border/60 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
          <ShieldAlert className="h-4 w-4 text-primary" />
          Transport stays in sync when regenerating while playing.
        </div>
      </div>

      <div className="rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Cpu className="h-4 w-4 text-primary" />
          Session state
        </div>
        <p className="text-xs text-muted-foreground">
          Save the current generator parameters and song to localStorage for offline recall.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={saveLocal}>
            Save locally
          </Button>
          <Button size="sm" variant="ghost" onClick={loadLocal}>
            Restore
          </Button>
        </div>
        <div className="mt-3 rounded-md border border-border/50 bg-white/5 p-3 text-xs text-muted-foreground">
          {song.tracks.length} tracks · {song.bars} bars ·{" "}
          {song.tracks[0]?.pattern.steps ?? 16} steps/bar
        </div>
      </div>
    </div>
  );
};
