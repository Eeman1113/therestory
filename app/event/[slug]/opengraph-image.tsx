import { notFound } from "next/navigation";
import { allEvents, getEvent, getEra, getCategory } from "@/lib/content/loader";
import { formatDate } from "@/lib/date/format";
import { OG_SIZE, OG_CONTENT_TYPE, ogImage } from "@/lib/og/template";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Therestory event";

export function generateStaticParams() {
  return allEvents().map((e) => ({ slug: e.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const era = getEra(event.era);
  const cat = getCategory(event.categories[0]);
  const eyebrow = [era?.label, cat?.label].filter(Boolean).join(" · ");

  return ogImage({
    date: formatDate(event.date),
    eyebrow,
    title: event.title,
  });
}
