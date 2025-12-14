import { useMemo } from "react";
import { Float32BufferAttribute } from "three";
import { useFrame } from "@react-three/fiber";

export const Starfield = () => {
  const positions = useMemo(() => {
    const pts = [];
    const count = 400;
    for (let i = 0; i < count; i++) {
      pts.push((Math.random() - 0.5) * 30, Math.random() * 20 - 5, (Math.random() - 0.5) * 30);
    }
    return new Float32BufferAttribute(pts, 3);
  }, []);

  useFrame((state, delta) => {
    state.scene.rotation.y += delta * 0.02;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.array, positions.itemSize]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#4ef2ff" transparent opacity={0.35} />
    </points>
  );
};
