import React from "react";
import {
  AudioLines,
  Download,
  PanelsTopLeft,
  PencilRuler,
  Settings2,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs";
import { GenerateTab } from "./tabs/GenerateTab";
import { EditTab } from "./tabs/EditTab";
import { MixTab } from "./tabs/MixTab";
import { FxTab } from "./tabs/FxTab";
import { VisualizerTab } from "./tabs/VisualizerTab";
import { ExportTab } from "./tabs/ExportTab";

const tabIcons: Record<string, React.ReactNode> = {
  Generate: <Sparkles className="h-4 w-4" />,
  Edit: <PencilRuler className="h-4 w-4" />,
  Mix: <SlidersHorizontal className="h-4 w-4" />,
  FX: <AudioLines className="h-4 w-4" />,
  Visualizer: <PanelsTopLeft className="h-4 w-4" />,
  Export: <Download className="h-4 w-4" />,
};

export const RightPanel = () => {
  const ui = useAppStore((state) => state.ui);
  const setTab = useAppStore((state) => state.setTab);
  const setMode = useAppStore((state) => state.setMode);

  if (ui.cinema) return null;

  return (
    <aside className="w-[360px] border-l border-border/70 bg-black/40 px-4 py-4 backdrop-blur-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex rounded-full border border-border/60 bg-card/80 p-1 text-xs font-medium">
          {(["playground", "studio"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className={`rounded-full px-3 py-1 capitalize transition ${
                ui.mode === mode ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <Settings2 className="h-4 w-4 text-muted-foreground" />
      </div>
      <Tabs value={ui.tab} onValueChange={(tab) => setTab(tab as typeof ui.tab)}>
        <TabsList className="grid grid-cols-3 gap-2">
          {(["Generate", "Edit", "Mix", "FX", "Visualizer", "Export"] as const).map((tab) => (
            <TabsTrigger key={tab} value={tab} className="gap-2">
              {tabIcons[tab]}
              <span className="hidden md:inline">{tab}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scroll-smoothbars">
          <TabsContent value="Generate">
            <GenerateTab />
          </TabsContent>
          <TabsContent value="Edit">
            <EditTab />
          </TabsContent>
          <TabsContent value="Mix">
            <MixTab />
          </TabsContent>
          <TabsContent value="FX">
            <FxTab />
          </TabsContent>
          <TabsContent value="Visualizer">
            <VisualizerTab />
          </TabsContent>
          <TabsContent value="Export">
            <ExportTab />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
};
