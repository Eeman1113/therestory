import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MicroCaps } from "@/components/common/micro-caps";
import { MonoDate } from "@/components/common/mono-date";
import { HairlineRule } from "@/components/common/hairline-rule";
import { TimelineCanvas } from "@/components/timeline/timeline-canvas";
import { allEvents } from "@/lib/content/loader";

export default function HomePage() {
  const events = allEvents();
  const heroEvent =
    events.find((e) => e.slug === "fall-of-constantinople") ?? events[0];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8">
      {/* Intro */}
      <section className="grid grid-cols-1 gap-10 pt-14 pb-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <MicroCaps as="p">Wikipedia, by time</MicroCaps>
          <h1 className="mt-4 text-[40px] leading-[1.05] tracking-[-0.02em] sm:text-[52px] sm:leading-[1.04]">
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
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-muted">
            <li>
              <span className="text-ink">Sourced.</span> Every fact is grounded
              in at least two reputable sources.
            </li>
            <li>
              <span className="text-ink">Global.</span> Every era covers every
              region. No Eurocentric default.
            </li>
            <li>
              <span className="text-ink">Growing.</span> v0.1 seeds the
              timeline; the architecture holds all of history.
            </li>
          </ul>
        </aside>
      </section>

      {/* Interactive timeline — the hero */}
      <section className="pb-16">
        <TimelineCanvas events={events} />
      </section>

      <HairlineRule />

      {/* Anchor events — jump list */}
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

        {heroEvent && (
          <div className="mt-10">
            <Link
              href={`/event/${heroEvent.slug}`}
              className="group inline-flex items-baseline gap-3 border-b border-ink pb-1 text-base"
            >
              <span>Read a full anchor event — {heroEvent.title}</span>
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="translate-y-[2px] transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        )}
      </section>

      <HairlineRule />

      <section className="py-16">
        <MicroCaps as="p">Coming next</MicroCaps>
        <h2 className="mt-2 max-w-[28ch] text-2xl leading-tight tracking-[-0.01em]">
          Event and year detail pages arrive in Phase 4.
        </h2>
        <p className="mt-4 max-w-[60ch] text-sm leading-6 text-ink-muted">
          Each marker on the timeline will open a page with the story of the
          event, a &ldquo;meanwhile, around the world&rdquo; region-by-region
          snapshot, key figures, imagery from Wikimedia, and every source cited.
        </p>
      </section>
    </div>
  );
}
