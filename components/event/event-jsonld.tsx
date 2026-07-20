import type { EventDoc } from "@/lib/content/schema";

/**
 * schema.org Event JSON-LD.
 * Emitted on every event detail page so search engines and knowledge-graph
 * indexers can pick up dates, sources, and imagery cleanly.
 */
export function EventJsonLd({ event }: { event: EventDoc }) {
  const url = `https://eeman1113.github.io/therestory/event/${event.slug}/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: normaliseDate(event.date.start),
    ...(event.date.end ? { endDate: normaliseDate(event.date.end) } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Global",
    },
    image: event.images.map((i) => i.url),
    isBasedOn: event.sources.map((s) => ({
      "@type": "CreativeWork",
      name: s.title,
      url: s.url,
      publisher: { "@type": "Organization", name: s.publisher },
    })),
    author: {
      "@type": "Organization",
      name: "Therestory",
      url: "https://eeman1113.github.io/therestory/",
    },
    url,
  };

  return (
    <script
      type="application/ld+json"
      // Serialise carefully so we don't produce invalid HTML.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** Convert our canonical BCE-safe date string to something schema.org can parse.
 *  Positive years pass through; BCE years use the ISO 8601 extended year form
 *  (a leading minus sign). */
function normaliseDate(raw: string): string {
  if (!raw.startsWith("-")) return raw;
  // "-000776" or "-000776-01-01" → "-0776" or "-0776-01-01"
  const body = raw.slice(1);
  const parts = body.split("-");
  const year = parseInt(parts[0], 10);
  const yearStr = String(year).padStart(4, "0");
  return ["-" + yearStr, ...parts.slice(1)].join("-");
}
