"use client";

import dynamic from "next/dynamic";
import { Suspense, type ComponentType } from "react";
import type { GardenSceneProps } from "./types";
import { getGarden } from "@/lib/gardens/registry";

const loaders: Record<
  string,
  ComponentType<GardenSceneProps>
> = {
  "grok-4-5": dynamic(() => import("./grok-4-5"), {
    ssr: false,
    loading: () => <GardenFallback label="Grok 4.5" />,
  }),
  "gemini-3-6-flash": dynamic(() => import("./gemini-3-6-flash"), {
    ssr: false,
    loading: () => <GardenFallback label="Gemini 3.6 Flash" />,
  }),
};

function GardenFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-solid text-sm text-muted">
      Growing {label}…
    </div>
  );
}

type GardenLoaderProps = GardenSceneProps & {
  modelId: string;
  className?: string;
};

export function GardenLoader({
  modelId,
  interactive = true,
  className = "",
}: GardenLoaderProps) {
  const entry = getGarden(modelId);
  const Scene = loaders[modelId];

  if (!entry || !Scene) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-surface-solid text-sm text-danger ${className}`}
      >
        Unknown garden: {modelId}
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <Suspense fallback={<GardenFallback label={entry.name} />}>
        <Scene interactive={interactive} />
      </Suspense>
    </div>
  );
}
