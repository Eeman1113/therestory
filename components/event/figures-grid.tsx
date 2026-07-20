import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import type { Figure } from "@/lib/content/schema";

export function FiguresGrid({ figures }: { figures: Figure[] }) {
  if (!figures?.length) return null;
  return (
    <section className="py-16">
      <MicroCaps as="p">Key figures</MicroCaps>
      <h2 className="mt-2 text-2xl tracking-[-0.01em]">Who was there</h2>
      <HairlineRule className="mt-8" />
      <ul className="grid grid-cols-1 gap-x-10 md:grid-cols-2 lg:grid-cols-3">
        {figures.map((f) => (
          <li key={f.name} className="border-b border-rule py-6">
            <div className="flex items-start gap-4">
              {f.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={f.imageUrl}
                  alt={f.name}
                  className="h-14 w-14 shrink-0 border border-rule object-cover grayscale"
                />
              ) : (
                <div className="h-14 w-14 shrink-0 border border-rule bg-surface" aria-hidden />
              )}
              <div>
                <p className="text-base leading-6 text-ink">{f.name}</p>
                <p className="mt-1 text-sm leading-5 text-ink-muted">{f.role}</p>
                {f.credit && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ink-muted/80">
                    {f.credit}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
