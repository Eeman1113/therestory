import { MicroCaps } from "@/components/common/micro-caps";
import { Markdown } from "@/components/common/markdown";
import type { Section } from "@/lib/content/schema";

export function EventBody({ sections }: { sections: Section[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-16 gap-y-14 py-16 lg:grid-cols-12">
      {sections.map((s, i) => (
        <section key={s.heading} className="contents">
          <div className="lg:col-span-3">
            <MicroCaps as="p">§ {String(i + 1).padStart(2, "0")}</MicroCaps>
            <h2 className="mt-2 text-xl leading-tight tracking-[-0.01em] text-ink">
              {s.heading}
            </h2>
          </div>
          <div className="max-w-[65ch] lg:col-span-9">
            <Markdown>{s.body}</Markdown>
          </div>
        </section>
      ))}
    </div>
  );
}
