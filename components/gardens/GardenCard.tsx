import Link from "next/link";
import { listGardens } from "@/lib/gardens/registry";

export function GardenCard({
  id,
  name,
  tagline,
  aesthetic,
  fps,
}: {
  id: string;
  name: string;
  tagline: string;
  aesthetic: number;
  fps: number;
}) {
  return (
    <Link
      href={`/gardens/${id}`}
      className="group block rounded-xl border border-border bg-glass p-5 backdrop-blur transition hover:border-accent"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Garden</p>
      <h2 className="mt-1 font-display text-2xl text-foreground transition group-hover:text-accent">
        {name}
      </h2>
      <p className="mt-2 text-sm text-muted">{tagline}</p>
      <dl className="mt-4 flex gap-6 text-sm">
        <div>
          <dt className="text-xs text-muted">Aesthetic</dt>
          <dd className="tabular-nums text-foreground">{aesthetic}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">FPS</dt>
          <dd className="tabular-nums text-foreground">{fps}</dd>
        </div>
      </dl>
    </Link>
  );
}

export function GardenGrid() {
  const gardens = listGardens();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {gardens.map((g) => (
        <GardenCard
          key={g.id}
          id={g.id}
          name={g.name}
          tagline={g.tagline}
          aesthetic={g.metadata.aesthetic}
          fps={g.metadata.outputFps}
        />
      ))}
    </div>
  );
}
