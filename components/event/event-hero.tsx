import { MonoDate } from "@/components/common/mono-date";
import { MicroCaps } from "@/components/common/micro-caps";
import { SafeImage } from "@/components/common/safe-image";
import { markerColor } from "@/lib/timeline/categories";
import type { EventDoc } from "@/lib/content/schema";
import { getEra, getCategory } from "@/lib/content/loader";

export function EventHero({ event }: { event: EventDoc }) {
  const era = getEra(event.era);
  const c = markerColor(event.categories);
  const hero = event.images[0];

  return (
    <header className="grid grid-cols-1 gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <MonoDate
            date={event.date}
            size="xl"
            className="text-[24px] leading-7 sm:text-[32px] sm:leading-8"
          />
          {event.disputed && (
            <MicroCaps className="text-accent">Disputed</MicroCaps>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {era && <MicroCaps>{era.label}</MicroCaps>}
          {event.categories.map((cat) => {
            const meta = getCategory(cat);
            return (
              <span
                key={cat}
                className="text-[11px] uppercase tracking-[0.14em]"
                style={{ color: `light-dark(${c.light}, ${c.dark})` }}
              >
                {meta?.label ?? cat}
              </span>
            );
          })}
        </div>
        <h1 className="mt-6 text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[56px] sm:leading-[1.04]">
          {event.title}
        </h1>
        <p className="mt-6 max-w-[62ch] text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
          {event.summary}
        </p>
      </div>

      {hero && (
        <figure className="lg:col-span-5">
          <SafeImage
            src={hero.url}
            alt={hero.caption}
            loading="eager"
            className="w-full border border-rule object-cover"
            aspectRatio="4 / 5"
          />
          <figcaption className="mt-3 text-xs leading-5 text-ink-muted">
            <span className="text-ink">{hero.caption}</span> ·{" "}
            {hero.credit} · {hero.license} ·{" "}
            <a
              href={hero.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-ink-muted/40 underline-offset-2 hover:decoration-ink-muted"
            >
              source
            </a>
          </figcaption>
        </figure>
      )}
    </header>
  );
}
