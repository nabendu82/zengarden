import { GARDEN_MODELS } from "@/lib/gardens/registry";

export type BenchmarkPoint = {
  model: string;
  costPer1M: number;
  latencyMs: number;
  outputFps: number;
  aesthetic: number;
  tokens: number;
};

export const benchmarkData: BenchmarkPoint[] = GARDEN_MODELS.map((m) => ({
  model: m.name,
  costPer1M: m.metadata.costPer1M,
  latencyMs: m.metadata.latencyMs,
  outputFps: m.metadata.outputFps,
  aesthetic: m.metadata.aesthetic,
  tokens: m.metadata.tokens,
}));

/** Synthetic latency samples over a session window for line charts */
export const latencySeries = [
  { step: "T0", Grok: 510, Gemini: 280 },
  { step: "T1", Grok: 460, Gemini: 240 },
  { step: "T2", Grok: 430, Gemini: 220 },
  { step: "T3", Grok: 420, Gemini: 210 },
  { step: "T4", Grok: 415, Gemini: 205 },
  { step: "T5", Grok: 420, Gemini: 210 },
];

export const fpsSeries = [
  { step: "T0", Grok: 52, Gemini: 58 },
  { step: "T1", Grok: 55, Gemini: 60 },
  { step: "T2", Grok: 57, Gemini: 61 },
  { step: "T3", Grok: 58, Gemini: 61 },
  { step: "T4", Grok: 58, Gemini: 62 },
  { step: "T5", Grok: 58, Gemini: 61 },
];
