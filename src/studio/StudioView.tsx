import { useMemo, useRef, useState } from "react";
import { Plus, Repeat2, ZoomIn, ZoomOut } from "lucide-react";
import type { Clip, ProjectTrack } from "@/types/project";
import { STEPS_PER_BAR, STEPS_PER_BEAT } from "@/types/project";
import { useAppStore } from "@/store/useAppStore";
import { TimelineRuler } from "./TimelineRuler";
import { ClipEditorDrawer } from "./ClipEditorDrawer";
import { Button } from "@/ui/components/button";
import { Slider } from "@/ui/components/slider";

interface ClipBlockProps {
  clip: Clip;
  stepWidth: number;
  quantize: number;
  selected: boolean;
  onSelect: (id: Clip["id"]) => void;
  onMove: (id: Clip["id"], start: number) => void;
  onResize: (id: Clip["id"], length: number) => void;
}

const ClipBlock = ({ clip, stepWidth, quantize, selected, onSelect, onMove, onResize }: ClipBlockProps) => {
  const snap = Math.max(1, quantize);
  const dragStart = useRef<number | null>(null);
  const resizeStart = useRef<number | null>(null);
  const draftOffset = useRef(0);
  const draftLength = useRef<number | null>(null);
  const [, forceRender] = useState(0);

  const forceTick = () => forceRender((v) => v + 1);

  const handlePointerUp = () => {
    draftOffset.current = 0;
    draftLength.current = null;
    document.body.style.userSelect = "";
    forceTick();
  };

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragStart.current = e.clientX;
    document.body.style.userSelect = "none";
    const onMovePointer = (ev: PointerEvent) => {
      if (dragStart.current === null) return;
      const delta = ev.clientX - dragStart.current;
      const steps = Math.round(delta / (stepWidth * snap)) * snap;
      draftOffset.current = steps;
      forceTick();
    };
    const onUp = (ev: PointerEvent) => {
      if (dragStart.current !== null) {
        const delta = ev.clientX - dragStart.current;
        const steps = Math.round(delta / (stepWidth * snap)) * snap;
        onMove(clip.id, clip.startStep + steps);
      }
      dragStart.current = null;
      window.removeEventListener("pointermove", onMovePointer);
      window.removeEventListener("pointerup", onUp);
      handlePointerUp();
    };
    window.addEventListener("pointermove", onMovePointer);
    window.addEventListener("pointerup", onUp);
  };

  const startResize = (e: React.PointerEvent<HTMLDivElement>, direction: "left" | "right") => {
    e.preventDefault();
    e.stopPropagation();
    resizeStart.current = e.clientX;
    document.body.style.userSelect = "none";
    const onMovePointer = (ev: PointerEvent) => {
      if (resizeStart.current === null) return;
      const delta = ev.clientX - resizeStart.current;
      const steps = Math.round(delta / (stepWidth * snap)) * snap;
      if (direction === "right") {
        draftLength.current = Math.max(snap, clip.lengthSteps + steps);
      } else {
        draftLength.current = Math.max(snap, clip.lengthSteps - steps);
        draftOffset.current = steps;
      }
      forceTick();
    };
    const onUp = (ev: PointerEvent) => {
      if (resizeStart.current !== null) {
        const delta = ev.clientX - resizeStart.current;
        const steps = Math.round(delta / (stepWidth * snap)) * snap;
        if (direction === "right") {
          onResize(clip.id, Math.max(snap, clip.lengthSteps + steps));
        } else {
          const nextLength = Math.max(snap, clip.lengthSteps - steps);
          onMove(clip.id, clip.startStep + steps);
          onResize(clip.id, nextLength);
        }
      }
      resizeStart.current = null;
      window.removeEventListener("pointermove", onMovePointer);
      window.removeEventListener("pointerup", onUp);
      draftOffset.current = 0;
      draftLength.current = null;
      handlePointerUp();
    };
    window.addEventListener("pointermove", onMovePointer);
    window.addEventListener("pointerup", onUp);
  };

  const computedStart = (clip.startStep + draftOffset.current) * stepWidth;
  const computedLength = (draftLength.current ?? clip.lengthSteps) * stepWidth;

  return (
    <div
      onPointerDown={startDrag}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(clip.id);
      }}
      className={`absolute top-2 h-14 cursor-grab rounded-md border px-3 py-2 text-xs font-semibold shadow-lg transition ${
        selected ? "border-primary/80 bg-primary/30" : "border-border/70 bg-white/5 hover:border-primary/60"
      }`}
      style={{ left: computedStart, width: computedLength }}
    >
      <div className="flex items-center justify-between text-[11px] text-foreground/80">
        <span>Clip {clip.id}</span>
        <span className="text-muted-foreground">
          {Math.round(clip.lengthSteps / STEPS_PER_BEAT)} beats
        </span>
      </div>
      <div className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-primary/70"
        onPointerDown={(e) => startResize(e, "left")}
      />
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-primary/70"
        onPointerDown={(e) => startResize(e, "right")}
      />
    </div>
  );
};

interface LaneProps {
  track: ProjectTrack;
  clips: Clip[];
  stepWidth: number;
  totalSteps: number;
  quantize: number;
  selectedClipId?: string;
  onAddClip: (trackId: ProjectTrack["id"]) => void;
  onSelectClip: (id?: string) => void;
  onMoveClip: (id: string, start: number) => void;
  onResizeClip: (id: string, len: number) => void;
}

const ClipLane = ({
  track,
  clips,
  stepWidth,
  totalSteps,
  quantize,
  selectedClipId,
  onAddClip,
  onSelectClip,
  onMoveClip,
  onResizeClip,
}: LaneProps) => {
  const width = totalSteps * stepWidth;
  const gridStyle = {
    backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
      linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${stepWidth}px 100%, ${stepWidth * 4}px 100%`,
    backgroundPosition: "0 0, 0 0",
  };

  return (
    <div className="relative h-20 border-b border-border/50 bg-gradient-to-r from-black/30 to-black/20">
      <div className="absolute inset-0" style={{ width, ...gridStyle }} />
      <div
        className="relative h-full"
        style={{ width }}
        onClick={() => onSelectClip(undefined)}
      >
        {clips.map((clip) => (
          <ClipBlock
            key={clip.id}
            clip={clip}
            quantize={quantize}
            stepWidth={stepWidth}
            selected={selectedClipId === clip.id}
            onSelect={onSelectClip}
            onMove={onMoveClip}
            onResize={onResizeClip}
          />
        ))}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddClip(track.id);
        }}
        className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-border/70 bg-black/50 px-2 py-1 text-[11px] text-muted-foreground transition hover:border-primary/70 hover:text-primary"
      >
        <Plus className="h-3 w-3" />
        Add clip
      </button>
    </div>
  );
};

export const StudioView = () => {
  const project = useAppStore((state) => state.project);
  const studio = useAppStore((state) => state.studio);
  const addClip = useAppStore((state) => state.addClip);
  const moveClip = useAppStore((state) => state.moveClip);
  const resizeClip = useAppStore((state) => state.resizeClip);
  const selectClip = useAppStore((state) => state.selectClip);
  const toggleTrackMute = useAppStore((state) => state.toggleTrackMute);
  const toggleTrackSolo = useAppStore((state) => state.toggleTrackSolo);
  const setLoopRegion = useAppStore((state) => state.setLoopRegion);
  const setStudioZoom = useAppStore((state) => state.setStudioZoom);
  const setProjectQuantize = useAppStore((state) => state.setProjectQuantize);
  const toggleDrumStep = useAppStore((state) => state.toggleDrumStep);
  const toggleNoteAt = useAppStore((state) => state.toggleNoteAt);
  const transposePattern = useAppStore((state) => state.transposePattern);
  const quantizePattern = useAppStore((state) => state.quantizePattern);
  const resetDrumPattern = useAppStore((state) => state.resetDrumPattern);

  const stepWidth = 14 * studio.zoom;
  const totalSteps = project.lengthBars * STEPS_PER_BAR;
  const selectedClip = useMemo(
    () => project.clips.find((c) => c.id === studio.selectedClipId),
    [project.clips, studio.selectedClipId],
  );
  const selectedPattern = useMemo(
    () => project.patterns.find((p) => p.id === selectedClip?.patternId),
    [project.patterns, selectedClip?.patternId],
  );
  const selectedTrack = useMemo(
    () => project.tracks.find((t) => t.id === selectedClip?.trackId),
    [project.tracks, selectedClip?.trackId],
  );

  return (
    <div className="flex h-[calc(100vh-96px)] flex-col bg-gradient-to-b from-[#0b0f18]/70 to-[#0b0f16]/60 text-foreground">
      <div className="flex items-center justify-between border-b border-border/70 bg-black/50 px-4 py-2 text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 py-2">
            <Repeat2 className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Loop</span>
            <input
              type="number"
              className="w-12 rounded bg-black/40 px-2 py-1 text-xs"
              min={1}
              value={project.loop.startBar + 1}
              onChange={(e) =>
                setLoopRegion(Number(e.target.value) - 1, project.loop.endBar, project.loop.enabled)
              }
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="number"
              className="w-12 rounded bg-black/40 px-2 py-1 text-xs"
              min={2}
              value={project.loop.endBar}
              onChange={(e) =>
                setLoopRegion(project.loop.startBar, Number(e.target.value), project.loop.enabled)
              }
            />
            <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <input
                type="checkbox"
                checked={project.loop.enabled}
                onChange={(e) =>
                  setLoopRegion(project.loop.startBar, project.loop.endBar, e.target.checked)
                }
                className="accent-primary"
              />
              Enable
            </label>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 py-2 text-xs text-muted-foreground">
            Snap
            {[1, 2, 4].map((step) => (
              <button
                key={step}
                onClick={() => setProjectQuantize(step)}
                className={`rounded px-2 py-1 text-[11px] ${
                  project.quantizeSteps === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-black/40 text-foreground"
                }`}
              >
                1/{16 / step}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <Slider
            className="w-32"
            min={0.6}
            max={2}
            step={0.05}
            value={[studio.zoom]}
            onValueChange={([val]) => setStudioZoom(val)}
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 border-r border-border/70 bg-black/40">
          {project.tracks.map((track) => (
            <div
              key={track.id}
              className="flex h-20 items-center justify-between border-b border-border/60 px-3"
            >
              <div>
                <div className="text-sm font-semibold">{track.name}</div>
                <div className="text-[11px] uppercase text-muted-foreground">{track.type}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={track.mixer.mute ? "secondary" : "ghost"}
                  onClick={() => toggleTrackMute(track.id, !track.mixer.mute)}
                >
                  {track.mixer.mute ? "Unmute" : "Mute"}
                </Button>
                <Button
                  size="sm"
                  variant={track.mixer.solo ? "default" : "outline"}
                  onClick={() => toggleTrackSolo(track.id)}
                >
                  Solo
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="relative flex-1 overflow-auto">
          <TimelineRuler bars={project.lengthBars} stepWidth={stepWidth} />
          {project.tracks.map((track) => (
            <ClipLane
            key={track.id}
            track={track}
            clips={project.clips.filter((c) => c.trackId === track.id)}
            stepWidth={stepWidth}
            totalSteps={totalSteps}
            quantize={project.quantizeSteps}
              selectedClipId={studio.selectedClipId}
              onAddClip={addClip}
              onSelectClip={selectClip}
              onMoveClip={moveClip}
              onResizeClip={resizeClip}
            />
          ))}
        </div>
      </div>
      <ClipEditorDrawer
        project={project}
        clip={selectedClip}
        pattern={selectedPattern}
        track={selectedTrack}
        onToggleNote={(id, pitch, step, len) => toggleNoteAt(id, pitch, step, len)}
        onToggleStep={(id, lane, step) => toggleDrumStep(id, lane, step)}
        onQuantize={(id) => quantizePattern(id)}
        onTranspose={(id, amt) => transposePattern(id, amt)}
        onResetDrums={(id, mode) => resetDrumPattern(id, mode)}
      />
    </div>
  );
};
