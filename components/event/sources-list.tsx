import { ExternalLink } from "lucide-react";
import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import type { Source } from "@/lib/content/schema";

export function SourcesList({ sources }: { sources: Source[] }) {
  return (
    <section className="py-16">
      <MicroCaps as="p">Sources</MicroCaps>
      <h2 className="mt-2 text-2xl tracking-[-0.01em]">
        Everything on this page traces back to these.
      </h2>
      <HairlineRule className="mt-8" />
      <ol className="mt-2">
        {sources.map((s, i) => (
          <li
            key={s.url}
            className="grid grid-cols-[auto,1fr,auto] items-baseline gap-x-4 gap-y-1 border-b border-rule py-4"
          >
            <span className="font-mono text-xs tabular-nums text-ink-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-baseline gap-2 text-sm text-ink hover:text-accent"
              >
                <span>{s.title}</span>
                <ExternalLink
                  size={12}
                  strokeWidth={1.5}
                  className="translate-y-[1px] text-ink-muted transition-colors group-hover:text-accent"
                  aria-hidden
                />
              </a>
              <p className="mt-0.5 text-xs text-ink-muted">{s.publisher}</p>
            </div>
            <span className="font-mono text-[10px] tabular-nums text-ink-muted/70">
              accessed {s.accessed}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
