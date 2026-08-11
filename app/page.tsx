"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Full-bleed atmospheric plane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 70% 20%, color-mix(in srgb, var(--accent-soft) 35%, transparent), transparent 55%),
            radial-gradient(ellipse 80% 60% at 15% 80%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 50%),
            linear-gradient(180deg, color-mix(in srgb, var(--background) 40%, #c5d8ce) 0%, var(--background) 72%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col justify-center px-4 py-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-[clamp(3rem,10vw,6.5rem)] leading-[0.95] tracking-tight text-foreground">
            Model Zen Garden
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-5 max-w-md text-lg text-muted"
        >
          A long-horizon LLM benchmark — same brief, two gardens, side-by-side
          stillness.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/arena"
            className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Enter the arena
          </Link>
          <Link
            href="/charts"
            className="inline-flex items-center rounded-md border border-border bg-glass px-5 py-2.5 text-sm text-foreground backdrop-blur transition hover:border-accent"
          >
            View charts
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
