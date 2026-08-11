"use client";

import { Canvas } from "@react-three/fiber";
import { useCallback, useState } from "react";
import type { GardenSceneProps } from "../types";
import { FirstPersonControls } from "../FirstPersonControls";
import { ZenGardenScene, type LightingMode } from "./scene";
import { zenAudio } from "./audio";

/**
 * AAA-Quality Standalone 3D Karesansui Zen Garden — Gemini 3.6 Flash.
 * Features:
 * - 28-Meter Expansive Sand Bed with Procedural Raked Sand Shader
 * - ZERO External Assets (100% Procedural Shaders, Geometries, and Audio)
 * - First-Person WASD + Mouse Look Walkable Experience
 * - Interactive Bronze Temple Gong, Sand Ripples, and Chimes
 * - Web Audio API Ambient Wind & Harmonic Bell Synthesizer
 * - Post-Processing Pipeline (Bloom + Vignette)
 */
export default function ZenGarden({ interactive = true }: GardenSceneProps) {
  const [lighting, setLighting] = useState<LightingMode>("dusk");
  const [particles, setParticles] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [locked, setLocked] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [hint, setHint] = useState("Click or press 'Enter Garden' to explore");

  const resetGarden = useCallback(() => {
    setResetKey((k) => k + 1);
    setLocked(false);
    setHint("Garden reset — click to look");
  }, []);

  const onLockChange = useCallback((isLocked: boolean) => {
    setLocked(isLocked);
    if (isLocked) {
      setHasEntered(true);
      zenAudio.startWind();
    }
  }, []);

  const toggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      zenAudio.setMuted(next);
      return next;
    });
  }, []);

  const handleEnterGarden = useCallback(() => {
    setHasEntered(true);
    zenAudio.startWind();
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0d14] font-sans">
      {/* 3D Canvas */}
      <Canvas
        key={resetKey}
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.6, 11], fov: 62, near: 0.1, far: 140 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
        className="h-full w-full touch-none"
      >
        <ZenGardenScene
          lighting={lighting}
          particles={particles}
          interactive={interactive && hasEntered}
          onHintChange={setHint}
        />
        {interactive ? (
          <FirstPersonControls
            eyeHeight={1.6}
            bounds={13.2}
            initialYaw={0}
            onLockChange={onLockChange}
          />
        ) : null}
      </Canvas>

      {/* Landing / Welcome Screen Overlay before entry */}
      {!hasEntered && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/65 px-4 text-center backdrop-blur-md">
          <div className="max-w-md rounded-2xl border border-white/15 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl">
            <span className="text-xs uppercase tracking-widest text-amber-400/90 font-medium">
              28m Karesansui Sanctuary
            </span>
            <h1 className="mt-1 text-2xl font-light text-white tracking-wide">
              枯山水 · Zen Garden
            </h1>
            <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
              Step into a 28-meter procedural stone and raked sand garden. Crafted with 100% procedural GLSL shaders, procedural audio synthesis, and dynamic post-processing.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 text-left text-[11px] text-neutral-400 bg-white/5 p-3 rounded-xl border border-white/10">
              <div><span className="font-semibold text-white">WASD / Arrows</span>: Walk</div>
              <div><span className="font-semibold text-white">Mouse</span>: Look around</div>
              <div><span className="font-semibold text-white">Press E / Click</span>: Strike Gong</div>
              <div><span className="font-semibold text-white">Shift</span>: Slow stroll</div>
            </div>

            <button
              type="button"
              onClick={handleEnterGarden}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg transition hover:from-amber-500 hover:to-amber-600 active:scale-[0.98]"
            >
              Enter Garden
            </button>
          </div>
        </div>
      )}

      {/* First-person Aiming Crosshair */}
      {locked && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/60" />
          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/60" />
        </div>
      )}

      {/* HUD Bar at Bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 p-3 sm:p-4">
        <p className="rounded-full border border-white/15 bg-black/50 px-4 py-1 text-[11px] text-white/80 backdrop-blur-md shadow-md">
          {hint}
        </p>

        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-black/60 p-2 shadow-2xl backdrop-blur-xl">
          {(["dusk", "night", "dawn"] as LightingMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setLighting(mode)}
              className={`rounded-lg px-3 py-1 text-xs capitalize transition font-medium ${
                lighting === mode
                  ? "bg-amber-500/30 text-amber-200 border border-amber-400/40"
                  : "text-white/60 hover:bg-white/10 hover:text-white/90"
              }`}
            >
              {mode}
            </button>
          ))}

          <span className="mx-1 h-4 w-px bg-white/20" aria-hidden />

          <button
            type="button"
            onClick={toggleAudio}
            className={`rounded-lg px-3 py-1 text-xs transition ${
              !isAudioMuted
                ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/30"
                : "text-white/60 hover:bg-white/10 hover:text-white/90"
            }`}
          >
            {isAudioMuted ? "Audio Off" : "Audio On"}
          </button>

          <button
            type="button"
            onClick={() => setParticles((p) => !p)}
            className={`rounded-lg px-3 py-1 text-xs transition ${
              particles
                ? "bg-white/20 text-white"
                : "text-white/55 hover:bg-white/10 hover:text-white/90"
            }`}
          >
            Fireflies {particles ? "On" : "Off"}
          </button>

          <button
            type="button"
            onClick={resetGarden}
            className="rounded-lg px-3 py-1 text-xs text-white/60 transition hover:bg-white/10 hover:text-white/90"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
