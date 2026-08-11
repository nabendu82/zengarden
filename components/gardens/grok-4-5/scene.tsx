"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  CanvasTexture,
  Color,
  DoubleSide,
  Fog,
  Group,
  MathUtils,
  Mesh,
  Plane,
  Vector2,
  Vector3,
} from "three";
import { suppressPointerLock } from "../FirstPersonControls";

export type LightingMode = "day" | "dusk" | "night";

type StoneState = {
  id: string;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  color: string;
};

type Ripple = {
  id: number;
  x: number;
  z: number;
  born: number;
  kind: "sand" | "water";
};

const INITIAL_STONES: StoneState[] = [
  {
    id: "s1",
    position: [-1.4, 0.28, -0.6],
    scale: 1.15,
    rotation: [0.2, 0.4, 0.1],
    color: "#6a737a",
  },
  {
    id: "s2",
    position: [0.35, 0.18, -1.35],
    scale: 0.72,
    rotation: [0.1, 1.1, -0.15],
    color: "#7a848c",
  },
  {
    id: "s3",
    position: [1.55, 0.22, 0.15],
    scale: 0.9,
    rotation: [-0.15, 0.6, 0.2],
    color: "#5e686f",
  },
  {
    id: "s4",
    position: [-0.15, 0.14, 1.1],
    scale: 0.55,
    rotation: [0.3, 0.2, -0.1],
    color: "#8a9298",
  },
  {
    id: "s5",
    position: [2.4, 0.32, -2.1],
    scale: 1.35,
    rotation: [0.05, -0.5, 0.12],
    color: "#555e66",
  },
  {
    id: "s6",
    position: [-2.6, 0.2, 1.6],
    scale: 0.8,
    rotation: [0.2, 0.9, 0],
    color: "#727b82",
  },
  {
    id: "s7",
    position: [-7.2, 0.3, -5.5],
    scale: 1.5,
    rotation: [0.1, 0.8, -0.05],
    color: "#5a646c",
  },
  {
    id: "s8",
    position: [6.8, 0.22, 4.2],
    scale: 1.05,
    rotation: [-0.2, 1.4, 0.1],
    color: "#6e787f",
  },
  {
    id: "s9",
    position: [8.5, 0.26, -7.0],
    scale: 1.25,
    rotation: [0.15, -0.3, 0.2],
    color: "#4f585f",
  },
  {
    id: "s10",
    position: [-9.0, 0.18, 6.5],
    scale: 0.85,
    rotation: [0.25, 0.5, 0],
    color: "#7a838a",
  },
  {
    id: "s11",
    position: [4.2, 0.2, 8.8],
    scale: 0.95,
    rotation: [0, 1.8, 0.1],
    color: "#656e75",
  },
  {
    id: "s12",
    position: [-5.5, 0.24, -9.2],
    scale: 1.1,
    rotation: [0.12, -1.1, 0.05],
    color: "#596268",
  },
];

const LIGHTING: Record<
  LightingMode,
  {
    sky: string;
    fog: string;
    ambient: number;
    sun: number;
    sunPos: [number, number, number];
    sunColor: string;
    hemiSky: string;
    hemiGround: string;
    water: string;
    sand: string;
  }
> = {
  day: {
    sky: "#b7cfd4",
    fog: "#c5d6d8",
    ambient: 0.55,
    sun: 1.35,
    sunPos: [18, 22, 10],
    sunColor: "#fff4e0",
    hemiSky: "#e8f2f0",
    hemiGround: "#6a7a70",
    water: "#5a8794",
    sand: "#cfc6b2",
  },
  dusk: {
    sky: "#c9a48e",
    fog: "#d4b49a",
    ambient: 0.38,
    sun: 0.85,
    sunPos: [-20, 8, 6],
    sunColor: "#ffb07a",
    hemiSky: "#f0c8a8",
    hemiGround: "#5a4a40",
    water: "#6a7088",
    sand: "#d2bda0",
  },
  night: {
    sky: "#0e1620",
    fog: "#121c28",
    ambient: 0.18,
    sun: 0.15,
    sunPos: [6, 18, -12],
    sunColor: "#a8c4e8",
    hemiSky: "#1a2838",
    hemiGround: "#0a1014",
    water: "#2a4050",
    sand: "#8a8478",
  },
};

const RAKE_SIZE = 768;
/** Half-extent of the sand bed — playable area is 2× this (~28m across). */
const GARDEN_HALF = 14;

function createRakeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = RAKE_SIZE;
  canvas.height = RAKE_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#cfc6b2";
  ctx.fillRect(0, 0, RAKE_SIZE, RAKE_SIZE);

  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * RAKE_SIZE;
    const y = Math.random() * RAKE_SIZE;
    ctx.fillStyle = `rgba(160,150,130,${0.015 + Math.random() * 0.03})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  ctx.strokeStyle = "rgba(170,160,140,0.35)";
  ctx.lineWidth = 1.4;
  for (let r = 30; r < 280; r += 16) {
    ctx.beginPath();
    ctx.arc(RAKE_SIZE * 0.38, RAKE_SIZE * 0.36, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let r = 24; r < 200; r += 14) {
    ctx.beginPath();
    ctx.arc(RAKE_SIZE * 0.7, RAKE_SIZE * 0.62, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let r = 20; r < 160; r += 13) {
    ctx.beginPath();
    ctx.arc(RAKE_SIZE * 0.28, RAKE_SIZE * 0.72, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return { canvas, ctx, texture };
}

function worldToSandUV(x: number, z: number) {
  const u = (x + GARDEN_HALF) / (GARDEN_HALF * 2);
  const v = (z + GARDEN_HALF) / (GARDEN_HALF * 2);
  return {
    px: MathUtils.clamp(u * RAKE_SIZE, 0, RAKE_SIZE),
    py: MathUtils.clamp(v * RAKE_SIZE, 0, RAKE_SIZE),
  };
}

export function ZenGardenScene({
  lighting,
  particles,
  interactive,
  onHint,
}: {
  lighting: LightingMode;
  particles: boolean;
  interactive: boolean;
  onHint: (msg: string) => void;
}) {
  const preset = LIGHTING[lighting];
  const { scene } = useThree();
  const ripplesRef = useRef<Ripple[]>([]);
  const [, bump] = useState(0);

  const addRipple = useCallback((x: number, z: number, kind: Ripple["kind"]) => {
    ripplesRef.current = [
      ...ripplesRef.current.slice(-18),
      {
        id: performance.now() + Math.random(),
        x,
        z,
        born: performance.now(),
        kind,
      },
    ];
    bump((n) => n + 1);
  }, []);

  useEffect(() => {
    scene.background = new Color(preset.sky);
    scene.fog = new Fog(preset.fog, 28, 75);
  }, [scene, preset.sky, preset.fog]);

  return (
    <>
      <color attach="background" args={[preset.sky]} />
      <fog attach="fog" args={[preset.fog, 28, 75]} />

      <ambientLight intensity={preset.ambient} />
      <hemisphereLight
        args={[
          preset.hemiSky,
          preset.hemiGround,
          lighting === "night" ? 0.25 : 0.4,
        ]}
      />
      <directionalLight
        castShadow
        color={preset.sunColor}
        intensity={preset.sun}
        position={preset.sunPos}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0002}
      />
      {lighting === "night" ? (
        <>
          <pointLight
            position={[0, 2.4, 0]}
            intensity={0.55}
            color="#9eb8d8"
            distance={22}
          />
          <pointLight
            position={[-8, 1.6, 6]}
            intensity={0.4}
            color="#6a90b8"
            distance={16}
          />
          <pointLight
            position={[9, 1.6, -7]}
            intensity={0.35}
            color="#7aa0c0"
            distance={14}
          />
        </>
      ) : null}
      {lighting === "dusk" ? (
        <pointLight
          position={[-8, 1.8, 4]}
          intensity={0.5}
          color="#ff9a60"
          distance={18}
        />
      ) : null}

      <GardenGround
        sandColor={preset.sand}
        waterColor={preset.water}
        interactive={interactive}
        onRipple={addRipple}
        onHint={onHint}
        lighting={lighting}
      />
      <ZenStones
        interactive={interactive}
        onRipple={addRipple}
        onHint={onHint}
      />
      <MossBeds />
      <StoneLantern position={[-8.5, 0, 6.5]} night={lighting === "night"} />
      <StoneLantern position={[9.2, 0, -7.0]} night={lighting === "night"} />
      <StoneLantern position={[-6.0, 0, -10.5]} night={lighting === "night"} />
      <StoneLantern position={[7.5, 0, 10.0]} night={lighting === "night"} />
      <BambooGrove />
      <WoodenDeck />
      <RippleLayer ripplesRef={ripplesRef} />
      {particles ? <PetalField night={lighting === "night"} /> : null}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <circleGeometry args={[32, 64]} />
        <meshStandardMaterial
          color={lighting === "night" ? "#0a1014" : "#8a9a8e"}
          roughness={1}
        />
      </mesh>
    </>
  );
}

function GardenGround({
  sandColor,
  waterColor,
  interactive,
  onRipple,
  onHint,
  lighting,
}: {
  sandColor: string;
  waterColor: string;
  interactive: boolean;
  onRipple: (x: number, z: number, kind: Ripple["kind"]) => void;
  onHint: (msg: string) => void;
  lighting: LightingMode;
}) {
  const rake = useMemo(() => createRakeTexture(), []);
  const lastRake = useRef<Vector2 | null>(null);
  const raking = useRef(false);

  const rakeAt = (x: number, z: number) => {
    const { px, py } = worldToSandUV(x, z);
    const ctx = rake.ctx;
    const prev = lastRake.current;

    if (prev) {
      const dx = px - prev.x;
      const dy = py - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const spread = 5;

      ctx.strokeStyle = "rgba(150,140,120,0.55)";
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      for (const off of [-spread, 0, spread]) {
        ctx.beginPath();
        ctx.moveTo(prev.x + nx * off, prev.y + ny * off);
        ctx.lineTo(px + nx * off, py + ny * off);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(235,228,210,0.25)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(prev.x + nx * (spread + 2), prev.y + ny * (spread + 2));
      ctx.lineTo(px + nx * (spread + 2), py + ny * (spread + 2));
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.fillStyle = "rgba(150,140,120,0.3)";
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    lastRake.current = new Vector2(px, py);
    rake.texture.needsUpdate = true;
  };

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
        onPointerDown={(e) => {
          if (!interactive) return;
          // Shift+drag rakes; plain click falls through to pointer-lock look
          if (!e.shiftKey) return;
          e.stopPropagation();
          suppressPointerLock(500);
          raking.current = true;
          lastRake.current = null;
          rakeAt(e.point.x, e.point.z);
          onRipple(e.point.x, e.point.z, "sand");
          onHint("Raking the sand…");
        }}
        onPointerMove={(e) => {
          if (!interactive || !raking.current) return;
          e.stopPropagation();
          rakeAt(e.point.x, e.point.z);
        }}
        onPointerUp={() => {
          raking.current = false;
          lastRake.current = null;
        }}
        onPointerLeave={() => {
          raking.current = false;
          lastRake.current = null;
        }}
        onPointerOver={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          if (Math.random() > 0.94) onRipple(e.point.x, e.point.z, "sand");
        }}
      >
        <planeGeometry args={[GARDEN_HALF * 2, GARDEN_HALF * 2]} />
        <meshStandardMaterial
          map={rake.texture}
          color={sandColor}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      <BorderFrame />
      <WaterPool
        color={waterColor}
        interactive={interactive}
        onRipple={onRipple}
        onHint={onHint}
        lighting={lighting}
        position={[5.5, 0.045, -6.2]}
        radius={2.6}
      />
      <WaterPool
        color={waterColor}
        interactive={interactive}
        onRipple={onRipple}
        onHint={onHint}
        lighting={lighting}
        position={[-7.8, 0.045, 4.5]}
        radius={2.0}
      />
    </group>
  );
}

function BorderFrame() {
  const h = GARDEN_HALF + 0.15;
  const t = 0.28;
  const y = 0.12;
  const mats = { color: "#5a4638", roughness: 0.85 };
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, y, -h]}>
        <boxGeometry args={[h * 2 + t * 2, 0.22, t]} />
        <meshStandardMaterial {...mats} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, y, h]}>
        <boxGeometry args={[h * 2 + t * 2, 0.22, t]} />
        <meshStandardMaterial {...mats} />
      </mesh>
      <mesh castShadow receiveShadow position={[-h, y, 0]}>
        <boxGeometry args={[t, 0.22, h * 2]} />
        <meshStandardMaterial {...mats} />
      </mesh>
      <mesh castShadow receiveShadow position={[h, y, 0]}>
        <boxGeometry args={[t, 0.22, h * 2]} />
        <meshStandardMaterial {...mats} />
      </mesh>
    </group>
  );
}

function WaterPool({
  color,
  interactive,
  onRipple,
  onHint,
  lighting,
  position,
  radius = 2.15,
}: {
  color: string;
  interactive: boolean;
  onRipple: (x: number, z: number, kind: Ripple["kind"]) => void;
  onHint: (msg: string) => void;
  lighting: LightingMode;
  position: [number, number, number];
  radius?: number;
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as { opacity: number };
    mat.opacity = lighting === "night" ? 0.72 : 0.82;
    meshRef.current.position.y =
      position[1] + Math.sin(clock.elapsedTime * 0.6) * 0.004;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      receiveShadow
      onPointerDown={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        suppressPointerLock(300);
        onRipple(e.point.x, e.point.z, "water");
        onHint("Ripples across still water");
      }}
      onPointerOver={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        if (Math.random() > 0.92) onRipple(e.point.x, e.point.z, "water");
      }}
    >
      <circleGeometry args={[radius, 48]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.08}
        metalness={0.15}
        transmission={0.35}
        thickness={0.4}
        transparent
        opacity={0.82}
        side={DoubleSide}
      />
    </mesh>
  );
}

function ZenStones({
  interactive,
  onRipple,
  onHint,
}: {
  interactive: boolean;
  onRipple: (x: number, z: number, kind: Ripple["kind"]) => void;
  onHint: (msg: string) => void;
}) {
  const [stones, setStones] = useState(INITIAL_STONES);

  return (
    <group>
      {stones.map((stone) => (
        <DraggableStone
          key={stone.id}
          stone={stone}
          interactive={interactive}
          onMove={(pos) => {
            setStones((prev) =>
              prev.map((s) =>
                s.id === stone.id
                  ? { ...s, position: [pos[0], s.position[1], pos[2]] }
                  : s,
              ),
            );
          }}
          onRipple={onRipple}
          onHint={onHint}
        />
      ))}
    </group>
  );
}

function DraggableStone({
  stone,
  interactive,
  onMove,
  onRipple,
  onHint,
}: {
  stone: StoneState;
  interactive: boolean;
  onMove: (pos: [number, number, number]) => void;
  onRipple: (x: number, z: number, kind: Ripple["kind"]) => void;
  onHint: (msg: string) => void;
}) {
  const groupRef = useRef<Group>(null);
  const dragging = useRef(false);
  const plane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new Vector3(), []);
  const offset = useRef(new Vector3());

  const clampPos = (v: Vector3) => {
    v.x = MathUtils.clamp(v.x, -GARDEN_HALF + 0.5, GARDEN_HALF - 0.5);
    v.z = MathUtils.clamp(v.z, -GARDEN_HALF + 0.5, GARDEN_HALF - 0.5);
    v.y = stone.position[1];
    return v;
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    e.stopPropagation();
    suppressPointerLock(500);
    dragging.current = true;
    offset.current.copy(e.point).sub(new Vector3(...stone.position));
    onHint("Moving a river stone…");
    onRipple(e.point.x, e.point.z, "sand");
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current || !interactive) return;
    e.stopPropagation();
    e.ray.intersectPlane(plane, hit);
    const next = clampPos(hit.clone().sub(offset.current));
    if (groupRef.current) {
      groupRef.current.position.set(next.x, next.y, next.z);
    }
    onMove([next.x, next.y, next.z]);
  };

  const endDrag = (e?: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (groupRef.current) {
      onRipple(groupRef.current.position.x, groupRef.current.position.z, "sand");
    }
    e?.stopPropagation();
  };

  return (
    <group
      ref={groupRef}
      position={stone.position}
      rotation={stone.rotation}
      scale={stone.scale}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <Float speed={0.55} rotationIntensity={0} floatIntensity={0.06}>
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color={stone.color}
            roughness={0.42}
            metalness={0.08}
          />
        </mesh>
        <mesh castShadow position={[0.08, -0.05, 0.06]} scale={0.55}>
          <icosahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color={stone.color}
            roughness={0.5}
            metalness={0.05}
          />
        </mesh>
      </Float>
    </group>
  );
}

function RippleLayer({
  ripplesRef,
}: {
  ripplesRef: MutableRefObject<Ripple[]>;
}) {
  const group = useRef<Group>(null);

  useFrame(() => {
    const now = performance.now();
    ripplesRef.current = ripplesRef.current.filter((r) => now - r.born < 1400);
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const r = ripplesRef.current[i];
      if (!r) {
        child.visible = false;
        return;
      }
      child.visible = true;
      const age = (now - r.born) / 1400;
      const mesh = child as Mesh;
      mesh.position.set(r.x, r.kind === "water" ? 0.06 : 0.03, r.z);
      const scale = 0.2 + age * (r.kind === "water" ? 2.4 : 1.6);
      mesh.scale.setScalar(scale);
      const mat = mesh.material as { opacity: number };
      mat.opacity = (1 - age) * (r.kind === "water" ? 0.55 : 0.35);
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <ringGeometry args={[0.35, 0.42, 32]} />
          <meshBasicMaterial
            color="#e8f0f2"
            transparent
            opacity={0.4}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function MossBeds() {
  return (
    <group>
      {[
        [-3.8, 0.02, -3.5, 1.4],
        [4.2, 0.02, 2.8, 1.1],
        [-4.5, 0.02, 1.2, 0.9],
        [-10.5, 0.02, -8.0, 1.8],
        [10.0, 0.02, 7.5, 1.6],
        [3.5, 0.02, -11.0, 1.3],
        [-8.0, 0.02, 10.5, 1.5],
        [11.2, 0.02, -3.0, 1.1],
      ].map(([x, y, z, r], i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, y, z]}
          receiveShadow
        >
          <circleGeometry args={[r, 28]} />
          <meshStandardMaterial color="#4a6b54" roughness={0.98} />
        </mesh>
      ))}
    </group>
  );
}

function StoneLantern({
  position,
  night,
}: {
  position: [number, number, number];
  night: boolean;
}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.28, 0.34, 0.55, 6]} />
        <meshStandardMaterial color="#7a848c" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.78, 0]}>
        <boxGeometry args={[0.55, 0.42, 0.55]} />
        <meshStandardMaterial color="#8a9298" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial
          color={night ? "#d4e8ff" : "#c5d8e0"}
          emissive={night ? "#8ab4e0" : "#6a90a8"}
          emissiveIntensity={night ? 1.4 : 0.45}
        />
        {night ? (
          <pointLight color="#a8c8e8" intensity={0.7} distance={5} />
        ) : null}
      </mesh>
      <mesh castShadow position={[0, 1.12, 0]}>
        <coneGeometry args={[0.42, 0.28, 4]} />
        <meshStandardMaterial color="#5c6870" roughness={0.88} />
      </mesh>
    </group>
  );
}

function BambooGrove() {
  const stalks = useMemo(() => {
    const clumps: { x: number; z: number; h: number }[] = [];
    // West grove
    for (let i = 0; i < 22; i++) {
      clumps.push({
        x: -15.5 + (i % 6) * 0.5 + Math.sin(i) * 0.12,
        z: -4 + Math.floor(i / 6) * 1.1,
        h: 2.8 + (i % 4) * 0.45,
      });
    }
    // East grove
    for (let i = 0; i < 18; i++) {
      clumps.push({
        x: 14.2 + (i % 5) * 0.48 + Math.cos(i) * 0.1,
        z: 2 + Math.floor(i / 5) * 1.05,
        h: 2.6 + (i % 3) * 0.5,
      });
    }
    // North corner
    for (let i = 0; i < 12; i++) {
      clumps.push({
        x: -6 + (i % 4) * 0.55,
        z: -15.2 + Math.floor(i / 4) * 0.9,
        h: 3.0 + (i % 3) * 0.4,
      });
    }
    return clumps;
  }, []);

  return (
    <group>
      {stalks.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          {Array.from({ length: Math.floor(s.h) }).map((_, j) => (
            <mesh key={j} castShadow position={[0, 0.35 + j * 0.65, 0]}>
              <cylinderGeometry args={[0.055, 0.065, 0.62, 6]} />
              <meshStandardMaterial color="#5f7d4a" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function WoodenDeck() {
  return (
    <group position={[0, 0.08, GARDEN_HALF - 0.9]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6.5, 0.12, 1.8]} />
        <meshStandardMaterial color="#6e5640" roughness={0.82} />
      </mesh>
      {[-2.2, 0, 2.2].map((x) => (
        <mesh key={x} castShadow position={[x, -0.25, 0.5]}>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color="#5a4634" />
        </mesh>
      ))}
    </group>
  );
}

function PetalField({ night }: { night: boolean }) {
  const count = 96;
  const span = GARDEN_HALF * 2.4;
  const data = useMemo(() => {
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const starts: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      speeds[i] = 0.25 + Math.random() * 0.45;
      phases[i] = Math.random() * Math.PI * 2;
      starts.push([
        (Math.random() - 0.5) * span,
        Math.random() * 9 + 1,
        (Math.random() - 0.5) * span,
      ]);
    }
    return { speeds, phases, starts };
  }, [count, span]);

  const groupRef = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const speed = data.speeds[i];
      const phase = data.phases[i];
      child.position.y -= speed * delta;
      child.position.x += Math.sin(t * 0.4 + phase) * 0.6 * delta;
      child.position.z += Math.cos(t * 0.35 + phase) * 0.4 * delta;
      child.rotation.z += delta * 0.6;
      child.rotation.x = Math.sin(t + phase) * 0.4;
      if (child.position.y < 0.05) {
        child.position.y = 7 + Math.random() * 2;
        child.position.x = (Math.random() - 0.5) * span;
        child.position.z = (Math.random() - 0.5) * span;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.starts.map((p, i) => (
        <mesh key={i} position={p} rotation={[0.4, 0, Math.random()]}>
          <planeGeometry args={[0.12, 0.09]} />
          <meshStandardMaterial
            color={night ? "#e8d0dc" : "#f2c4d0"}
            transparent
            opacity={night ? 0.55 : 0.85}
            side={DoubleSide}
            roughness={0.8}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
