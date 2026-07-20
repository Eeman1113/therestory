import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allEvents, getEvent, getYear } from "@/lib/content/loader";
import { EventHero } from "@/components/event/event-hero";
import { EventBody } from "@/components/event/event-body";
import { MeanwhileSection } from "@/components/event/meanwhile-section";
import { FiguresGrid } from "@/components/event/figures-grid";
import { ImageGallery } from "@/components/event/image-gallery";
import { SourcesList } from "@/components/event/sources-list";
import { PrevNextNav } from "@/components/event/prev-next-nav";
import { YearCrossref } from "@/components/event/year-crossref";
import { EventJsonLd } from "@/components/event/event-jsonld";
import { HairlineRule } from "@/components/common/hairline-rule";
import { parseStartYear } from "@/lib/timeline/scale";

export function generateStaticParams() {
  return allEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return { title: "Not found" };
  return {
    title: event.title,
    description: event.summary,
    openGraph: {
      title: event.title,
      description: event.summary,
      images: event.images[0] ? [event.images[0].url] : undefined,
      type: "article",
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const all = allEvents();
  const idx = all.findIndex((e) => e.slug === event.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const eventYear = Math.round(parseStartYear(event.date.start));
  const yearPage = getYear(eventYear);

  return (
    <article className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
      <EventJsonLd event={event} />
      <EventHero event={event} />
      <HairlineRule />
      <EventBody sections={event.sections} />
      {event.worldContext && event.worldContext.length > 0 && (
        <>
          <HairlineRule />
          <MeanwhileSection
            snapshots={event.worldContext}
            focusRegions={event.regions}
          />
        </>
      )}
      {event.figures.length > 0 && (
        <>
          <HairlineRule />
          <FiguresGrid figures={event.figures} />
        </>
      )}
      {event.images.length > 1 && (
        <>
          <HairlineRule />
          <ImageGallery images={event.images} />
        </>
      )}
      <HairlineRule />
      <SourcesList sources={event.sources} />
      {yearPage && (
        <section className="pb-8">
          <YearCrossref year={yearPage} />
        </section>
      )}
      <PrevNextNav prev={prev} next={next} />
    </article>
  );
}
