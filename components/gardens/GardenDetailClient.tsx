"use client";

import { Maximize2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GardenLoader } from "@/components/gardens/GardenLoader";
import type { GardenModel } from "@/components/gardens/types";
import { FullscreenSandbox } from "@/components/sandbox/FullscreenSandbox";

export function GardenDetailClient({ garden }: { garden: GardenModel }) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div>
            <Link
              href="/gardens"
              className="text-xs text-muted transition hover:text-accent"
            >
              ← Model Gardens
            </Link>
            <h1 className="font-display text-3xl text-foreground">{garden.name}</h1>
            <p className="text-sm text-muted">{garden.tagline}</p>
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-glass px-3 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
          >
            <Maximize2 className="h-4 w-4" />
            Fullscreen sandbox
          </button>
        </div>
        <div className="relative min-h-0 flex-1">
          <GardenLoader modelId={garden.id} />
        </div>
      </div>
      <FullscreenSandbox
        modelId={fullscreen ? garden.id : null}
        onClose={() => setFullscreen(false)}
      />
    </>
  );
}
