/**
 * Canonical date formatting for Therestory.
 * Signature style: middle-dot separators, e.g. `1453·05·29`, `776 BCE`, `c. 3100 BCE`.
 */

export type Precision = "day" | "month" | "year" | "decade" | "century";

export interface HistoricalDate {
  start: string; // "1453-05-29" | "-000776" | "-000776-01-01"
  end?: string;
  precision: Precision;
  display?: string;
}

const DOT = "·"; // ·

function parseSignedYear(s: string): { year: number; month?: number; day?: number } {
  // "-000776-01-01" or "1453-05-29" or "-000776" or "1453"
  let sign = 1;
  let rest = s;
  if (rest.startsWith("-")) {
    sign = -1;
    rest = rest.slice(1);
  }
  const parts = rest.split("-");
  const year = sign * parseInt(parts[0], 10);
  const month = parts[1] ? parseInt(parts[1], 10) : undefined;
  const day = parts[2] ? parseInt(parts[2], 10) : undefined;
  return { year, month, day };
}

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year}`;
}

export function formatDate(d: HistoricalDate): string {
  if (d.display) return d.display;
  const { year, month, day } = parseSignedYear(d.start);
  const bce = year < 0;
  const y = Math.abs(year);

  switch (d.precision) {
    case "day":
      if (bce) return `${y} BCE`;
      return [y, pad(month ?? 1), pad(day ?? 1)].join(DOT);
    case "month":
      if (bce) return `${y} BCE`;
      return [y, pad(month ?? 1)].join(DOT);
    case "year":
      return formatYear(year);
    case "decade": {
      const dec = Math.floor(y / 10) * 10;
      return bce ? `${dec}s BCE` : `${dec}s`;
    }
    case "century": {
      const century = Math.floor(y / 100) + 1;
      return bce ? `${century}th c. BCE` : `${century}th c.`;
    }
  }
}

export function formatRange(d: HistoricalDate): string {
  if (!d.end) return formatDate(d);
  const start = formatDate(d);
  const end = formatDate({ ...d, start: d.end });
  return `${start} – ${end}`; // en dash
}
