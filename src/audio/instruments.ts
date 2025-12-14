import * as Tone from "tone";
import type { DrumHit, Note, Track } from "@/types/song";

export interface InstrumentHandle {
  id: Track["id"];
  gain: Tone.Gain;
  triggerNote?: (time: Tone.Unit.Time, note: Note) => void;
  triggerDrum?: (time: Tone.Unit.Time, hit: DrumHit) => void;
  mute: (muted: boolean) => void;
  dispose: () => void;
}

const makeTimeSafe = () => {
  let last = -Infinity;
  return (time: number) => {
    const t = time <= last ? last + 0.0001 : time;
    last = t;
    return t;
  };
};

export const createMasterChain = () => {
  const masterGain = new Tone.Gain(0.9);
  const limiter = new Tone.Limiter(-1);
  const analyser = new Tone.Analyser("fft", 256);
  const meter = new Tone.Meter();
  const raw = Tone.getContext().rawContext as AudioContext;
  const mediaDest = raw.createMediaStreamDestination();

  masterGain.connect(limiter);
  limiter.fan(Tone.Destination, analyser, meter);
  limiter.connect(mediaDest);

  return { masterGain, limiter, analyser, meter, mediaDest };
};

const createPulse = (track: Track, dest: Tone.ToneAudioNode): InstrumentHandle => {
  const synth = new Tone.MonoSynth({
    oscillator: { type: "square" },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.2, release: 0.2 },
    filterEnvelope: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.2 },
    volume: -8,
  });
  const gain = new Tone.Gain(0.9);
  synth.chain(gain, dest);
  const safeTime = makeTimeSafe();
  return {
    id: track.id,
    gain,
    triggerNote: (time, note) => {
      const freq = Tone.Frequency(note.midi, "midi").toFrequency();
      const t = safeTime(Tone.Time(time).toSeconds());
      synth.triggerAttackRelease(freq, note.duration, t, note.velocity ?? 0.8);
    },
    mute: (muted) => gain.gain.rampTo(muted ? 0 : 0.9, 0.02),
    dispose: () => synth.dispose(),
  };
};

const createTriangle = (track: Track, dest: Tone.ToneAudioNode): InstrumentHandle => {
  const synth = new Tone.MonoSynth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.4, release: 0.35 },
    volume: -10,
  });
  const gain = new Tone.Gain(0.9);
  synth.chain(gain, dest);
  const safeTime = makeTimeSafe();
  return {
    id: track.id,
    gain,
    triggerNote: (time, note) => {
      const freq = Tone.Frequency(note.midi, "midi").toFrequency();
      const t = safeTime(Tone.Time(time).toSeconds());
      synth.triggerAttackRelease(freq, note.duration, t, note.velocity ?? 0.8);
    },
    mute: (muted) => gain.gain.rampTo(muted ? 0 : 0.9, 0.02),
    dispose: () => synth.dispose(),
  };
};

const createNoise = (track: Track, dest: Tone.ToneAudioNode): InstrumentHandle => {
  const synth = new Tone.NoiseSynth({
    envelope: { attack: 0.001, decay: 0.08, sustain: 0.01 },
    volume: -18,
  });
  const gain = new Tone.Gain(0.8);
  synth.chain(gain, dest);
  const safeTime = makeTimeSafe();
  return {
    id: track.id,
    gain,
    triggerDrum: (time, hit) => {
      const decay = hit.type === "hat" ? 0.05 : hit.type === "snare" ? 0.12 : 0.18;
      synth.envelope.decay = decay;
      const t = safeTime(Tone.Time(time).toSeconds());
      synth.triggerAttackRelease(decay, t, hit.velocity ?? 0.6);
    },
    mute: (muted) => gain.gain.rampTo(muted ? 0 : 0.8, 0.02),
    dispose: () => synth.dispose(),
  };
};

const createTransient = (track: Track, dest: Tone.ToneAudioNode): InstrumentHandle => {
  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0, decay: 0.12, sustain: 0, release: 0.05 },
    volume: -12,
  });
  const gain = new Tone.Gain(0.5);
  synth.chain(gain, dest);
  const safeTime = makeTimeSafe();
  return {
    id: track.id,
    gain,
    triggerDrum: (time, hit) => {
      const freq = hit.type === "kick" ? 80 : hit.type === "snare" ? 180 : 400;
      const t = safeTime(Tone.Time(time).toSeconds());
      synth.triggerAttackRelease(freq, 0.1, t, 0.7);
    },
    mute: (muted) => gain.gain.rampTo(muted ? 0 : 0.5, 0.02),
    dispose: () => synth.dispose(),
  };
};

export const createInstrument = (
  track: Track,
  destination: Tone.ToneAudioNode,
): InstrumentHandle => {
  switch (track.synth) {
    case "pulse":
      return createPulse(track, destination);
    case "triangle":
      return createTriangle(track, destination);
    case "noise":
      return createNoise(track, destination);
    case "sine":
    default:
      return createTransient(track, destination);
  }
};
