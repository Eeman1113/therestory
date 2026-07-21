import { MicroCaps } from "@/components/common/micro-caps";
import { Markdown } from "@/components/common/markdown";
import { SafeImage } from "@/components/common/safe-image";
import type { Section } from "@/lib/content/schema";

export function EventBody({ sections }: { sections: Section[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-16 gap-y-10 py-12 sm:gap-y-14 sm:py-16 lg:grid-cols-12">
      {sections.map((s, i) => (
        <section key={s.heading} className="contents">
          <div className="lg:col-span-3">
            <MicroCaps as="p">§ {String(i + 1).padStart(2, "0")}</MicroCaps>
            <h2 className="mt-2 text-xl leading-tight tracking-[-0.01em] text-ink">
              {s.heading}
            </h2>
          </div>
          <div className="max-w-[65ch] lg:col-span-9">
            {s.image && (
              <figure className="mb-8">
                <div className="overflow-hidden border border-rule bg-surface">
                  <SafeImage
                    src={s.image.url}
                    alt={s.image.caption}
                    className="block h-auto w-full object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-xs leading-5 text-ink-muted">
                  <span className="text-ink">{s.image.caption}</span>{" "}
                  <span className="text-ink-muted/80">
                    {s.image.credit} · {s.image.license}
                  </span>
                </figcaption>
              </figure>
            )}
            <Markdown>{s.body}</Markdown>
          </div>
        </section>
      ))}
    </div>
  );
}
