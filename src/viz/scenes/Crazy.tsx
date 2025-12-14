import { useMemo, useRef } from "react";
import { Color, Group, InstancedMesh, Mesh, MeshStandardMaterial, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import type { Bands } from "../useAudioBands";

interface Props {
  bands: Bands;
  quality: "low" | "med" | "high";
  motion?: number;
}

const temp = new Object3D();
const coreColor = new Color("#6cf2ff");
const palette = [new Color("#6cf2ff"), new Color("#c86bff"), new Color("#7affc6"), new Color("#ff6edb")];

export const Crazy = ({ bands, quality, motion = 1 }: Props) => {
  const group = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const coreMat = useRef<MeshStandardMaterial>(null);
  const ringsRef = useRef<Group>(null);
  const shardsRef = useRef<InstancedMesh>(null);
  const shardsMat = useRef<MeshStandardMaterial>(null);
  const sparksRef = useRef<InstancedMesh>(null);
  const sparksMat = useRef<MeshStandardMaterial>(null);
  const prevEnergy = useRef(0);
  const beatPhase = useRef(0);
  const ringDesync = useRef(0);
  const shardBurst = useRef(0);

  const ringCount = quality === "high" ? 7 : quality === "med" ? 5 : 3;
  const shardCount = quality === "high" ? 280 : quality === "med" ? 200 : 140;
  const sparkCount = quality === "high" ? 240 : quality === "med" ? 180 : 120;

  const ringData = useMemo(
    () =>
      new Array(ringCount).fill(0).map((_, i) => ({
        radius: 1.4 + i * 0.6,
        width: 0.18 + (i % 2) * 0.05,
        speed: (i % 2 === 0 ? 1 : -1) * (0.1 + i * 0.02),
        hueOffset: i * 0.05,
      })),
    [ringCount],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const dt = state.clock.getDelta();
    const energy = bands.energy;
    const low = bands.low;
    const mid = bands.mid;
    const high = bands.high;
    const beat = Math.max(0, energy - prevEnergy.current);
    prevEnergy.current = energy;

    // Signature triggers with simple cooldown decays
    beatPhase.current = Math.max(beatPhase.current * 0.9, beat * 1.8);
    ringDesync.current = Math.max(ringDesync.current * 0.92, beat > 0.1 ? 0.6 : 0);
    shardBurst.current = Math.max(shardBurst.current * 0.9, beat > 0.1 ? 0.8 : 0);

    const hueDrift = 0.1 * motion;

    // Core
    const core = coreRef.current;
    if (core) {
      const scale = 0.9 + energy * 0.9 * (1 + beatPhase.current * 0.8) + low * 0.5;
      core.scale.setScalar(scale);
      core.rotation.x += 0.3 * dt * (1 + motion);
      core.rotation.y -= 0.25 * dt * (1 + motion * 0.6);
    }
    if (coreMat.current) {
      const hue = (0.55 + t * 0.05 + high * 0.15) % 1;
      coreColor.setHSL(hue, 0.95, 0.55);
      coreMat.current.color.copy(coreColor);
      coreMat.current.emissive.copy(coreColor);
      coreMat.current.emissiveIntensity = Math.min(2.5, 1.2 + energy * 3 + beatPhase.current * 1.5);
    }

    // Rings
    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, idx) => {
        const ring = child as Mesh;
        const data = ringData[idx];
        const sway = 1 + mid * 0.6 + ringDesync.current * 0.4;
        const radiusMod = 1 + mid * 0.15 + Math.sin(t * 0.6 + idx) * 0.05;
        ring.rotation.z += data.speed * dt * sway * (1 + motion * 0.3);
        ring.scale.set(radiusMod, 1, radiusMod);
        const col = palette[idx % palette.length].clone();
        col.offsetHSL(hueDrift * 0.02 + data.hueOffset + high * 0.02, 0, 0);
        const mat = ring.material as MeshStandardMaterial;
        mat.color.copy(col);
        mat.emissive.copy(col);
        mat.emissiveIntensity = 0.6 + mid * 1.6 + ringDesync.current * 0.6;
      });
    }

    // Shards
    if (shardsRef.current) {
      const burst = 1 + shardBurst.current * 1.5;
      for (let i = 0; i < shardCount; i++) {
        const angle = (i / shardCount) * Math.PI * 12 + t * 0.5 * motion;
        const radius = 2.2 + (i % 15) * 0.06;
        const expand = radius * (1 + energy * 0.3) * burst;
        const y = Math.sin(angle * 0.5 + t * 0.6) * 0.6;
        temp.position.set(Math.cos(angle) * expand, y, Math.sin(angle) * expand);
        const baseScale = 0.08 + (i % 5) * 0.012;
        const len = 0.6 + energy * 0.8;
        temp.scale.set(baseScale, len, baseScale);
        temp.lookAt(0, 0, 0);
        temp.rotation.y += t * 0.2 + motion * 0.2;
        temp.updateMatrix();
        shardsRef.current.setMatrixAt(i, temp.matrix);
      }
      shardsRef.current.instanceMatrix.needsUpdate = true;
      if (shardsMat.current) {
        const col = palette[1].clone().offsetHSL(high * 0.05, 0, 0);
        shardsMat.current.color.copy(col);
        shardsMat.current.emissive.copy(col);
        shardsMat.current.emissiveIntensity = 0.5 + energy * 2;
      }
    }

    // Sparks
    if (sparksRef.current) {
      const pulse = 1 + Math.min(0.8, high * 1.2);
      for (let i = 0; i < sparkCount; i++) {
        const a = (i / sparkCount) * Math.PI * 14 + t * 1.2 * motion;
        const r = 2 + Math.sin(i + t * 0.5) * 0.4;
        const z = Math.cos(i * 0.3 + t) * 0.5;
        temp.position.set(Math.cos(a) * r, Math.sin(a * 1.1) * 0.8, Math.sin(a) * r + z);
        const s = 0.05 * pulse;
        temp.scale.setScalar(s);
        temp.rotation.y = a;
        temp.updateMatrix();
        sparksRef.current.setMatrixAt(i, temp.matrix);
      }
      sparksRef.current.instanceMatrix.needsUpdate = true;
      if (sparksMat.current) {
        const col = palette[0].clone().offsetHSL(high * 0.08, 0, 0);
        sparksMat.current.color.copy(col);
        sparksMat.current.emissive.copy(col);
        sparksMat.current.emissiveIntensity = Math.min(2, 0.8 + high * 2);
      }
    }

    // Group subtle orbit for perspective
    if (group.current) {
      group.current.rotation.x = 0.05 + Math.sin(t * 0.2) * 0.08 * motion;
      group.current.rotation.y = 0.1 + Math.cos(t * 0.25) * 0.12 * motion;
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 3, 3]} intensity={1.4} color="#7cf5ff" />
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#04070d" emissive="#060a11" emissiveIntensity={0.1} />
      </mesh>

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          ref={coreMat}
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={1.2}
          metalness={0.2}
          roughness={0.15}
        />
      </mesh>

      <group ref={ringsRef}>
        {ringData.map((ring, idx) => (
          <mesh key={idx} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ring.radius, ring.width, 16, 64]} />
            <meshStandardMaterial color={palette[idx % palette.length]} emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>

      <instancedMesh ref={shardsRef} args={[undefined as any, undefined as any, shardCount]}>
        <coneGeometry args={[1, 1.4, 6]} />
        <meshStandardMaterial
          ref={shardsMat}
          color={palette[1]}
          emissive={palette[1]}
          emissiveIntensity={1}
          roughness={0.3}
          metalness={0.2}
        />
      </instancedMesh>

      <instancedMesh ref={sparksRef} args={[undefined as any, undefined as any, sparkCount]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial
          ref={sparksMat}
          color={palette[0]}
          emissive={palette[0]}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
          roughness={0.25}
          metalness={0.15}
        />
      </instancedMesh>
    </group>
  );
};
