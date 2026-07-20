import { MicroCaps } from "@/components/common/micro-caps";
import type { YearDoc } from "@/lib/content/schema";

function formatYearShort(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  if (y === 0) return "1 CE";
  return `${y}`;
}

export function YearHero({ year }: { year: YearDoc }) {
  return (
    <header className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-8">
        <MicroCaps as="p">A year in the world</MicroCaps>
        <h1 className="mt-3 font-mono text-[80px] leading-[0.9] tracking-[-0.03em] sm:text-[112px]">
          {formatYearShort(year.year)}
        </h1>
        <h2 className="mt-6 max-w-[28ch] text-[32px] leading-[1.1] tracking-[-0.015em]">
          {year.headline}
        </h2>
        <p className="mt-6 max-w-[62ch] text-lg leading-8 text-ink-muted">
          {year.summary}
        </p>
      </div>
    </header>
  );
}
