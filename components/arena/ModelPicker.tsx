"use client";

import { listGardens } from "@/lib/gardens/registry";

type ModelPickerProps = {
  value: string;
  onChange: (id: string) => void;
  label?: string;
};

export function ModelPicker({ value, onChange, label }: ModelPickerProps) {
  const models = listGardens();

  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      {label ? <span className="hidden sm:inline">{label}</span> : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-glass px-2 py-1.5 text-sm text-foreground outline-none backdrop-blur focus:border-accent"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </label>
  );
}
