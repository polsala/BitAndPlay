import { useMemo, useRef } from "react";
import { Color, InstancedMesh, MeshStandardMaterial, Object3D } from "three";
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
  const material = useRef<MeshStandardMaterial>(null);
  const gridSize = quality === "high" ? 14 : 10;
  const spacing = 0.8;
  const count = gridSize * gridSize;
  const color = useRef(new Color("#64f0ff"));

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
    const beat = Math.sin(t * 0.7) * 0.5 + 0.5;
    const hue = (0.5 + bands.high * 0.25 + beat * 0.05) % 1;
    color.current.setHSL(hue, 0.9, 0.55 + bands.energy * 0.1);
    if (material.current) {
      material.current.color.copy(color.current);
      material.current.emissive.copy(color.current);
      material.current.emissiveIntensity = 0.5 + bands.energy * 2.2;
    }
    positions.forEach(([x, z], i) => {
      const wave = Math.sin(t + (x + z) * 0.3) * 0.4 * motion;
      const height = 0.3 + wave + bands.low * 2 * motion + bands.high * 1.5 * motion;
      obj.position.set(x, height / 2 - 1.4, z);
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
          ref={material}
          color={color.current}
          emissive={color.current}
          emissiveIntensity={0.9}
          roughness={0.25}
          metalness={0.2}
        />
      </instancedMesh>
    </>
  );
};
