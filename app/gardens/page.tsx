import { GardenGrid } from "@/components/gardens/GardenCard";

export default function GardensPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">
        Model Gardens
      </p>
      <h1 className="mt-1 font-display text-4xl text-foreground">
        Explore gardens
      </h1>
      <p className="mt-2 max-w-lg text-muted">
        Each model produced a self-contained interactive zen garden from the
        same brief. Open one in sandbox mode.
      </p>
      <div className="mt-8">
        <GardenGrid />
      </div>
    </div>
  );
}
