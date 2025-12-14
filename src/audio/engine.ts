import * as Tone from "tone";
import type { DrumHit, Note, Song, Track } from "@/types/song";
import type { Clip, Pattern, Project, ProjectTrack } from "@/types/project";
import { STEPS_PER_BAR, STEPS_PER_BEAT } from "@/types/project";
import { createInstrument, createMasterChain, type InstrumentHandle } from "./instruments";

interface EngineState {
  initialized: boolean;
  started: boolean;
  song?: Song;
  project?: Project;
  instruments: InstrumentHandle[];
  parts: Tone.Part[];
  analyser?: Tone.Analyser;
  mediaDest?: MediaStreamAudioDestinationNode;
  masterGain?: Tone.Gain;
  source: "song" | "project";
}

const engine: EngineState = {
  initialized: false,
  started: false,
  instruments: [],
  parts: [],
  source: "song",
};

const disposeParts = () => {
  engine.parts.forEach((p) => p.dispose());
  engine.parts = [];
};

const disposeInstruments = () => {
  engine.instruments.forEach((i) => i.dispose());
  engine.instruments = [];
};

const normalizeEvents = <T extends { time: number }>(events: T[]): T[] => {
  const sorted = [...events].sort((a, b) => a.time - b.time);
  let last = -Infinity;
  return sorted.map((event) => {
    const t = event.time <= last ? last + 0.0001 : event.time;
    last = t;
    return { ...event, time: t };
  });
};

const projectTrackToInstrument = (track: ProjectTrack): Track => {
  const synth =
    track.type === "TRIANGLE"
      ? "triangle"
      : track.type === "NOISE"
        ? "noise"
        : track.type === "PCM"
          ? "sine"
          : "pulse";
  const role: Track["role"] = track.type === "NOISE" || track.type === "PCM" ? "drum" : "melodic";
  return {
    id: track.id,
    name: track.name,
    role,
    pattern: { steps: STEPS_PER_BAR, length: 1 },
    synth,
    mute: track.mixer.mute,
  };
};

const stepsToSeconds = (steps: number) =>
  Tone.Time(steps / STEPS_PER_BAR, "m").toSeconds();

const compileClipEvents = (
  clip: Clip,
  pattern: Pattern,
): { notes?: { time: number; note: Note }[]; drums?: { time: number; hit: DrumHit }[] } => {
  const clipStart = clip.startStep;
  const clipEnd = clip.startStep + clip.lengthSteps;
  if (pattern.kind === "tonal") {
    const notes = pattern.notes
      .map((note) => {
        const globalStart = clipStart + note.startStep;
        if (globalStart >= clipEnd) return null;
        const remaining = clipEnd - (clipStart + note.startStep);
        const lengthSteps = Math.max(1, Math.min(note.lengthSteps, remaining));
        return {
          time: stepsToSeconds(globalStart),
          note: {
            time: 0,
            midi: note.pitch,
            duration: lengthSteps / STEPS_PER_BEAT,
            velocity: note.velocity,
          },
        };
      })
      .filter(Boolean) as { time: number; note: Note }[];
    return { notes };
  }
  const drums: { time: number; hit: DrumHit }[] = [];
  (Object.entries(pattern.lanes) as [DrumHit["type"] | "fx", boolean[]][]).forEach(
    ([lane, steps]) => {
      steps.forEach((active, idx) => {
        if (!active) return;
        const globalStep = clipStart + idx;
        if (globalStep >= clipEnd) return;
        drums.push({
          time: stepsToSeconds(globalStep),
          hit: { time: 0, type: (lane === "fx" ? "perc" : lane) as DrumHit["type"] },
        });
      });
    },
  );
  return { drums };
};

const scheduleTrack = (track: Track) => {
  const destination = engine.masterGain ?? Tone.getDestination();
  const instrument = createInstrument(track, destination);
  engine.instruments.push(instrument);

  if (track.role === "melodic" && track.pattern.notes) {
    const events = normalizeEvents(
      track.pattern.notes.map((note) => ({
        time: Tone.Time(note.time / 4, "m").toSeconds(),
        note,
      })),
    );
    const part = new Tone.Part((time, value: { note: typeof track.pattern.notes[number] }) => {
      instrument.triggerNote?.(time, value.note);
    }, events);
    part.loop = true;
    part.loopEnd = `${track.pattern.length}m`;
    part.start(0);
    engine.parts.push(part);
  } else if (track.pattern.drums && (track.role === "drum" || track.role === "pcm")) {
    const events = normalizeEvents(
      track.pattern.drums.map((hit: DrumHit) => ({
        time: Tone.Time(hit.time / 4, "m").toSeconds(),
        hit,
      })),
    );
    const part = new Tone.Part((time, value: { hit: DrumHit }) => {
      instrument.triggerDrum?.(time, value.hit);
    }, events);
    part.loop = true;
    part.loopEnd = `${track.pattern.length}m`;
    part.start(0);
    engine.parts.push(part);
  }
};

const applySong = (song: Song, time?: number) => {
  disposeParts();
  disposeInstruments();
  engine.song = song;
  engine.project = undefined;
  engine.source = "song";
  const now = time ?? Tone.now();
  Tone.Transport.bpm.rampTo(song.bpm, 0.05, now);
  Tone.Transport.swing = song.swing;
  Tone.Transport.swingSubdivision = "16n";
  Tone.Transport.loop = false;
  Tone.Transport.loopStart = 0;
  Tone.Transport.loopEnd = "1m";
  song.tracks.forEach(scheduleTrack);
};

const scheduleProjectTrack = (track: ProjectTrack, project: Project) => {
  const destination = engine.masterGain ?? Tone.getDestination();
  const instrumentTrack = projectTrackToInstrument(track);
  const instrument = createInstrument(instrumentTrack, destination);
  engine.instruments.push(instrument);

  const hasSolo = project.tracks.some((t) => t.mixer.solo);
  if (hasSolo && !track.mixer.solo) return;

  const clips = project.clips.filter((c) => c.trackId === track.id);
  const patternMap = Object.fromEntries(project.patterns.map((p) => [p.id, p]));
  if (instrumentTrack.role === "melodic") {
    const noteEvents = normalizeEvents(
      clips.flatMap((clip) => {
        const pattern = patternMap[clip.patternId];
        if (!pattern || pattern.kind !== "tonal") return [];
        return compileClipEvents(clip, pattern).notes ?? [];
      }),
    );
    if (!noteEvents.length) return;
    const part = new Tone.Part((time, value: { note: Note }) => {
      instrument.triggerNote?.(time, value.note);
    }, noteEvents);
    part.loop = true;
    part.loopEnd = `${project.lengthBars}m`;
    part.start(0);
    engine.parts.push(part);
  } else {
    const drumEvents = normalizeEvents(
      clips.flatMap((clip) => {
        const pattern = patternMap[clip.patternId];
        if (!pattern || pattern.kind !== "drum") return [];
        return compileClipEvents(clip, pattern).drums ?? [];
      }),
    );
    if (!drumEvents.length) return;
    const part = new Tone.Part((time, value: { hit: DrumHit }) => {
      instrument.triggerDrum?.(time, value.hit);
    }, drumEvents);
    part.loop = true;
    part.loopEnd = `${project.lengthBars}m`;
    part.start(0);
    engine.parts.push(part);
  }
};

const applyProject = (project: Project, time?: number) => {
  disposeParts();
  disposeInstruments();
  engine.project = project;
  engine.song = undefined;
  engine.source = "project";
  const now = time ?? Tone.now();
  Tone.Transport.bpm.rampTo(project.bpm, 0.05, now);
  Tone.Transport.swing = project.swing;
  Tone.Transport.swingSubdivision = "16n";
  Tone.Transport.loop = project.loop.enabled;
  Tone.Transport.loopStart = `${project.loop.startBar}m`;
  Tone.Transport.loopEnd = `${project.loop.endBar}m`;
  project.tracks.forEach((t) => scheduleProjectTrack(t, project));
};

export const initAudio = async () => {
  if (engine.initialized) return engine;
  await Tone.start();
  const chain = createMasterChain();
  engine.masterGain = chain.masterGain;
  engine.analyser = chain.analyser;
  engine.mediaDest = chain.mediaDest;
  engine.initialized = true;
  Tone.Transport.bpm.value = 120;
  Tone.Transport.swing = 0;
  return engine;
};

export const loadSong = async (song: Song, applyAtNextBar?: boolean) => {
  await initAudio();
  if (applyAtNextBar && Tone.Transport.state === "started") {
    Tone.Transport.scheduleOnce((time) => applySong(song, time), "1m");
  } else {
    applySong(song);
  }
};

export const loadProject = async (project: Project, applyAtNextBar?: boolean) => {
  await initAudio();
  if (applyAtNextBar && Tone.Transport.state === "started") {
    Tone.Transport.scheduleOnce((time) => applyProject(project, time), "1m");
  } else {
    applyProject(project);
  }
};

export const startTransport = async () => {
  await initAudio();
  if (!engine.song && !engine.project) return;
  if (engine.started) {
    Tone.Transport.start();
  } else {
    engine.started = true;
    Tone.Transport.start();
  }
};

export const pauseTransport = () => {
  Tone.Transport.pause();
};

export const stopTransport = () => {
  Tone.Transport.stop();
  Tone.Transport.position = 0;
};

export const setBpm = (bpm: number) => Tone.Transport.bpm.rampTo(bpm, 0.05);

export const setSwing = (swing: number) => {
  Tone.Transport.swing = swing;
};

export const setMasterGain = (value: number) => {
  engine.masterGain?.gain.rampTo(value, 0.05);
};

export const toggleMute = (trackId: Track["id"], muted: boolean) => {
  engine.instruments.find((i) => i.id === trackId)?.mute(muted);
};

export const getAnalyser = () => engine.analyser;

export const getMediaStream = () => engine.mediaDest;

export const getEngineSong = () => engine.song;

export const getEngineProject = () => engine.project;
