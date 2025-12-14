import type { TrackId } from "./song";

export const STEPS_PER_BEAT = 4;
export const STEPS_PER_BAR = 16;

export type TrackType = "PULSE1" | "PULSE2" | "TRIANGLE" | "NOISE" | "PCM";
export type DrumLane = "kick" | "snare" | "hat" | "perc" | "fx";

export interface MixerSettings {
  volume: number;
  mute?: boolean;
  solo?: boolean;
  pan?: number;
}

export interface ProjectTrack {
  id: TrackId;
  name: string;
  type: TrackType;
  mixer: MixerSettings;
}

export interface Clip {
  id: string;
  trackId: TrackId;
  startStep: number;
  lengthSteps: number;
  patternId: string;
}

export interface TonalNote {
  pitch: number;
  startStep: number;
  lengthSteps: number;
  velocity?: number;
}

export interface TonalPattern {
  id: string;
  kind: "tonal";
  stepsPerBar: number;
  lengthSteps: number;
  notes: TonalNote[];
}

export interface DrumPattern {
  id: string;
  kind: "drum";
  stepsPerBar: number;
  lengthSteps: number;
  lanes: Record<DrumLane, boolean[]>;
}

export type Pattern = TonalPattern | DrumPattern;

export interface LoopRegion {
  enabled: boolean;
  startBar: number;
  endBar: number;
}

export interface Project {
  bpm: number;
  swing: number;
  lengthBars: number;
  quantizeSteps: number;
  tracks: ProjectTrack[];
  patterns: Pattern[];
  clips: Clip[];
  loop: LoopRegion;
}
