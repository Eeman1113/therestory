import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MicroCaps } from "@/components/common/micro-caps";
import { MonoDate } from "@/components/common/mono-date";
import { HairlineRule } from "@/components/common/hairline-rule";
import { allEvents } from "@/lib/content/loader";

export default function HomePage() {
  const events = allEvents();
  const heroEvent = events.find((e) => e.slug === "fall-of-constantinople") ?? events[0];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8">
      {/* Hero */}
      <section className="grid grid-cols-1 gap-10 pt-16 pb-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <MicroCaps as="p">Wikipedia, by time</MicroCaps>
          <h1 className="mt-4 text-[44px] leading-[1.05] tracking-[-0.02em] sm:text-[56px] sm:leading-[1.04]">
            A history of everything,{" "}
            <span className="text-ink-muted">everywhere,</span>{" "}
            arranged along a single line.
          </h1>
          <p className="mt-6 max-w-[62ch] text-lg leading-8 text-ink-muted">
            Therestory is a slow, careful map of the past. Scroll a horizontal
            timeline across every era — and at any moment you pick, see what was
            happening in every corner of the world: Africa, the Americas, East
            Asia, South & Central Asia, the Middle East & North Africa, Europe,
            and Oceania.
          </p>

          {heroEvent && (
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href={`/event/${heroEvent.slug}`}
                className="group inline-flex items-baseline gap-3 border-b border-ink pb-1 text-base"
              >
                <span>Start here — {heroEvent.title}</span>
                <ArrowRight
                  size={16}
                  strokeWidth={1.5}
                  className="translate-y-[2px] transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              <MonoDate
                date={heroEvent.date}
                size="sm"
                className="text-ink-muted"
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <MicroCaps as="p">Editorial notes</MicroCaps>
          <ul className="mt-4 space-y-4 text-sm leading-6 text-ink-muted">
            <li>
              <span className="text-ink">Sourced.</span> Every fact is grounded
              in at least two reputable sources. Nothing is invented.
            </li>
            <li>
              <span className="text-ink">Global.</span> Every era covers every
              region. No Eurocentric default.
            </li>
            <li>
              <span className="text-ink">Growing.</span> v0.1 seeds the
              timeline. The architecture is built for all of history.
            </li>
          </ul>
        </aside>
      </section>

      <HairlineRule />

      {/* Seed anchor events */}
      <section className="py-16">
        <div className="flex items-baseline justify-between">
          <div>
            <MicroCaps as="p">Anchor events</MicroCaps>
            <h2 className="mt-2 text-2xl tracking-[-0.01em]">
              Where the story begins
            </h2>
          </div>
          <span className="hidden font-mono text-xs tabular-nums text-ink-muted sm:inline">
            —{events.length} seeded
          </span>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <li key={e.slug} className="border-t border-rule py-4">
              <Link
                href={`/event/${e.slug}`}
                className="group flex items-baseline justify-between gap-4"
              >
                <span className="text-sm leading-6 text-ink transition-colors group-hover:text-accent">
                  {e.title}
                </span>
                <MonoDate
                  date={e.date}
                  size="sm"
                  className="shrink-0 text-ink-muted"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <HairlineRule />

      {/* Placeholder for the real interactive timeline (Phase 3) */}
      <section className="py-16">
        <MicroCaps as="p">Coming next</MicroCaps>
        <h2 className="mt-2 max-w-[24ch] text-2xl leading-tight tracking-[-0.01em]">
          The interactive timeline lands in Phase 3.
        </h2>
        <p className="mt-4 max-w-[60ch] text-sm leading-6 text-ink-muted">
          The strip at the top of every page is a preview. Soon it will pan,
          zoom, hover-preview every marker, and let you press Enter on any
          moment to open a region-by-region view of what was happening
          everywhere at once.
        </p>
      </section>
    </div>
  );
}
