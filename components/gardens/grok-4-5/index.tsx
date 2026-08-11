"use client";

import { Canvas } from "@react-three/fiber";
import { useCallback, useState } from "react";
import type { GardenSceneProps } from "../types";
import { FirstPersonControls } from "../FirstPersonControls";
import { ZenGardenScene, type LightingMode } from "./scene";

/**
 * Interactive Karesansui zen garden — Grok 4.5 showcase.
 * First-person WASD + mouse look, rake sand, drag stones, day/dusk/night.
 */
export default function ZenGarden({ interactive = true }: GardenSceneProps) {
  const [lighting, setLighting] = useState<LightingMode>("day");
  const [particles, setParticles] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hint, setHint] = useState(
    "Click to look · WASD walk · Shift slow · Shift+drag rake",
  );

  const resetGarden = useCallback(() => {
    setResetKey((k) => k + 1);
    setLocked(false);
    setHint("Garden reset — click to look again");
    window.setTimeout(
      () =>
        setHint("Click to look · WASD walk · Shift slow · Shift+drag rake"),
      1600,
    );
  }, []);

  const onLockChange = useCallback((isLocked: boolean) => {
    setLocked(isLocked);
    setHint(
      isLocked
        ? "WASD walk · mouse look · Shift slow · Esc free cursor"
        : "Click to look · WASD walk · drag stones · Shift+drag rake",
    );
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c100e]">
      <Canvas
        key={resetKey}
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.6, 12], fov: 60, near: 0.1, far: 120 }}
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
          interactive={interactive}
          onHint={setHint}
        />
        {interactive ? (
          <FirstPersonControls
            eyeHeight={1.6}
            bounds={13.5}
            initialYaw={0}
            onLockChange={onLockChange}
          />
        ) : null}
      </Canvas>

      {/* Crosshair when looking */}
      {locked ? (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/50" />
          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/50" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 p-3 sm:p-4">
        <p className="rounded-md border border-white/10 bg-black/35 px-3 py-1 text-[11px] text-white/70 backdrop-blur-md">
          {hint}
        </p>
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-xl border border-white/15 bg-black/40 p-1.5 shadow-lg backdrop-blur-xl">
          {(["day", "dusk", "night"] as LightingMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setLighting(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs capitalize transition ${
                lighting === mode
                  ? "bg-white/20 text-white"
                  : "text-white/55 hover:bg-white/10 hover:text-white/90"
              }`}
            >
              {mode}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/15" aria-hidden />
          <button
            type="button"
            onClick={() => setParticles((p) => !p)}
            className={`rounded-lg px-3 py-1.5 text-xs transition ${
              particles
                ? "bg-white/20 text-white"
                : "text-white/55 hover:bg-white/10 hover:text-white/90"
            }`}
          >
            Petals {particles ? "on" : "off"}
          </button>
          <button
            type="button"
            onClick={resetGarden}
            className="rounded-lg px-3 py-1.5 text-xs text-white/55 transition hover:bg-white/10 hover:text-white/90"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
