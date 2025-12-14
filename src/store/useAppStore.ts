import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { generateSong, generateVariation, defaultGeneratorParams } from "@/audio/generator/generate";
import type { GeneratorParams, Song, Track } from "@/types/song";
import {
  getEngineSong,
  getMediaStream,
  initAudio,
  loadSong,
  pauseTransport,
  setBpm as engineSetBpm,
  setMasterGain,
  setSwing as engineSetSwing,
  startTransport,
  stopTransport,
  toggleMute,
} from "@/audio/engine";
import { renderSongOffline, type OfflinePhase } from "@/audio/render/offline";

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

interface StoreState {
  params: GeneratorParams;
  song: Song;
  playing: boolean;
  bpm: number;
  swing: number;
  headroom: number;
  export: ExportState;
  visualizerScene: VisualizerScene;
  visualizerQuality: "low" | "med" | "high";
  ui: UIState;
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
  setBpm: (bpm: number) => void;
  setSwing: (swing: number) => void;
  setHeadroom: (gain: number) => void;
  setQuantize: (value: Song["quantize"]) => void;
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

export const useAppStore = create<StoreState>()(
  devtools((set, get) => ({
  params: defaultGeneratorParams,
  song: typeof window !== "undefined" ? loadInitialSong() : generateSong(defaultGeneratorParams),
  playing: false,
  bpm: defaultGeneratorParams.bpm,
  swing: defaultGeneratorParams.syncopation * 0.1,
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
  export: { fastChunks: [], exporting: false },
  setVisualizerScene: (scene: VisualizerScene) => set({ visualizerScene: scene }),
  setVisualizerQuality: (visualizerQuality: "low" | "med" | "high") =>
    set({ visualizerQuality }),
  setTab: (tab: UIState["tab"]) => set((state) => ({ ui: { ...state.ui, tab } })),
  setMode: (mode: UIMode) => set((state) => ({ ui: { ...state.ui, mode } })),
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
    const song = get().song;
    await loadSong(song);
    set((state) => ({ ui: { ...state.ui, overlay: "ready" } }));
  },
  play: async () => {
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
    set({ params, song, bpm: song.bpm, swing: song.swing });
    await loadSong(song, get().ui.applyNextBar);
  },
  variation: async () => {
    const song = generateVariation(get().song);
    set({ song });
    await loadSong(song, true);
  },
  updateParams: async (changes: Partial<GeneratorParams>, autorender = true) => {
    const params = { ...get().params, ...changes };
    set({ params });
    if (autorender) {
      const song = generateSong(params);
      set({ song, bpm: song.bpm, swing: song.swing });
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
    }));
  },
  setBpm: (bpm: number) => {
    engineSetBpm(bpm);
    set((state) => ({ bpm, song: { ...state.song, bpm } }));
  },
  setSwing: (swing: number) => {
    engineSetSwing(swing);
    set((state) => ({ swing, song: { ...state.song, swing } }));
  },
  setHeadroom: (gain: number) => {
    set({ headroom: gain });
    setMasterGain(gain);
  },
  setQuantize: (value: Song["quantize"]) =>
    set((state) => ({ song: { ...state.song, quantize: value } })),
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
    const payload = JSON.stringify({ params: get().params, song: get().song });
    localStorage.setItem("bitandplay-save", payload);
  },
  loadLocal: async () => {
    const saved = localStorage.getItem("bitandplay-save");
    if (!saved) return;
    const { song, params } = JSON.parse(saved) as { song: Song; params: GeneratorParams };
    set({ song, params });
    await loadSong(song);
  },
  importJson: async (json: string) => {
    const parsed = JSON.parse(json) as Song;
    set({ song: parsed, params: { ...get().params, seed: parsed.seed, bpm: parsed.bpm } });
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
})),
);
