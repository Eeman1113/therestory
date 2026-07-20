import type { MetadataRoute } from "next";
import { allEras, allEvents, allYears } from "@/lib/content/loader";

export const dynamic = "force-static";

const BASE = "https://eeman1113.github.io/therestory";

function yearSlug(y: number): string {
  return y < 0 ? `${Math.abs(y)}-bce` : `${y}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/events/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/eras/`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const eraRoutes: MetadataRoute.Sitemap = allEras().map((e) => ({
    url: `${BASE}/eras/${e.id}/`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const eventRoutes: MetadataRoute.Sitemap = allEvents().map((e) => ({
    url: `${BASE}/event/${e.slug}/`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const yearRoutes: MetadataRoute.Sitemap = allYears().map((y) => ({
    url: `${BASE}/year/${yearSlug(y.year)}/`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...eraRoutes, ...eventRoutes, ...yearRoutes];
}
