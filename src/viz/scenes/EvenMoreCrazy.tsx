import { useMemo, useRef } from "react";
import { Color, Group, InstancedMesh, Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import type { Bands } from "../useAudioBands";

interface Props {
  bands: Bands;
  quality: "low" | "med" | "high";
  motion?: number;
}

const tmp = new Object3D();
const tmpVec = new Vector3();

const basePalette = [
  new Color("#ff63ff"), // magenta
  new Color("#62e8ff"), // cyan
  new Color("#7a6bff"), // violet
  new Color("#5cffb4"), // acid green accent
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const EvenMoreCrazy = ({ bands, quality, motion = 1 }: Props) => {
  const group = useRef<Group>(null);
  const tunnelRef = useRef<InstancedMesh>(null);
  const tunnelMat = useRef<MeshStandardMaterial>(null);
  const mandalaRef = useRef<Group>(null);
  const mandalaMat = useRef<MeshStandardMaterial>(null);
  const ribbonsRef = useRef<Group>(null);
  const confettiRef = useRef<InstancedMesh>(null);
  const confettiMat = useRef<MeshStandardMaterial>(null);

  const prevEnergy = useRef(0);
  const flipPhase = useRef(0);
  const warpPhase = useRef(0);
  const bloomPhase = useRef(0);
  const cameraPush = useRef(0);
  const baseHue = useRef(0.6);

  const segmentCount = quality === "high" ? 120 : quality === "med" ? 96 : 72;
  const confettiCount = quality === "high" ? 380 : quality === "med" ? 280 : 200;
  const ribbonCount = quality === "high" ? 6 : quality === "med" ? 4 : 3;
  const segmentSpacing = 0.3;

  const tunnelData = useMemo(
    () =>
      new Array(segmentCount).fill(0).map((_, i) => ({
        z: -i * segmentSpacing,
        phase: Math.random() * Math.PI * 2,
        wobble: Math.random() * 0.4 + 0.6,
        hueShift: (i / segmentCount) * 0.2,
      })),
    [segmentCount],
  );

  const ribbonData = useMemo(
    () =>
      new Array(ribbonCount).fill(0).map((_, i) => ({
        radius: 2.2 + i * 0.45,
        speed: (i % 2 === 0 ? 1 : -1) * (0.35 + i * 0.08),
        offset: Math.random() * Math.PI * 2,
      })),
    [ribbonCount],
  );

  const colorForHue = (h: number, sat = 0.9, light = 0.55) => {
    const c = new Color();
    c.setHSL(h % 1, sat, light);
    return c;
  };

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const dt = state.clock.getDelta();
    const { low, mid, high, energy } = bands;

    const beat = Math.max(0, energy - prevEnergy.current);
    prevEnergy.current = energy;

    flipPhase.current = Math.max(flipPhase.current * 0.9, beat > 0.12 ? 0.6 : 0);
    warpPhase.current = Math.max(warpPhase.current * 0.9, beat > 0.1 ? 0.7 : 0);
    bloomPhase.current = Math.max(bloomPhase.current * 0.9, beat > 0.14 ? 0.8 : 0);
    cameraPush.current = Math.max(cameraPush.current * 0.92, beat > 0.1 ? 0.45 : 0);
    baseHue.current = (baseHue.current + dt * 0.02 + high * 0.01 - low * 0.005) % 1;
    const hueBase = baseHue.current;
    const motionScale = 0.6 + motion * 0.6;

    // Tunnel
    if (tunnelRef.current && tunnelMat.current) {
      const speed = (1.5 + energy * 3 + warpPhase.current * 3) * motionScale;
      for (let i = 0; i < segmentCount; i++) {
        const seg = tunnelData[i];
        seg.z += dt * speed;
        if (seg.z > segmentSpacing * 2) seg.z -= segmentCount * segmentSpacing;
        const twist = (mid * 0.7 + warpPhase.current * 0.5 + flipPhase.current * 0.4) * (i % 2 ? 1 : -1);
        const radius = 1.3 + low * 0.6 + Math.sin(t * 0.6 + seg.phase) * 0.15;
        const hue = hueBase + seg.hueShift + low * 0.05 - high * 0.03;
        const col = colorForHue(hue, 0.9, 0.52 + (i / segmentCount) * 0.06);
        tunnelMat.current.color.copy(col);
        tunnelMat.current.emissive.copy(col);
        tunnelMat.current.emissiveIntensity = Math.min(2.2, 0.9 + energy * 2 + warpPhase.current * 1.4);
        tmp.position.set(0, 0, seg.z);
        tmp.rotation.z = seg.phase + t * 0.35 + twist;
        tmp.scale.setScalar(radius);
        tmp.updateMatrix();
        tunnelRef.current.setMatrixAt(i, tmp.matrix);
      }
      tunnelRef.current.instanceMatrix.needsUpdate = true;
    }

    // Mandala
    if (mandalaRef.current && mandalaMat.current) {
      const scale = 0.95 + low * 0.7 + bloomPhase.current * 0.6;
      mandalaRef.current.scale.setScalar(scale);
      mandalaRef.current.rotation.z += dt * (0.8 + mid * 1.2) * motionScale;
      mandalaRef.current.rotation.x = Math.sin(t * 0.25) * 0.18 * motionScale;
      const hue = hueBase + 0.12 + high * 0.05;
      const col = colorForHue(hue, 0.95, 0.6);
      mandalaMat.current.color.copy(col);
      mandalaMat.current.emissive.copy(col);
      mandalaMat.current.emissiveIntensity = Math.min(3, 1.2 + energy * 3 + bloomPhase.current * 2);
    }

    // Ribbons
    if (ribbonsRef.current) {
      ribbonsRef.current.children.forEach((child, idx) => {
        const mesh = child as Mesh;
        const data = ribbonData[idx];
        const swirl = mid * 0.9 + warpPhase.current * 0.4;
        const ang = t * data.speed * motionScale + data.offset;
        const r = data.radius + Math.sin(t * 0.7 + idx) * 0.25 * motionScale;
        const y = Math.sin(t * 0.6 + idx) * 0.7 * (0.7 + motion * 0.6);
        tmpVec.set(Math.cos(ang + swirl) * r, y, Math.sin(ang + swirl) * r);
        mesh.position.copy(tmpVec);
        mesh.rotation.y = ang + swirl;
        mesh.scale.set(0.06 + mid * 0.08, 0.06 + mid * 0.08, 2.2 + motion * 0.8);
        const hue = hueBase + idx * 0.06 + low * 0.02 + high * 0.04;
        const mat = mesh.material as MeshStandardMaterial;
        const col = colorForHue(hue, 0.85, 0.6);
        mat.color.copy(col);
        mat.emissive.copy(col);
        mat.emissiveIntensity = 0.6 + high * 1.1;
      });
    }

    // Confetti
    if (confettiRef.current && confettiMat.current) {
      const sparkle = Math.min(1.2, 0.4 + high * 1.2);
      const burst = lerp(1, 1.4, warpPhase.current);
      for (let i = 0; i < confettiCount; i++) {
        const a = (i / confettiCount) * Math.PI * 20 + t * 1.1 * motionScale;
        const r = 2.4 + (i % 24) * 0.05;
        const z = -((i * 0.02) % 7) + (t * (0.8 + energy * 1.8)) % 7;
        tmp.position.set(Math.cos(a) * r * burst, Math.sin(a * 1.2) * 0.7, -z);
        tmp.scale.setScalar(0.04 + (i % 5) * 0.006);
        tmp.rotation.y = a;
        tmp.updateMatrix();
        confettiRef.current.setMatrixAt(i, tmp.matrix);
      }
      confettiRef.current.instanceMatrix.needsUpdate = true;
      const col = colorForHue(hueBase + 0.2 + high * 0.06, 0.9, 0.7);
      confettiMat.current.color.copy(col);
      confettiMat.current.emissive.copy(col);
      confettiMat.current.emissiveIntensity = sparkle;
    }

    // Camera drift
    if (group.current) {
      const push = cameraPush.current * (0.6 + motion * 0.3);
      group.current.position.z = -push;
      group.current.rotation.z = Math.sin(t * 0.15) * 0.08 * motionScale + push * 0.1;
      group.current.rotation.x = Math.sin(t * 0.12) * 0.05 * motionScale;
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 3, 3]} intensity={1.5} color="#7df1ff" />
      <mesh position={[0, -2.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#05060d" emissive="#05060d" emissiveIntensity={0.05} />
      </mesh>

      {/* Tunnel */}
      <instancedMesh ref={tunnelRef} args={[undefined as any, undefined as any, segmentCount]}>
        <torusGeometry args={[1, 0.12, 18, 72]} />
        <meshStandardMaterial
          ref={tunnelMat}
          color={basePalette[1]}
          emissive={basePalette[1]}
          emissiveIntensity={1}
          metalness={0.25}
          roughness={0.25}
        />
      </instancedMesh>

      {/* Mandala / portal */}
      <group ref={mandalaRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.15, 0.08, 2, 80]} />
          <meshStandardMaterial
            ref={mandalaMat}
            color={basePalette[0]}
            emissive={basePalette[0]}
            emissiveIntensity={1.4}
            metalness={0.2}
            roughness={0.2}
          />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (Math.PI / 4) * i]}>
            <ringGeometry args={[0.45, 1.05, 28]} />
            <meshStandardMaterial
              color={basePalette[(i + 1) % basePalette.length]}
              emissive={basePalette[(i + 1) % basePalette.length]}
              emissiveIntensity={1}
              transparent
              opacity={0.78}
            />
          </mesh>
        ))}
      </group>

      {/* Ribbons */}
      <group ref={ribbonsRef}>
        {ribbonData.map((_, idx) => (
          <mesh key={idx}>
            <cylinderGeometry args={[0.02, 0.02, 3, 12]} />
            <meshStandardMaterial
              color={basePalette[idx % basePalette.length]}
              emissive={basePalette[idx % basePalette.length]}
              emissiveIntensity={0.8}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
      </group>

      {/* Confetti */}
      <instancedMesh ref={confettiRef} args={[undefined as any, undefined as any, confettiCount]}>
        <tetrahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          ref={confettiMat}
          color={basePalette[2]}
          emissive={basePalette[2]}
          emissiveIntensity={0.8}
          roughness={0.4}
          metalness={0.1}
        />
      </instancedMesh>
    </group>
  );
};
