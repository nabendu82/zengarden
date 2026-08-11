import type { GardenModel, GardenRegistryEntry } from "@/components/gardens/types";

export const GARDEN_MODELS: GardenModel[] = [
  {
    id: "grok-4-5",
    name: "Grok 4.5",
    shortName: "Grok",
    tagline: "Cool stone & mist garden",
    palette: "cool",
    metadata: {
      tokens: 128_400,
      prompt:
        "Build a first-person interactive zen garden at AAA quality: walkable world, intuitive controls, music, interactive areas, 60fps, mobile-friendly.",
      generationTime: "47m 12s",
      costPer1M: 3.2,
      latencyMs: 420,
      outputFps: 58,
      aesthetic: 8.7,
    },
  },
  {
    id: "gemini-3-6-flash",
    name: "Gemini 3.6 Flash",
    shortName: "Gemini",
    tagline: "Warm bamboo & sand garden",
    palette: "warm",
    metadata: {
      tokens: 96_200,
      prompt:
        "Build a first-person interactive zen garden at AAA quality: walkable world, intuitive controls, music, interactive areas, 60fps, mobile-friendly.",
      generationTime: "31m 48s",
      costPer1M: 1.1,
      latencyMs: 210,
      outputFps: 61,
      aesthetic: 8.2,
    },
  },
];

export const gardenRegistry: Record<string, GardenRegistryEntry> = {
  "grok-4-5": {
    ...GARDEN_MODELS[0],
    load: () => import("@/components/gardens/grok-4-5"),
  },
  "gemini-3-6-flash": {
    ...GARDEN_MODELS[1],
    load: () => import("@/components/gardens/gemini-3-6-flash"),
  },
};

export function getGarden(id: string): GardenRegistryEntry | undefined {
  return gardenRegistry[id];
}

export function listGardens(): GardenRegistryEntry[] {
  return Object.values(gardenRegistry);
}

export const DEFAULT_LEFT_MODEL = "grok-4-5";
export const DEFAULT_RIGHT_MODEL = "gemini-3-6-flash";
