import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MicroCaps } from "@/components/common/micro-caps";
import { MonoDate } from "@/components/common/mono-date";
import { HairlineRule } from "@/components/common/hairline-rule";
import { TimelineCanvas } from "@/components/timeline/timeline-canvas";
import { allEvents, allYears } from "@/lib/content/loader";
import { parseStartYear } from "@/lib/timeline/scale";
import { markerColor } from "@/lib/timeline/categories";

function yearSlug(y: number): string {
  return y < 0 ? `${Math.abs(y)}-bce` : `${y}`;
}

function yearLabel(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  if (y === 0) return "1 CE";
  return `${y}`;
}

export default function HomePage() {
  const events = allEvents();
  const years = allYears();

  // Featured anchor events: pick a curated set spanning eras.
  // Sort by date, then take one from each era (max 12).
  const sorted = [...events].sort(
    (a, b) => parseStartYear(a.date.start) - parseStartYear(b.date.start),
  );
  const featured: typeof events = [];
  const seenEras = new Set<string>();
  for (const e of sorted) {
    if (!seenEras.has(e.era)) {
      featured.push(e);
      seenEras.add(e.era);
    }
    if (featured.length >= 12) break;
  }

  const heroEvent =
    events.find((e) => e.slug === "fall-of-constantinople") ?? events[0];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
      {/* Intro */}
      <section className="grid grid-cols-1 gap-10 pt-10 pb-8 sm:pt-14 sm:pb-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <MicroCaps as="p">Wikipedia, by time</MicroCaps>
          <h1 className="mt-4 text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[52px] sm:leading-[1.04]">
            A history of everything,{" "}
            <span className="text-ink-muted">everywhere,</span>{" "}
            arranged along a single line.
          </h1>
          <p className="mt-6 max-w-[62ch] text-base leading-7 text-ink-muted">
            Scroll the timeline below to move through 5,500 years of world
            history. Click any marker to open a region-by-region view of what
            was happening everywhere at that moment.
          </p>
        </div>

        <aside className="lg:col-span-4">
          <MicroCaps as="p">Editorial notes</MicroCaps>
          <ul className="mt-4 space-y-3 text-base leading-6 text-ink-muted sm:text-sm">
            <li>
              <span className="text-ink">Sourced.</span> Every fact is grounded
              in at least two reputable sources.
            </li>
            <li>
              <span className="text-ink">Global.</span> Every era covers every
              region. No Eurocentric default.
            </li>
            <li>
              <span className="text-ink">Growing.</span> {events.length}{" "}
              events and {years.length} pivotal-year pages so far. The
              architecture holds all of history.
            </li>
          </ul>
        </aside>
      </section>

      {/* Interactive timeline — the hero */}
      <section className="pb-12 sm:pb-16">
        <TimelineCanvas events={events} />
      </section>

      <HairlineRule />

      {/* Featured anchor events */}
      <section className="py-12 sm:py-16">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <MicroCaps as="p">Anchor events</MicroCaps>
            <h2 className="mt-2 text-2xl tracking-[-0.01em]">
              One from every era.
            </h2>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-baseline gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <span>All {events.length} events</span>
            <ArrowRight
              size={14}
              strokeWidth={1.5}
              className="translate-y-[1px] transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((e) => {
            const color = markerColor(e.categories);
            return (
              <li key={e.slug} className="border-t border-rule py-4">
                <Link
                  href={`/event/${e.slug}`}
                  className="group flex items-baseline justify-between gap-4"
                >
                  <span className="flex items-baseline gap-3">
                    <span
                      className="inline-block h-2 w-2 shrink-0 translate-y-[3px] rounded-full"
                      style={{
                        background: `light-dark(${color.light}, ${color.dark})`,
                      }}
                      aria-hidden
                    />
                    <span className="text-sm leading-6 text-ink transition-colors group-hover:text-accent">
                      {e.title}
                    </span>
                  </span>
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

      {years.length > 0 && (
        <>
          <HairlineRule />
          <section className="py-12 sm:py-16">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <MicroCaps as="p">Pivotal years</MicroCaps>
                <h2 className="mt-2 text-2xl tracking-[-0.01em]">
                  Zoom out. A whole year, region by region.
                </h2>
              </div>
              <span className="hidden font-mono text-xs tabular-nums text-ink-muted sm:inline">
                — {years.length} seeded
              </span>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
              {years.map((y) => (
                <li key={y.year} className="border-t border-rule py-4">
                  <Link
                    href={`/year/${yearSlug(y.year)}`}
                    className="group flex items-baseline justify-between gap-4"
                  >
                    <span className="text-sm leading-6 text-ink transition-colors group-hover:text-accent">
                      {y.headline}
                    </span>
                    <span className="shrink-0 font-mono text-sm tabular-nums text-ink-muted">
                      {yearLabel(y.year)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <HairlineRule />

      <section className="py-12 sm:py-16">
        <MicroCaps as="p">Read a full event</MicroCaps>
        <h2 className="mt-2 max-w-[28ch] text-2xl leading-tight tracking-[-0.01em]">
          Start with {heroEvent.title.toLowerCase()}.
        </h2>
        <p className="mt-4 max-w-[60ch] text-sm leading-6 text-ink-muted">
          Every event page carries a signature &ldquo;Meanwhile, around the
          world&rdquo; section — a region-by-region snapshot of what was
          happening everywhere at that moment. Plus sourced body sections, key
          figures, and imagery from Wikimedia with credits and licences.
        </p>
        <div className="mt-6">
          <Link
            href={`/event/${heroEvent.slug}`}
            className="group inline-flex items-baseline gap-3 border-b border-ink pb-1 text-base"
          >
            <span>Open the {heroEvent.title} page</span>
            <ArrowRight
              size={16}
              strokeWidth={1.5}
              className="translate-y-[2px] transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
