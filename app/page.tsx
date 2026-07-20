import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MicroCaps } from "@/components/common/micro-caps";
import { MonoDate } from "@/components/common/mono-date";
import { HairlineRule } from "@/components/common/hairline-rule";

const PIVOTAL_YEARS = [
  { year: -3100, note: "Writing appears in Sumer and Egypt" },
  { year: -776, note: "First recorded Olympiad" },
  { year: -221, note: "Qin unifies China" },
  { year: 622, note: "The Hijra" },
  { year: 1066, note: "Norman conquest of England" },
  { year: 1206, note: "Genghis Khan proclaimed" },
  { year: 1347, note: "The Black Death reaches Europe" },
  { year: 1453, note: "Fall of Constantinople" },
  { year: 1492, note: "Columbus makes landfall in the Americas" },
  { year: 1789, note: "French Revolution begins" },
  { year: 1914, note: "The world goes to war" },
  { year: 1945, note: "End of WWII; atomic age begins" },
  { year: 1969, note: "Apollo 11 lands on the Moon" },
  { year: 1989, note: "Berlin Wall falls" },
  { year: 2001, note: "September 11 attacks" },
];

export default function HomePage() {
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

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/year/1453"
              className="group inline-flex items-baseline gap-3 border-b border-ink pb-1 text-base"
            >
              <span>Start with the fall of Constantinople</span>
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="translate-y-[2px] transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
            <span className="font-mono text-xs tabular-nums text-ink-muted">
              1453·05·29
            </span>
          </div>
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

      {/* Pivotal years */}
      <section className="py-16">
        <div className="flex items-baseline justify-between">
          <div>
            <MicroCaps as="p">Pivotal years</MicroCaps>
            <h2 className="mt-2 text-2xl tracking-[-0.01em]">
              Fifteen moments to start from
            </h2>
          </div>
          <span className="hidden font-mono text-xs tabular-nums text-ink-muted sm:inline">
            —{PIVOTAL_YEARS.length} entries
          </span>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
          {PIVOTAL_YEARS.map((y) => (
            <li key={y.year} className="border-t border-rule py-4">
              <Link
                href={`/year/${y.year}`}
                className="group flex items-baseline justify-between gap-4"
              >
                <span className="text-sm leading-6 text-ink transition-colors group-hover:text-accent">
                  {y.note}
                </span>
                <MonoDate
                  date={{ start: signedYear(y.year), precision: "year" }}
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

function signedYear(y: number): string {
  const abs = Math.abs(y).toString().padStart(4, "0");
  return y < 0 ? `-${abs.padStart(6, "0")}` : abs;
}
