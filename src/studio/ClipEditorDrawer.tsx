import { Minus, Music, Piano, Plus, Sparkles, Square, Wand2 } from "lucide-react";
import type { Clip, Pattern, Project, ProjectTrack } from "@/types/project";
import { Button } from "@/ui/components/button";

interface Props {
  project: Project;
  clip?: Clip;
  pattern?: Pattern;
  track?: ProjectTrack;
  onToggleNote: (patternId: string, pitch: number, step: number, defaultLength: number) => void;
  onToggleStep: (patternId: string, lane: string, step: number) => void;
  onQuantize: (patternId: string) => void;
  onTranspose: (patternId: string, amount: number) => void;
  onResetDrums: (patternId: string, mode: "clear" | "fill") => void;
}

const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const formatNote = (midi: number) => {
  const octave = Math.floor(midi / 12) - 1;
  const name = noteNames[midi % 12];
  return `${name}${octave}`;
};

export const ClipEditorDrawer = ({
  clip,
  pattern,
  track,
  project,
  onToggleNote,
  onToggleStep,
  onQuantize,
  onTranspose,
  onResetDrums,
}: Props) => {
  const visible = clip && pattern && track;
  if (!visible || !clip || !pattern || !track) {
    return (
      <div className="h-12 border-t border-border/70 bg-black/60 px-4 text-sm text-muted-foreground">
        <div className="flex h-full items-center gap-2">
          <Piano className="h-4 w-4" />
          Select a clip to edit notes and steps.
        </div>
      </div>
    );
  }

  const cellSize = 18;
  const defaultNoteLen = Math.max(project.quantizeSteps, 4);

  const renderTonal = () => {
    const tonal = pattern.kind === "tonal" ? pattern : null;
    if (!tonal) return null;
    const pitches = [72, 71, 70, 69, 68, 67, 65, 64, 62, 60, 59, 57];

    const noteAt = (pitch: number, step: number) =>
      tonal.notes.find((n) => n.pitch === pitch && step >= n.startStep && step < n.startStep + n.lengthSteps);

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Music className="h-4 w-4" />
          Piano roll · {tonal.lengthSteps / tonal.stepsPerBar} bars
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-black/40 p-2">
          <div className="min-w-full space-y-1">
            {pitches.map((pitch) => (
              <div key={pitch} className="flex items-center gap-2">
                <div className="w-12 text-right text-[10px] uppercase text-muted-foreground">
                  {formatNote(pitch)}
                </div>
                <div
                  className="relative flex-1"
                  style={{
                    minWidth: tonal.lengthSteps * cellSize,
                  }}
                >
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${tonal.lengthSteps}, ${cellSize}px)`,
                    }}
                  >
                    {Array.from({ length: tonal.lengthSteps }, (_, step) => {
                      const active = noteAt(pitch, step);
                      return (
                        <button
                          key={`${pitch}-${step}`}
                          onClick={() => onToggleNote(pattern.id, pitch, step, defaultNoteLen)}
                          className={`h-6 rounded-[3px] border transition ${
                            active
                              ? "border-primary/60 bg-primary/30 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                              : "border-border/40 bg-black/30 hover:border-primary/40"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDrums = () => {
    const drum = pattern.kind === "drum" ? pattern : null;
    if (!drum) return null;
    const lanes = Object.keys(drum.lanes) as Array<keyof typeof drum.lanes>;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Square className="h-4 w-4" />
          Step grid
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-black/40 p-2">
          <div className="min-w-full space-y-1">
            {lanes.map((lane) => (
              <div key={lane} className="flex items-center gap-2">
                <div className="w-12 text-right text-[10px] uppercase text-muted-foreground">{lane}</div>
                <div
                  className="grid gap-[3px]"
                  style={{
                    gridTemplateColumns: `repeat(${drum.lengthSteps}, ${cellSize}px)`,
                  }}
                >
                  {drum.lanes[lane].map((active, step) => (
                    <button
                      key={`${lane}-${step}`}
                      onClick={() => onToggleStep(pattern.id, lane, step)}
                      className={`h-6 rounded-[3px] border transition ${
                        active
                          ? "border-primary/70 bg-primary/40"
                          : "border-border/40 bg-black/30 hover:border-primary/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-t border-border/60 bg-gradient-to-t from-black/80 to-black/50 px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">
            {track.name} · Clip {clip.id}
          </div>
          <div className="text-xs text-muted-foreground">
            {pattern.kind === "tonal" ? "Piano roll" : "Drum steps"} · Quantize {project.quantizeSteps}{" "}
            step{project.quantizeSteps > 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pattern.kind === "tonal" ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => onTranspose(pattern.id, -12)}>
                <Minus className="mr-1 h-4 w-4" />
                -12
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onTranspose(pattern.id, 12)}>
                <Plus className="mr-1 h-4 w-4" />
                +12
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onQuantize(pattern.id)}>
                <Wand2 className="mr-1 h-4 w-4" />
                Quantize
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => onResetDrums(pattern.id, "clear")}>
                Clear
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onResetDrums(pattern.id, "fill")}>
                <Sparkles className="mr-1 h-4 w-4" />
                Fill
              </Button>
            </>
          )}
        </div>
      </div>
      {pattern.kind === "tonal" ? renderTonal() : renderDrums()}
    </div>
  );
};
