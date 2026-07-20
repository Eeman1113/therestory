import { z } from "zod";

/* ---------------------------------------------------------------------------
   Canonical enums — the taxonomy behind every content file.
   Kept in sync with content/regions.json, content/eras.json,
   content/categories.json (the JSON files are for display metadata).
--------------------------------------------------------------------------- */

export const REGIONS = [
  "africa",
  "americas",
  "east-asia",
  "south-central-asia",
  "middle-east-north-africa",
  "europe",
  "oceania",
] as const;
export type Region = (typeof REGIONS)[number];
export const RegionEnum = z.enum(REGIONS);

export const ERAS = [
  "prehistory",
  "ancient",
  "classical",
  "post-classical",
  "early-modern",
  "long-19th",
  "20th-century",
  "contemporary",
] as const;
export type Era = (typeof ERAS)[number];
export const EraEnum = z.enum(ERAS);

export const CATEGORIES = [
  "war-conflict",
  "politics-empires",
  "science-technology",
  "art-culture",
  "exploration",
  "religion-ideas",
  "disaster-disease",
  "economy-trade",
] as const;
export type Category = (typeof CATEGORIES)[number];
export const CategoryEnum = z.enum(CATEGORIES);

/* ---------------------------------------------------------------------------
   Dates
   Canonical form: signed ISO-ish strings.
     CE: "1453-05-29" | "1453-05" | "1453"
     BCE: "-000776-01-01" | "-000776" | "-003100"  (leading "-", zero-padded to
          6 digits so string sort orders correctly with CE dates)
--------------------------------------------------------------------------- */

const YEAR_STRING = /^(-\d{4,6}|\d{1,4})(-\d{2}(-\d{2})?)?$/;

export const PrecisionEnum = z.enum([
  "day",
  "month",
  "year",
  "decade",
  "century",
]);
export type Precision = z.infer<typeof PrecisionEnum>;

export const HistoricalDateSchema = z.object({
  start: z.string().regex(YEAR_STRING, "Invalid date string"),
  end: z.string().regex(YEAR_STRING).optional(),
  precision: PrecisionEnum,
  display: z.string().optional(),
});
export type HistoricalDate = z.infer<typeof HistoricalDateSchema>;

/* ---------------------------------------------------------------------------
   Sources, images, figures, sections
--------------------------------------------------------------------------- */

export const SourceSchema = z.object({
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.url(),
  accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "accessed must be YYYY-MM-DD"),
});
export type Source = z.infer<typeof SourceSchema>;

export const ImageSchema = z.object({
  url: z.url(),
  caption: z.string().min(1),
  credit: z.string().min(1),
  license: z.string().min(1),
  sourceUrl: z.url(),
});
export type Image = z.infer<typeof ImageSchema>;

export const FigureSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  imageUrl: z.url().optional(),
  credit: z.string().optional(),
});
export type Figure = z.infer<typeof FigureSchema>;

export const SectionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1), // markdown
});
export type Section = z.infer<typeof SectionSchema>;

export const WorldContextSchema = z.object({
  region: RegionEnum,
  text: z.string().min(1), // markdown
});
export type WorldContext = z.infer<typeof WorldContextSchema>;

/* ---------------------------------------------------------------------------
   Event
--------------------------------------------------------------------------- */

export const EventSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "id must be lowercase kebab-case"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  title: z.string().min(1),
  date: HistoricalDateSchema,
  era: EraEnum,
  regions: z.array(RegionEnum).min(1),
  categories: z.array(CategoryEnum).min(1),
  significance: z.number().int().min(1).max(5),
  summary: z.string().min(1),
  sections: z.array(SectionSchema).min(1),
  worldContext: z.array(WorldContextSchema).optional(),
  figures: z.array(FigureSchema).default([]),
  images: z.array(ImageSchema).min(1),
  sources: z.array(SourceSchema).min(2),
  disputed: z.boolean().default(false),
});
export type EventDoc = z.infer<typeof EventSchema>;

/* ---------------------------------------------------------------------------
   Year — the "meanwhile, everywhere" pivot pages
--------------------------------------------------------------------------- */

export const YearSchema = z
  .object({
    year: z.number().int(), // signed, negative for BCE
    headline: z.string().min(1),
    summary: z.string().min(1),
    snapshots: z.array(WorldContextSchema),
    featuredEventIds: z.array(z.string()).default([]),
    sources: z.array(SourceSchema).min(2),
  })
  .refine(
    (v) => {
      const regions = new Set(v.snapshots.map((s) => s.region));
      return REGIONS.every((r) => regions.has(r));
    },
    { message: "Year snapshots must cover every region exactly once" },
  );
export type YearDoc = z.infer<typeof YearSchema>;

/* ---------------------------------------------------------------------------
   IA metadata files
--------------------------------------------------------------------------- */

export const EraMetaSchema = z.object({
  id: EraEnum,
  label: z.string(),
  startYear: z.number().int(),
  endYear: z.number().int(),
  description: z.string(),
});
export type EraMeta = z.infer<typeof EraMetaSchema>;

export const RegionMetaSchema = z.object({
  id: RegionEnum,
  label: z.string(),
  description: z.string(),
});
export type RegionMeta = z.infer<typeof RegionMetaSchema>;

export const CategoryMetaSchema = z.object({
  id: CategoryEnum,
  label: z.string(),
  description: z.string(),
});
export type CategoryMeta = z.infer<typeof CategoryMetaSchema>;
