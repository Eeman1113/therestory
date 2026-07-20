import { notFound } from "next/navigation";
import { allYears, getYear } from "@/lib/content/loader";
import { OG_SIZE, OG_CONTENT_TYPE, ogImage } from "@/lib/og/template";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Therestory year";

function yearToSlug(y: number): string {
  return y < 0 ? `${Math.abs(y)}-bce` : `${y}`;
}

function slugToYear(slug: string): number {
  const lower = slug.toLowerCase();
  if (lower.endsWith("-bce")) return -parseInt(lower.replace("-bce", ""), 10);
  return parseInt(lower, 10);
}

function yearLabel(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  if (y === 0) return "1 CE";
  return `${y}`;
}

export function generateStaticParams() {
  return allYears().map((y) => ({ year: yearToSlug(y.year) }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearSlug } = await params;
  const year = getYear(slugToYear(yearSlug));
  if (!year) notFound();

  return ogImage({
    date: yearLabel(year.year),
    eyebrow: "A year in the world",
    title: year.headline,
  });
}
