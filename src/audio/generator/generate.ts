import type { DrumHit, GeneratorParams, Note, Song, Track } from "@/types/song";
import { chordProgressions, arpMotifs, drumMotifs } from "./patterns";
import { chordDegrees, clampMidi, degreeToMidi } from "./theory";
import { mulberry32, pick, randomInt, seededHash } from "./rng";

const STEPS_PER_BAR = 16;
const STEP_DURATION = 1 / 4; // 16th notes in beats

export const defaultGeneratorParams: GeneratorParams = {
  seed: 1,
  preset: "Voyager",
  key: "C",
  scale: "minor",
  bpm: 120,
  bars: 8,
  energy: 0.6,
  density: 0.65,
  syncopation: 0.35,
  complexity: 0.35,
};

const buildHarmony = (
  rngSeed: number,
  params: GeneratorParams,
): { chords: number[]; harmonyNotes: Note[] } => {
  const rng = mulberry32(rngSeed);
  const progression = pick(rng, chordProgressions);
  const chords: number[] = [];
  const harmonyNotes: Note[] = [];
  for (let bar = 0; bar < params.bars; bar++) {
    const chordDegree = progression[bar % progression.length];
    chords.push(chordDegree);
    const notes = chordDegrees(chordDegree);
    const octave = 4;
    harmonyNotes.push({
      time: bar * 4,
      duration: 4,
      midi: degreeToMidi(notes[0], octave, params.key, params.scale),
      velocity: 0.6,
    });
    // occasional counter-line
    if (rng() < params.complexity) {
      harmonyNotes.push({
        time: bar * 4 + 2,
        duration: 2,
        midi: degreeToMidi(notes[1], octave + 1, params.key, params.scale),
        velocity: 0.4,
      });
    }
  }
  return { chords, harmonyNotes };
};

const buildMelody = (
  rngSeed: number,
  params: GeneratorParams,
  chordMap: number[],
): Note[] => {
  const rng = mulberry32(rngSeed);
  const motif = pick(rng, arpMotifs);
  const notes: Note[] = [];
  for (let bar = 0; bar < params.bars; bar++) {
    for (let step = 0; step < STEPS_PER_BAR; step++) {
      if (rng() > params.density) continue;
      const motifNote = motif[step % motif.length];
      const chordDegree = chordMap[bar % chordMap.length];
      const octave = 5 + (rng() > 0.7 ? 1 : 0);
      const midi = clampMidi(
        degreeToMidi(chordDegree + motifNote - 1, octave, params.key, params.scale),
      );
      notes.push({
        time: bar * 4 + step * STEP_DURATION,
        duration: rng() > 0.5 ? STEP_DURATION : STEP_DURATION * 2,
        midi,
        velocity: 0.7 + rng() * 0.2,
      });
    }
  }
  return notes;
};

const buildBass = (
  rngSeed: number,
  params: GeneratorParams,
  chordMap: number[],
): Note[] => {
  const rng = mulberry32(rngSeed);
  const notes: Note[] = [];
  for (let bar = 0; bar < params.bars; bar++) {
    const chordDegree = chordMap[bar % chordMap.length];
    const base = clampMidi(degreeToMidi(chordDegree, 3, params.key, params.scale));
    const grooveSteps = rng() > params.syncopation ? [0, 8] : [0, 6, 12];
    grooveSteps.forEach((step) => {
      notes.push({
        time: bar * 4 + (step / STEPS_PER_BAR) * 4,
        duration: STEP_DURATION * 2,
        midi: base,
        velocity: 0.8,
      });
    });
  }
  return notes;
};

const buildDrums = (rngSeed: number, params: GeneratorParams) => {
  const rng = mulberry32(rngSeed);
  const motif = pick(rng, drumMotifs);
  const drums: DrumHit[] = [];
  for (let bar = 0; bar < params.bars; bar++) {
    motif.kick.forEach((s) =>
      drums.push({
        time: bar * 4 + (s / STEPS_PER_BAR) * 4,
        type: "kick" as const,
        velocity: 0.9,
      }),
    );
    motif.snare.forEach((s) =>
      drums.push({
        time: bar * 4 + (s / STEPS_PER_BAR) * 4,
        type: "snare" as const,
        velocity: 0.8,
      }),
    );
    motif.hat.forEach((s) => {
      if (rng() > params.syncopation + 0.2) return;
      drums.push({
        time: bar * 4 + (s / STEPS_PER_BAR) * 4,
        type: "hat" as const,
        velocity: 0.6 + rng() * 0.2,
      });
    });
  }
  return drums;
};

export const generateSong = (incoming?: Partial<GeneratorParams>): Song => {
  const params: GeneratorParams = { ...defaultGeneratorParams, ...incoming };
  const swing = 0.05 + params.syncopation * 0.1;

  const harmonySeed = seededHash(params.seed, "harmony");
  const melodySeed = seededHash(params.seed, "melody");
  const bassSeed = seededHash(params.seed, "bass");
  const drumsSeed = seededHash(params.seed, "drums");

  const { chords, harmonyNotes } = buildHarmony(harmonySeed, params);
  const melody = buildMelody(melodySeed, params, chords);
  const bass = buildBass(bassSeed, params, chords);
  const drums = buildDrums(drumsSeed, params);

  const tracks: Track[] = [
    {
      id: "pulse1",
      name: "Pulse 1",
      role: "melodic",
      synth: "pulse",
      pan: -0.15,
      pattern: { steps: STEPS_PER_BAR, length: params.bars, notes: melody },
    },
    {
      id: "pulse2",
      name: "Pulse 2",
      role: "melodic",
      synth: "pulse",
      pan: 0.18,
      pattern: { steps: STEPS_PER_BAR, length: params.bars, notes: harmonyNotes },
    },
    {
      id: "triangle",
      name: "Triangle Bass",
      role: "melodic",
      synth: "triangle",
      pan: 0,
      pattern: { steps: STEPS_PER_BAR, length: params.bars, notes: bass },
    },
    {
      id: "noise",
      name: "Noise Drums",
      role: "drum",
      synth: "noise",
      pattern: { steps: STEPS_PER_BAR, length: params.bars, drums },
    },
    {
      id: "pcm",
      name: "Transient",
      role: "pcm",
      synth: "sine",
      pattern: { steps: STEPS_PER_BAR, length: params.bars, drums },
    },
  ];

  return {
    seed: params.seed,
    preset: params.preset,
    key: params.key,
    scale: params.scale,
    bpm: params.bpm,
    swing,
    bars: params.bars,
    energy: params.energy,
    density: params.density,
    syncopation: params.syncopation,
    complexity: params.complexity,
    quantize: 0.25,
    tracks,
  };
};

export const generateVariation = (song: Song): Song =>
  generateSong({
    seed: randomInt(mulberry32(song.seed + 42), 1, 2 ** 31 - 1),
    preset: song.preset,
    key: song.key,
    scale: song.scale,
    bpm: song.bpm,
    bars: song.bars,
    energy: song.energy,
    density: song.density,
    syncopation: song.syncopation,
    complexity: song.complexity + 0.05,
  });
