import { useState } from "react";
import { Dices, RefreshCcw, Sparkle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Slider } from "../components/slider";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select";

const presets = ["Voyager", "PixelRush", "NightDrive", "Skyline"];
const scales = ["major", "minor", "dorian", "mixolydian"] as const;
const keys = ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb", "Ab"];

export const GenerateTab = () => {
  const { params, updateParams, regenerate, variation } = useAppStore((state) => ({
    params: state.params,
    updateParams: state.updateParams,
    regenerate: state.regenerate,
    variation: state.variation,
  }));
  const [seedInput, setSeedInput] = useState(params.seed.toString());

  const applySeed = () => {
    const seed = Number(seedInput) || Math.floor(Math.random() * 999999);
    regenerate(seed);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/70 bg-card/70 p-4 shadow-glow">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Seeded generation</div>
          <Button size="sm" variant="secondary" onClick={() => regenerate()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="text-xs text-muted-foreground">Seed</label>
            <div className="mt-1 flex gap-2">
              <Input value={seedInput} onChange={(e) => setSeedInput(e.target.value)} />
              <Button variant="ghost" onClick={applySeed}>
                Apply
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Preset</label>
            <Select
              value={params.preset}
              onValueChange={(preset) => updateParams({ preset })}
            >
              <SelectTrigger>{params.preset}</SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem value={p} key={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Key</label>
            <Select value={params.key} onValueChange={(key) => updateParams({ key })}>
              <SelectTrigger>{params.key}</SelectTrigger>
              <SelectContent>
                {keys.map((k) => (
                  <SelectItem value={k} key={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Scale</label>
            <Select
              value={params.scale}
              onValueChange={(scale) =>
                updateParams({ scale: scale as (typeof scales)[number] })
              }
            >
              <SelectTrigger className="capitalize">{params.scale}</SelectTrigger>
              <SelectContent>
                {scales.map((scale) => (
                  <SelectItem key={scale} value={scale} className="capitalize">
                    {scale}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">BPM</label>
            <div className="flex items-center gap-2">
              <Slider
                min={80}
                max={170}
                step={1}
                value={[params.bpm]}
                onValueChange={([bpm]) => updateParams({ bpm })}
              />
              <span className="w-12 text-right text-xs text-muted-foreground">{params.bpm}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Bars</label>
            <Slider
              min={4}
              max={32}
              step={4}
              value={[params.bars]}
              onValueChange={([bars]) => updateParams({ bars })}
            />
            <div className="text-right text-xs text-muted-foreground">{params.bars} bars</div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border/70 bg-card/70 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkle className="h-4 w-4 text-primary" />
          Character
        </div>
        {[
          ["Energy", "energy"],
          ["Melody density", "density"],
          ["Harmony complexity", "complexity"],
          ["Syncopation", "syncopation"],
        ].map(([label, key]) => (
          <div key={key}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{label}</span>
              <span>{Math.round((params as any)[key] * 100)}%</span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[(params as any)[key]]}
              onValueChange={([val]) => updateParams({ [key]: val } as any)}
            />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => variation()}>
            <Dices className="mr-2 h-4 w-4" />
            Variation
          </Button>
          <Button size="sm" variant="ghost" onClick={() => regenerate()}>
            Reroll
          </Button>
        </div>
      </div>
    </div>
  );
};
