import { useMemo, useRef } from "react";
import { Color, Group, InstancedMesh, MeshStandardMaterial, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import type { Bands } from "../useAudioBands";

interface Props {
  bands: Bands;
  quality: "low" | "med" | "high";
  motion?: number;
}

const obj = new Object3D();

export const BlackHole = ({ bands, quality, motion = 1 }: Props) => {
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const color = useRef(new Color("#7ef5ff"));
  const group = useRef<Group>(null);
  const count = quality === "high" ? 420 : quality === "med" ? 320 : 220;

  const particles = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const radius = 0.9 + (i / count) * 3.6;
        return {
          radius,
          angle: (i / count) * Math.PI * 14,
          height: (Math.random() - 0.5) * 0.35 + Math.sin(radius) * 0.08,
        };
      }),
    [count],
  );

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const hue = (0.6 + bands.energy * 0.35 + Math.sin(t * 0.6) * 0.05) % 1;
    color.current.setHSL(hue, 0.95, 0.5 + bands.high * 0.2);
    if (material.current) {
      material.current.color.copy(color.current);
      material.current.emissive.copy(color.current);
      material.current.emissiveIntensity = 1 + bands.energy * 3;
      material.current.metalness = 0.2 + bands.mid * 0.2;
    }
    particles.forEach((p, i) => {
      const swirl = p.angle + t * (0.8 + bands.low * 1.4) * motion;
      const wobble = Math.sin(t * 1.6 + i) * 0.18 * motion;
      const radius = p.radius + Math.sin(t + i * 0.01) * 0.1 * motion + bands.mid * 0.35 * motion;
      const y = (p.height + wobble + bands.high * 0.3 * motion) * 0.6;
      obj.position.set(Math.cos(swirl) * radius, y, Math.sin(swirl) * radius);
      const scale = 0.035 + (p.radius / 7.5) * (1 + bands.energy * 0.8);
      obj.scale.setScalar(scale);
      obj.lookAt(0, 0, 0);
      obj.updateMatrix();
      mesh.current!.setMatrixAt(i, obj.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;

    if (group.current) {
      group.current.rotation.x = 0.1 + Math.sin(t * 0.25) * 0.08;
      group.current.rotation.y = t * 0.1 + bands.mid * 0.3;
    }
  });

  return (
    <group ref={group} scale={0.9}>
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#05070c" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 4.2, 96]} />
        <meshBasicMaterial color="#04070f" transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 3.2, 64]} />
        <meshBasicMaterial color="#12304b" transparent opacity={0.5} />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined as any, undefined as any, count]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial
          ref={material}
          color={color.current}
          emissive={color.current}
          emissiveIntensity={1.6}
          roughness={0.18}
          metalness={0.25}
          transparent
          opacity={0.95}
        />
      </instancedMesh>
    </group>
  );
};
