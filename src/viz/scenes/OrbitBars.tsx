import { useMemo, useRef } from "react";
import { Color, Group, Mesh, MeshStandardMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import type { Bands } from "../useAudioBands";

interface Props {
  bands: Bands;
  quality: "low" | "med" | "high";
  motion?: number;
}

export const OrbitBars = ({ bands, quality, motion = 1 }: Props) => {
  const group = useRef<Group>(null);
  const color = useRef(new Color("#7af7ff"));
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
    const hue = (0.55 + bands.high * 0.35 + Math.sin(t * 1.1) * 0.08) % 1;
    color.current.setHSL(hue, 0.95, 0.55 + bands.energy * 0.15);
    group.current.children.forEach((child, idx) => {
      const mesh = child as Mesh;
      const bar = bars[idx];
      if (!bar) return;
      const mat = mesh.material as MeshStandardMaterial;
      if (mat) {
        mat.color.copy(color.current);
        mat.emissive.copy(color.current);
        mat.emissiveIntensity = 0.5 + bands.energy * 2;
      }
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
            color={color.current}
            emissive={color.current}
            emissiveIntensity={0.8}
            metalness={0.25}
            roughness={0.18}
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 6.5, 64]} />
        <meshBasicMaterial color="#1c2a3d" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 3.5, 48]} />
        <meshBasicMaterial color="#6bf2ff" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};
