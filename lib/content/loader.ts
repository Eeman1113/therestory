import fs from "node:fs";
import path from "node:path";
import {
  CategoryMetaSchema,
  EraMetaSchema,
  EventSchema,
  RegionMetaSchema,
  YearSchema,
  type CategoryMeta,
  type EraMeta,
  type EventDoc,
  type RegionMeta,
  type YearDoc,
} from "./schema";
import { z } from "zod";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function readJson(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${filePath}: ${(err as Error).message}`);
  }
}

function readDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(dir, f))
    .sort();
}

function loadCollection<T>(dir: string, schema: z.ZodType<T>): T[] {
  return readDir(dir).map((file) => {
    const raw = readJson(file);
    const result = schema.safeParse(raw);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  · ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`Schema error in ${path.relative(process.cwd(), file)}:\n${issues}`);
    }
    return result.data;
  });
}

/* ---------------------------------------------------------------------------
   Public loader API — everything is synchronous and reads at build time only.
--------------------------------------------------------------------------- */

let cachedEvents: EventDoc[] | null = null;
let cachedYears: YearDoc[] | null = null;
let cachedEras: EraMeta[] | null = null;
let cachedRegions: RegionMeta[] | null = null;
let cachedCategories: CategoryMeta[] | null = null;

export function allEvents(): EventDoc[] {
  if (cachedEvents) return cachedEvents;
  const events = loadCollection(path.join(CONTENT_ROOT, "events"), EventSchema);
  const seen = new Set<string>();
  for (const e of events) {
    if (seen.has(e.slug)) throw new Error(`Duplicate event slug: ${e.slug}`);
    seen.add(e.slug);
  }
  cachedEvents = events.sort((a, b) => a.date.start.localeCompare(b.date.start));
  return cachedEvents;
}

export function allYears(): YearDoc[] {
  if (cachedYears) return cachedYears;
  cachedYears = loadCollection(path.join(CONTENT_ROOT, "years"), YearSchema).sort(
    (a, b) => a.year - b.year,
  );
  return cachedYears;
}

export function allEras(): EraMeta[] {
  if (cachedEras) return cachedEras;
  const raw = readJson(path.join(CONTENT_ROOT, "eras.json"));
  cachedEras = z.array(EraMetaSchema).parse(raw);
  return cachedEras;
}

export function allRegions(): RegionMeta[] {
  if (cachedRegions) return cachedRegions;
  const raw = readJson(path.join(CONTENT_ROOT, "regions.json"));
  cachedRegions = z.array(RegionMetaSchema).parse(raw);
  return cachedRegions;
}

export function allCategories(): CategoryMeta[] {
  if (cachedCategories) return cachedCategories;
  const raw = readJson(path.join(CONTENT_ROOT, "categories.json"));
  cachedCategories = z.array(CategoryMetaSchema).parse(raw);
  return cachedCategories;
}

export function getEvent(slug: string): EventDoc | undefined {
  return allEvents().find((e) => e.slug === slug);
}

export function getYear(year: number): YearDoc | undefined {
  return allYears().find((y) => y.year === year);
}

export function getEra(id: string): EraMeta | undefined {
  return allEras().find((e) => e.id === id);
}

export function getRegion(id: string): RegionMeta | undefined {
  return allRegions().find((r) => r.id === id);
}

export function getCategory(id: string): CategoryMeta | undefined {
  return allCategories().find((c) => c.id === id);
}
