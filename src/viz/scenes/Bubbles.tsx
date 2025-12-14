import { useMemo, useRef } from "react";
import { Color, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import type { Bands } from "../useAudioBands";

interface Props {
  bands: Bands;
  quality: "low" | "med" | "high";
  motion?: number;
}

type BubbleState = {
  id: number;
  pos: Vector3;
  vel: Vector3;
  radius: number;
  hue: number;
};

const bounds = { x: 6.5, y: 3, z: 4 };

export const Bubbles = ({ bands, quality, motion = 1 }: Props) => {
  const count = quality === "high" ? 28 : quality === "med" ? 22 : 16;
  const bubbles: BubbleState[] = useMemo((): BubbleState[] => {
    const arr: BubbleState[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        pos: new Vector3((Math.random() - 0.5) * 6, Math.random() * 2, (Math.random() - 0.5) * 4),
        vel: new Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.1,
        ),
        radius: 0.35 + Math.random() * 0.3,
        hue: Math.random(),
      });
    }
    return arr;
  }, [count]);
  const meshes = useRef<Record<number, Mesh>>({});
  const dragRef = useRef<{
    id: number;
    offset: Vector3;
    lastPos: Vector3;
    lastTime: number;
  } | null>(null);
  const tempColor = useRef(new Color());

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const timeScale = motion;
    bubbles.forEach((bubble) => {
      const mesh = meshes.current[bubble.id];
      if (!mesh) return;
      if (!dragRef.current || dragRef.current.id !== bubble.id) {
        // idle drift + velocity
        bubble.vel.x += Math.sin(t + bubble.id) * 0.0008 * timeScale;
        bubble.vel.y += Math.cos(t * 0.7 + bubble.id) * 0.0006 * timeScale;
        bubble.vel.z += Math.sin(t * 0.5 + bubble.id * 2) * 0.0007 * timeScale;
        bubble.pos.add(bubble.vel);
        bubble.vel.multiplyScalar(0.994);
        // bounds bounce
        (["x", "y", "z"] as const).forEach((axis) => {
          const limit = bounds[axis];
          if (bubble.pos[axis] > limit) {
            bubble.pos[axis] = limit;
            bubble.vel[axis] *= -0.65;
          }
          if (bubble.pos[axis] < -limit) {
            bubble.pos[axis] = -limit;
            bubble.vel[axis] *= -0.65;
          }
        });
        // upward lift and audio push
        bubble.vel.y += 0.0005 * timeScale + bands.low * 0.0008 * timeScale;
      } else {
        // follow pointer while dragging
        const now = performance.now();
        const delta = now - dragRef.current.lastTime;
        const diff = bubble.pos.clone().sub(dragRef.current.lastPos);
        dragRef.current.lastPos.copy(bubble.pos);
        dragRef.current.lastTime = now;
        bubble.vel.copy(diff.multiplyScalar(1000 / Math.max(16, delta)));
      }
      const hue = (bubble.hue + bands.high * 0.02 + Math.sin(t + bubble.id) * 0.01) % 1;
      tempColor.current.setHSL(hue, 0.8, 0.55 + bands.energy * 0.1);
      (mesh.material as MeshStandardMaterial).color.copy(tempColor.current);
      (mesh.material as MeshStandardMaterial).emissive.copy(tempColor.current);
      (mesh.material as MeshStandardMaterial).emissiveIntensity = 0.6 + bands.energy * 2.4;
      const scale = bubble.radius * (1 + bands.energy * 0.3);
      mesh.scale.setScalar(scale);
      mesh.position.copy(bubble.pos);
    });
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const point = e.point as Vector3;
    let nearestIndex = -1;
    let nearestDist = Infinity;
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const d = b.pos.distanceTo(point);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIndex = i;
      }
    }
    if (nearestIndex === -1 || nearestDist >= 1.2) return;
    const target = bubbles[nearestIndex];
    target.vel.set(0, 0, 0);
    target.pos.copy(point);
    dragRef.current = {
      id: target.id,
      offset: target.pos.clone().sub(point),
      lastPos: target.pos.clone(),
      lastTime: performance.now(),
    };
  };

  const handlePointerMove = (e: any) => {
    const drag = dragRef.current;
    if (!drag) return;
    e.stopPropagation();
    const point = e.point as Vector3;
    const bubble = bubbles.find((b): b is BubbleState => b.id === drag.id);
    if (!bubble) return;
    bubble.pos.copy(point.clone().add(drag.offset));
    bubble.vel.set(0, 0, 0);
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  // background catch plane for pointer interactions
  const planeSize = 20;

  return (
    <group>
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {bubbles.map((bubble) => (
        <mesh
          key={bubble.id}
          ref={(el) => {
            if (el) meshes.current[bubble.id] = el;
          }}
          position={bubble.pos}
          castShadow
          receiveShadow
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#7ff7ff"
            emissive="#7ff7ff"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
            metalness={0.2}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};
