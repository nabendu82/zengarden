import Link from "next/link";
import { GardenDetailClient } from "@/components/gardens/GardenDetailClient";
import { getGarden, listGardens } from "@/lib/gardens/registry";

export function generateStaticParams() {
  return listGardens().map((g) => ({ model: g.id }));
}

export default async function GardenDetailPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model: modelId } = await params;
  const garden = getGarden(modelId);

  if (!garden) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-foreground">Garden not found</h1>
        <p className="mt-2 text-muted">No model registered as “{modelId}”.</p>
        <Link href="/gardens" className="mt-6 inline-block text-accent underline">
          Back to gardens
        </Link>
      </div>
    );
  }

  const model = {
    id: garden.id,
    name: garden.name,
    shortName: garden.shortName,
    tagline: garden.tagline,
    palette: garden.palette,
    metadata: garden.metadata,
  };
  return <GardenDetailClient garden={model} />;
}
