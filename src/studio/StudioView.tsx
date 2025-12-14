import { useEffect, useMemo, useRef, useState } from "react";
import { MinusCircle, Pause, Play, Plus, Repeat2, Square, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import * as Tone from "tone";
import type { Clip, ProjectTrack } from "@/types/project";
import { STEPS_PER_BAR, STEPS_PER_BEAT } from "@/types/project";
import { useAppStore } from "@/store/useAppStore";
import { TimelineRuler } from "./TimelineRuler";
import { ClipEditorDrawer } from "./ClipEditorDrawer";
import { Button } from "@/ui/components/button";
import { Slider } from "@/ui/components/slider";
import { Input } from "@/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/ui/components/select";

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
      data-clip
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
  onCreateClip: (trackId: ProjectTrack["id"], startStep: number, lengthSteps: number) => void;
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
  onCreateClip,
  onSelectClip,
  onMoveClip,
  onResizeClip,
}: LaneProps) => {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);
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
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          if ((e.target as HTMLElement).closest("[data-clip]")) return;
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const offset = e.clientX - rect.left;
          const step = Math.floor(offset / stepWidth);
          setDragStart(step);
          setDragCurrent(step);
          onSelectClip(undefined);
          const onMove = (ev: PointerEvent) => {
            const delta = ev.clientX - rect.left;
            setDragCurrent(Math.max(0, Math.floor(delta / stepWidth)));
          };
          const onUp = (ev: PointerEvent) => {
            ev.preventDefault();
            const endOffset = ev.clientX - rect.left;
            const endStep = Math.max(0, Math.floor(endOffset / stepWidth));
            const start = Math.min(step, endStep);
            const rawLen = Math.max(quantize, Math.abs(endStep - step) || quantize);
            const snappedLen = Math.max(quantize, Math.round(rawLen / quantize) * quantize);
            onCreateClip(track.id, start, snappedLen);
            setDragStart(null);
            setDragCurrent(null);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
          };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
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
        {dragStart !== null && dragCurrent !== null && (
          <div
            className="pointer-events-none absolute top-2 h-14 rounded-md border border-dashed border-primary/60 bg-primary/10"
            style={{
              left: Math.min(dragStart, dragCurrent) * stepWidth,
              width: Math.max(quantize, Math.abs(dragCurrent - dragStart)) * stepWidth,
            }}
          />
        )}
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
  const play = useAppStore((state) => state.play);
  const pause = useAppStore((state) => state.pause);
  const stop = useAppStore((state) => state.stop);
  const playing = useAppStore((state) => state.playing);
  const toggleTrackMute = useAppStore((state) => state.toggleTrackMute);
  const toggleTrackSolo = useAppStore((state) => state.toggleTrackSolo);
  const setLoopRegion = useAppStore((state) => state.setLoopRegion);
  const setStudioZoom = useAppStore((state) => state.setStudioZoom);
  const setProjectQuantize = useAppStore((state) => state.setProjectQuantize);
  const clearClips = useAppStore((state) => state.clearClips);
  const toggleDrumStep = useAppStore((state) => state.toggleDrumStep);
  const toggleNoteAt = useAppStore((state) => state.toggleNoteAt);
  const transposePattern = useAppStore((state) => state.transposePattern);
  const quantizePattern = useAppStore((state) => state.quantizePattern);
  const resetDrumPattern = useAppStore((state) => state.resetDrumPattern);
  const stopPreviewPlayback = useAppStore((state) => state.stopPreviewPlayback);
  const addTrack = useAppStore((state) => state.addTrack);
  const removeTrack = useAppStore((state) => state.removeTrack);

  const stepWidth = 14 * studio.zoom;
  const totalSteps = project.lengthBars * STEPS_PER_BAR;
  const [playheadBars, setPlayheadBars] = useState(0);
  const playheadX = Math.min(totalSteps * stepWidth, playheadBars * STEPS_PER_BAR * stepWidth);
  const createClipAt = useAppStore((state) => state.createClipAt);
  const [newTrackType, setNewTrackType] = useState<ProjectTrack["type"]>("PULSE1");
  const [newTrackName, setNewTrackName] = useState("");

  useEffect(() => {
    if (!playing) {
      setPlayheadBars(0);
      return;
    }
    let raf: number;
    const tick = () => {
      const pos = Tone.Transport.position.toString();
      const [barStr = "0", beatStr = "0", sixStr = "0"] = pos.split(":");
      const bar = Number(barStr) || 0;
      const beat = Number(beatStr) || 0;
      const sixteenth = Number(sixStr) || 0;
      const bars = bar + beat / 4 + sixteenth / 16;
      setPlayheadBars(bars);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
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
    <div className="flex h-[calc(100vh-96px)] min-w-0 flex-col bg-gradient-to-b from-[#0b0f18]/70 to-[#0b0f16]/60 text-foreground">
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
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => clearClips()}
          >
            <Trash2 className="h-4 w-4" />
            Clear clips
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-2 py-1">
            <span className="text-[11px] uppercase text-muted-foreground">Studio</span>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                stopPreviewPlayback?.();
                playing ? pause() : play();
              }}
              className="gap-1"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause" : "Play"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => stop()} className="gap-1">
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </div>
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
      <div className="flex flex-1 overflow-hidden pb-16">
        <div className="w-72 shrink-0 overflow-y-auto overflow-x-hidden border-r border-border/70 bg-black/40 scroll-smoothbars">
          <div className="space-y-2 border-b border-border/70 px-3 py-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Add track</div>
            <Input
              placeholder="Name"
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              className="h-8 bg-black/50 text-sm"
            />
            <Select
              value={newTrackType}
              onValueChange={(val) => setNewTrackType(val as ProjectTrack["type"])}
            >
              <SelectTrigger className="h-8 bg-black/50 text-xs">
                <span className="truncate">{newTrackType}</span>
              </SelectTrigger>
              <SelectContent>
                {["PULSE1", "PULSE2", "TRIANGLE", "SAW", "SINE", "NOISE", "PCM"].map((type) => (
                  <SelectItem key={type} value={type} className="text-xs">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={() => addTrack({ name: newTrackName || "New Track", type: newTrackType })}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add track
            </Button>
          </div>
          {project.tracks.map((track) => (
            <div
              key={track.id}
              className="flex h-20 items-center justify-between border-b border-border/60 px-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{track.name}</div>
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
                <button
                  className="rounded-full border border-border/60 p-1 text-muted-foreground hover:border-destructive hover:text-destructive"
                  onClick={() => removeTrack(track.id)}
                  aria-label="Remove track"
                >
                  <MinusCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="relative flex-1 min-w-0 overflow-x-auto overflow-y-auto pb-6 scroll-smoothbars">
          <div className="relative" style={{ width: totalSteps * stepWidth }}>
            <TimelineRuler bars={project.lengthBars} stepWidth={stepWidth} />
            <div
              className="pointer-events-none absolute bottom-0 top-0 border-l-2 border-primary/80 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
              style={{ left: playheadX }}
            />
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
              onCreateClip={createClipAt}
              onSelectClip={selectClip}
              onMoveClip={moveClip}
              onResizeClip={resizeClip}
            />
          ))}
          </div>
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
