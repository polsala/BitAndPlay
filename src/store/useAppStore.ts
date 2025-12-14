import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { generateSong, generateVariation, defaultGeneratorParams } from "@/audio/generator/generate";
import type { GeneratorParams, Song, Track } from "@/types/song";
import type { Clip, Pattern, Project } from "@/types/project";
import { STEPS_PER_BAR, STEPS_PER_BEAT } from "@/types/project";
import {
  getEngineSong,
  getMediaStream,
  initAudio,
  loadSong,
  loadProject,
  pauseTransport,
  setBpm as engineSetBpm,
  setMasterGain,
  setSwing as engineSetSwing,
  startTransport,
  stopTransport,
  toggleMute,
} from "@/audio/engine";
import { renderSongOffline, type OfflinePhase } from "@/audio/render/offline";
import { projectFromSong } from "@/studio/projectDefaults";
import { createDeterministicId } from "@/utils/id";

export type VisualizerScene = "tunnel" | "grid" | "orbits";
export type UIMode = "playground" | "studio";

interface ExportState {
  fastRecording?: MediaRecorder;
  fastChunks: Blob[];
  hqPhase?: OfflinePhase;
  exporting: boolean;
  error?: string;
}

interface UIState {
  tab: "Generate" | "Edit" | "Mix" | "FX" | "Visualizer" | "Export";
  mode: UIMode;
  overlay: "idle" | "needs-gesture" | "ready";
  cinema: boolean;
  applyNextBar: boolean;
}

interface StudioUIState {
  selectedClipId?: Clip["id"];
  zoom: number;
}

interface StoreState {
  params: GeneratorParams;
  song: Song;
  project: Project;
  playing: boolean;
  bpm: number;
  swing: number;
  headroom: number;
  export: ExportState;
  visualizerScene: VisualizerScene;
  visualizerQuality: "low" | "med" | "high";
  ui: UIState;
  studio: StudioUIState;
  setVisualizerScene: (scene: VisualizerScene) => void;
  setVisualizerQuality: (q: "low" | "med" | "high") => void;
  setTab: (tab: UIState["tab"]) => void;
  setMode: (mode: UIMode) => void;
  setApplyNextBar: (apply: boolean) => void;
  toggleCinema: () => void;
  prepareAudio: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  regenerate: (seed?: number) => Promise<void>;
  variation: () => Promise<void>;
  updateParams: (changes: Partial<GeneratorParams>, autorender?: boolean) => Promise<void>;
  toggleTrackMute: (id: Track["id"], mute: boolean) => void;
  toggleTrackSolo: (id: Track["id"]) => Promise<void>;
  setBpm: (bpm: number) => void;
  setSwing: (swing: number) => void;
  setHeadroom: (gain: number) => void;
  setQuantize: (value: Song["quantize"]) => void;
  setProjectQuantize: (steps: number) => Promise<void>;
  clearClips: () => Promise<void>;
  createClipAt: (trackId: Track["id"], startStep: number, lengthSteps: number) => Promise<void>;
  addClip: (trackId: Track["id"]) => Promise<void>;
  moveClip: (id: Clip["id"], startStep: number) => Promise<void>;
  resizeClip: (id: Clip["id"], lengthSteps: number) => Promise<void>;
  selectClip: (id?: Clip["id"]) => void;
  toggleDrumStep: (patternId: Pattern["id"], lane: string, step: number) => Promise<void>;
  toggleNoteAt: (patternId: Pattern["id"], pitch: number, step: number, defaultLength: number) => Promise<void>;
  resetDrumPattern: (patternId: Pattern["id"], mode: "clear" | "fill") => Promise<void>;
  transposePattern: (patternId: Pattern["id"], semitones: number) => Promise<void>;
  quantizePattern: (patternId: Pattern["id"]) => Promise<void>;
  setLoopRegion: (startBar: number, endBar: number, enabled: boolean) => Promise<void>;
  setStudioZoom: (zoom: number) => void;
  buildShareLink: () => string;
  saveLocal: () => void;
  loadLocal: () => Promise<void>;
  importJson: (json: string) => Promise<void>;
  exportJson: () => string;
  startFastExport: () => Promise<void>;
  stopFastExport: () => Promise<Blob | null>;
  exportWav: (sampleRate: number, normalize: boolean) => Promise<Blob | null>;
}

const loadInitialSong = () => {
  const url = new URL(window.location.href);
  const seed = Number(url.searchParams.get("seed") ?? defaultGeneratorParams.seed);
  const preset = url.searchParams.get("preset") ?? defaultGeneratorParams.preset;
  const params = { ...defaultGeneratorParams, seed, preset };
  return generateSong(params);
};

const fallbackSong = generateSong(defaultGeneratorParams);
const initialSong = typeof window !== "undefined" ? loadInitialSong() : fallbackSong;
const initialProject = projectFromSong(initialSong);

export const useAppStore = create<StoreState>()(
  devtools((set, get) => {
    const applyProjectChange = async (project: Project) => {
      set({ project });
      const shouldDefer = get().ui.applyNextBar && get().playing;
      await loadProject(project, shouldDefer);
    };

    const updateProject = async (updater: (project: Project) => Project) => {
      const next = updater(get().project);
      await applyProjectChange(next);
    };

    return {
  params: defaultGeneratorParams,
  song: initialSong,
  project: initialProject,
  playing: false,
  bpm: initialSong.bpm,
  swing: initialSong.swing,
  headroom: 0.9,
  visualizerScene: "tunnel",
  visualizerQuality: "high",
  ui: {
    tab: "Generate",
    mode: "playground",
    overlay: "needs-gesture",
    cinema: false,
    applyNextBar: true,
  },
  studio: {
    selectedClipId: undefined,
    zoom: 1,
  },
  export: { fastChunks: [], exporting: false },
  setVisualizerScene: (scene: VisualizerScene) => set({ visualizerScene: scene }),
  setVisualizerQuality: (visualizerQuality: "low" | "med" | "high") =>
    set({ visualizerQuality }),
  setTab: (tab: UIState["tab"]) => set((state) => ({ ui: { ...state.ui, tab } })),
  setMode: (mode: UIMode) => {
    set((state) => ({ ui: { ...state.ui, mode } }));
    if (get().playing) {
      if (mode === "studio") {
        loadProject(get().project, get().ui.applyNextBar);
      } else {
        loadSong(get().song, get().ui.applyNextBar);
      }
    }
  },
  toggleCinema: () => set((state) => ({ ui: { ...state.ui, cinema: !state.ui.cinema } })),
  setApplyNextBar: (apply: boolean) =>
    set((state) => ({
      ui: {
        ...state.ui,
        applyNextBar: apply,
      },
    })),
  prepareAudio: async () => {
    await initAudio();
    const state = get();
    if (state.ui.mode === "studio") {
      await loadProject(state.project);
    } else {
      await loadSong(state.song);
    }
    set((state) => ({ ui: { ...state.ui, overlay: "ready" } }));
  },
  play: async () => {
    const state = get();
    if (state.ui.mode === "studio") {
      await loadProject(state.project, false);
    } else {
      await loadSong(state.song, false);
    }
    await startTransport();
    set({ playing: true });
  },
  pause: () => {
    pauseTransport();
    set({ playing: false });
  },
  stop: () => {
    stopTransport();
    set({ playing: false });
  },
  regenerate: async (seed?: number) => {
    const params = { ...get().params, seed: seed ?? Math.floor(Math.random() * 999999) };
    const song = generateSong(params);
    const shouldResetProject = get().ui.mode === "playground";
    set({
      params,
      song,
      bpm: song.bpm,
      swing: song.swing,
      project: shouldResetProject ? projectFromSong(song) : get().project,
    });
    await loadSong(song, get().ui.applyNextBar);
  },
  variation: async () => {
    const song = generateVariation(get().song);
    const shouldResetProject = get().ui.mode === "playground";
    set({ song, project: shouldResetProject ? projectFromSong(song) : get().project });
    await loadSong(song, true);
  },
  updateParams: async (changes: Partial<GeneratorParams>, autorender = true) => {
    const params = { ...get().params, ...changes };
    set({ params });
    if (autorender) {
      const song = generateSong(params);
      const shouldResetProject = get().ui.mode === "playground";
      set({
        song,
        bpm: song.bpm,
        swing: song.swing,
        project: shouldResetProject ? projectFromSong(song) : get().project,
      });
      await loadSong(song, get().ui.applyNextBar);
    }
  },
  toggleTrackMute: (id: Track["id"], mute: boolean) => {
    toggleMute(id, mute);
    set((state) => ({
      song: {
        ...state.song,
        tracks: state.song.tracks.map((t) => (t.id === id ? { ...t, mute } : t)),
      },
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) =>
          t.id === id ? { ...t, mixer: { ...t.mixer, mute } } : t,
        ),
      },
    }));
  },
  toggleTrackSolo: async (id: Track["id"]) => {
    await updateProject((project) => ({
      ...project,
      tracks: project.tracks.map((t) =>
        t.id === id ? { ...t, mixer: { ...t.mixer, solo: !t.mixer.solo } } : t,
      ),
    }));
  },
  setBpm: (bpm: number) => {
    engineSetBpm(bpm);
    set((state) => ({
      bpm,
      song: { ...state.song, bpm },
      project: { ...state.project, bpm },
    }));
  },
  setSwing: (swing: number) => {
    engineSetSwing(swing);
    set((state) => ({
      swing,
      song: { ...state.song, swing },
      project: { ...state.project, swing },
    }));
  },
  setHeadroom: (gain: number) => {
    set({ headroom: gain });
    setMasterGain(gain);
  },
  setQuantize: (value: Song["quantize"]) =>
    set((state) => ({ song: { ...state.song, quantize: value } })),
  setProjectQuantize: async (steps: number) => {
    await updateProject((project) => ({ ...project, quantizeSteps: Math.max(1, steps) }));
  },
  clearClips: async () => {
    await updateProject((project) => ({
      ...project,
      clips: [],
    }));
    set((state) => ({ studio: { ...state.studio, selectedClipId: undefined } }));
  },
  createClipAt: async (trackId: Track["id"], startStep: number, lengthSteps: number) => {
    const track = get().project.tracks.find((t) => t.id === trackId);
    if (!track) return;
    const quantize = Math.max(1, get().project.quantizeSteps);
    const snappedStart = Math.max(0, Math.floor(startStep / quantize) * quantize);
    const snappedLength = Math.max(quantize, Math.round(lengthSteps / quantize) * quantize);
    const totalSteps = get().project.lengthBars * STEPS_PER_BAR;
    const boundedStart = Math.min(snappedStart, Math.max(0, totalSteps - snappedLength));
    const patternId = createDeterministicId(`pat-${trackId}`);
    const clipId = createDeterministicId(`clip-${trackId}`);
    const basePattern: Pattern =
      track.type === "NOISE" || track.type === "PCM"
        ? {
            id: patternId,
            kind: "drum",
            stepsPerBar: STEPS_PER_BAR,
            lengthSteps: snappedLength,
            lanes: {
              kick: Array.from({ length: snappedLength }, () => false),
              snare: Array.from({ length: snappedLength }, () => false),
              hat: Array.from({ length: snappedLength }, () => false),
              perc: Array.from({ length: snappedLength }, () => false),
              fx: Array.from({ length: snappedLength }, () => false),
            },
          }
        : {
            id: patternId,
            kind: "tonal",
            stepsPerBar: STEPS_PER_BAR,
            lengthSteps: snappedLength,
            notes: [],
          };
    await updateProject((project) => ({
      ...project,
      patterns: [...project.patterns, basePattern],
      clips: [
        ...project.clips,
        {
          id: clipId,
          trackId,
          startStep: boundedStart,
          lengthSteps: snappedLength,
          patternId,
        },
      ],
    }));
    set((state) => ({ studio: { ...state.studio, selectedClipId: clipId } }));
  },
  addClip: async (trackId: Track["id"]) => {
    const track = get().project.tracks.find((t) => t.id === trackId);
    if (!track) return;
    const baseLength = STEPS_PER_BAR;
    const patternId = createDeterministicId(`pat-${trackId}`);
    const clipId = createDeterministicId(`clip-${trackId}`);
    const defaultPattern: Pattern =
      track.type === "NOISE" || track.type === "PCM"
        ? {
            id: patternId,
            kind: "drum",
            stepsPerBar: STEPS_PER_BAR,
            lengthSteps: baseLength,
            lanes: {
              kick: Array.from({ length: baseLength }, () => false),
              snare: Array.from({ length: baseLength }, () => false),
              hat: Array.from({ length: baseLength }, () => false),
              perc: Array.from({ length: baseLength }, () => false),
              fx: Array.from({ length: baseLength }, () => false),
            },
          }
        : {
            id: patternId,
            kind: "tonal",
            stepsPerBar: STEPS_PER_BAR,
            lengthSteps: baseLength,
            notes: [],
          };
    const nextStart =
      get()
        .project.clips.filter((c) => c.trackId === trackId)
        .reduce((acc, clip) => Math.max(acc, clip.startStep + clip.lengthSteps), 0) ?? 0;
    await updateProject((project) => ({
      ...project,
      patterns: [...project.patterns, defaultPattern],
      clips: [
        ...project.clips,
        {
          id: clipId,
          trackId,
          startStep: nextStart,
          lengthSteps: baseLength,
          patternId,
        },
      ],
    }));
    set((state) => ({ studio: { ...state.studio, selectedClipId: clipId } }));
  },
  moveClip: async (id: Clip["id"], startStep: number) => {
    const totalSteps = get().project.lengthBars * STEPS_PER_BAR;
    await updateProject((project) => ({
      ...project,
      clips: project.clips.map((clip) =>
        clip.id === id
          ? { ...clip, startStep: Math.max(0, Math.min(startStep, totalSteps - clip.lengthSteps)) }
          : clip,
      ),
    }));
  },
  resizeClip: async (id: Clip["id"], lengthSteps: number) => {
    const minLength = get().project.quantizeSteps;
    await updateProject((project) => ({
      ...project,
      clips: project.clips.map((clip) =>
        clip.id === id ? { ...clip, lengthSteps: Math.max(minLength, lengthSteps) } : clip,
      ),
    }));
  },
  selectClip: (id?: Clip["id"]) =>
    set((state) => ({ studio: { ...state.studio, selectedClipId: id } })),
  toggleDrumStep: async (patternId: Pattern["id"], lane: string, step: number) => {
    await updateProject((project) => ({
      ...project,
      patterns: project.patterns.map((p) => {
        if (p.id !== patternId || p.kind !== "drum" || !p.lanes[lane as keyof typeof p.lanes]) {
          return p;
        }
        const laneArr = [...p.lanes[lane as keyof typeof p.lanes]];
        if (laneArr[step] === undefined) return p;
        laneArr[step] = !laneArr[step];
        return {
          ...p,
          lanes: { ...p.lanes, [lane]: laneArr },
        };
      }),
    }));
  },
  resetDrumPattern: async (patternId: Pattern["id"], mode: "clear" | "fill") => {
    await updateProject((project) => ({
      ...project,
      patterns: project.patterns.map((p) => {
        if (p.id !== patternId || p.kind !== "drum") return p;
        if (mode === "clear") {
          const empty = Object.fromEntries(
            Object.entries(p.lanes).map(([lane, steps]) => [lane, steps.map(() => false)]),
          ) as typeof p.lanes;
          return { ...p, lanes: empty };
        }
        const filled = Object.fromEntries(
          Object.entries(p.lanes).map(([lane, steps]) => {
            const sequence = steps.map((_, idx) => {
              if (lane === "kick") return idx % STEPS_PER_BEAT === 0;
              if (lane === "snare") return idx % STEPS_PER_BAR === STEPS_PER_BEAT * 2;
              if (lane === "hat") return idx % 2 === 0;
              return idx % STEPS_PER_BEAT === 2;
            });
            return [lane, sequence];
          }),
        ) as typeof p.lanes;
        return { ...p, lanes: filled };
      }),
    }));
  },
  toggleNoteAt: async (patternId: Pattern["id"], pitch: number, step: number, defaultLength: number) => {
    await updateProject((project) => ({
      ...project,
      patterns: project.patterns.map((p) => {
        if (p.id !== patternId || p.kind !== "tonal") return p;
        const existing = p.notes.find(
          (n) => n.pitch === pitch && step >= n.startStep && step < n.startStep + n.lengthSteps,
        );
        if (existing) {
          return { ...p, notes: p.notes.filter((n) => n !== existing) };
        }
        const lengthSteps = Math.max(
          project.quantizeSteps,
          Math.min(defaultLength, p.lengthSteps - step),
        );
        return {
          ...p,
          notes: [
            ...p.notes,
            { pitch, startStep: step, lengthSteps, velocity: 0.8 },
          ],
        };
      }),
    }));
  },
  transposePattern: async (patternId: Pattern["id"], semitones: number) => {
    await updateProject((project) => ({
      ...project,
      patterns: project.patterns.map((p) => {
        if (p.id !== patternId || p.kind !== "tonal") return p;
        return {
          ...p,
          notes: p.notes.map((n) => ({
            ...n,
            pitch: Math.min(100, Math.max(24, n.pitch + semitones)),
          })),
        };
      }),
    }));
  },
  quantizePattern: async (patternId: Pattern["id"]) => {
    const q = Math.max(1, get().project.quantizeSteps);
    await updateProject((project) => ({
      ...project,
      patterns: project.patterns.map((p) => {
        if (p.id !== patternId || p.kind !== "tonal") return p;
        return {
          ...p,
          notes: p.notes.map((n) => ({
            ...n,
            startStep: Math.min(p.lengthSteps - q, Math.round(n.startStep / q) * q),
            lengthSteps: (() => {
              const start = Math.min(p.lengthSteps - q, Math.round(n.startStep / q) * q);
              return Math.max(
                q,
                Math.min(p.lengthSteps - start, Math.round(n.lengthSteps / q) * q),
              );
            })(),
          })),
        };
      }),
    }));
  },
  setLoopRegion: async (startBar: number, endBar: number, enabled: boolean) => {
    const project = get().project;
    const start = Math.max(0, Math.min(startBar, project.lengthBars - 1));
    const end = Math.max(start + 1, Math.min(endBar, project.lengthBars));
    await updateProject((project) => ({
      ...project,
      loop: {
        enabled,
        startBar: start,
        endBar: end,
      },
    }));
  },
  setStudioZoom: (zoom: number) =>
    set((state) => ({ studio: { ...state.studio, zoom: Math.max(0.5, Math.min(zoom, 2.5)) } })),
  buildShareLink: () => {
    const params = get().params;
    const url = new URL(window.location.href);
    url.searchParams.set("seed", params.seed.toString());
    url.searchParams.set("preset", params.preset);
    url.searchParams.set("key", params.key);
    url.searchParams.set("scale", params.scale);
    url.searchParams.set("bpm", params.bpm.toString());
    url.searchParams.set("bars", params.bars.toString());
    return url.toString();
  },
  saveLocal: () => {
    const payload = JSON.stringify({
      params: get().params,
      song: get().song,
      project: get().project,
    });
    localStorage.setItem("bitandplay-save", payload);
  },
  loadLocal: async () => {
    const saved = localStorage.getItem("bitandplay-save");
    if (!saved) return;
    const { song, params, project } = JSON.parse(saved) as {
      song: Song;
      params: GeneratorParams;
      project?: Project;
    };
    set({ song, params, project: project ?? projectFromSong(song) });
    if (get().ui.mode === "studio") {
      await loadProject(project ?? projectFromSong(song));
    } else {
      await loadSong(song);
    }
  },
  importJson: async (json: string) => {
    const parsed = JSON.parse(json) as Song;
    set({
      song: parsed,
      params: { ...get().params, seed: parsed.seed, bpm: parsed.bpm },
      project: projectFromSong(parsed),
    });
    await loadSong(parsed);
  },
  exportJson: () => JSON.stringify(get().song, null, 2),
  startFastExport: async () => {
    const streamNode = getMediaStream();
    const stream = streamNode?.stream;
    if (!stream || typeof MediaRecorder === "undefined") return;
    const mime = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/ogg;codecs=opus";
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    recorder.start();
    set((state) => ({ export: { ...state.export, fastRecording: recorder, fastChunks: chunks } }));
  },
  stopFastExport: async () => {
    const rec = get().export.fastRecording;
    if (!rec) return null;
    return new Promise<Blob | null>((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(get().export.fastChunks, { type: rec.mimeType });
        set((state) => ({ export: { ...state.export, fastRecording: undefined, fastChunks: [] } }));
        resolve(blob);
      };
      rec.stop();
    });
  },
  exportWav: async (sampleRate: number, normalize: boolean) => {
    try {
      set((state) => ({ export: { ...state.export, exporting: true, hqPhase: "rendering" } }));
      const song = getEngineSong() ?? get().song;
      const wav = await renderSongOffline(song, {
        sampleRate,
        normalize,
        onPhase: (phase) => set((state) => ({ export: { ...state.export, hqPhase: phase } })),
      });
      set((state) => ({ export: { ...state.export, exporting: false, hqPhase: "done" } }));
      return wav;
    } catch (err) {
      set((state) => ({
        export: { ...state.export, exporting: false, error: (err as Error).message },
      }));
      return null;
    }
  },
    };
  }),
);
