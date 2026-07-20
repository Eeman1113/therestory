import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import { Markdown } from "@/components/common/markdown";
import { getRegion } from "@/lib/content/loader";
import type { WorldContext } from "@/lib/content/schema";

const REGION_ORDER = [
  "middle-east-north-africa",
  "europe",
  "africa",
  "south-central-asia",
  "east-asia",
  "americas",
  "oceania",
];

export function YearWorldSnapshot({
  snapshots,
}: {
  snapshots: WorldContext[];
}) {
  // Order by canonical region sequence for consistency across year pages.
  const sorted = [...snapshots].sort(
    (a, b) => REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region),
  );

  return (
    <section className="py-16">
      <MicroCaps as="p">The world, region by region</MicroCaps>
      <h2 className="mt-2 max-w-[26ch] text-[32px] leading-[1.1] tracking-[-0.015em]">
        Seven snapshots. One year.
      </h2>
      <p className="mt-4 max-w-[62ch] text-sm leading-6 text-ink-muted">
        Every year page on Therestory carries a snapshot of every world region
        — Africa, the Americas, East Asia, South & Central Asia, the Middle East
        & North Africa, Europe, and Oceania. This is what a global history
        looks like when nothing is left out.
      </p>

      <HairlineRule className="mt-10" />

      <ul>
        {sorted.map((snap) => {
          const region = getRegion(snap.region);
          return (
            <li key={snap.region} className="border-b border-rule py-10">
              <div className="grid grid-cols-1 gap-x-16 gap-y-6 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <MicroCaps as="p">{region?.label ?? snap.region}</MicroCaps>
                  {region?.description && (
                    <p className="mt-3 text-xs leading-5 text-ink-muted/80">
                      {region.description}
                    </p>
                  )}
                </div>
                <div className="max-w-[65ch] lg:col-span-9">
                  <Markdown>{snap.text}</Markdown>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
