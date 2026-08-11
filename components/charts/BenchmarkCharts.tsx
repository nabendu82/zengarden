"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  benchmarkData,
  fpsSeries,
  latencySeries,
} from "@/lib/data/benchmarks";
import { StrawPollWidget } from "@/components/poll/StrawPollWidget";

const tooltipStyle = {
  background: "var(--surface-solid)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
  fontSize: 12,
};

const gridStroke = "var(--chart-grid)";
const tick = { fill: "var(--muted)", fontSize: 12 };

export function BenchmarkCharts() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Leaderboard / Charts
        </p>
        <h1 className="mt-1 font-display text-4xl text-foreground">
          Benchmark & Price
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Token cost, latency, output FPS, and aesthetic ratings across
          generated gardens.
        </p>
      </motion.header>

      {/* Community StrawPoll Live Voting Section at Top */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <StrawPollWidget title="Which Zengarden is better?" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Token cost"
          subtitle="$ per 1M tokens"
          delay={0.05}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={benchmarkData}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="model" tick={tick} axisLine={false} tickLine={false} />
              <YAxis tick={tick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="costPer1M" name="Cost" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Aesthetic rating" subtitle="0–10 panel score" delay={0.1}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={benchmarkData}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="model" tick={tick} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={tick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="aesthetic"
                name="Aesthetic"
                fill="var(--accent-soft)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Latency over session" subtitle="ms TTFT samples" delay={0.15}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={latencySeries}>
              <CartesianGrid stroke={gridStroke} />
              <XAxis dataKey="step" tick={tick} axisLine={false} tickLine={false} />
              <YAxis tick={tick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Grok"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Gemini"
                stroke="var(--accent-soft)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Output FPS" subtitle="runtime frame rate" delay={0.2}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={fpsSeries}>
              <CartesianGrid stroke={gridStroke} />
              <XAxis dataKey="step" tick={tick} axisLine={false} tickLine={false} />
              <YAxis domain={[45, 70]} tick={tick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Grok"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Gemini"
                stroke="var(--accent-soft)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="overflow-x-auto rounded-xl border border-border bg-glass backdrop-blur"
      >
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Tokens</th>
              <th className="px-4 py-3 font-medium">$/1M</th>
              <th className="px-4 py-3 font-medium">Latency</th>
              <th className="px-4 py-3 font-medium">FPS</th>
              <th className="px-4 py-3 font-medium">Aesthetic</th>
            </tr>
          </thead>
          <tbody>
            {benchmarkData.map((row) => (
              <tr key={row.model} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{row.model}</td>
                <td className="px-4 py-3 tabular-nums text-muted">
                  {row.tokens.toLocaleString()}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted">${row.costPer1M}</td>
                <td className="px-4 py-3 tabular-nums text-muted">{row.latencyMs} ms</td>
                <td className="px-4 py-3 tabular-nums text-muted">{row.outputFps}</td>
                <td className="px-4 py-3 tabular-nums text-accent">{row.aesthetic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  delay,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border bg-glass p-4 backdrop-blur sm:p-5"
    >
      <div className="mb-4">
        <h2 className="font-display text-xl text-foreground">{title}</h2>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
      {children}
    </motion.section>
  );
}
