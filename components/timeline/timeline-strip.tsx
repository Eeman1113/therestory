"use client";

/**
 * Persistent 60px chrome strip that sits at the top of every page.
 * Phase 1: empty shell — renders era bands and mono year ticks statically
 * so the site already *feels* like Therestory. Real interactive ruler
 * (zoom / pan / markers / keyboard nav) arrives in Phase 3.
 */

import { cn } from "@/lib/utils";

const ERAS = [
  { key: "prehistory", label: "Prehistory", startYear: -3500, endYear: -800 },
  { key: "ancient", label: "Ancient", startYear: -800, endYear: 500 },
  { key: "classical", label: "Classical", startYear: 500, endYear: 1000 },
  { key: "post-classical", label: "Post-classical", startYear: 1000, endYear: 1500 },
  { key: "early-modern", label: "Early Modern", startYear: 1500, endYear: 1800 },
  { key: "long-19th", label: "Long 19th c.", startYear: 1800, endYear: 1914 },
  { key: "20th-century", label: "20th Century", startYear: 1914, endYear: 1991 },
  { key: "contemporary", label: "Contemporary", startYear: 1991, endYear: 2026 },
];

// Piecewise time-scale approximation for the strip preview.
// Compresses ancient millennia, gives recent centuries more room.
// Returns 0..1 position for a given year.
function positionOf(year: number): number {
  const knots: [number, number][] = [
    [-3500, 0.00],
    [-800, 0.14],
    [500, 0.26],
    [1000, 0.34],
    [1500, 0.44],
    [1800, 0.58],
    [1914, 0.72],
    [1991, 0.90],
    [2026, 1.00],
  ];
  for (let i = 0; i < knots.length - 1; i++) {
    const [y1, p1] = knots[i];
    const [y2, p2] = knots[i + 1];
    if (year >= y1 && year <= y2) {
      const t = (year - y1) / (y2 - y1);
      return p1 + t * (p2 - p1);
    }
  }
  return year < knots[0][0] ? 0 : 1;
}

// Sparse tick years chosen so the preview reads well at all viewport widths.
const TICK_YEARS = [
  -3000, -2000, -1000, -500, 0, 500, 1000, 1500, 1800, 1900, 1950, 2000,
];

function formatTick(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  if (y === 0) return "1 CE";
  return `${y}`;
}

export function TimelineStrip({ className }: { className?: string }) {
  return (
    <div
      aria-label="Timeline preview"
      className={cn(
        "relative h-[60px] w-full border-b border-rule bg-surface/60 backdrop-blur",
        className,
      )}
    >
      {/* Era bands */}
      <div className="absolute inset-x-0 top-0 flex h-[22px] items-stretch">
        {ERAS.map((era, i) => {
          const left = positionOf(era.startYear) * 100;
          const right = positionOf(era.endYear) * 100;
          const width = right - left;
          return (
            <div
              key={era.key}
              className={cn(
                "absolute top-0 h-full",
                i % 2 === 0 ? "bg-ink/[0.025] dark:bg-ink/[0.04]" : "",
              )}
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              <span
                className={cn(
                  "absolute left-2 top-1.5 text-[10px] uppercase tracking-[0.14em]",
                  "text-ink-muted/80",
                  width < 6 ? "hidden" : "",
                )}
              >
                {era.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hairline separating bands from ruler */}
      <div className="absolute inset-x-0 top-[22px] h-px bg-rule" />

      {/* Ruler ticks */}
      <div className="absolute inset-x-0 top-[22px] bottom-0">
        {TICK_YEARS.map((y) => {
          const left = positionOf(y) * 100;
          return (
            <div
              key={y}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${left}%`, transform: "translateX(-50%)" }}
            >
              <div className="h-[6px] w-px bg-rule" />
              <span className="mt-1 font-mono text-[10px] tabular-nums text-ink-muted">
                {formatTick(y)}
              </span>
            </div>
          );
        })}
      </div>

      {/* "You are here" indicator — pinned to present for now */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 w-px bg-accent"
        style={{ left: `${positionOf(2026) * 100}%` }}
        aria-hidden
      />
    </div>
  );
}
