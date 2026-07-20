import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MicroCaps } from "@/components/common/micro-caps";
import type { YearDoc } from "@/lib/content/schema";

function yearSlug(y: number): string {
  return y < 0 ? `${Math.abs(y)}-bce` : `${y}`;
}

function yearLabel(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  if (y === 0) return "1 CE";
  return `${y}`;
}

export function YearCrossref({ year }: { year: YearDoc }) {
  return (
    <Link
      href={`/year/${yearSlug(year.year)}`}
      className="group block border-y border-rule py-8"
    >
      <MicroCaps>Zoom out — the whole year</MicroCaps>
      <div className="mt-2 flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <div className="max-w-[62ch]">
          <h3 className="text-xl leading-tight text-ink transition-colors group-hover:text-accent sm:text-2xl">
            {year.headline}
          </h3>
          <p className="mt-2 text-sm text-ink-muted">
            See what was happening in every world region during {yearLabel(year.year)}.
          </p>
        </div>
        <div className="flex shrink-0 items-baseline gap-3">
          <span className="font-mono text-2xl tabular-nums text-ink-muted">
            {yearLabel(year.year)}
          </span>
          <ArrowUpRight
            size={18}
            strokeWidth={1.5}
            className="text-ink-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
