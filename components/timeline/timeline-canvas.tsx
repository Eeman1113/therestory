"use client";

/**
 * TimelineCanvas — the full-page interactive timeline (homepage hero).
 *
 * Layout inside the canvas (top to bottom):
 *   0..24px    Era band strip
 *   24..64px   Year ticks
 *   64..~end   Marker plane with stacked category-colored dots
 *
 * Interactions:
 *   - drag body        → pan
 *   - wheel            → zoom around cursor (with ctrl/meta or over ruler)
 *   - + / -            → zoom (keyboard)
 *   - arrow left/right → focus previous / next marker (auto-scrolls in view)
 *   - Home / End       → focus first / last marker
 *   - Enter            → open focused marker
 *   - hover a marker   → shows preview card with title, date, category, summary
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { EventDoc } from "@/lib/content/schema";
import { cn } from "@/lib/utils";
import { MonoDate } from "@/components/common/mono-date";
import { MicroCaps } from "@/components/common/micro-caps";
import { SafeImage } from "@/components/common/safe-image";
import {
  generateTicks,
  parseStartYear,
  yearToPosition,
  positionToYear,
  MIN_YEAR,
  MAX_YEAR,
} from "@/lib/timeline/scale";
import { minSignificanceFor } from "@/lib/timeline/density";
import { markerColor, markerRadius } from "@/lib/timeline/categories";
import { useTimelineView } from "./timeline-view";

const CANVAS_HEIGHT = 420;
const ERA_BAND_H = 24;
const RULER_H = 40;
const MARKER_TOP = ERA_BAND_H + RULER_H;
const AXIS_Y = 170;      // vertical position of the main horizontal backbone inside the marker plane
const TRACK_H = 22;      // vertical distance between stacked-track slots away from the axis

const ERAS = [
  { key: "prehistory", label: "Prehistory", start: -3500, end: -800 },
  { key: "ancient", label: "Ancient", start: -800, end: 500 },
  { key: "classical", label: "Classical", start: 500, end: 1000 },
  { key: "post-classical", label: "Post-classical", start: 1000, end: 1500 },
  { key: "early-modern", label: "Early Modern", start: 1500, end: 1800 },
  { key: "long-19th", label: "Long 19th c.", start: 1800, end: 1914 },
  { key: "20th-century", label: "20th Century", start: 1914, end: 1991 },
  { key: "contemporary", label: "Contemporary", start: 1991, end: 2026 },
];

function eraOf(year: number): string {
  const era = ERAS.find((e) => year >= e.start && year < e.end) ?? ERAS[ERAS.length - 1];
  return era.label;
}

function formatYearShort(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  if (year === 0) return "1 CE";
  return `${year}`;
}

/** Greedy multi-track marker layout: each marker gets the lowest track where
 *  it does not overlap the previous marker on that track. */
function layoutTracks(
  markers: Array<{ id: string; xPx: number }>,
  minGapPx: number,
): Map<string, number> {
  const tracks: number[] = []; // stores last-used rightEdge px per track
  const assignment = new Map<string, number>();
  const sorted = [...markers].sort((a, b) => a.xPx - b.xPx);
  for (const m of sorted) {
    let placed = false;
    for (let i = 0; i < tracks.length; i++) {
      if (m.xPx - tracks[i] >= minGapPx) {
        tracks[i] = m.xPx;
        assignment.set(m.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      tracks.push(m.xPx);
      assignment.set(m.id, tracks.length - 1);
    }
  }
  return assignment;
}

interface Props {
  events: EventDoc[];
}

export function TimelineCanvas({ events }: Props) {
  const {
    viewStart,
    viewEnd,
    focusedEventId,
    setView,
    zoomAt,
    resetView,
    setFocusedEvent,
  } = useTimelineView();
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startView: [number, number] } | null>(null);
  const pointerMoved = useRef(false);

  /* --- observe container size ------------------------------------------ */
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observe = () => {
      const w = el.getBoundingClientRect().width;
      // Never regress to 0 — an intermittent 0 (during hydration or transitions)
      // would collapse every marker onto the same track. Wait for a real width.
      if (w > 0) setWidth(w);
    };
    observe();
    const ro = new ResizeObserver(observe);
    ro.observe(el);
    // Belt-and-braces: recheck after the first paint in case layout was
    // pending when useLayoutEffect first ran.
    const raf = requestAnimationFrame(observe);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  /* --- derive per-render positions ------------------------------------- */
  const viewWidth = viewEnd - viewStart;
  const minSig = minSignificanceFor(viewWidth);

  /** Convert a normalized 0..1 timeline position to pixel X inside the canvas. */
  const posToPx = useCallback(
    (pos: number) => ((pos - viewStart) / viewWidth) * width,
    [viewStart, viewWidth, width],
  );

  const visibleEvents = useMemo(() => {
    return events
      .map((e) => {
        const y = parseStartYear(e.date.start);
        const pos = yearToPosition(y);
        return { event: e, year: y, pos, xPx: posToPx(pos) };
      })
      .filter(
        (m) =>
          m.event.significance >= minSig &&
          m.xPx >= -40 &&
          m.xPx <= width + 40,
      );
  }, [events, minSig, posToPx, width]);

  const trackFor = useMemo(
    () => layoutTracks(visibleEvents.map((m) => ({ id: m.event.id, xPx: m.xPx })), 36),
    [visibleEvents],
  );

  const ticks = useMemo(
    () => generateTicks(width, viewStart, viewEnd, 56),
    [width, viewStart, viewEnd],
  );

  const eraBands = useMemo(
    () =>
      ERAS.map((era) => {
        const left = posToPx(yearToPosition(era.start));
        const right = posToPx(yearToPosition(era.end));
        return { ...era, left, width: right - left };
      }).filter((b) => b.left + b.width > 0 && b.left < width),
    [posToPx, width],
  );

  const centeredYear = positionToYear((viewStart + viewEnd) / 2);

  /* --- pointer drag → pan ---------------------------------------------- */
  const onPointerDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("[data-marker]")) return;
      dragRef.current = {
        startX: e.clientX,
        startView: [viewStart, viewEnd],
      };
      pointerMoved.current = false;
      (e.currentTarget as HTMLElement).setPointerCapture?.((e as unknown as PointerEvent).pointerId);
    },
    [viewStart, viewEnd],
  );

  const onPointerMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || width === 0) return;
      const dx = e.clientX - drag.startX;
      if (Math.abs(dx) > 3) pointerMoved.current = true;
      const [s0, e0] = drag.startView;
      const w = e0 - s0;
      const delta = -(dx / width) * w;
      setView(s0 + delta, e0 + delta);
    },
    [setView, width],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  /* --- wheel → zoom (anchored at cursor) ------------------------------- */
  const onWheel = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el || width === 0) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cursorFrac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const anchorPos = viewStart + cursorFrac * viewWidth;
      // Trackpad pinch emits ctrlKey with small deltaY; wheel spins are larger.
      const intensity = e.ctrlKey || e.metaKey ? 0.02 : 0.0015;
      const factor = Math.exp(e.deltaY * intensity);
      zoomAt(anchorPos, factor);
    },
    [viewStart, viewWidth, width, zoomAt],
  );

  /* --- keyboard --------------------------------------------------------- */
  const eventsByYear = useMemo(
    () =>
      [...events].sort(
        (a, b) => parseStartYear(a.date.start) - parseStartYear(b.date.start),
      ),
    [events],
  );

  const focusMarker = useCallback(
    (id: string) => {
      setFocusedEvent(id);
      const target = events.find((e) => e.id === id);
      if (!target) return;
      const pos = yearToPosition(parseStartYear(target.date.start));
      if (pos < viewStart + 0.03 || pos > viewEnd - 0.03) {
        const width = viewWidth;
        setView(pos - width / 2, pos + width / 2);
      }
    },
    [events, setFocusedEvent, setView, viewStart, viewEnd, viewWidth],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      const currentIndex = focusedEventId
        ? eventsByYear.findIndex((x) => x.id === focusedEventId)
        : -1;

      switch (e.key) {
        case "ArrowRight": {
          e.preventDefault();
          const next = eventsByYear[Math.min(eventsByYear.length - 1, currentIndex + 1)];
          if (next) focusMarker(next.id);
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const prev = eventsByYear[Math.max(0, currentIndex - 1)];
          if (prev) focusMarker(prev.id);
          break;
        }
        case "Home": {
          e.preventDefault();
          if (eventsByYear[0]) focusMarker(eventsByYear[0].id);
          break;
        }
        case "End": {
          e.preventDefault();
          const last = eventsByYear[eventsByYear.length - 1];
          if (last) focusMarker(last.id);
          break;
        }
        case "+":
        case "=": {
          e.preventDefault();
          zoomAt((viewStart + viewEnd) / 2, 0.75);
          break;
        }
        case "-":
        case "_": {
          e.preventDefault();
          zoomAt((viewStart + viewEnd) / 2, 1.35);
          break;
        }
      }
    },
    [eventsByYear, focusMarker, focusedEventId, viewEnd, viewStart, zoomAt],
  );

  /* --- prevent wheel scroll on page while over canvas ------------------ */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wheelBlock = (ev: WheelEvent) => {
      if (Math.abs(ev.deltaY) > 0) ev.preventDefault();
    };
    el.addEventListener("wheel", wheelBlock, { passive: false });
    return () => el.removeEventListener("wheel", wheelBlock);
  }, []);

  /* --- render ---------------------------------------------------------- */
  const focused = focusedEventId
    ? visibleEvents.find((m) => m.event.id === focusedEventId)
    : null;
  const hovered = hoverId
    ? visibleEvents.find((m) => m.event.id === hoverId)
    : null;
  const cardFor = hovered ?? focused ?? null;

  return (
    <div className="relative select-none">
      {/* You are here + controls */}
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <MicroCaps>You are here</MicroCaps>
          <span className="font-mono text-sm tabular-nums text-ink">
            {formatYearShort(centeredYear)}
          </span>
          <span className="text-xs text-ink-muted">— {eraOf(centeredYear)}</span>
        </div>
        <div className="flex items-center gap-1">
          <ControlButton onClick={() => zoomAt((viewStart + viewEnd) / 2, 1.35)} label="Zoom out">
            <Minus size={14} strokeWidth={1.5} />
          </ControlButton>
          <ControlButton onClick={() => zoomAt((viewStart + viewEnd) / 2, 0.75)} label="Zoom in">
            <Plus size={14} strokeWidth={1.5} />
          </ControlButton>
          <ControlButton onClick={resetView} label="Reset view">
            <RotateCcw size={14} strokeWidth={1.5} />
          </ControlButton>
        </div>
      </div>

      <div
        ref={containerRef}
        role="region"
        aria-label="Interactive timeline"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        className={cn(
          "relative w-full cursor-grab border-y border-rule bg-surface/40 outline-none",
          "active:cursor-grabbing",
          "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0",
        )}
        style={{ height: CANVAS_HEIGHT }}
      >
        {/* Era band strip */}
        <div className="absolute inset-x-0 top-0" style={{ height: ERA_BAND_H }}>
          {eraBands.map((band, i) => (
            <div
              key={band.key}
              className={cn(
                "absolute top-0 h-full",
                i % 2 === 0
                  ? "bg-ink/[0.025] dark:bg-ink/[0.05]"
                  : "bg-transparent",
              )}
              style={{ left: band.left, width: band.width }}
            >
              {band.width > 60 && (
                <span className="absolute left-2 top-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted/80">
                  {band.label}
                </span>
              )}
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-px bg-rule" />
        </div>

        {/* Ruler */}
        <div
          className="absolute inset-x-0"
          style={{ top: ERA_BAND_H, height: RULER_H }}
        >
          {ticks.map((t) => (
            <div
              key={`${t.year}-${t.major}`}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: posToPx(t.pos), transform: "translateX(-50%)" }}
            >
              <div
                className={cn(
                  "w-px",
                  t.major ? "h-4 bg-ink/60" : "h-1 bg-rule/60",
                )}
              />
              <span
                className={cn(
                  "mt-1 font-mono tabular-nums",
                  t.major
                    ? "text-[11px] font-medium text-ink"
                    : "text-[10px] text-ink-muted/70",
                )}
              >
                {formatYearShort(t.year)}
              </span>
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-px bg-rule" />
        </div>

        {/* Marker plane */}
        <div
          className="absolute inset-x-0"
          style={{ top: MARKER_TOP, bottom: 0 }}
        >
          {/* Era separator verticals — stronger than tick marks */}
          {eraBands.map((band) => (
            <div
              key={`sep-${band.key}`}
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-rule/70 dark:bg-rule"
              style={{ left: band.left }}
              aria-hidden
            />
          ))}

          {/* The backbone — a 2px horizontal axis with a subtle gradient */}
          <div
            className="pointer-events-none absolute inset-x-0"
            style={{
              top: AXIS_Y - 1,
              height: 2,
              background:
                "linear-gradient(to right, transparent 0%, var(--rule) 4%, var(--ink-muted) 50%, var(--rule) 96%, transparent 100%)",
              opacity: 0.75,
            }}
            aria-hidden
          />

          {visibleEvents.map((m) => {
            const track = trackFor.get(m.event.id) ?? 0;
            const level = Math.floor(track / 2) + 1;
            const above = track % 2 === 0;
            const y = AXIS_Y + (above ? -1 : 1) * level * TRACK_H;
            const c = markerColor(m.event.categories);
            const isFocused = focusedEventId === m.event.id;
            const isHovered = hoverId === m.event.id;
            const r = markerRadius(m.event.significance, isFocused || isHovered);
            const stemStart = above ? y + r : y - r;
            const stemLen = Math.max(0, Math.abs(AXIS_Y - stemStart) - 1);
            return (
              <div key={m.event.id}>
                {/* Stem connecting the marker to the axis */}
                <div
                  className="pointer-events-none absolute w-px"
                  style={{
                    left: m.xPx,
                    top: above ? stemStart : AXIS_Y + 1,
                    height: stemLen,
                    background: `light-dark(${c.light}, ${c.dark})`,
                    opacity: isFocused || isHovered ? 0.9 : 0.45,
                  }}
                  aria-hidden
                />
                <button
                  type="button"
                  data-marker
                  aria-label={`${m.event.title}, ${m.event.date.display ?? m.event.date.start}`}
                  onMouseEnter={() => setHoverId(m.event.id)}
                  onMouseLeave={() =>
                    setHoverId((cur) => (cur === m.event.id ? null : cur))
                  }
                  onFocus={() => setFocusedEvent(m.event.id)}
                  onClick={(evt) => {
                    if (pointerMoved.current) {
                      evt.preventDefault();
                      return;
                    }
                    router.push(`/event/${m.event.slug}`);
                  }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,box-shadow] duration-150",
                    "outline-none",
                  )}
                  style={{
                    left: m.xPx,
                    top: y,
                    width: r * 2,
                    height: r * 2,
                    background: `light-dark(${c.light}, ${c.dark})`,
                    boxShadow: isFocused
                      ? `0 0 0 2px var(--bg), 0 0 0 3px light-dark(${c.light}, ${c.dark})`
                      : undefined,
                  }}
                />
              </div>
            );
          })}

          {/* Hover / focus preview card */}
          {cardFor && (() => {
            const track = trackFor.get(cardFor.event.id) ?? 0;
            const level = Math.floor(track / 2) + 1;
            const above = track % 2 === 0;
            const y = AXIS_Y + (above ? -1 : 1) * level * TRACK_H;
            return (
              <HoverCard
                event={cardFor.event}
                xPx={cardFor.xPx}
                containerWidth={width}
                trackY={y}
              />
            );
          })()}
        </div>

        {/* "Center" indicator line — quiet accent */}
        <div
          className="pointer-events-none absolute w-px bg-accent/40"
          style={{ left: width / 2, top: ERA_BAND_H, bottom: 0 }}
          aria-hidden
        />
      </div>

      <p className="mt-3 text-xs text-ink-muted">
        Drag to pan · scroll to zoom · <kbd className="font-mono">←</kbd>{" "}
        <kbd className="font-mono">→</kbd> between markers ·{" "}
        <kbd className="font-mono">Enter</kbd> to open · showing {visibleEvents.length} of {events.length} events
      </p>
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center text-ink-muted transition-colors hover:text-ink"
    >
      {children}
    </button>
  );
}

function HoverCard({
  event,
  xPx,
  containerWidth,
  trackY,
}: {
  event: EventDoc;
  xPx: number;
  containerWidth: number;
  trackY: number;
}) {
  const CARD_W = 300;
  const half = CARD_W / 2;
  let left = xPx - half;
  if (left < 8) left = 8;
  if (left + CARD_W > containerWidth - 8) left = containerWidth - CARD_W - 8;
  const above = trackY > 160;
  const c = markerColor(event.categories);
  const hero = event.images[0];

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-10 border border-rule bg-surface shadow-[0_2px_16px_-8px_rgb(0_0_0_/_0.25)]",
      )}
      style={{
        left,
        top: above ? trackY - 12 : trackY + 20,
        width: CARD_W,
        transform: above ? "translateY(-100%)" : undefined,
      }}
    >
      {hero && (
        <SafeImage
          src={hero.url}
          alt={hero.caption}
          className="w-full border-b border-rule object-cover"
          aspectRatio="16 / 9"
          loading="eager"
        />
      )}
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <MonoDate date={event.date} size="sm" className="text-ink-muted" />
          <span
            className="text-[10px] uppercase tracking-[0.14em]"
            style={{ color: `light-dark(${c.light}, ${c.dark})` }}
          >
            {event.categories[0].replace("-", " · ")}
          </span>
        </div>
        <Link
          href={`/event/${event.slug}`}
          className="pointer-events-auto mt-1 block text-sm font-medium leading-snug text-ink hover:text-accent"
        >
          {event.title}
        </Link>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-ink-muted">
          {event.summary}
        </p>
      </div>
    </div>
  );
}

export { MIN_YEAR, MAX_YEAR };
