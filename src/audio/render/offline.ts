import type { DrumHit, Song } from "@/types/song";
import { audioBufferToWav } from "./wav";

export type OfflinePhase = "rendering" | "encoding" | "done";

export interface OfflineOptions {
  sampleRate: number;
  normalize?: boolean;
  onPhase?: (phase: OfflinePhase) => void;
}

const scheduleTone = (
  ctx: OfflineAudioContext,
  master: GainNode,
  time: number,
  duration: number,
  frequency: number,
  type: OscillatorType,
  velocity = 0.8,
) => {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, time);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(velocity, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain).connect(master);
  osc.start(time);
  osc.stop(time + duration + 0.05);
};

const scheduleNoise = (
  ctx: OfflineAudioContext,
  master: GainNode,
  hit: DrumHit,
  time: number,
) => {
  const bufferSize = 0.2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const gain = ctx.createGain();
  const duration = hit.type === "hat" ? 0.05 : hit.type === "snare" ? 0.12 : 0.16;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(hit.velocity ?? 0.8, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  noise.connect(gain).connect(master);
  noise.start(time);
  noise.stop(time + duration + 0.05);
};

export const renderSongOffline = async (
  song: Song,
  options: OfflineOptions,
): Promise<Blob> => {
  const { sampleRate, normalize, onPhase } = options;
  const secondsPerBeat = 60 / song.bpm;
  const secondsPerBar = secondsPerBeat * 4;
  const duration = secondsPerBar * song.bars + 1;
  const ctx = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
  const master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  song.tracks.forEach((track) => {
    if (track.role === "melodic" && track.pattern.notes) {
      track.pattern.notes.forEach((note) => {
        const time = note.time * secondsPerBeat; // beats to seconds
        const durationSec = note.duration * secondsPerBeat;
        const freq = 440 * Math.pow(2, (note.midi - 69) / 12);
        const oscType = track.synth === "triangle" ? "triangle" : "square";
        scheduleTone(ctx, master, time, durationSec, freq, oscType, note.velocity ?? 0.8);
      });
    }
    if (track.pattern.drums) {
      track.pattern.drums.forEach((hit) => {
        const time = hit.time * secondsPerBeat;
        if (track.synth === "noise") {
          scheduleNoise(ctx, master, hit, time);
        } else {
          const freq = hit.type === "kick" ? 80 : hit.type === "snare" ? 200 : 400;
          scheduleTone(ctx, master, time, 0.1, freq, "sine", hit.velocity ?? 0.6);
        }
      });
    }
  });

  onPhase?.("rendering");
  const buffer = await ctx.startRendering();
  onPhase?.("encoding");
  const wav = audioBufferToWav(buffer, { normalize });
  onPhase?.("done");
  return wav;
};
