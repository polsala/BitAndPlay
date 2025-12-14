import type { Song, Track } from "@/types/song";
import {
  type DrumLane,
  type Pattern,
  type Project,
  type ProjectTrack,
  STEPS_PER_BAR,
  STEPS_PER_BEAT,
  type TrackType,
} from "@/types/project";
import { createDeterministicId } from "@/utils/id";

const resolveTrackType = (id: Track["id"]): TrackType => {
  if (id === "pulse1") return "PULSE1";
  if (id === "pulse2") return "PULSE2";
  if (id === "triangle") return "TRIANGLE";
  if (id === "noise") return "NOISE";
  if (id === "pcm") return "PCM";
  return "SINE";
};

const makeDrumLanes = (lengthSteps: number) => {
  const lanes: Record<DrumLane, boolean[]> = {
    kick: Array.from({ length: lengthSteps }, () => false),
    snare: Array.from({ length: lengthSteps }, () => false),
    hat: Array.from({ length: lengthSteps }, () => false),
    perc: Array.from({ length: lengthSteps }, () => false),
    fx: Array.from({ length: lengthSteps }, () => false),
  };
  return lanes;
};

export const projectFromSong = (song: Song): Project => {
  const tracks: ProjectTrack[] = [];
  const patterns: Pattern[] = [];
  const clips: Project["clips"] = [];

  song.tracks.forEach((track) => {
    const type = resolveTrackType(track.id);
    const projectTrack: ProjectTrack = {
      id: track.id,
      name: track.name,
      type,
      mixer: { volume: 0.9, mute: track.mute },
    };
    tracks.push(projectTrack);

    const patternId = createDeterministicId(`pat-${track.id}`);
    const lengthSteps = (track.pattern.length ?? song.bars) * STEPS_PER_BAR;
    if (track.role === "melodic" && track.pattern.notes) {
      patterns.push({
        id: patternId,
        kind: "tonal",
        stepsPerBar: STEPS_PER_BAR,
        lengthSteps,
        notes: track.pattern.notes.map((note) => ({
          pitch: note.midi,
          startStep: Math.max(0, Math.round(note.time * STEPS_PER_BEAT)),
          lengthSteps: Math.max(1, Math.round(note.duration * STEPS_PER_BEAT)),
          velocity: note.velocity ?? 0.8,
        })),
      });
    } else {
      const lanes = makeDrumLanes(lengthSteps);
      (track.pattern.drums ?? []).forEach((hit) => {
        const lane = (hit.type ?? "perc") as DrumLane;
        const index = Math.max(0, Math.round(hit.time * STEPS_PER_BEAT));
        if (lanes[lane] && lanes[lane][index] !== undefined) {
          lanes[lane][index] = true;
        }
      });
      patterns.push({
        id: patternId,
        kind: "drum",
        stepsPerBar: STEPS_PER_BAR,
        lengthSteps,
        lanes,
      });
    }

    clips.push({
      id: createDeterministicId(`clip-${track.id}`),
      trackId: track.id,
      startStep: 0,
      lengthSteps,
      patternId,
    });
  });

  const lengthBars = song.bars;
  return {
    bpm: song.bpm,
    swing: song.swing,
    lengthBars,
    quantizeSteps: 1,
    tracks,
    patterns,
    clips,
    loop: { enabled: false, startBar: 0, endBar: Math.max(1, lengthBars) },
  };
};
