"use client";

import { Canvas } from "@react-three/fiber";
import { Fog, Color } from "three";
import type { ReactNode } from "react";
import { FirstPersonControls } from "./FirstPersonControls";

type GardenCanvasProps = {
  children: ReactNode;
  fogColor?: string;
  skyColor?: string;
  ambientIntensity?: number;
  sunIntensity?: number;
  sunPosition?: [number, number, number];
  interactive?: boolean;
  cameraPosition?: [number, number, number];
};

export function GardenCanvas({
  children,
  fogColor = "#c8d6ce",
  skyColor = "#b8cfc4",
  ambientIntensity = 0.55,
  sunIntensity = 1.1,
  sunPosition = [12, 18, 8],
  interactive = true,
  cameraPosition = [0, 1.6, 8],
}: GardenCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: cameraPosition, fov: 60, near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ scene, gl }) => {
        scene.background = new Color(skyColor);
        scene.fog = new Fog(fogColor, 12, 55);
        gl.setClearColor(skyColor);
      }}
      className="h-full w-full touch-none"
    >
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        castShadow
        intensity={sunIntensity}
        position={sunPosition}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight args={["#dfeee8", "#4a5c52", 0.35]} />
      {children}
      {interactive ? <FirstPersonControls /> : null}
    </Canvas>
  );
}
