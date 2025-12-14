import * as Tone from "tone";
import type { DrumHit, Song, Track } from "@/types/song";
import { createInstrument, createMasterChain, type InstrumentHandle } from "./instruments";

interface EngineState {
  initialized: boolean;
  started: boolean;
  song?: Song;
  instruments: InstrumentHandle[];
  parts: Tone.Part[];
  analyser?: Tone.Analyser;
  mediaDest?: MediaStreamAudioDestinationNode;
  masterGain?: Tone.Gain;
}

const engine: EngineState = {
  initialized: false,
  started: false,
  instruments: [],
  parts: [],
};

const disposeParts = () => {
  engine.parts.forEach((p) => p.dispose());
  engine.parts = [];
};

const disposeInstruments = () => {
  engine.instruments.forEach((i) => i.dispose());
  engine.instruments = [];
};

const scheduleTrack = (track: Track) => {
  const destination = engine.masterGain ?? Tone.getDestination();
  const instrument = createInstrument(track, destination);
  engine.instruments.push(instrument);

  if (track.role === "melodic" && track.pattern.notes) {
    const events = track.pattern.notes.map((note) => ({
      time: Tone.Time(note.time / 4, "m").toSeconds(),
      note,
    }));
    const part = new Tone.Part((time, value: { note: typeof track.pattern.notes[number] }) => {
      instrument.triggerNote?.(time, value.note);
    }, events);
    part.loop = true;
    part.loopEnd = `${track.pattern.length}m`;
    part.start(0);
    engine.parts.push(part);
  } else if (track.pattern.drums && (track.role === "drum" || track.role === "pcm")) {
    const events = track.pattern.drums.map((hit: DrumHit) => ({
      time: Tone.Time(hit.time / 4, "m").toSeconds(),
      hit,
    }));
    const part = new Tone.Part((time, value: { hit: DrumHit }) => {
      instrument.triggerDrum?.(time, value.hit);
    }, events);
    part.loop = true;
    part.loopEnd = `${track.pattern.length}m`;
    part.start(0);
    engine.parts.push(part);
  }
};

const applySong = (song: Song) => {
  disposeParts();
  disposeInstruments();
  engine.song = song;
  Tone.Transport.bpm.rampTo(song.bpm, 0.05);
  Tone.Transport.swing = song.swing;
  Tone.Transport.swingSubdivision = "16n";
  song.tracks.forEach(scheduleTrack);
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
    Tone.Transport.scheduleOnce(() => applySong(song), "1m");
  } else {
    applySong(song);
  }
};

export const startTransport = async () => {
  await initAudio();
  if (!engine.song) return;
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
