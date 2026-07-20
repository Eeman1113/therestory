import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import { Markdown } from "@/components/common/markdown";
import { SafeImage } from "@/components/common/safe-image";
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
    <section className="py-12 sm:py-16">
      <MicroCaps as="p">The world, region by region</MicroCaps>
      <h2 className="mt-2 max-w-[26ch] text-[26px] leading-[1.15] tracking-[-0.015em] sm:text-[32px] sm:leading-[1.1]">
        Seven snapshots. One year.
      </h2>
      <p className="mt-4 max-w-[62ch] text-base leading-7 text-ink-muted sm:text-sm sm:leading-6">
        Every year page on Therestory carries a snapshot of every world region
        — Africa, the Americas, East Asia, South & Central Asia, the Middle East
        & North Africa, Europe, and Oceania. This is what a global history
        looks like when nothing is left out.
      </p>

      <HairlineRule className="mt-8 sm:mt-10" />

      <ul>
        {sorted.map((snap) => {
          const region = getRegion(snap.region);
          return (
            <li key={snap.region} className="border-b border-rule py-8 sm:py-10">
              <div className="grid grid-cols-1 gap-x-16 gap-y-6 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <MicroCaps as="p">{region?.label ?? snap.region}</MicroCaps>
                  {region?.description && (
                    <p className="mt-3 text-xs leading-5 text-ink-muted/80">
                      {region.description}
                    </p>
                  )}
                  {snap.image && (
                    <figure className="mt-4">
                      <SafeImage
                        src={snap.image.url}
                        alt={snap.image.caption}
                        className="w-full border border-rule object-cover"
                        aspectRatio="4 / 3"
                      />
                      <figcaption className="mt-2 text-[11px] leading-4 text-ink-muted/80">
                        <span className="text-ink-muted">{snap.image.caption}</span>{" "}
                        · {snap.image.credit} · {snap.image.license} ·{" "}
                        <a
                          href={snap.image.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-ink-muted/40 underline-offset-2 hover:decoration-ink-muted"
                        >
                          src
                        </a>
                      </figcaption>
                    </figure>
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
