"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { GardenLoader } from "@/components/gardens/GardenLoader";
import { getGarden } from "@/lib/gardens/registry";

type FullscreenSandboxProps = {
  modelId: string | null;
  onClose: () => void;
};

export function FullscreenSandbox({ modelId, onClose }: FullscreenSandboxProps) {
  const model = modelId ? getGarden(modelId) : undefined;

  useEffect(() => {
    if (!modelId) return;
    const onKey = (e: KeyboardEvent) => {
      // Let Esc free pointer-lock first (browser); only exit sandbox when unlocked
      if (e.key !== "Escape") return;
      if (document.pointerLockElement) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modelId, onClose]);

  return (
    <AnimatePresence>
      {modelId && model ? (
        <motion.div
          className="fixed inset-0 z-[100] bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0">
            <GardenLoader modelId={modelId} interactive />
          </div>

          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="absolute right-4 top-4 z-10 w-[min(100%-2rem,22rem)] rounded-xl border border-glass-border bg-glass p-4 shadow-lg backdrop-blur-xl"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  Sandbox
                </p>
                <h2 className="font-display text-2xl text-foreground">
                  {model.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Exit fullscreen"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Tokens</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {model.metadata.tokens.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Generation Time</dt>
                <dd className="font-medium text-foreground">
                  {model.metadata.generationTime}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Prompt</dt>
                <dd className="mt-1 max-h-40 overflow-y-auto text-muted leading-relaxed">
                  {model.metadata.prompt}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-xs text-muted">
              Click garden to look · WASD walk · Shift slow · Esc free cursor
              (again to exit)
            </p>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
