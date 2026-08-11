"use client";

import { motion } from "framer-motion";
import { Maximize2, Vote } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { GardenLoader } from "@/components/gardens/GardenLoader";
import { ModelPicker } from "@/components/arena/ModelPicker";
import { FullscreenSandbox } from "@/components/sandbox/FullscreenSandbox";
import { StrawPollWidget } from "@/components/poll/StrawPollWidget";
import {
  DEFAULT_LEFT_MODEL,
  DEFAULT_RIGHT_MODEL,
  getGarden,
} from "@/lib/gardens/registry";

export function SplitArena() {
  const [leftId, setLeftId] = useState(DEFAULT_LEFT_MODEL);
  const [rightId, setRightId] = useState(DEFAULT_RIGHT_MODEL);
  const [split, setSplit] = useState(50);
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el || !dragging.current) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(80, Math.max(20, pct)));
  }, []);

  const startDrag = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const endDrag = () => {
    dragging.current = false;
  };

  const left = getGarden(leftId);
  const right = getGarden(rightId);

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div>
            <h1 className="font-display text-2xl text-foreground">
              Side-by-Side Arena
            </h1>
            <p className="text-sm text-muted">
              Load two gardens and compare in real time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowVoteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow transition hover:opacity-90 active:scale-95"
            >
              <Vote className="h-3.5 w-3.5" />
              Vote for Best Garden
            </button>
            <p className="hidden text-xs text-muted sm:block">
              Drag divider to resize · Expand pane for sandbox
            </p>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative flex min-h-0 flex-1 flex-col md:flex-row"
          onPointerMove={(e) => onPointerMove(e.clientX)}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <motion.section
            layout
            style={{ flexBasis: `${split}%` }}
            className="relative flex min-h-[40vh] min-w-0 flex-1 flex-col border-b border-border md:border-b-0 md:border-r"
          >
            <PaneHeader
              name={left?.name ?? leftId}
              modelId={leftId}
              onModelChange={setLeftId}
              onFullscreen={() => setFullscreenId(leftId)}
              side="Left"
            />
            <div className="relative min-h-0 flex-1">
              <GardenLoader modelId={leftId} />
              <ControlsHint />
            </div>
          </motion.section>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={Math.round(split)}
            tabIndex={0}
            onPointerDown={startDrag}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setSplit((s) => Math.max(20, s - 2));
              if (e.key === "ArrowRight") setSplit((s) => Math.min(80, s + 2));
            }}
            className="group relative z-10 hidden w-3 shrink-0 cursor-col-resize items-stretch md:flex"
          >
            <div className="mx-auto h-full w-px bg-border transition group-hover:bg-accent group-active:bg-accent" />
            <div className="absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft opacity-70" />
          </div>

          <motion.section
            layout
            style={{ flexBasis: `${100 - split}%` }}
            className="relative flex min-h-[40vh] min-w-0 flex-1 flex-col"
          >
            <PaneHeader
              name={right?.name ?? rightId}
              modelId={rightId}
              onModelChange={setRightId}
              onFullscreen={() => setFullscreenId(rightId)}
              side="Right"
            />
            <div className="relative min-h-0 flex-1">
              <GardenLoader modelId={rightId} />
              <ControlsHint />
            </div>
          </motion.section>
        </div>
      </div>

      {/* Voting Modal */}
      {showVoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg">
            <StrawPollWidget
              title="Vote for the Best Zen Garden"
              isOpen={true}
              onClose={() => setShowVoteModal(false)}
            />
          </div>
        </div>
      )}

      <FullscreenSandbox
        modelId={fullscreenId}
        onClose={() => setFullscreenId(null)}
      />
    </>
  );
}

function PaneHeader({
  name,
  modelId,
  onModelChange,
  onFullscreen,
  side,
}: {
  name: string;
  modelId: string;
  onModelChange: (id: string) => void;
  onFullscreen: () => void;
  side: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border bg-nav-bg/80 px-3 py-2 backdrop-blur">
      <div className="min-w-0">
        <p className="truncate text-xs uppercase tracking-[0.14em] text-muted">
          {side}
        </p>
        <p className="truncate font-display text-lg leading-tight text-foreground">
          {name}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ModelPicker value={modelId} onChange={onModelChange} />
        <button
          type="button"
          onClick={onFullscreen}
          aria-label={`Open ${name} fullscreen`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:border-accent hover:text-accent"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ControlsHint() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-glass-border bg-glass px-2.5 py-1.5 text-[10px] text-muted backdrop-blur">
      Interact in each pane
    </div>
  );
}
