import { useEffect, useState } from "react";
import * as Tone from "tone";

export interface Bands {
  low: number;
  mid: number;
  high: number;
  energy: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const useAudioBands = (analyser?: Tone.Analyser | null, smoothing = 0.2) => {
  const [bands, setBands] = useState<Bands>({ low: 0, mid: 0, high: 0, energy: 0 });

  // fallback idle motion to keep visuals alive when analyser isn't ready yet
  useEffect(() => {
    if (analyser) return;
    let mounted = true;
    const started = performance.now();
    const tick = () => {
      if (!mounted) return;
      const t = (performance.now() - started) / 1000;
      setBands({
        low: 0.2 * Math.sin(t * 0.6),
        mid: 0.25 * Math.sin(t * 0.8 + 1),
        high: 0.3 * Math.sin(t * 1.1 + 2),
        energy: 0.35,
      });
      requestAnimationFrame(tick);
    };
    tick();
    return () => {
      mounted = false;
    };
  }, [analyser]);

  useEffect(() => {
    if (!analyser) return;
    let mounted = true;

    const update = () => {
      if (!mounted) return;
      const current = analyser.getValue() as Float32Array;
      const binCount = current.length;
      const thirds = Math.floor(binCount / 3);
      const low = average(current.subarray(0, thirds));
      const mid = average(current.subarray(thirds, thirds * 2));
      const high = average(current.subarray(thirds * 2));
      const energy = Math.max(low, mid, high);
      setBands((prev) => ({
        low: lerp(prev.low, low, smoothing),
        mid: lerp(prev.mid, mid, smoothing),
        high: lerp(prev.high, high, smoothing),
        energy: lerp(prev.energy, energy, smoothing),
      }));
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
    return () => {
      mounted = false;
    };
  }, [analyser, smoothing]);

  return bands;
};

const average = (arr: Float32Array) => {
  if (!arr.length) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += Math.abs(arr[i]);
  }
  return sum / arr.length;
};
