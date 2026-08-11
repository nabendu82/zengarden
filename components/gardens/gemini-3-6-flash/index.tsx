"use client";

import Image from "next/image";
import type { GardenSceneProps } from "../types";

/**
 * Placeholder for the Gemini 3.6 Flash garden.
 * Replace `public/gardens/gemini-3-6-flash.png` (and this component)
 * with the real interactive garden generated on another machine.
 */
export default function GeminiGarden(_props: GardenSceneProps) {
  void _props;
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#e8d9b8]">
      <Image
        src="/gardens/gemini-3-6-flash.png"
        alt="Gemini 3.6 Flash zen garden preview"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-4 pb-4 pt-10">
        <p className="text-center text-xs text-white/85">
          Preview placeholder — interactive garden coming soon
        </p>
      </div>
    </div>
  );
}
