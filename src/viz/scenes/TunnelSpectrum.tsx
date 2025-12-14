import { useMemo, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import type { Bands } from "../useAudioBands";

interface Props {
  bands: Bands;
  quality: "low" | "med" | "high";
  motion?: number;
}

const temp = new Object3D();

export const TunnelSpectrum = ({ bands, quality, motion = 1 }: Props) => {
  const mesh = useRef<InstancedMesh>(null);
  const count = quality === "high" ? 180 : quality === "med" ? 120 : 80;

  const ringZ = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => ({
        z: -i * 0.25,
        scale: 1 - i / (count * 1.3),
      })),
    [count],
  );

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * 0.4;
    ringZ.forEach((ring, i) => {
      const pulsar = 1 + bands.low * 0.8 * motion + Math.sin(t + i * 0.1) * 0.05 * motion;
      temp.position.set(0, 0, ring.z + (bands.mid * 2 - bands.high) * 0.5 * motion);
      temp.rotation.z = t * 0.5 + i * 0.01;
      const s = ring.scale * pulsar;
      temp.scale.setScalar(s);
      temp.updateMatrix();
      mesh.current!.setMatrixAt(i, temp.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined as any, undefined as any, count]}>
      <torusGeometry args={[2, 0.1, 16, 64]} />
      <meshStandardMaterial
        color="#5bf3ff"
        emissive="#5bf3ff"
        emissiveIntensity={0.6 + bands.high * 1.5}
        metalness={0.1}
        roughness={0.2}
      />
    </instancedMesh>
  );
};
