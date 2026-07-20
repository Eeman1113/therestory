import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import type { Image as ImageDoc } from "@/lib/content/schema";

export function ImageGallery({ images }: { images: ImageDoc[] }) {
  // Skip the hero image (already shown at the top of the page).
  const gallery = images.slice(1);
  if (!gallery.length) return null;
  return (
    <section className="py-16">
      <MicroCaps as="p">Gallery</MicroCaps>
      <h2 className="mt-2 text-2xl tracking-[-0.01em]">Imagery</h2>
      <HairlineRule className="mt-8" />
      <ul className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2">
        {gallery.map((img) => (
          <li key={img.url}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.caption}
              loading="lazy"
              className="w-full border border-rule bg-surface object-cover"
            />
            <p className="mt-3 text-xs leading-5 text-ink-muted">
              <span className="text-ink">{img.caption}</span> · {img.credit} ·{" "}
              {img.license} ·{" "}
              <a
                href={img.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ink-muted/40 underline-offset-2 hover:decoration-ink-muted"
              >
                source
              </a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
