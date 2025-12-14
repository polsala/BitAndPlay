import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useState, useEffect } from "react";
import * as Tone from "tone";
import { useAppStore } from "@/store/useAppStore";
import { useAudioBands } from "./useAudioBands";
import { TunnelSpectrum } from "./scenes/TunnelSpectrum";
import { NeonGrid } from "./scenes/NeonGrid";
import { OrbitBars } from "./scenes/OrbitBars";

interface Props {
  analyser?: Tone.Analyser | null;
  scene: "tunnel" | "grid" | "orbits";
  quality: "low" | "med" | "high";
}

const usePrefersReducedMotion = () => {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setPrefers(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return prefers;
};

export const VisualizerCanvas = ({ analyser, scene, quality }: Props) => {
  const bands = useAudioBands(analyser, 0.22);
  const ui = useAppStore((state) => state.ui);
  const prefersReducedMotion = usePrefersReducedMotion();
  const motion = prefersReducedMotion ? 0.35 : 1;

  const cameraZ = useMemo(() => (quality === "low" ? 10 : 8), [quality]);

  return (
    <div className={`relative h-[calc(100vh-88px)] w-full ${ui.cinema ? "" : "rounded-lg"}`}>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 55 }}
        dpr={quality === "high" ? [1, 1.5] : 1}
      >
        <color attach="background" args={["#070b12"]} />
        <fog attach="fog" args={["#070b12", 12, 30]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[4, 4, 4]} intensity={1.4} color="#4ef2ff" />
        <Suspense fallback={null}>
          {scene === "tunnel" && (
            <TunnelSpectrum bands={bands} quality={quality} motion={motion} />
          )}
          {scene === "grid" && <NeonGrid bands={bands} quality={quality} motion={motion} />}
          {scene === "orbits" && <OrbitBars bands={bands} quality={quality} motion={motion} />}
        </Suspense>
      </Canvas>
    </div>
  );
};
