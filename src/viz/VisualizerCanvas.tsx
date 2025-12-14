import { Canvas } from "@react-three/fiber";
import { useMemo, useState, useEffect } from "react";
import * as Tone from "tone";
import { useAppStore } from "@/store/useAppStore";
import { useAudioBands } from "./useAudioBands";
import { TunnelSpectrum } from "./scenes/TunnelSpectrum";
import { NeonGrid } from "./scenes/NeonGrid";
import { OrbitBars } from "./scenes/OrbitBars";
import { Starfield } from "./scenes/Starfield";

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
  const webglSupported = useMemo(() => {
    if (typeof document === "undefined") return true;
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  }, []);

  const cameraZ = useMemo(() => (quality === "low" ? 10 : 8), [quality]);

  if (!webglSupported) {
    return (
      <div className="relative h-[calc(100vh-88px)] w-full rounded-lg border border-border/60 bg-gradient-to-br from-[#0b0f1a] to-[#0a0d15]">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_20%,rgba(100,240,255,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.05),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(100,240,255,0.06),transparent_25%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border border-border/70 bg-black/70 px-4 py-3 text-center shadow-glow">
            <div className="text-sm font-semibold">WebGL not available</div>
            <p className="text-xs text-muted-foreground">
              Enable hardware acceleration to view the 3D visualizer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-[calc(100vh-88px)] w-full ${ui.cinema ? "" : "rounded-lg"}`}>
      <Canvas
        frameloop="always"
        camera={{ position: [0, 0, cameraZ], fov: 55 }}
        dpr={quality === "high" ? [1, 1.5] : 1}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#070b12"]} />
        <fog attach="fog" args={["#070b12", 12, 30]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[4, 4, 4]} intensity={1.4} color="#4ef2ff" />
        <Starfield />
        {scene === "tunnel" && <TunnelSpectrum bands={bands} quality={quality} motion={motion} />}
        {scene === "grid" && <NeonGrid bands={bands} quality={quality} motion={motion} />}
        {scene === "orbits" && <OrbitBars bands={bands} quality={quality} motion={motion} />}
      </Canvas>
    </div>
  );
};
