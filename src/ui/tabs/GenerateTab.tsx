import { useState } from "react";
import { Dices, RefreshCcw, Sparkle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Slider } from "../components/slider";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select";
import { useEffect } from "react";

const presets = ["Voyager", "PixelRush", "NightDrive", "Skyline"];
const scales = ["major", "minor", "dorian", "mixolydian"] as const;
const keys = ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb", "Ab"];

export const GenerateTab = () => {
  const params = useAppStore((state) => state.params);
  const updateParams = useAppStore((state) => state.updateParams);
  const regenerate = useAppStore((state) => state.regenerate);
  const variation = useAppStore((state) => state.variation);
  const setParams = useAppStore((state) => state.updateParams);
  const [seedInput, setSeedInput] = useState(params.seed.toString());

  useEffect(() => {
    setSeedInput(params.seed.toString());
  }, [params.seed]);

  const reroll = () => {
    const seed = Math.floor(Math.random() * 999999);
    setSeedInput(seed.toString());
    regenerate(seed);
  };

  const randomizeAll = () => {
    const seed = Math.floor(Math.random() * 999999);
    const preset = presets[Math.floor(Math.random() * presets.length)];
    const key = keys[Math.floor(Math.random() * keys.length)];
    const scale = scales[Math.floor(Math.random() * scales.length)];
    const bpm = 80 + Math.floor(Math.random() * 90);
    const bars = [4, 8, 12, 16, 24, 32][Math.floor(Math.random() * 6)];
    const energy = Math.random();
    const density = Math.random();
    const complexity = Math.random();
    const syncopation = Math.random();
    setSeedInput(seed.toString());
    setParams(
      {
        seed,
        preset,
        key,
        scale,
        bpm,
        bars,
        energy,
        density,
        complexity,
        syncopation,
      },
      true,
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/70 bg-card/70 p-4 shadow-glow">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Seeded generation</div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => regenerate(params.seed)}
            title="Rebuild from current seed + settings"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="text-xs text-muted-foreground">Seed</label>
            <div className="mt-1 flex gap-2">
              <Input
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                className="w-full text-sm"
              />
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => variation()}
            title="Keep the vibe, reshuffle motifs/patterns"
          >
            <Dices className="mr-2 h-4 w-4" />
            Variation
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={reroll}
            title="New seed, regenerate a fresh song"
          >
            Reroll
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="secondary" onClick={randomizeAll}>
          <Dices className="mr-2 h-4 w-4" />
          Surprise me
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border border-border/70 bg-card/60 p-4 text-sm leading-relaxed">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Sparkle className="h-4 w-4 text-primary" />
            How generation works
          </div>
          <p className="text-sm text-muted-foreground">
            BitAndPlay builds patterns on a 16-step grid per bar. The seed feeds a deterministic RNG
            that picks chords, arps, drum hits, and fills based on preset + key/scale. Sliders bias
            how busy or syncopated parts get; BPM and bar count set loop length. Reroll swaps the
            seed, Variation morphs motifs while keeping the vibe, and Apply reuses your current seed
            with any parameter tweaks.
          </p>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Sparkle className="h-4 w-4 text-primary" />
            Bar-safe updates
          </div>
          <p className="text-sm text-muted-foreground">
            The Bar-safe toggle (transport footer) defers engine swaps to the next bar to avoid
            clicks. Turn it off for instant changes; leave it on during playback for smooth
            scheduling.
          </p>
        </div>
      </div>
    </div>
  );
};
