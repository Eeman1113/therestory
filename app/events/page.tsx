import Link from "next/link";
import type { Metadata } from "next";
import { allEras, allEvents, allCategories } from "@/lib/content/loader";
import { MicroCaps } from "@/components/common/micro-caps";
import { MonoDate } from "@/components/common/mono-date";
import { HairlineRule } from "@/components/common/hairline-rule";
import { markerColor } from "@/lib/timeline/categories";
import { parseStartYear } from "@/lib/timeline/scale";

export const metadata: Metadata = {
  title: "All events",
  description:
    "Every anchor event currently seeded in Therestory, ordered by date.",
};

export default function EventsIndex() {
  const events = [...allEvents()].sort(
    (a, b) => parseStartYear(a.date.start) - parseStartYear(b.date.start),
  );
  const eras = allEras();
  const cats = allCategories();

  // Group events by era for section headers.
  const byEra = new Map<string, typeof events>();
  for (const e of events) {
    const arr = byEra.get(e.era) ?? [];
    arr.push(e);
    byEra.set(e.era, arr);
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <MicroCaps as="p">All events</MicroCaps>
          <h1 className="mt-4 text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[44px]">
            Every anchor event currently on Therestory.
          </h1>
          <p className="mt-6 max-w-[62ch] text-base leading-7 text-ink-muted">
            Grouped by era, ordered by date. The catalogue grows as new events
            are researched and sourced. Every entry links to a full page with
            body sections, a region-by-region &ldquo;meanwhile&rdquo; snapshot,
            key figures, imagery, and sources.
          </p>
        </div>
        <aside className="lg:col-span-4">
          <MicroCaps as="p">Legend — category colours</MicroCaps>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-ink-muted sm:text-xs">
            {cats.map((c) => {
              const color = markerColor([c.id]);
              return (
                <li key={c.id} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: `light-dark(${color.light}, ${color.dark})` }}
                    aria-hidden
                  />
                  <span>{c.label}</span>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      <HairlineRule className="mt-12 sm:mt-16" />

      {eras.map((era) => {
        const inEra = byEra.get(era.id) ?? [];
        if (inEra.length === 0) return null;
        return (
          <section key={era.id} className="py-12">
            <div className="flex items-baseline justify-between border-b border-rule pb-4">
              <div>
                <MicroCaps>Era</MicroCaps>
                <h2 className="mt-1 text-2xl tracking-[-0.01em]">
                  <Link
                    href={`/eras/${era.id}`}
                    className="transition-colors hover:text-accent"
                  >
                    {era.label}
                  </Link>
                </h2>
              </div>
              <span className="font-mono text-xs tabular-nums text-ink-muted">
                {inEra.length} event{inEra.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul>
              {inEra.map((e) => {
                const color = markerColor(e.categories);
                return (
                  <li key={e.slug} className="border-b border-rule">
                    <Link
                      href={`/event/${e.slug}`}
                      className="group grid grid-cols-1 items-baseline gap-4 py-5 md:grid-cols-[auto_minmax(0,1fr)_auto]"
                    >
                      <span
                        className="hidden h-2 w-2 shrink-0 translate-y-2 rounded-full md:inline-block"
                        style={{
                          background: `light-dark(${color.light}, ${color.dark})`,
                        }}
                        aria-hidden
                      />
                      <div>
                        <h3 className="text-lg leading-tight text-ink transition-colors group-hover:text-accent">
                          {e.title}
                        </h3>
                        <p className="mt-1 max-w-[85ch] text-xs text-ink-muted line-clamp-2">
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
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
