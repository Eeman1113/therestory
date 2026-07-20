import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { allEras, allEvents } from "@/lib/content/loader";
import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import { yearToPosition } from "@/lib/timeline/scale";

export const metadata: Metadata = {
  title: "Eras",
  description: "An overview of every era in Therestory — Prehistory through the Contemporary world.",
};

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  return `${y}`;
}

export default function ErasIndex() {
  const eras = allEras();
  const events = allEvents();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <MicroCaps as="p">The eight eras</MicroCaps>
          <h1 className="mt-4 text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[44px]">
            Every era in Therestory, from Prehistory to today.
          </h1>
          <p className="mt-6 max-w-[62ch] text-base leading-7 text-ink-muted">
            The timeline is divided into eight editorial eras — not because
            history obeys tidy century breaks, but because human historiography
            groups things this way and it makes the site easier to navigate.
            Each era gets its own page listing the anchor events currently
            seeded within it.
          </p>
        </div>
      </div>

      <HairlineRule className="mt-12 sm:mt-16" />

      <ul>
        {eras.map((era) => {
          const inEra = events.filter((e) => e.era === era.id);
          const width =
            (yearToPosition(era.endYear) - yearToPosition(era.startYear)) * 100;
          return (
            <li key={era.id} className="border-b border-rule">
              <Link
                href={`/eras/${era.id}`}
                className="group grid grid-cols-1 gap-6 py-8 md:grid-cols-12"
              >
                <div className="md:col-span-3">
                  <p className="font-mono text-xs tabular-nums text-ink-muted">
                    {formatYear(era.startYear)} → {formatYear(era.endYear)}
                  </p>
                  <h2 className="mt-2 text-2xl leading-tight tracking-[-0.01em] text-ink transition-colors group-hover:text-accent">
                    {era.label}
                  </h2>
                </div>
                <div className="md:col-span-6">
                  <p className="max-w-[60ch] text-sm leading-6 text-ink-muted">
                    {era.description}
                  </p>
                </div>
                <div className="flex items-start justify-between gap-4 md:col-span-3">
                  <div className="flex-1">
                    <p className="font-mono text-xs tabular-nums text-ink-muted">
                      {inEra.length} event{inEra.length === 1 ? "" : "s"}
                    </p>
                    <div className="mt-2 h-[3px] bg-rule">
                      <div
                        className="h-full bg-accent/70"
                        style={{ width: `${Math.max(6, width)}%` }}
                      />
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    strokeWidth={1.5}
                    className="mt-1 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
