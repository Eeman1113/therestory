/**
 * The Therestory time scale.
 *
 * A piecewise linear-in-log mapping from historical year to a normalized
 * position 0..1 across the timeline. Ancient millennia are compressed, recent
 * centuries get proportionally more space — so 20 years in the 20th century
 * takes about the same visual room as 500 years around 1000 BCE.
 *
 * The scale is defined by "knots": (year, position) pairs. Between knots we
 * interpolate linearly. This is what the design plan called "piecewise log-ish".
 *
 * The concrete pixel positions come from multiplying position * width, where
 * width is the current viewport width times the zoom factor. Zoom 1.0 fits the
 * whole timeline in the viewport. Higher zoom means more pixels per year.
 */

export const MIN_YEAR = -3500;
export const MAX_YEAR = 2026;

const KNOTS: Array<[year: number, pos: number]> = [
  [-3500, 0.0],
  [-800, 0.14],
  [500, 0.26],
  [1000, 0.34],
  [1500, 0.44],
  [1800, 0.58],
  [1914, 0.72],
  [1991, 0.9],
  [2026, 1.0],
];

/** Map a year (signed, negative for BCE) to a normalized position 0..1. */
export function yearToPosition(year: number): number {
  if (year <= KNOTS[0][0]) return 0;
  if (year >= KNOTS[KNOTS.length - 1][0]) return 1;
  for (let i = 0; i < KNOTS.length - 1; i++) {
    const [y1, p1] = KNOTS[i];
    const [y2, p2] = KNOTS[i + 1];
    if (year >= y1 && year <= y2) {
      const t = (year - y1) / (y2 - y1);
      return p1 + t * (p2 - p1);
    }
  }
  return 1;
}

/** Inverse: normalized position 0..1 back to a year. */
export function positionToYear(pos: number): number {
  const clamped = Math.min(1, Math.max(0, pos));
  for (let i = 0; i < KNOTS.length - 1; i++) {
    const [y1, p1] = KNOTS[i];
    const [y2, p2] = KNOTS[i + 1];
    if (clamped >= p1 && clamped <= p2) {
      const t = (clamped - p1) / (p2 - p1);
      return Math.round(y1 + t * (y2 - y1));
    }
  }
  return MAX_YEAR;
}

/** Parse the canonical event date.start string ("-000221", "1453-05-29") into
 * a signed year (fractional component encodes month for finer positioning). */
export function parseStartYear(start: string): number {
  const negative = start.startsWith("-");
  const body = negative ? start.slice(1) : start;
  const [yStr, mStr = "01", dStr = "01"] = body.split("-");
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);
  const fraction = (m - 1) / 12 + (d - 1) / 365;
  const signed = negative ? -y : y;
  return signed + (negative ? -fraction : fraction);
}

/* ---------------------------------------------------------------------------
   Tick generation.

   At any viewport width, generate a sparse-but-legible set of year ticks that:
   - hits the era boundaries when visible
   - fills the gaps between them with "nice" round years (1000s, 500s, 100s,
     50s, 10s, or 1s depending on how much pixel room each year gets)
   - never crowds ticks closer than ~48px apart

   Returns { year, pos } pairs, plus a `major` flag for era-boundary ticks that
   should render with a longer stem / bolder label.
--------------------------------------------------------------------------- */

export interface Tick {
  year: number;
  pos: number; // 0..1
  major: boolean;
}

const ERA_BOUNDARIES = [-3500, -800, 500, 1000, 1500, 1800, 1914, 1991, 2026];

/**
 * @param width - total pixel width of the ruler
 * @param viewStart - normalized position at left edge of viewport (0..1)
 * @param viewEnd   - normalized position at right edge of viewport (0..1)
 * @param minSpacing - minimum pixel distance between rendered ticks
 */
export function generateTicks(
  width: number,
  viewStart = 0,
  viewEnd = 1,
  minSpacing = 56,
): Tick[] {
  if (width <= 0) return [];
  // Convert viewport bounds to year range visible in the viewport.
  const startYear = positionToYear(viewStart);
  const endYear = positionToYear(viewEnd);

  const visibleYears = endYear - startYear;
  if (visibleYears <= 0) return [];

  // pixels per year in the visible range (approximate — it varies along the
  // piecewise scale, but this is close enough for spacing decisions).
  const viewWidth = (viewEnd - viewStart) * width;
  const pxPerYear = viewWidth / visibleYears;

  // Choose a base step so ticks stay >= minSpacing px apart.
  const STEPS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
  const target = minSpacing / Math.max(pxPerYear, 0.0001);
  const step = STEPS.find((s) => s >= target) ?? STEPS[STEPS.length - 1];

  const ticks: Tick[] = [];
  const seen = new Set<number>();

  // Era boundaries always render (as major ticks) when in range.
  for (const y of ERA_BOUNDARIES) {
    if (y >= startYear - step && y <= endYear + step) {
      ticks.push({ year: y, pos: yearToPosition(y), major: true });
      seen.add(y);
    }
  }

  // Fill with round-year ticks.
  const first = Math.ceil(startYear / step) * step;
  for (let y = first; y <= endYear; y += step) {
    if (seen.has(y)) continue;
    if (y === 0) continue; // skip year 0 — historians don't use it
    ticks.push({ year: y, pos: yearToPosition(y), major: false });
    seen.add(y);
  }

  ticks.sort((a, b) => a.year - b.year);

  // Post-pass: drop ticks that end up too close in pixel space (era-boundary
  // ticks always win).
  const kept: Tick[] = [];
  for (const t of ticks) {
    const lastPx = kept.length ? kept[kept.length - 1].pos * width : -Infinity;
    const px = t.pos * width;
    if (px - lastPx < minSpacing && !t.major) continue;
    kept.push(t);
  }
  return kept;
}
