import type { ScaleName } from "@/types/song";

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const SCALE_PATTERNS: Record<ScaleName, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

export const midiFromKey = (key: string): number => {
  const normalized = key.trim();
  return NOTE_TO_SEMITONE[normalized] ?? 0;
};

export const scaleNotes = (root: string, scale: ScaleName): number[] => {
  const rootMidi = midiFromKey(root);
  const pattern = SCALE_PATTERNS[scale];
  return pattern.map((interval) => (rootMidi + interval) % 12);
};

export const degreeToMidi = (
  degree: number,
  octave: number,
  key: string,
  scale: ScaleName,
): number => {
  const degrees = scaleNotes(key, scale);
  const note = degrees[(degree - 1 + degrees.length * 10) % degrees.length];
  return note + 12 * octave;
};

export const chordDegrees = (degree: number): number[] => {
  const deg = ((degree - 1) % 7) + 1;
  return [deg, deg + 2, deg + 4];
};

export const clampMidi = (midi: number, min = 36, max = 96): number =>
  Math.min(max, Math.max(min, midi));
