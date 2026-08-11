"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { zenAudio } from "./audio";
import {
  RakedSandShaderMaterial,
  AtmosphericSkyShaderMaterial,
} from "./shaders";
import {
  createDisplacedBoulderGeometry,
  createStoneLanternGroup,
  createTempleGongGroup,
  createSteppingStoneGeometry,
} from "./geometries";

export type LightingMode = "dusk" | "night" | "dawn";

type ZenGardenSceneProps = {
  lighting: LightingMode;
  particles: boolean;
  interactive: boolean;
  onHintChange?: (hint: string) => void;
};

export function ZenGardenScene({
  lighting,
  particles,
  interactive,
  onHintChange,
}: ZenGardenSceneProps) {
  const { camera, scene } = useThree();

  // Shader material ref for updating uniforms (time, ripples)
  const sandMaterialRef = useRef<THREE.ShaderMaterial>(null!);
  const foliageMaterialRef = useRef<THREE.ShaderMaterial>(null!);
  const skyMaterialRef = useRef<THREE.ShaderMaterial>(null!);

  const gongGroupRef = useRef<THREE.Group>(null!);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Ripple state
  const rippleTimeRef = useRef(-100);
  const rippleCenterRef = useRef(new THREE.Vector2(0, 0));
  const rippleStrengthRef = useRef(0);

  // Trigger expanding sand ripple
  const triggerRipple = (x: number, z: number, strength = 1.0) => {
    rippleCenterRef.current.set(x, z);
    rippleTimeRef.current = 0;
    rippleStrengthRef.current = strength;
    if (sandMaterialRef.current) {
      sandMaterialRef.current.uniforms.uRippleCenter.value.set(x, z);
      sandMaterialRef.current.uniforms.uRippleStrength.value = strength;
    }
  };

  // Pre-generate boulder geometries with distinct noise seeds
  const mainBoulderGeo = useMemo(() => createDisplacedBoulderGeometry(1.6, 3, 0.45, 1.2), []);
  const tallBoulderGeo = useMemo(() => createDisplacedBoulderGeometry(2.2, 3, 0.35, 4.5), []);
  const smallBoulderGeo = useMemo(() => createDisplacedBoulderGeometry(1.0, 3, 0.5, 8.8), []);
  const steppingStoneGeo = useMemo(() => createSteppingStoneGeometry(), []);

  // Rock materials
  const rockMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#5a5650",
        roughness: 0.85,
        metalness: 0.15,
      }),
    []
  );

  const mossMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3a5228",
        roughness: 0.95,
      }),
    []
  );

  // Bamboo stems instanced mesh setup
  const bambooGeo = useMemo(() => new THREE.CylinderGeometry(0.04, 0.05, 4.5, 8), []);
  const bambooMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2e572b",
        roughness: 0.6,
      }),
    []
  );

  const bambooMeshRef = useRef<THREE.InstancedMesh>(null!);
  useEffect(() => {
    if (!bambooMeshRef.current) return;
    const dummy = new THREE.Object3D();
    let count = 0;
    // Perimeter Bamboo Groves along North & East boundaries
    for (let x = -13; x <= 13; x += 0.6) {
      if (Math.abs(x) > 4) {
        dummy.position.set(x + (Math.random() * 0.2 - 0.1), 2.25, -13.5 + (Math.random() * 0.4 - 0.2));
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.scale.set(1, 0.8 + Math.random() * 0.5, 1);
        dummy.updateMatrix();
        bambooMeshRef.current.setMatrixAt(count++, dummy.matrix);
      }
    }
    bambooMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Lighting parameters based on selected mode
  const lightConfig = useMemo(() => {
    switch (lighting) {
      case "night":
        return {
          fogColor: "#050a14",
          ambientColor: "#152035",
          ambientIntensity: 0.4,
          sunColor: "#5588cc",
          sunIntensity: 0.6,
          sunPos: [-10, 15, -10] as [number, number, number],
          topSky: new THREE.Color("#02040a"),
          bottomSky: new THREE.Color("#0e172a"),
        };
      case "dawn":
        return {
          fogColor: "#2a1e28",
          ambientColor: "#402d35",
          ambientIntensity: 0.6,
          sunColor: "#ff9955",
          sunIntensity: 1.4,
          sunPos: [15, 8, -12] as [number, number, number],
          topSky: new THREE.Color("#0c1220"),
          bottomSky: new THREE.Color("#4a2432"),
        };
      case "dusk":
      default:
        return {
          fogColor: "#141520",
          ambientColor: "#2d2a38",
          ambientIntensity: 0.5,
          sunColor: "#ffaa66",
          sunIntensity: 1.0,
          sunPos: [12, 10, -15] as [number, number, number],
          topSky: new THREE.Color("#060a16"),
          bottomSky: new THREE.Color("#2a182b"),
        };
    }
  }, [lighting]);

  // Update sky shader uniforms on light mode change
  useEffect(() => {
    if (skyMaterialRef.current) {
      skyMaterialRef.current.uniforms.uTopColor.value.copy(lightConfig.topSky);
      skyMaterialRef.current.uniforms.uBottomColor.value.copy(lightConfig.bottomSky);
    }
  }, [lightConfig]);

  // Keypress 'E' interaction handler
  useEffect(() => {
    if (!interactive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE") {
        // Strike temple gong if close to gong position [-8, 0, -5]
        const camPos = camera.position;
        const gongPos = new THREE.Vector3(-8, 1.5, -5);
        if (camPos.distanceTo(gongPos) < 5.0) {
          zenAudio.playGong();
          triggerRipple(-8, -5, 1.5);
          if (gongGroupRef.current) {
            // Subtle gong hit wobble animation
            gongGroupRef.current.rotation.z = 0.08;
            setTimeout(() => {
              if (gongGroupRef.current) gongGroupRef.current.rotation.z = 0;
            }, 300);
          }
        } else {
          // General sand chime + ripple at camera look direction
          const dir = new THREE.Vector3();
          camera.getWorldDirection(dir);
          const targetX = camPos.x + dir.x * 4;
          const targetZ = camPos.z + dir.z * 4;
          if (Math.abs(targetX) < 13.5 && Math.abs(targetZ) < 13.5) {
            zenAudio.playBell();
            triggerRipple(targetX, targetZ, 1.0);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, interactive]);

  // Animation Loop (Update Uniforms & Raycasting for HUD prompt)
  useFrame((_, delta) => {
    const elapsedTime = _.clock.getElapsedTime();

    if (sandMaterialRef.current) {
      sandMaterialRef.current.uniforms.uTime.value = elapsedTime;
      if (rippleTimeRef.current >= 0) {
        rippleTimeRef.current += delta;
        sandMaterialRef.current.uniforms.uRippleTime.value = rippleTimeRef.current;
        if (rippleTimeRef.current > 5.0) {
          rippleTimeRef.current = -100;
        }
      }
    }

    if (foliageMaterialRef.current) {
      foliageMaterialRef.current.uniforms.uTime.value = elapsedTime;
    }

    if (skyMaterialRef.current) {
      skyMaterialRef.current.uniforms.uTime.value = elapsedTime;
    }

    // Raycast forward from camera to detect interactive objects
    if (interactive && onHintChange) {
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      let foundGong = false;

      for (const hit of intersects) {
        if (hit.distance < 5.0) {
          if (hit.object.name === "temple_gong" || hit.object.parent?.name === "temple_gong_group") {
            onHintChange("Press [E] or Click to Strike Temple Gong");
            foundGong = true;
            break;
          }
        }
      }

      if (!foundGong) {
        onHintChange("WASD walk · mouse look · Press [E] to chime sand · Esc free cursor");
      }
    }
  });

  return (
    <>
      <color attach="background" args={[lightConfig.fogColor]} />
      <fogExp2 attach="fog" args={[lightConfig.fogColor, 0.022]} />

      {/* Sky Sphere */}
      <mesh scale={120}>
        <sphereGeometry args={[1, 32, 16]} />
        <shaderMaterial
          ref={skyMaterialRef}
          {...AtmosphericSkyShaderMaterial}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Ambient & Directional Sky Lighting */}
      <ambientLight color={lightConfig.ambientColor} intensity={lightConfig.ambientIntensity} />
      <directionalLight
        color={lightConfig.sunColor}
        intensity={lightConfig.sunIntensity}
        position={lightConfig.sunPos}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {/* 28m Karesansui Raked Sand Bed Ground Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          zenAudio.playBell();
          triggerRipple(e.point.x, e.point.z, 1.2);
        }}
      >
        <planeGeometry args={[28, 28, 64, 64]} />
        <shaderMaterial
          ref={sandMaterialRef}
          {...RakedSandShaderMaterial}
        />
      </mesh>

      {/* Perimeter Clay Tile Wall / Border */}
      <mesh position={[0, 0.4, -14]} receiveShadow castShadow>
        <boxGeometry args={[28.5, 0.8, 0.4]} />
        <meshStandardMaterial color="#4a3e35" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.4, 14]} receiveShadow castShadow>
        <boxGeometry args={[28.5, 0.8, 0.4]} />
        <meshStandardMaterial color="#4a3e35" roughness={0.9} />
      </mesh>
      <mesh position={[-14, 0.4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[28.5, 0.8, 0.4]} />
        <meshStandardMaterial color="#4a3e35" roughness={0.9} />
      </mesh>
      <mesh position={[14, 0.4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[28.5, 0.8, 0.4]} />
        <meshStandardMaterial color="#4a3e35" roughness={0.9} />
      </mesh>

      {/* Rock Group 1: Sanzon Ishigumi (Triad Formation - Center Left) */}
      <group position={[-4, 0, -3]}>
        {/* Soft Moss Mound at Base */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.2, 24]} />
          <primitive object={mossMaterial} />
        </mesh>
        {/* Guardian Tall Stone */}
        <mesh geometry={tallBoulderGeo} material={rockMaterial} position={[0, 1.5, 0]} castShadow receiveShadow />
        {/* Left Flanking Stone */}
        <mesh geometry={mainBoulderGeo} material={rockMaterial} position={[-1.6, 1.0, 0.8]} castShadow receiveShadow />
        {/* Right Flanking Stone */}
        <mesh geometry={smallBoulderGeo} material={rockMaterial} position={[1.5, 0.7, -0.6]} castShadow receiveShadow />
      </group>

      {/* Rock Group 2: Turtle Island (Kame-shima - Southeast Area) */}
      <group position={[5, 0, 2]}>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.8, 20]} />
          <primitive object={mossMaterial} />
        </mesh>
        <mesh geometry={mainBoulderGeo} material={rockMaterial} position={[0, 1.1, 0]} castShadow receiveShadow />
        <mesh geometry={smallBoulderGeo} material={rockMaterial} position={[-1.2, 0.6, -0.8]} castShadow receiveShadow />
        <mesh geometry={smallBoulderGeo} material={rockMaterial} position={[1.1, 0.5, 0.7]} castShadow receiveShadow />
      </group>

      {/* Rock Group 3: Crane Island (Tsuru-shima - North Center) */}
      <group position={[0.5, 0, 6]}>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.2, 18]} />
          <primitive object={mossMaterial} />
        </mesh>
        <mesh geometry={tallBoulderGeo} material={rockMaterial} position={[0, 1.2, 0]} scale={[0.8, 0.9, 0.8]} castShadow receiveShadow />
        <mesh geometry={smallBoulderGeo} material={rockMaterial} position={[0.9, 0.5, -0.5]} castShadow receiveShadow />
      </group>

      {/* Stepping Stones Path (Tobi-ishi) */}
      <group position={[0, 0.06, 0]}>
        {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((z, idx) => (
          <mesh
            key={idx}
            geometry={steppingStoneGeo}
            material={rockMaterial}
            position={[Math.sin(z * 0.4) * 1.8, 0, z]}
            rotation={[0, idx * 0.5, 0]}
            receiveShadow
          />
        ))}
      </group>

      {/* Japanese Stone Lanterns with Warm Lights */}
      <group position={[-9, 0, 4]}>
        <primitive object={createStoneLanternGroup()} />
        <pointLight color="#ffaa44" intensity={2.5} distance={9} position={[0, 1.2, 0]} castShadow />
      </group>
      <group position={[8, 0, -6]}>
        <primitive object={createStoneLanternGroup()} />
        <pointLight color="#ffaa44" intensity={2.5} distance={9} position={[0, 1.2, 0]} castShadow />
      </group>

      {/* Interactive Temple Gong / Bell Assembly */}
      <group
        ref={gongGroupRef}
        name="temple_gong_group"
        position={[-8, 0, -5]}
        rotation={[0, Math.PI / 4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          zenAudio.playGong();
          triggerRipple(-8, -5, 1.5);
        }}
      >
        <primitive object={createTempleGongGroup()} />
      </group>

      {/* Bamboo Groves along Perimeter */}
      <instancedMesh
        ref={bambooMeshRef}
        args={[bambooGeo, bambooMat, 50]}
        castShadow
        receiveShadow
      />

      {/* Fireflies / Floating Dust Motes */}
      {particles && (
        <Sparkles
          count={50}
          scale={[26, 6, 26]}
          size={4}
          speed={0.4}
          opacity={0.75}
          color="#ffcc66"
        />
      )}

      {/* Post-Processing Pipeline */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.75} intensity={1.3} radius={0.65} />
        <Vignette eskil={false} offset={0.28} darkness={0.75} />
      </EffectComposer>
    </>
  );
}
