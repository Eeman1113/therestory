import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { allEras, allEvents, getEra } from "@/lib/content/loader";
import { MicroCaps } from "@/components/common/micro-caps";
import { MonoDate } from "@/components/common/mono-date";
import { HairlineRule } from "@/components/common/hairline-rule";
import { parseStartYear } from "@/lib/timeline/scale";

export function generateStaticParams() {
  return allEras().map((e) => ({ era: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ era: string }>;
}): Promise<Metadata> {
  const { era } = await params;
  const meta = getEra(era);
  if (!meta) return { title: "Not found" };
  return {
    title: meta.label,
    description: meta.description,
  };
}

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  return `${y}`;
}

export default async function EraPage({
  params,
}: {
  params: Promise<{ era: string }>;
}) {
  const { era } = await params;
  const meta = getEra(era);
  if (!meta) notFound();

  const events = allEvents()
    .filter((e) => e.era === meta.id)
    .sort((a, b) => parseStartYear(a.date.start) - parseStartYear(b.date.start));

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/eras"
        className="inline-flex min-h-[44px] items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} strokeWidth={1.5} aria-hidden />
        <span>All eras</span>
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 sm:mt-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <p className="font-mono text-xs tabular-nums text-ink-muted">
            {formatYear(meta.startYear)} → {formatYear(meta.endYear)}
          </p>
          <h1 className="mt-2 text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            {meta.label}
          </h1>
          <p className="mt-6 max-w-[62ch] text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
            {meta.description}
          </p>
        </div>
      </div>

      <HairlineRule className="mt-12 sm:mt-16" />

      <section className="py-8">
        <MicroCaps as="p">Anchor events in this era</MicroCaps>
        {events.length === 0 ? (
          <p className="mt-6 max-w-[60ch] text-sm text-ink-muted">
            No events seeded in this era yet. As the archive grows, this page
            will fill with the moments that shaped the {meta.label.toLowerCase()} world.
          </p>
        ) : (
          <ul className="mt-6">
            {events.map((e) => (
              <li key={e.slug} className="border-t border-rule">
                <Link
                  href={`/event/${e.slug}`}
                  className="group grid grid-cols-1 items-baseline gap-4 py-6 md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div>
                    <h2 className="text-xl leading-tight text-ink transition-colors group-hover:text-accent">
                      {e.title}
                    </h2>
                    <p className="mt-2 max-w-[80ch] text-sm text-ink-muted">
                      {e.summary}
                    </p>
                  </div>
                  <MonoDate
                    date={e.date}
                    size="sm"
                    className="shrink-0 text-ink-muted"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
