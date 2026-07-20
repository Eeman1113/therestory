import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import { Markdown } from "@/components/common/markdown";
import { getRegion } from "@/lib/content/loader";
import type { WorldContext } from "@/lib/content/schema";

/**
 * The signature section of every event page: "Meanwhile, around the world."
 * Region-by-region plaques — museum-hall energy.
 */
export function MeanwhileSection({
  snapshots,
  focusRegions,
}: {
  snapshots: WorldContext[];
  focusRegions: string[];
}) {
  if (!snapshots?.length) return null;

  // Sort so the focus regions of this event appear first, then the rest.
  const sorted = [...snapshots].sort((a, b) => {
    const aFocus = focusRegions.includes(a.region) ? 0 : 1;
    const bFocus = focusRegions.includes(b.region) ? 0 : 1;
    return aFocus - bFocus;
  });

  return (
    <section className="py-16">
      <MicroCaps as="p">The signature</MicroCaps>
      <h2 className="mt-2 max-w-[24ch] text-[32px] leading-[1.1] tracking-[-0.015em]">
        Meanwhile, around the world.
      </h2>
      <p className="mt-4 max-w-[62ch] text-sm leading-6 text-ink-muted">
        What was happening in every other region at the same moment. This is
        what makes Therestory different — global by default, not appended.
      </p>

      <HairlineRule className="mt-10" />

      <ul className="grid grid-cols-1 gap-x-16 md:grid-cols-2">
        {sorted.map((snap) => {
          const region = getRegion(snap.region);
          return (
            <li
              key={snap.region}
              className="border-b border-rule py-8 md:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 md:border-b-0"
            >
              <MicroCaps as="p">{region?.label ?? snap.region}</MicroCaps>
              <div className="mt-3">
                <Markdown>{snap.text}</Markdown>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
