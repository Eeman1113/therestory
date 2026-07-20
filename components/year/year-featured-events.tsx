import Link from "next/link";
import { MicroCaps } from "@/components/common/micro-caps";
import { MonoDate } from "@/components/common/mono-date";
import { HairlineRule } from "@/components/common/hairline-rule";
import type { EventDoc } from "@/lib/content/schema";

export function YearFeaturedEvents({ events }: { events: EventDoc[] }) {
  if (!events.length) return null;
  return (
    <section className="py-16">
      <MicroCaps as="p">Featured events</MicroCaps>
      <h2 className="mt-2 text-2xl tracking-[-0.01em]">
        {events.length === 1
          ? "The moment this year turned on."
          : "The moments this year turned on."}
      </h2>
      <HairlineRule className="mt-8" />
      <ul>
        {events.map((e) => (
          <li key={e.slug} className="border-b border-rule">
            <Link
              href={`/event/${e.slug}`}
              className="group grid grid-cols-1 items-baseline gap-4 py-6 md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div>
                <h3 className="text-xl leading-tight text-ink transition-colors group-hover:text-accent">
                  {e.title}
                </h3>
                <p className="mt-2 max-w-[80ch] text-sm text-ink-muted">
                  {e.summary}
                </p>
              </div>
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
  );
}
