import { notFound } from "next/navigation";
import { allEras, getEra } from "@/lib/content/loader";
import { OG_SIZE, OG_CONTENT_TYPE, ogImage } from "@/lib/og/template";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Therestory era";

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  return `${y}`;
}

export function generateStaticParams() {
  return allEras().map((e) => ({ era: e.id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ era: string }>;
}) {
  const { era: eraId } = await params;
  const era = getEra(eraId);
  if (!era) notFound();

  return ogImage({
    date: `${formatYear(era.startYear)} — ${formatYear(era.endYear)}`,
    eyebrow: "An era",
    title: era.label,
  });
}
