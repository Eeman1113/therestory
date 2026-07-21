/**
 * Highcharts option builders for the three-mode homepage timeline.
 *
 * The chart lives inside a client-only component; these functions produce plain
 * option objects (no direct Highcharts imports) so they stay tree-shake friendly
 * and easy to test.
 *
 * Three modes:
 *   - "eras"        : Highcharts timeline chart listing the 8 eras
 *   - "era-scatter" : scatter of events within a selected era
 *   - "all-scatter" : scatter of all events across full range
 */

import type { Category, CategoryMeta, EraMeta, EventDoc } from "@/lib/content/schema";
import { CATEGORY_COLORS, markerRadius } from "@/lib/timeline/categories";
import { parseStartYear } from "@/lib/timeline/scale";
import { formatDate } from "@/lib/date/format";

/* ---------------------------------------------------------------------------
   Palette used for the eight era dots in the "eras" mode timeline chart.
   Chosen so successive dots don't clash and every one stays legible on the
   warm-paper background.
--------------------------------------------------------------------------- */
export const ERA_PALETTE: Record<string, { light: string; dark: string }> = {
  prehistory:      { light: CATEGORY_COLORS["war-conflict"].light,       dark: CATEGORY_COLORS["war-conflict"].dark },
  ancient:         { light: CATEGORY_COLORS["politics-empires"].light,   dark: CATEGORY_COLORS["politics-empires"].dark },
  classical:       { light: CATEGORY_COLORS["religion-ideas"].light,     dark: CATEGORY_COLORS["religion-ideas"].dark },
  "post-classical":{ light: CATEGORY_COLORS["art-culture"].light,        dark: CATEGORY_COLORS["art-culture"].dark },
  "early-modern":  { light: CATEGORY_COLORS["exploration"].light,        dark: CATEGORY_COLORS["exploration"].dark },
  "long-19th":     { light: CATEGORY_COLORS["economy-trade"].light,      dark: CATEGORY_COLORS["economy-trade"].dark },
  "20th-century":  { light: CATEGORY_COLORS["science-technology"].light, dark: CATEGORY_COLORS["science-technology"].dark },
  contemporary:    { light: CATEGORY_COLORS["disaster-disease"].light,   dark: CATEGORY_COLORS["disaster-disease"].dark },
};

export interface ThemeTokens {
  ink: string;
  inkMuted: string;
  rule: string;
  bg: string;
  surface: string;
  accent: string;
  isDark: boolean;
  isMobile: boolean;
}

function pickColor(cat: Category, isDark: boolean): string {
  const c = CATEGORY_COLORS[cat];
  return isDark ? c.dark : c.light;
}

function fmtYear(y: number): string {
  const rounded = Math.round(y);
  if (rounded < 0) return `${-rounded} BCE`;
  if (rounded === 0) return "1 CE";
  return `${rounded}`;
}

/* ---------------------------------------------------------------------------
   Piecewise era-weighted x scale for the "all" scatter mode. Ancient
   millennia get compressed so contemporary events don't crowd on top of each
   other. Weights match the reference-mockup timeline widths.
--------------------------------------------------------------------------- */
const SCALE_ERAS = [
  { start: -3500, end: -800,  weight: 12 },
  { start:  -800, end: -200,  weight: 11 },
  { start:  -200, end:  500,  weight: 10 },
  { start:   500, end: 1500,  weight: 16 },
  { start:  1500, end: 1800,  weight: 13 },
  { start:  1800, end: 1914,  weight: 11 },
  { start:  1914, end: 1991,  weight: 14 },
  { start:  1991, end: 2026,  weight: 13 },
];
const SCALE_TOTAL = SCALE_ERAS.reduce((s, e) => s + e.weight, 0);
const SCALE_CUM: number[] = (() => {
  const out: number[] = [];
  let acc = 0;
  for (const e of SCALE_ERAS) {
    out.push(acc);
    acc += (e.weight / SCALE_TOTAL) * 100;
  }
  return out;
})();
export function yearToScale(year: number): number {
  for (let i = 0; i < SCALE_ERAS.length; i++) {
    const e = SCALE_ERAS[i];
    if (year >= e.start && year <= e.end) {
      const ew = (e.weight / SCALE_TOTAL) * 100;
      return SCALE_CUM[i] + ((year - e.start) / (e.end - e.start)) * ew;
    }
  }
  return year < SCALE_ERAS[0].start ? 0 : 100;
}
export function scaleToYear(pos: number): number {
  const c = Math.min(100, Math.max(0, pos));
  for (let i = 0; i < SCALE_ERAS.length; i++) {
    const e = SCALE_ERAS[i];
    const ew = (e.weight / SCALE_TOTAL) * 100;
    const eL = SCALE_CUM[i];
    if (c >= eL && c <= eL + ew) {
      const t = ew === 0 ? 0 : (c - eL) / ew;
      return Math.round(e.start + t * (e.end - e.start));
    }
  }
  return SCALE_ERAS[SCALE_ERAS.length - 1].end;
}
const SCALE_TICK_YEARS = [
  ...SCALE_ERAS.map((e) => e.start),
  SCALE_ERAS[SCALE_ERAS.length - 1].end,
];

/**
 * Escapes HTML so summaries with `<`, `&`, etc. don't break the tooltip.
 */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Renders the tooltip HTML for a scatter point. Matches the existing hover-card
 * aesthetic: hero image + serif year overlay, mono date + category pill, title,
 * clamped summary.
 */
export function tooltipHTML(event: EventDoc, isDark: boolean): string {
  const cat = event.categories[0];
  const c = CATEGORY_COLORS[cat];
  const hero = event.images[0];
  const dateLabel = esc(formatDate(event.date));
  const yearLabel = esc(fmtYear(parseStartYear(event.date.start)));
  const title = esc(event.title);
  const summary = esc(event.summary);
  const catLabel = esc(CATEGORY_LABELS[cat]);

  // Every event has at least one image per schema (images.min(1)).
  // <img> + src/alt are whitelisted in Highcharts.AST from _highcharts-host.
  const heroBlock = `
    <div class="tsc-tooltip-hero" style="background:${c.tint}">
      <img src="${esc(hero.url)}" alt="${esc(hero.caption)}" loading="lazy" />
      <div class="tsc-tooltip-scrim"></div>
      <span class="tsc-tooltip-year">${yearLabel}</span>
    </div>`;

  const surface = isDark ? "#1A1815" : "#FBF9F3";
  const inkColor = isDark ? "#EDE7D6" : "#1A1815";
  const inkMuted = isDark ? "#8A8478" : "#6B655A";
  const ruleColor = isDark ? "#2A2622" : "#DDD7C7";

  return `
    <div class="tsc-tooltip" style="background:${surface};color:${inkColor};border-color:${ruleColor}">
      ${heroBlock}
      <div class="tsc-tooltip-body">
        <div class="tsc-tooltip-meta">
          <span class="tsc-tooltip-date" style="color:${inkMuted}">${dateLabel}</span>
          <span class="tsc-tooltip-pill" style="background:${c.tint};color:${c.deep}">${catLabel}</span>
        </div>
        <div class="tsc-tooltip-title">${title}</div>
        <p class="tsc-tooltip-summary" style="color:${inkMuted}">${summary}</p>
      </div>
    </div>`;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  "war-conflict": "War & conflict",
  "politics-empires": "Empires & politics",
  "science-technology": "Science & technology",
  "religion-ideas": "Belief & ideas",
  "art-culture": "Arts & culture",
  "economy-trade": "Economy & trade",
  exploration: "Exploration",
  "disaster-disease": "Disaster & disease",
};

/* ---------------------------------------------------------------------------
   Shared axis & chart chrome
--------------------------------------------------------------------------- */

function baseChartOptions(tokens: ThemeTokens, height: number): Highcharts.Options {
  const m = tokens.isMobile;
  // Side spacing must exceed half the label width so the leftmost / rightmost
  // labels don't clip against the container. Labels are ~100 (mobile) / ~150
  // (desktop) wide, so ~50px on mobile and ~90px on desktop cover half a
  // label plus the callout tail. Extra margin also prevents the last era
  // label ("Contemporary · 18 events") from getting cropped by the container
  // on a 375px viewport.
  const sideSpacing = m ? 55 : 90;
  return {
    chart: {
      backgroundColor: "transparent",
      style: {
        fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
        color: tokens.ink,
      },
      spacing: [12, sideSpacing, 12, sideSpacing],
      animation: { duration: 220 },
      height,
    },
    credits: { enabled: false },
    title: { text: undefined },
    subtitle: { text: undefined },
    legend: { enabled: false },
    accessibility: { enabled: false },
  } as Highcharts.Options;
}

/**
 * Shortens a title so it fits neatly inside a fixed-width callout. Word-aware,
 * uses a single-character ellipsis. Full title always remains available in the
 * hover tooltip.
 */
function truncateLabel(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.55 ? cut.slice(0, lastSpace) : cut;
  return base.trimEnd() + "…";
}

/* ---------------------------------------------------------------------------
   MODE 1 — the eras timeline
--------------------------------------------------------------------------- */

export function buildErasOptions(
  eras: EraMeta[],
  eventsByEra: Record<string, number>,
  tokens: ThemeTokens,
): Highcharts.Options {
  const m = tokens.isMobile;
  const base = baseChartOptions(tokens, m ? 440 : 460);
  // 4-lane label placement so 8 era labels never overlap on any viewport,
  // especially mobile where the ribbon is only ~340px wide.
  const farPush = m ? 60 : 90;
  return {
    ...base,
    chart: {
      ...base.chart,
      type: "timeline",
      events: {
        render: function () {
          const chart = this as unknown as {
            series: Array<{
              points: Array<{
                dataLabel?: {
                  element?: SVGGraphicsElement;
                  attr: (o: Record<string, unknown>) => void;
                  translateX?: number;
                  translateY?: number;
                  width?: number;
                  height?: number;
                  connector?: {
                    element?: SVGPathElement;
                    attr: (o: Record<string, unknown>) => void;
                  };
                };
                options: { __laneIdx?: number };
                firePointEvent: (name: string) => void;
                plotX?: number;
                plotY?: number;
              }>;
            }>;
          };

          const applyLaneShift = () => {
            if (!chart || !chart.series) return;
            for (const s of chart.series) {
              if (!s || !s.points) continue;
              for (const p of s.points) {
                const dl = p.dataLabel;
                if (!dl || !dl.element) continue;

                const laneIdx = (p.options as { __laneIdx?: number }).__laneIdx ?? 0;
                const isFar = laneIdx >= 2;
                if (!isFar) continue;

                const currentY = dl.translateY ?? 0;
                const currentX = dl.translateX ?? 0;
                const markerY = p.plotY ?? 0;
                const isBelow = currentY > markerY;
                const delta = isBelow ? farPush : -farPush;
                const newY = currentY + delta;
                dl.attr({ y: newY });
                (dl.element as SVGGraphicsElement).style.opacity = "1";
                dl.element.setAttribute("opacity", "1");

                if (dl.connector && dl.connector.element) {
                  const markerX = p.plotX ?? 0;
                  const w = dl.width ?? dl.element.getBBox().width;
                  const h = dl.height ?? dl.element.getBBox().height;
                  const relStartX = markerX - currentX;
                  const relStartY = markerY - newY;
                  const relEndX = w / 2;
                  const relEndY = isBelow ? 0 : h;
                  const path = `M ${relStartX} ${relStartY} L ${relEndX} ${relEndY}`;
                  dl.connector.attr({ d: path });
                  (dl.connector.element as SVGPathElement).style.opacity = "1";
                }
              }
            }
          };
          if (typeof window !== "undefined" && window.requestAnimationFrame) {
            window.requestAnimationFrame(applyLaneShift);
          } else {
            applyLaneShift();
          }

          // Click passthrough — label boxes are the primary click target for
          // opening an era (the ribbon dot is very small).
          for (const s of chart.series) {
            if (!s || !s.points) continue;
            for (const p of s.points) {
              const el = p.dataLabel?.element as unknown as
                | (HTMLElement & { __wired?: boolean })
                | undefined;
              if (el && !el.__wired) {
                el.style.cursor = "pointer";
                el.addEventListener("click", () => p.firePointEvent("click"));
                el.__wired = true;
              }
            }
          }
        },
      },
    },
    xAxis: {
      visible: false,
      type: "category",
    },
    yAxis: { visible: false, gridLineWidth: 0 },
    tooltip: {
      enabled: true,
      useHTML: true,
      outside: true,
      shadow: false,
      borderWidth: 0,
      backgroundColor: "transparent",
      padding: 0,
      hideDelay: 0,
      animation: false,
      followPointer: false,
      snap: 0,
      style: {
        pointerEvents: "auto",
        width: "340px",
      },
      formatter: function () {
        const p = this as unknown as { point: { name: string; description: string; color: string } };
        const surface = tokens.isDark ? "#1A1815" : "#FBF9F3";
        return `
          <div class="tsc-era-tooltip" style="background:${surface};color:${tokens.ink};border-color:${tokens.rule}">
            <div class="tsc-era-tooltip-dot" style="background:${p.point.color}"></div>
            <div class="tsc-era-tooltip-name">${esc(p.point.name ?? "")}</div>
            <p class="tsc-era-tooltip-desc" style="color:${tokens.inkMuted}">${esc(p.point.description ?? "")}</p>
            <div class="tsc-era-tooltip-cta" style="color:${tokens.accent}">Open era →</div>
          </div>`;
      },
    },
    plotOptions: {
      timeline: {
        showInLegend: false,
        colorByPoint: true,
        cursor: "pointer",
        animation: { duration: 220 },
        marker: {
          states: {
            hover: {
              animation: { duration: 0 },
              radiusPlus: 2,
              lineWidthPlus: 0,
            },
            select: { animation: { duration: 0 } },
          },
        },
        states: {
          hover: { animation: { duration: 0 }, halo: { size: 0 } },
          inactive: { animation: { duration: 0 }, opacity: 1 },
        },
        dataLabels: {
          allowOverlap: false,
          shape: "callout",
          connectorWidth: 1.5,
          connectorColor: tokens.isDark ? "#8A8478" : "#6B655A",
          crop: false,
          overflow: "allow",
          backgroundColor: tokens.surface,
          borderWidth: 1,
          borderColor: tokens.rule,
          borderRadius: 4,
          padding: m ? 6 : 10,
          // Fallback distance — the near lane. Far-lane offset is applied
          // per-point in the chart render callback.
          distance: m ? 40 : 90,
          width: m ? 100 : 180,
          useHTML: false,
          style: {
            fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
            fontWeight: "500",
            fontSize: m ? "10px" : "12.5px",
            textOutline: "none",
            color: tokens.isDark ? "#EDE7D6" : "#000",
            opacity: 1,
            wordBreak: "break-word",
          },
          format:
            '<span style="color:{point.color}">●</span> <b style="color:' + (tokens.isDark ? "#EDE7D6" : "#000") + '">{point.label}</b><br/>' +
            '<span style="color:' + (tokens.isDark ? "#EDE7D6" : "#000") + ';font-weight:400;font-size:' + (m ? "9px" : "11px") + '">{point.description}</span>',
        },
      },
    },
    series: [
      {
        type: "timeline",
        data: eras.map((era, i) => {
          const range =
            (era.startYear < 0 ? `${-era.startYear} BCE` : `${era.startYear}`) +
            " – " +
            (era.endYear < 0 ? `${-era.endYear} BCE` : `${era.endYear}`);
          const count = eventsByEra[era.id] ?? 0;
          const color = tokens.isDark
            ? ERA_PALETTE[era.id]?.dark
            : ERA_PALETTE[era.id]?.light;
          return {
            name: `${era.label}`,
            label: era.label,
            description: `${range} · ${count} event${count === 1 ? "" : "s"}`,
            color,
            eraId: era.id,
            // Rotate through 4 lanes so 8 era labels never collide
            // horizontally on any viewport (near-above / near-below / far-
            // above / far-below in ABCD alternation). Actual placement
            // happens in the chart `render` handler above.
            __laneIdx: i % 4,
          };
        }),
      },
    ],
  } as unknown as Highcharts.Options;
}

/* ---------------------------------------------------------------------------
   MODE 2 — era timeline (per-era Highcharts timeline of events)
--------------------------------------------------------------------------- */

export function buildEraTimelineOptions(
  events: EventDoc[],
  tokens: ThemeTokens,
): Highcharts.Options {
  const m = tokens.isMobile;
  // Extra height accommodates 4 label lanes (2 above ribbon + 2 below).
  const base = baseChartOptions(tokens, m ? 460 : 560);

  // 4-lane label placement so adjacent labels never overlap horizontally.
  // Timeline auto-alternates above/below; we augment that with two distances
  // per side so consecutive labels visit different rows in ABCD order.
  // On mobile the density (up to 18 events in a ~300px ribbon) forces a lot
  // of labels to hide via allowOverlap:false — tooltips still surface them.
  const laneDistances = m
    ? [40, 40, 78, 78]
    : [60, 60, 108, 108];

  // Truncate visible title so labels stay narrow. Full title is preserved in
  // the tooltip (`tooltipHTML` reads `event.title`).
  const maxTitleChars = m ? 24 : 34;

  // Push distance for the "far" lane (labels every 4th index pushed further
  // from the ribbon). The near/far distinction only matters at high density —
  // it's what stops "Death of Alexander" and "Qin unification" from touching.
  const farPushDesktop = 90;
  const farPushMobile = 55;

  const data = events.map((event, i) => {
    const cat = event.categories[0];
    const color = pickColor(cat, tokens.isDark);
    const year = parseStartYear(event.date.start);
    const shortTitle = truncateLabel(event.title, maxTitleChars);
    return {
      // `name` is what Highcharts uses in default templates + accessibility;
      // include the year so any fallback text stays informative.
      name: `${fmtYear(year)}: ${event.title}`,
      label: shortTitle,
      yearLabel: fmtYear(year),
      description: event.summary,
      color,
      slug: event.slug,
      eventIndex: i,
      __laneIdx: i % 4, // 0,1 = near; 2,3 = far (post-render sees this)
      // Per-point label distance — cycles through 4 lanes. HC's timeline
      // renderer largely ignores this at layout time (it packs into 2 rows
      // regardless), so the real per-point offset is applied post-render in
      // the chart `render` event handler below.
      dataLabels: { distance: laneDistances[i % laneDistances.length] },
    };
  });

  return {
    ...base,
    chart: {
      ...base.chart,
      type: "timeline",
      events: {
        render: function () {
          const chart = this as unknown as {
            series: Array<{
              points: Array<{
                dataLabel?: {
                  element?: SVGGraphicsElement;
                  attr: (o: Record<string, unknown>) => void;
                  translateX?: number;
                  translateY?: number;
                  connector?: {
                    element?: SVGPathElement;
                    attr: (o: Record<string, unknown>) => void;
                  };
                };
                options: { __laneIdx?: number };
                firePointEvent: (name: string) => void;
                plotX?: number;
                plotY?: number;
              }>;
            }>;
          };
          const push = m ? farPushMobile : farPushDesktop;

          // Highcharts's timeline runs its own label layout inside redraw,
          // so any positional changes we make DURING the render event get
          // undone by a subsequent layout pass. Defer the shift + connector
          // redraw to the next frame so it happens after HC's final pass.
          const applyLaneShift = () => {
            // Chart may have been destroyed between render and rAF (e.g.
            // user clicked another era). Guard against a dead reference.
            if (!chart || !chart.series) return;
            for (const s of chart.series) {
              if (!s || !s.points) continue;
              for (const p of s.points) {
                const dl = p.dataLabel as unknown as {
                  element?: SVGGraphicsElement;
                  attr: (o: Record<string, unknown>) => void;
                  translateX?: number;
                  translateY?: number;
                  width?: number;
                  height?: number;
                  connector?: {
                    element?: SVGPathElement;
                    attr: (o: Record<string, unknown>) => void;
                  };
                } | undefined;
                if (!dl || !dl.element) continue;

                const laneIdx = (p.options as { __laneIdx?: number }).__laneIdx ?? 0;
                const isFar = laneIdx >= 2;
                if (!isFar) continue;

                const currentY = dl.translateY ?? 0;
                const currentX = dl.translateX ?? 0;
                const markerY = p.plotY ?? 0;
                const isBelow = currentY > markerY;
                const delta = isBelow ? push : -push;
                const newY = currentY + delta;
                dl.attr({ y: newY });
                // Force the label group to be visible in case HC marked it
                // hidden during its own collision pass.
                (dl.element as SVGGraphicsElement).style.opacity = "1";
                dl.element.setAttribute("opacity", "1");

                // Redraw connector so it reaches the near edge of the
                // newly-positioned label box, keeping every point visibly
                // tied back to its marker on the ribbon. The connector's
                // parent <g> is translated by (translateX, translateY), so
                // path coordinates must be expressed relative to that group,
                // not in absolute chart space.
                if (dl.connector && dl.connector.element) {
                  const markerX = p.plotX ?? 0;
                  const w = dl.width ?? dl.element.getBBox().width;
                  const h = dl.height ?? dl.element.getBBox().height;
                  // Relative coordinates: subtract the group's translate.
                  const relStartX = markerX - currentX;
                  const relStartY = markerY - newY;
                  const relEndX = w / 2;
                  const relEndY = isBelow ? 0 : h;
                  const path = `M ${relStartX} ${relStartY} L ${relEndX} ${relEndY}`;
                  dl.connector.attr({ d: path });
                  // Highcharts sets opacity:0 on connectors it thinks are
                  // "hidden" (its own alignment heuristic disagrees with our
                  // manual placement). Force it visible since we've placed
                  // the label ourselves and want the connector to show.
                  (dl.connector.element as SVGPathElement).style.opacity = "1";
                }
              }
            }
          };
          // rAF ensures we run *after* Highcharts's own post-render layout,
          // which would otherwise re-place labels in the default 2 rows.
          if (typeof window !== "undefined" && window.requestAnimationFrame) {
            window.requestAnimationFrame(applyLaneShift);
          } else {
            applyLaneShift();
          }

          // Click passthrough (this part can run synchronously — HC doesn't
          // touch the listeners).
          for (const s of chart.series) {
            for (const p of s.points) {
              const clickEl = p.dataLabel?.element as unknown as
                | (HTMLElement & { __wired?: boolean })
                | undefined;
              if (clickEl && !clickEl.__wired) {
                clickEl.style.cursor = "pointer";
                clickEl.addEventListener("click", () => p.firePointEvent("click"));
                clickEl.__wired = true;
              }
            }
          }
        },
      },
    },
    xAxis: { visible: false, type: "category" },
    yAxis: { visible: false, gridLineWidth: 0 },
    tooltip: {
      enabled: true,
      useHTML: true,
      outside: true,
      shadow: false,
      borderWidth: 0,
      backgroundColor: "transparent",
      padding: 0,
      hideDelay: 0,
      animation: false,
      followPointer: false,
      snap: 0,
      style: { pointerEvents: "auto", width: "340px" },
      formatter: function () {
        const p = (this as unknown as { point: { eventIndex: number } }).point;
        const event = events[p.eventIndex];
        if (!event) return "";
        return tooltipHTML(event, tokens.isDark);
      },
    },
    plotOptions: {
      timeline: {
        showInLegend: false,
        colorByPoint: true,
        cursor: "pointer",
        animation: { duration: 320 },
        marker: {
          states: {
            hover: { animation: { duration: 0 }, radiusPlus: 2, lineWidthPlus: 0 },
            select: { animation: { duration: 0 } },
          },
        },
        states: {
          hover: { animation: { duration: 0 }, halo: { size: 0 } },
          inactive: { animation: { duration: 0 }, opacity: 1 },
        },
        dataLabels: {
          allowOverlap: false,
          shape: "callout",
          connectorWidth: 1.5,
          connectorColor: tokens.isDark ? "#8A8478" : "#6B655A",
          crop: false,
          overflow: "allow",
          backgroundColor: tokens.surface,
          borderWidth: 1,
          borderColor: tokens.rule,
          borderRadius: 4,
          padding: m ? 6 : 9,
          // Fallback distance so any label that somehow doesn't get the
          // per-point override still gets a visible connector line.
          distance: m ? 40 : 60,
          width: m ? 120 : 150,
          useHTML: false,
          style: {
            fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
            fontWeight: "500",
            fontSize: m ? "10.5px" : "12px",
            textOutline: "none",
            color: tokens.isDark ? "#EDE7D6" : "#000",
            opacity: 1,
            // Prevent an overly-long single word blowing out the width — long
            // titles are already truncated but hyphens still need wrapping.
            wordBreak: "break-word",
          },
          format:
            '<span style="color:{point.color}">●</span> <b style="color:' + (tokens.isDark ? "#EDE7D6" : "#000") + '">{point.label}</b><br/>' +
            '<span style="color:' + (tokens.isDark ? "#EDE7D6" : "#000") + ';font-weight:400;font-size:' + (m ? "9.5px" : "10.5px") + '">{point.yearLabel}</span>',
        },
      },
    },
    series: [{ type: "timeline", data }],
  } as unknown as Highcharts.Options;
}

/* ---------------------------------------------------------------------------
   MODE 3 — scatter (all events across full time range)
--------------------------------------------------------------------------- */

export interface ScatterPointExtras {
  slug: string;
  eventIndex: number;
}

export function buildScatterOptions(
  events: EventDoc[],
  tokens: ThemeTokens,
  opts: {
    xMin: number;
    xMax: number;
    zoomable: boolean;
    activeCat: Category | null;
    height: number;
    piecewise?: boolean; // "all" mode: era-weighted x scale
  },
): Highcharts.Options {
  const base = baseChartOptions(tokens, opts.height);
  const piecewise = !!opts.piecewise;

  // Data with jittered Y lanes and per-point colours.
  const data = events.map((event, i) => {
    const cat = event.categories[0];
    const color = pickColor(cat, tokens.isDark);
    const year = parseStartYear(event.date.start);
    const lane = (i % 3) + 1; // 1..3
    const dimmed = opts.activeCat != null && !event.categories.includes(opts.activeCat);
    return {
      x: piecewise ? yearToScale(year) : year,
      y: lane,
      color,
      marker: {
        radius: markerRadius(event.significance),
        fillColor: color,
        lineColor: tokens.bg,
        lineWidth: 2,
        states: {
          hover: {
            radius: markerRadius(event.significance, true),
            lineWidth: 3,
            lineColor: tokens.bg,
          },
        },
      },
      opacity: dimmed ? 0.12 : 1,
      // custom fields the tooltip formatter + click handler read
      slug: event.slug,
      eventIndex: i,
      dimmed,
    };
  });

  return {
    ...base,
    chart: {
      ...base.chart,
      type: "scatter",
      ...(opts.zoomable
        ? {
            zooming: { type: "x" as const, singleTouch: true },
            panning: { enabled: true, type: "x" as const },
            panKey: "shift" as const,
          }
        : {}),
      resetZoomButton: {
        theme: { style: { display: "none" } },
      },
    },
    xAxis: piecewise
      ? {
          min: 0,
          max: 100,
          type: "linear",
          gridLineWidth: 0,
          lineColor: tokens.rule,
          lineWidth: 1,
          tickColor: tokens.rule,
          tickWidth: 1,
          tickLength: 6,
          tickPositions: SCALE_TICK_YEARS.map((y) => yearToScale(y)),
          labels: {
            style: {
              fontFamily: 'var(--font-mono), ui-monospace, monospace',
              fontSize: "10.5px",
              color: tokens.inkMuted,
            },
            formatter: function () {
              const v = Number((this as unknown as { value: number }).value);
              return fmtYear(scaleToYear(v));
            },
          },
        }
      : {
          min: opts.xMin,
          max: opts.xMax,
          type: "linear",
          gridLineWidth: 0,
          lineColor: tokens.rule,
          lineWidth: 1,
          tickColor: tokens.rule,
          tickWidth: 1,
          tickLength: 6,
          tickPixelInterval: 100,
          labels: {
            style: {
              fontFamily: 'var(--font-mono), ui-monospace, monospace',
              fontSize: "10.5px",
              color: tokens.inkMuted,
            },
            formatter: function () {
              const v = Number((this as unknown as { value: number }).value);
              return fmtYear(v);
            },
          },
        },
    yAxis: {
      min: 0,
      max: 4,
      visible: false,
      gridLineWidth: 0,
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      shadow: false,
      borderWidth: 0,
      backgroundColor: "transparent",
      padding: 0,
      hideDelay: 0,
      animation: false,
      followPointer: false,
      snap: 0,
      outside: true,
      formatter: function () {
        const p = (this as unknown as { point: { eventIndex: number } }).point;
        const event = events[p.eventIndex];
        if (!event) return "";
        return tooltipHTML(event, tokens.isDark);
      },
    },
    plotOptions: {
      scatter: {
        cursor: "pointer",
        stickyTracking: false,
        animation: false,
        marker: {
          symbol: "circle",
          states: {
            hover: {
              animation: { duration: 0 },
              lineWidthPlus: 0,
              radiusPlus: 0,
            },
            select: { animation: { duration: 0 } },
          },
        },
        states: {
          inactive: { opacity: 1, animation: { duration: 0 } },
          hover: { animation: { duration: 0 }, halo: { size: 0 } },
        },
      },
      series: {
        animation: false,
        states: {
          hover: { animation: { duration: 0 } },
          inactive: { animation: { duration: 0 } },
        },
      },
    },
    series: [
      {
        type: "scatter",
        name: "Events",
        data,
        // click routed by outer component via chart.options.plotOptions.series.point.events
      },
    ],
  } as Highcharts.Options;
}
