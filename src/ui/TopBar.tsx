import { useRef, useState } from "react";
import { FolderDown, Link2, RefreshCcw, Save, Settings } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "./components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/dialog";
import { Switch } from "./components/switch";

export const TopBar = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const {
    regenerate,
    exportJson,
    importJson,
    buildShareLink,
    ui,
    setTab,
    saveLocal,
    loadLocal,
    setApplyNextBar,
  } = useAppStore((state) => ({
    regenerate: state.regenerate,
    exportJson: state.exportJson,
    importJson: state.importJson,
    buildShareLink: state.buildShareLink,
    ui: state.ui,
    setTab: state.setTab,
    saveLocal: state.saveLocal,
    loadLocal: state.loadLocal,
    setApplyNextBar: state.setApplyNextBar,
  }));

  const handleNew = () => regenerate();

  const handleSaveJson = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bitandplay-song.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await importJson(text);
    setTab("Generate");
  };

  const handleShare = async () => {
    const url = buildShareLink();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-12 items-center justify-between border-b border-border/80 bg-black/40 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          BitAndPlay
        </div>
        <span className="text-xs text-muted-foreground">Seeded chiptune workstation</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={handleNew} className="gap-1">
          <RefreshCcw className="h-4 w-4" />
          New
        </Button>
        <Button size="sm" variant="ghost" onClick={handleSaveJson} className="gap-1">
          <Save className="h-4 w-4" />
          Save JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleLoadJson}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
          className="gap-1"
        >
          <FolderDown className="h-4 w-4" />
          Load JSON
        </Button>
        <Button size="sm" variant="ghost" onClick={handleShare} className="gap-1">
          <Link2 className="h-4 w-4" />
          {copied ? "Copied" : "Share Link"}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Session settings</DialogTitle>
              <DialogDescription>Persistence and playback safeguards.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                <div>
                  <div className="font-medium">Apply changes on next bar</div>
                  <p className="text-xs text-muted-foreground">
                    Prevents clicks by rescheduling pattern updates.
                  </p>
                </div>
                <Switch
                  checked={ui.applyNextBar}
                  onCheckedChange={(checked) => setApplyNextBar(checked)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={saveLocal}>
                  Save locally
                </Button>
                <Button size="sm" variant="ghost" onClick={loadLocal}>
                  Load local save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};
