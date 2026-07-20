import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MonoDate } from "@/components/common/mono-date";
import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import type { EventDoc } from "@/lib/content/schema";

export function PrevNextNav({
  prev,
  next,
}: {
  prev: EventDoc | null;
  next: EventDoc | null;
}) {
  return (
    <nav className="py-16" aria-label="Adjacent events">
      <HairlineRule className="mb-8" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {prev ? (
          <Link
            href={`/event/${prev.slug}`}
            className="group flex flex-col gap-2"
          >
            <span className="inline-flex items-center gap-2 text-ink-muted transition-colors group-hover:text-accent">
              <ArrowLeft size={14} strokeWidth={1.5} aria-hidden />
              <MicroCaps>Earlier in time</MicroCaps>
            </span>
            <span className="text-lg leading-tight text-ink transition-colors group-hover:text-accent">
              {prev.title}
            </span>
            <MonoDate date={prev.date} size="sm" className="text-ink-muted" />
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/event/${next.slug}`}
            className="group flex flex-col gap-2 md:items-end md:text-right"
          >
            <span className="inline-flex items-center gap-2 text-ink-muted transition-colors group-hover:text-accent">
              <MicroCaps>Later in time</MicroCaps>
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
            </span>
            <span className="text-lg leading-tight text-ink transition-colors group-hover:text-accent">
              {next.title}
            </span>
            <MonoDate date={next.date} size="sm" className="text-ink-muted" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
