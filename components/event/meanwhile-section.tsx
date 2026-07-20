import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import { Markdown } from "@/components/common/markdown";
import { SafeImage } from "@/components/common/safe-image";
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
    <section className="py-12 sm:py-16">
      <MicroCaps as="p">The signature</MicroCaps>
      <h2 className="mt-2 max-w-[24ch] text-[26px] leading-[1.15] tracking-[-0.015em] sm:text-[32px] sm:leading-[1.1]">
        Meanwhile, around the world.
      </h2>
      <p className="mt-4 max-w-[62ch] text-base leading-7 text-ink-muted sm:text-sm sm:leading-6">
        What was happening in every other region at the same moment. This is
        what makes Therestory different — global by default, not appended.
      </p>

      <HairlineRule className="mt-8 sm:mt-10" />

      <ul>
        {sorted.map((snap) => {
          const region = getRegion(snap.region);
          return (
            <li key={snap.region} className="border-b border-rule py-8 sm:py-10">
              <div className="grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <MicroCaps as="p">{region?.label ?? snap.region}</MicroCaps>
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
