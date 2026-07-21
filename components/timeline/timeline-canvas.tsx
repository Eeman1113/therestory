"use client";

/**
 * TimelineCanvas — three-mode interactive hero timeline built on Highcharts.
 *
 *   mode 1: "eras"        — vertical/horizontal era timeline (Highcharts timeline)
 *   mode 2: "era-scatter" — scatter of the events within a selected era
 *   mode 3: "all-scatter" — scatter of all 90 events across 3500 BCE → 2026
 *
 * Highcharts is loaded lazily on the client only (no SSR); the rest of the page
 * (headers, chips, "you are here" panel) stays in this component so the layout
 * and typography match the site's zen/paper aesthetic.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowLeft, Minus, Plus, RotateCcw } from "lucide-react";
import type { Category, CategoryMeta, EraMeta, EventDoc } from "@/lib/content/schema";
import { cn } from "@/lib/utils";
import { parseStartYear } from "@/lib/timeline/scale";
import { CATEGORY_COLORS } from "@/lib/timeline/categories";
import {
  buildEraTimelineOptions,
  buildErasOptions,
  buildScatterOptions,
  type ThemeTokens,
} from "@/lib/timeline/highcharts-config";
import type Highcharts from "highcharts";

/* ---------------------------------------------------------------------------
   Lazy Highcharts loader — SSR-safe. Because Highcharts touches `window` at
   import time, we import both the library and the react wrapper on the client
   only, then render inside a dynamically-loaded component.
--------------------------------------------------------------------------- */

const ChartHost = dynamic(() => import("./_highcharts-host").then((m) => m.HighchartsHost), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-xl border border-rule bg-surface/40 text-ink-muted"
      style={{ height: 380 }}
    >
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase">Loading timeline…</span>
    </div>
  ),
});

/* ---------------------------------------------------------------------------
   Types & helpers
--------------------------------------------------------------------------- */

type ViewMode = "eras" | "era-scatter" | "all-scatter";

interface Props {
  events: EventDoc[];
  categories: CategoryMeta[];
  eras?: EraMeta[];
  initialYear?: number;
}

/** Fallback eras when the caller doesn't inject content/eras.json. */
const FALLBACK_ERAS: EraMeta[] = [
  { id: "prehistory",     label: "Prehistory",        startYear: -3500, endYear: -800, description: "From the invention of writing to the Bronze Age Collapse." },
  { id: "ancient",        label: "Ancient",           startYear:  -800, endYear:  500, description: "Persia, Greece, Rome, Han, Maurya — the age of literate empires." },
  { id: "classical",      label: "Classical",         startYear:   500, endYear: 1000, description: "Islam rises, Tang & Song China, Byzantium, the Maya." },
  { id: "post-classical", label: "Post-classical",    startYear:  1000, endYear: 1500, description: "Mongol steppe, caliphates, High Middle Ages, Mali, Aztec, Inca." },
  { id: "early-modern",   label: "Early Modern",      startYear:  1500, endYear: 1800, description: "Global exchange, gunpowder empires, scientific revolution." },
  { id: "long-19th",      label: "Long 19th Century", startYear:  1800, endYear: 1914, description: "Industry, nationalism, empire, revolution." },
  { id: "20th-century",   label: "20th Century",      startYear:  1914, endYear: 1991, description: "World wars, decolonisation, Cold War, space flight." },
  { id: "contemporary",   label: "Contemporary",      startYear:  1991, endYear: 2026, description: "Internet age, globalisation, climate change." },
];

function fmtYear(y: number): string {
  const rounded = Math.round(y);
  if (rounded < 0) return `${-rounded} BCE`;
  if (rounded === 0) return "1 CE";
  return `${rounded}`;
}

function eraLabelFor(y: number, eras: EraMeta[]): string {
  const era =
    eras.find((e) => y >= e.startYear && y < e.endYear) ??
    eras[eras.length - 1];
  return era.label;
}

function useThemeTokens(): ThemeTokens {
  const { resolvedTheme } = useTheme();
  const [tokens, setTokens] = useState<ThemeTokens>(() => defaultTokens(false));

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Wait for the class swap that next-themes performs.
    const compute = () => {
      const isDark =
        (resolvedTheme ?? "").toLowerCase() === "dark" ||
        document.documentElement.classList.contains("dark");
      setTokens(defaultTokens(isDark));
    };
    compute();
    // If the theme changes at runtime, recompute after the class swap.
    const obs = new MutationObserver(compute);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [resolvedTheme]);

  return tokens;
}

function defaultTokens(isDark: boolean): ThemeTokens {
  return isDark
    ? {
        ink: "#EDE7D6",
        inkMuted: "#8A8478",
        rule: "#2A2622",
        bg: "#12110F",
        surface: "#1A1815",
        accent: "#8CB1E8",
        isDark: true,
      }
    : {
        ink: "#1A1815",
        inkMuted: "#6B655A",
        rule: "#DDD7C7",
        bg: "#F6F3EC",
        surface: "#FBF9F3",
        accent: "#2A487A",
        isDark: false,
      };
}

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */

export function TimelineCanvas({
  events,
  categories,
  eras = FALLBACK_ERAS,
  initialYear = 2026,
}: Props) {
  const router = useRouter();
  const tokens = useThemeTokens();

  const [mode, setMode] = useState<ViewMode>("eras");
  const [selectedEra, setSelectedEra] = useState<EraMeta | null>(null);
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [containerOpacity, setContainerOpacity] = useState(1);
  const chartRef = useRef<Highcharts.Chart | null>(null);

  /* --- filtered event pool (respects activeCat) --- */
  const filteredEvents = useMemo(() => {
    if (!activeCat) return events;
    return events.filter((e) => e.categories.includes(activeCat));
  }, [events, activeCat]);

  /* --- events grouped by era id (using content-side event.era, not year window) --- */
  const eventsByEra = useMemo(() => {
    const out: Record<string, number> = {};
    for (const era of eras) out[era.id] = 0;
    for (const e of filteredEvents) {
      out[e.era] = (out[e.era] ?? 0) + 1;
    }
    return out;
  }, [filteredEvents, eras]);

  /* --- events for the current scatter view --- */
  const scatterEvents = useMemo(() => {
    if (mode === "era-scatter" && selectedEra) {
      const evts = filteredEvents.filter((e) => e.era === selectedEra.id);
      return [...evts].sort(
        (a, b) => parseStartYear(a.date.start) - parseStartYear(b.date.start),
      );
    }
    if (mode === "all-scatter") {
      return [...filteredEvents].sort(
        (a, b) => parseStartYear(a.date.start) - parseStartYear(b.date.start),
      );
    }
    return [];
  }, [filteredEvents, mode, selectedEra]);

  /* --- x-axis range per mode --- */
  const [xMin, xMax] = useMemo(() => {
    if (mode === "era-scatter" && selectedEra) {
      return [selectedEra.startYear, selectedEra.endYear];
    }
    return [-3500, 2026];
  }, [mode, selectedEra]);

  /* --- header year + era label --- */
  const headerYear =
    hoverYear ??
    (mode === "eras"
      ? initialYear
      : selectedEra
        ? Math.round((selectedEra.startYear + selectedEra.endYear) / 2)
        : initialYear);
  const headerEraLabel =
    mode === "eras"
      ? "3500 BCE – 2026"
      : selectedEra
        ? `${fmtYear(selectedEra.startYear)} – ${fmtYear(selectedEra.endYear)}`
        : eraLabelFor(headerYear, eras);

  /* --- mode-switch animations (fade the chart container in/out) --- */
  const switchMode = useCallback((next: () => void) => {
    setContainerOpacity(0);
    setHoverYear(null);
    window.setTimeout(() => {
      next();
      // Give the new chart a tick to mount, then fade back in.
      requestAnimationFrame(() => setContainerOpacity(1));
    }, 240);
  }, []);

  const goToErasView = useCallback(() => {
    switchMode(() => {
      setMode("eras");
      setSelectedEra(null);
    });
  }, [switchMode]);

  const goToAllScatter = useCallback(() => {
    switchMode(() => {
      setMode("all-scatter");
      setSelectedEra(null);
    });
  }, [switchMode]);

  const goToEraScatter = useCallback(
    (eraId: string) => {
      const era = eras.find((e) => e.id === eraId);
      if (!era) return;
      switchMode(() => {
        setMode("era-scatter");
        setSelectedEra(era);
      });
    },
    [eras, switchMode],
  );

  /* --- Highcharts options per mode --- */
  const options = useMemo<Highcharts.Options>(() => {
    if (mode === "eras") {
      const opts = buildErasOptions(eras, eventsByEra, tokens);
      // Attach point click handler for era → era-scatter transition.
      opts.plotOptions = {
        ...opts.plotOptions,
        timeline: {
          ...opts.plotOptions?.timeline,
          point: {
            events: {
              click: function () {
                const p = this as unknown as { options: { eraId?: string } };
                const id = p.options.eraId;
                if (id) goToEraScatter(id);
              },
            },
          },
        },
      };
      return opts;
    }
    if (mode === "era-scatter") {
      const opts = buildEraTimelineOptions(scatterEvents, tokens);
      opts.plotOptions = {
        ...opts.plotOptions,
        timeline: {
          ...opts.plotOptions?.timeline,
          point: {
            events: {
              click: function () {
                const p = this as unknown as { options: { slug?: string } };
                const slug = p.options.slug;
                if (slug) router.push(`/event/${slug}`);
              },
            },
          },
        },
      };
      return opts;
    }
    // all-scatter mode
    const opts = buildScatterOptions(scatterEvents, tokens, {
      xMin,
      xMax,
      zoomable: true,
      activeCat,
      height: 360,
      piecewise: true,
    });
    // Wire click + hover on scatter points via plotOptions.series
    opts.plotOptions = {
      ...opts.plotOptions,
      series: {
        ...opts.plotOptions?.series,
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              const p = this as unknown as { options: { slug?: string } };
              const slug = p.options.slug;
              if (slug) router.push(`/event/${slug}`);
            },
            mouseOver: function () {
              const p = this as unknown as { x: number };
              setHoverYear(Math.round(p.x));
            },
            mouseOut: function () {
              setHoverYear(null);
            },
          },
        },
      },
    };
    return opts;
  }, [
    mode,
    eras,
    eventsByEra,
    tokens,
    scatterEvents,
    xMin,
    xMax,
    activeCat,
    router,
    goToEraScatter,
  ]);

  /* --- zoom controls (all-scatter only) --- */
  const zoomAxis = useCallback((factor: number) => {
    const chart = chartRef.current;
    if (!chart) return;
    const axis = chart.xAxis[0];
    const extremes = axis.getExtremes();
    const cur = { min: extremes.min ?? extremes.dataMin, max: extremes.max ?? extremes.dataMax };
    const width = cur.max - cur.min;
    const mid = (cur.min + cur.max) / 2;
    const newWidth = Math.max(50, width / factor);
    let newMin = mid - newWidth / 2;
    let newMax = mid + newWidth / 2;
    const dataMin = extremes.dataMin;
    const dataMax = extremes.dataMax;
    if (newMin < dataMin) {
      newMax += dataMin - newMin;
      newMin = dataMin;
    }
    if (newMax > dataMax) {
      newMin -= newMax - dataMax;
      newMax = dataMax;
    }
    axis.setExtremes(newMin, newMax, true, true);
  }, []);

  const resetZoom = useCallback(() => {
    chartRef.current?.zoomOut();
  }, []);

  const visibleCount =
    mode === "eras"
      ? Object.values(eventsByEra).reduce((a, b) => a + b, 0)
      : scatterEvents.length;
  const totalCount = events.length;

  return (
    <section className="not-prose relative">
      {/* Header row — "You are here" */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-ink-muted">
            You are here
          </p>
          <div className="mt-2 flex items-baseline gap-4">
            <h2 className="font-serif text-[56px] italic leading-[0.88] tracking-[-0.015em] text-ink sm:text-[78px]">
              {mode === "eras" ? "everywhen" : fmtYear(headerYear)}
            </h2>
            <span className="inline-block rounded-full border border-rule/80 bg-surface/50 px-3 py-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-ink-muted">
              {headerEraLabel}
            </span>
          </div>
        </div>

        {/* Zoom controls only in all-scatter mode */}
        {mode === "all-scatter" && (
          <div className="flex gap-1.5">
            <ZoomButton onClick={() => zoomAxis(1 / 1.5)} label="Zoom out">
              <Minus size={14} strokeWidth={1.5} />
            </ZoomButton>
            <ZoomButton onClick={() => zoomAxis(1.5)} label="Zoom in">
              <Plus size={14} strokeWidth={1.5} />
            </ZoomButton>
            <ZoomButton onClick={resetZoom} label="Reset view">
              <RotateCcw size={14} strokeWidth={1.5} />
            </ZoomButton>
          </div>
        )}
      </div>

      {/* Above-chart nav: back button + all-eras chip */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-h-[28px]">
          {mode !== "eras" && (
            <button
              type="button"
              onClick={goToErasView}
              className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              <span>Back to eras</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mode === "eras" && (
            <button
              type="button"
              onClick={goToAllScatter}
              className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3.5 py-[7px] text-[12.5px] font-medium text-ink shadow-[0_1px_3px_rgb(28_27_24_/_0.06)] transition-colors hover:border-accent hover:text-accent"
            >
              <span
                className="inline-block h-[7px] w-[7px] rounded-full"
                style={{ background: tokens.accent }}
                aria-hidden
              />
              All eras of everything
            </button>
          )}
          {mode === "era-scatter" && (
            <button
              type="button"
              onClick={goToAllScatter}
              className="inline-flex items-center gap-2 rounded-full border border-rule/70 px-3.5 py-[7px] text-[12.5px] font-medium text-ink-muted transition-colors hover:border-rule hover:text-ink"
            >
              See all eras
            </button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <FilterChip
          active={activeCat == null}
          onClick={() => setActiveCat(null)}
          label="All"
        />
        {categories.map((cat) => {
          const c = CATEGORY_COLORS[cat.id];
          return (
            <FilterChip
              key={cat.id}
              active={activeCat === cat.id}
              onClick={() =>
                setActiveCat((prev) => (prev === cat.id ? null : cat.id))
              }
              label={cat.label}
              swatch={tokens.isDark ? c.dark : c.light}
            />
          );
        })}
      </div>

      {/* Chart container */}
      <div
        className="relative border-y border-rule"
        style={{
          transition: "opacity 240ms ease",
          opacity: containerOpacity,
        }}
      >
        <ChartHost
          key={`${mode}-${selectedEra?.id ?? ""}`}
          options={options}
          onChartMounted={(c) => {
            chartRef.current = c;
          }}
        />
      </div>

      {/* Hints */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-muted">
        {mode === "eras" && (
          <span>Click an era dot to zoom in. Click <em>All eras of everything</em> to see every event at once.</span>
        )}
        {mode === "era-scatter" && (
          <span>Click a dot to open the event. Use <em>Back to eras</em> to zoom back out.</span>
        )}
        {mode === "all-scatter" && (
          <span>Drag on the chart to zoom. Shift + drag to pan. Click a dot to open.</span>
        )}
        <span className="ml-auto font-mono text-[11px] tracking-wider text-ink-muted/70">
          showing {visibleCount} of {totalCount} events
        </span>
      </div>

      {/* Tooltip + chart styling. Highcharts tooltips are absolutely positioned
          overlays; these styles ensure they match the site's hover card look. */}
      <style jsx global>{`
        .highcharts-container {
          font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif !important;
        }
        .highcharts-tooltip > span,
        .highcharts-tooltip-container {
          z-index: 999;
        }
        .highcharts-tooltip {
          filter: none !important;
        }

        /* Scatter event tooltip */
        .tsc-tooltip {
          width: 300px;
          border-radius: 16px;
          border: 1px solid;
          overflow: hidden;
          box-shadow:
            0 14px 34px rgb(0 0 0 / 0.09),
            0 2px 6px rgb(0 0 0 / 0.05);
          font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
        }
        .tsc-tooltip-hero {
          position: relative;
          height: 132px;
          overflow: hidden;
        }
        .tsc-tooltip-hero img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          /* Hide alt-text + broken icon on failed loads so the tinted
             background + serif year overlay carry the space cleanly. */
          color: transparent;
          font-size: 0;
          text-indent: -9999px;
        }
        .tsc-tooltip-hero--empty {
          height: 52px;
        }
        .tsc-tooltip-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgb(0 0 0 / 0.35) 0%, transparent 55%);
          pointer-events: none;
        }
        .tsc-tooltip-year {
          position: absolute;
          right: 12px;
          bottom: 6px;
          font-family: var(--font-serif), ui-serif, Georgia, serif;
          font-style: italic;
          font-size: 44px;
          line-height: 1;
          letter-spacing: -0.02em;
          color: rgb(255 255 255 / 0.9);
          text-shadow: 0 2px 12px rgb(0 0 0 / 0.45);
          pointer-events: none;
        }
        .tsc-tooltip-year--empty {
          right: 12px;
          bottom: -24px;
          font-size: 76px;
          opacity: 0.28;
          color: inherit;
          text-shadow: none;
        }
        .tsc-tooltip-body {
          padding: 12px 16px 16px;
        }
        .tsc-tooltip-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tsc-tooltip-date {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-variant-numeric: tabular-nums;
          font-size: 12px;
          line-height: 1;
        }
        .tsc-tooltip-pill {
          border-radius: 999px;
          padding: 3px 10px;
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .tsc-tooltip-title {
          margin-top: 8px;
          font-size: 15.5px;
          font-weight: 600;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }
        .tsc-tooltip-summary {
          margin: 4px 0 0;
          font-size: 12.8px;
          line-height: 1.58;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Era timeline tooltip */
        .tsc-era-tooltip {
          width: 320px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid;
          box-shadow:
            0 10px 28px rgb(0 0 0 / 0.08),
            0 2px 6px rgb(0 0 0 / 0.04);
          font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
          white-space: normal;
          overflow: visible;
        }
        .tsc-era-tooltip-desc {
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
        }
        .tsc-era-tooltip-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          margin-bottom: 8px;
        }
        .tsc-era-tooltip-name {
          font-size: 14.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .tsc-era-tooltip-desc {
          margin: 6px 0 10px;
          font-size: 12.5px;
          line-height: 1.55;
        }
        .tsc-era-tooltip-cta {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        /* Era timeline data labels */
        .tsc-era-label {
          text-align: center;
          padding: 0 4px;
        }
        .tsc-era-label-title {
          font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: -0.005em;
          color: var(--ink);
        }
        .tsc-era-label-desc {
          margin-top: 3px;
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 10px;
          color: var(--ink-muted);
          letter-spacing: 0.02em;
          max-width: 160px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Hide default Highcharts credits/branding just in case */
        .highcharts-credits { display: none !important; }
      `}</style>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Bits
--------------------------------------------------------------------------- */

function ZoomButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] border border-rule/80 text-ink-muted transition-colors",
        "h-11 w-11 sm:h-[34px] sm:w-[34px]",
        "hover:bg-surface hover:border-rule hover:text-ink",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  swatch,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  swatch?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-[7px] text-[12.5px] font-medium transition-colors",
        active
          ? "border-rule bg-surface text-ink shadow-[0_1px_3px_rgb(28_27_24_/_0.06)]"
          : "border-rule/70 bg-transparent text-ink-muted hover:border-rule hover:text-ink",
      )}
    >
      <span
        className="inline-block h-[7px] w-[7px] rounded-full"
        style={{ background: swatch ?? "var(--rule)" }}
        aria-hidden
      />
      {label}
    </button>
  );
}
