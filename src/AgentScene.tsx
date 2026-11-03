import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Network({ paused, active }: { paused: boolean; active: number }) {
  const system = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const orbit = useRef<THREE.Group>(null);
  const glow = useRef<THREE.ShaderMaterial>(null);
  const elapsed = useRef(0);
  const { points, connections, dust } = useMemo(() => {
    const vectors: THREE.Vector3[] = [];
    for (let i = 0; i < 160; i++) {
      const y = 1 - (i / 159) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      vectors.push(
        new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(1.83),
      );
    }
    const edges: number[] = [];
    vectors.forEach((p, i) =>
      vectors.slice(i + 1).forEach((q) => {
        if (p.distanceTo(q) < 0.62) edges.push(...p.toArray(), ...q.toArray());
      }),
    );
    const particles = Array.from({ length: 210 }, (_, i) => {
      const a = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      return (a - Math.floor(a) - 0.5) * 11;
    });
    return {
      points: new Float32Array(vectors.flatMap((p) => p.toArray())),
      connections: new Float32Array(edges),
      dust: new Float32Array(particles),
    };
  }, []);

  useFrame(({ pointer }, delta) => {
    if (paused || !system.current || !core.current || !orbit.current) return;
    elapsed.current += Math.min(delta, 0.05);
    system.current.rotation.y = elapsed.current * 0.065 + pointer.x * 0.17;
    system.current.rotation.x = Math.sin(elapsed.current * 0.15) * 0.1 - pointer.y * 0.1;
    core.current.rotation.y = -elapsed.current * 0.12;
    core.current.rotation.z = elapsed.current * 0.08;
    orbit.current.rotation.y = elapsed.current * 0.035;
    if (glow.current) glow.current.uniforms.time.value = elapsed.current;
  });

  const color = active < 0 ? '#67e7dc' : '#b8ffe1';
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 3, 4]} intensity={28} color="#5eeadd" />
      <pointLight position={[-3, -2, 2]} intensity={16} color="#487cf5" />
      <group ref={system} rotation={[0.2, 0, -0.15]}>
        <mesh>
          <sphereGeometry args={[1.7, 48, 48]} />
          <shaderMaterial
            ref={glow}
            uniforms={{ time: { value: 0 } }}
            vertexShader={`varying vec3 vNormal; varying vec3 vPosition; varying vec3 vView;
          void main() { vNormal = normalize(normalMatrix * normal); vPosition = position;
            vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`}
            fragmentShader={`uniform float time; varying vec3 vNormal; varying vec3 vPosition; varying vec3 vView;
          void main() { float rim = pow(1.0 - abs(dot(vNormal, vView)), 2.4);
            float bands = pow(0.5 + 0.5 * sin(vPosition.y * 44.0 + time * 0.7), 14.0);
            float wave = 0.5 + 0.5 * sin(vPosition.x * 3.0 + vPosition.z * 2.0 + time * 0.2);
            vec3 base = mix(vec3(0.015, 0.035, 0.065), vec3(0.018, 0.11, 0.12), wave);
            gl_FragColor = vec4(base + vec3(0.19, 0.67, 0.58) * rim * 0.7 + vec3(0.08, 0.35, 0.29) * bands * 0.13, 1.0); }`}
          />
        </mesh>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[connections, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={0.22} />
        </lineSegments>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[points, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.035} color="#b1fff5" sizeAttenuation transparent opacity={0.85} />
        </points>
        <mesh ref={core}>
          <icosahedronGeometry args={[1.87, 1]} />
          <meshBasicMaterial color="#74ffeb" wireframe transparent opacity={0.09} />
        </mesh>
      </group>
      <group ref={orbit} rotation={[0, 0, -0.32]}>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[Math.PI * (0.31 + i * 0.22), i * 0.48, i * 0.27]}>
            <mesh>
              <torusGeometry args={[2.22 + i * 0.14, 0.008, 6, 180]} />
              <meshBasicMaterial
                color={i === 1 ? '#7b98b9' : '#5bdccb'}
                transparent
                opacity={i === 1 ? 0.25 : 0.44}
              />
            </mesh>
            <mesh position={[2.22 + i * 0.14, 0, 0]}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshBasicMaterial color="#d8fff5" />
            </mesh>
          </group>
        ))}
      </group>
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2 + 0.4;
        return (
          <group
            key={i}
            position={[Math.cos(angle) * 2.36, Math.sin(angle) * 1.95, Math.sin(angle * 2) * 0.4]}
          >
            <mesh>
              <sphereGeometry args={[active === i ? 0.072 : 0.035, 12, 12]} />
              <meshBasicMaterial color={active === i ? '#c9ffe8' : '#659f9e'} />
            </mesh>
            {active === i && (
              <mesh>
                <ringGeometry args={[0.11, 0.12, 32]} />
                <meshBasicMaterial
                  color="#8be8d2"
                  transparent
                  opacity={0.6}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.018} color="#96c6d6" transparent opacity={0.6} />
      </points>
    </>
  );
}

export default function AgentScene({ paused, active }: { paused: boolean; active: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.1], fov: 43 }}
      dpr={[1, 1.5]}
      frameloop={paused ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      fallback={<div className="orb-fallback" />}
      aria-hidden="true"
    >
      <Network paused={paused} active={active} />
    </Canvas>
  );
}
