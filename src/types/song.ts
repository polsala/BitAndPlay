export type TrackId = string;
export type ScaleName = "major" | "minor" | "dorian" | "mixolydian";

export interface Note {
  time: number; // in beats
  duration: number; // in beats
  midi: number;
  velocity?: number;
}

export interface DrumHit {
  time: number; // in beats
  type: "kick" | "snare" | "hat" | "perc";
  velocity?: number;
}

export interface Pattern {
  steps: number;
  length: number; // in bars
  notes?: Note[];
  drums?: DrumHit[];
}

export type TrackRole = "melodic" | "drum" | "pcm";

export interface Track {
  id: TrackId;
  name: string;
  role: TrackRole;
  mute?: boolean;
  pan?: number;
  pattern: Pattern;
  synth: "pulse" | "triangle" | "noise" | "sine";
}

export interface Song {
  seed: number;
  preset: string;
  key: string;
  scale: ScaleName;
  bpm: number;
  swing: number;
  bars: number;
  energy: number;
  density: number;
  syncopation: number;
  complexity: number;
  quantize: 0.125 | 0.25 | 0.5;
  tracks: Track[];
}

export interface GeneratorParams {
  seed: number;
  preset: string;
  key: string;
  scale: ScaleName;
  bpm: number;
  bars: number;
  energy: number;
  density: number;
  syncopation: number;
  complexity: number;
}
