import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allEvents, allYears, getEvent, getYear } from "@/lib/content/loader";
import { YearHero } from "@/components/year/year-hero";
import { YearWorldSnapshot } from "@/components/year/year-world-snapshot";
import { YearFeaturedEvents } from "@/components/year/year-featured-events";
import { SourcesList } from "@/components/event/sources-list";
import { HairlineRule } from "@/components/common/hairline-rule";
import { parseStartYear } from "@/lib/timeline/scale";

/** URL slug for a year: `1789`, `776-bce`, `44-bce`. */
export function yearToSlug(y: number): string {
  return y < 0 ? `${Math.abs(y)}-bce` : `${y}`;
}

function slugToYear(slug: string): number {
  const lower = slug.toLowerCase();
  if (lower.endsWith("-bce")) return -parseInt(lower.replace("-bce", ""), 10);
  return parseInt(lower, 10);
}

export function generateStaticParams() {
  return allYears().map((y) => ({ year: yearToSlug(y.year) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year: yearSlug } = await params;
  const y = getYear(slugToYear(yearSlug));
  if (!y) return { title: "Not found" };
  const displayYear = y.year < 0 ? `${Math.abs(y.year)} BCE` : `${y.year}`;
  return {
    title: `${displayYear} · ${y.headline}`,
    description: y.summary,
  };
}

export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearSlug } = await params;
  const year = getYear(slugToYear(yearSlug));
  if (!year) notFound();

  // Resolve featured events: any explicit ids in the year file, plus any
  // seeded events whose date falls within ±1 year of this one.
  const explicit = year.featuredEventIds
    .map((id) => getEvent(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const nearby = allEvents().filter((e) => {
    const y = Math.round(parseStartYear(e.date.start));
    return Math.abs(y - year.year) <= 1 && !explicit.some((x) => x.id === e.id);
  });
  const featured = [...explicit, ...nearby];

  return (
    <article className="mx-auto w-full max-w-[1400px] px-8">
      <YearHero year={year} />
      <HairlineRule />
      <YearWorldSnapshot snapshots={year.snapshots} />
      {featured.length > 0 && (
        <>
          <HairlineRule />
          <YearFeaturedEvents events={featured} />
        </>
      )}
      <HairlineRule />
      <SourcesList sources={year.sources} />
    </article>
  );
}
