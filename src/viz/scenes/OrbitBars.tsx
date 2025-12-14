import { useMemo, useRef } from "react";
import { Group, Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import type { Bands } from "../useAudioBands";

interface Props {
  bands: Bands;
  quality: "low" | "med" | "high";
  motion?: number;
}

export const OrbitBars = ({ bands, quality, motion = 1 }: Props) => {
  const group = useRef<Group>(null);
  const bars = useMemo(() => {
    const count = quality === "high" ? 32 : quality === "med" ? 24 : 16;
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      radius: 4 + (i % 5) * 0.2,
    }));
  }, [quality]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((child, idx) => {
      const mesh = child as Mesh;
      const bar = bars[idx];
      if (!bar) return;
      const wobble = Math.sin(t + idx * 0.3) * 0.2 * motion;
      const radius = bar.radius + bands.low * 2 * motion + wobble;
      const y = 0.5 + bands.mid * 4 * motion + Math.sin(t * 0.5 + idx) * 0.2 * motion;
      const angle = bar.angle + t * 0.2 * motion + bands.high * 0.5 * motion;
      mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      mesh.lookAt(0, 0.5, 0);
      mesh.scale.y = 1 + bands.energy * 6 * motion;
    });
  });

  return (
    <group ref={group}>
      {bars.map((bar, idx) => (
        <mesh key={idx} position={[Math.cos(bar.angle) * bar.radius, 0.5, Math.sin(bar.angle) * bar.radius]}>
          <boxGeometry args={[0.15, 1.5, 0.15]} />
          <meshStandardMaterial
            color="#7af7ff"
            emissive="#7af7ff"
            emissiveIntensity={0.4 + bands.high * 1.2}
            metalness={0.2}
            roughness={0.2}
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 6.5, 64]} />
        <meshBasicMaterial color="#1c2a3d" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};
