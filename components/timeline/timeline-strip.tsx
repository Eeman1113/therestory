"use client";

/**
 * TimelineStrip — the persistent 60px chrome that lives at the top of every
 * page. It doubles as a minimap: on pages that host an interactive canvas
 * (currently only the homepage), the strip highlights the visible window so
 * the reader always knows where they are in history.
 */

import { cn } from "@/lib/utils";
import { generateTicks, yearToPosition } from "@/lib/timeline/scale";
import { useTimelineView } from "./timeline-view";

const ERAS = [
  { key: "prehistory", label: "Prehistory", start: -3500, end: -800 },
  { key: "ancient", label: "Ancient", start: -800, end: 500 },
  { key: "classical", label: "Classical", start: 500, end: 1000 },
  { key: "post-classical", label: "Post-classical", start: 1000, end: 1500 },
  { key: "early-modern", label: "Early Modern", start: 1500, end: 1800 },
  { key: "long-19th", label: "Long 19th c.", start: 1800, end: 1914 },
  { key: "20th-century", label: "20th Century", start: 1914, end: 1991 },
  { key: "contemporary", label: "Contemporary", start: 1991, end: 2026 },
];

const STRIP_TICK_YEARS = [
  -3000, -2000, -1000, -500, 0, 500, 1000, 1500, 1800, 1900, 1950, 2000,
];

function formatTick(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  if (y === 0) return "1 CE";
  return `${y}`;
}

export function TimelineStrip({ className }: { className?: string }) {
  const { viewStart, viewEnd } = useTimelineView();
  const showWindow = viewEnd - viewStart < 0.995;

  // Use a generous virtual width for tick generation so density matches the
  // static tick set we've picked below.
  const ticks =
    STRIP_TICK_YEARS.length > 0
      ? STRIP_TICK_YEARS.map((y) => ({
          year: y,
          pos: yearToPosition(y),
          major: false,
        }))
      : generateTicks(1600, 0, 1, 100);

  return (
    <div
      aria-label="Timeline minimap"
      className={cn(
        "relative h-[60px] w-full border-b border-rule bg-surface/60 backdrop-blur",
        className,
      )}
    >
      {/* Era bands */}
      <div className="absolute inset-x-0 top-0 flex h-[22px] items-stretch">
        {ERAS.map((era, i) => {
          const left = yearToPosition(era.start) * 100;
          const right = yearToPosition(era.end) * 100;
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
                  "absolute left-2 top-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted/80",
                  width < 6 ? "hidden" : "",
                )}
              >
                {era.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 top-[22px] h-px bg-rule" />

      {/* Ruler ticks */}
      <div className="absolute inset-x-0 top-[22px] bottom-0">
        {ticks.map((t) => {
          const left = t.pos * 100;
          return (
            <div
              key={t.year}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${left}%`, transform: "translateX(-50%)" }}
            >
              <div className="h-[6px] w-px bg-rule" />
              <span className="mt-1 font-mono text-[10px] tabular-nums text-ink-muted">
                {formatTick(t.year)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Highlighted view window from the interactive canvas */}
      {showWindow && (
        <div
          className="pointer-events-none absolute top-0 bottom-0 border-x border-accent/60 bg-accent/[0.06]"
          style={{
            left: `${viewStart * 100}%`,
            width: `${(viewEnd - viewStart) * 100}%`,
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
