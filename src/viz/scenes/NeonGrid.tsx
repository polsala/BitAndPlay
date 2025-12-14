import { useMemo, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import type { Bands } from "../useAudioBands";

interface Props {
  bands: Bands;
  quality: "low" | "med" | "high";
  motion?: number;
}

const obj = new Object3D();

export const NeonGrid = ({ bands, quality, motion = 1 }: Props) => {
  const mesh = useRef<InstancedMesh>(null);
  const gridSize = quality === "high" ? 14 : 10;
  const spacing = 0.8;
  const count = gridSize * gridSize;

  const positions = useMemo(() => {
    const arr: Array<[number, number]> = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        arr.push([(x - gridSize / 2) * spacing, (y - gridSize / 2) * spacing]);
      }
    }
    return arr;
  }, [gridSize]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    positions.forEach(([x, z], i) => {
      const wave = Math.sin(t + (x + z) * 0.3) * 0.4 * motion;
      const height = 0.3 + wave + bands.low * 2 * motion + bands.high * 1.5 * motion;
      obj.position.set(x, height / 2 - 1.4, z - t * 0.3 * motion);
      obj.scale.set(0.4, height, 0.4);
      obj.updateMatrix();
      mesh.current!.setMatrixAt(i, obj.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0b101d" emissive="#0b101d" />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined as any, undefined as any, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#64f0ff"
          emissive="#64f0ff"
          emissiveIntensity={0.5 + bands.high * 1.5}
          roughness={0.3}
          metalness={0.1}
        />
      </instancedMesh>
    </>
  );
};
