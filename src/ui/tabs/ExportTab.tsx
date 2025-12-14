import { useState } from "react";
import { HardDrive, Link2, Music4 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "../components/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select";
import { Switch } from "../components/switch";

export const ExportTab = () => {
  const [sampleRate, setSampleRate] = useState<44100 | 48000>(44100);
  const [normalize, setNormalize] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const { exportState, startFastExport, stopFastExport, exportWav, buildShareLink } = useAppStore(
    (state) => ({
      exportState: state.export,
      startFastExport: state.startFastExport,
      stopFastExport: state.stopFastExport,
      exportWav: state.exportWav,
      buildShareLink: state.buildShareLink,
    }),
  );

  const downloadBlob = (blob: Blob | null, filename: string) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFast = async () => {
    if (exportState.fastRecording) {
      const blob = await stopFastExport();
      downloadBlob(blob, "bitandplay-fast.webm");
    } else {
      await startFastExport();
    }
  };

  const handleHQ = async () => {
    const blob = await exportWav(sampleRate, normalize);
    downloadBlob(blob, `bitandplay-${sampleRate / 1000}k.wav`);
  };

  const handleCopy = async () => {
    const url = buildShareLink();
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1200);
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Music4 className="h-4 w-4 text-primary" />
          Fast export (live capture)
        </div>
        <p className="text-xs text-muted-foreground">
          Uses MediaRecorder to capture the current output. Start playback first for a clean render.
        </p>
        <Button
          className="mt-3 w-full"
          variant={exportState.fastRecording ? "secondary" : "default"}
          onClick={handleFast}
        >
          {exportState.fastRecording ? "Stop & download" : "Start capture"}
        </Button>
      </div>

      <div className="rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <HardDrive className="h-4 w-4 text-primary" />
          HQ offline WAV
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Sample rate</div>
            <Select
              value={sampleRate.toString()}
              onValueChange={(v) => setSampleRate(Number(v) as 44100 | 48000)}
            >
              <SelectTrigger className="w-full">{sampleRate / 1000} kHz</SelectTrigger>
              <SelectContent>
                <SelectItem value="44100">44.1 kHz</SelectItem>
                <SelectItem value="48000">48 kHz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-white/5 px-3 py-2">
            <span className="text-xs text-muted-foreground">Normalize</span>
            <Switch checked={normalize} onCheckedChange={setNormalize} />
          </div>
        </div>
        <Button className="mt-3 w-full" onClick={handleHQ} disabled={exportState.exporting}>
          {exportState.exporting ? `Rendering: ${exportState.hqPhase ?? "..."}` : "Render WAV"}
        </Button>
      </div>

      <div className="rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Link2 className="h-4 w-4 text-primary" />
          Share link
        </div>
        <p className="text-xs text-muted-foreground">Encode current seed and params into the URL.</p>
        <Button variant="ghost" className="mt-2 w-full" onClick={handleCopy}>
          {linkCopied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  );
};
