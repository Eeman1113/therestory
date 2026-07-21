"use client";

/**
 * TimelineCanvas — the interactive timeline hero: italic-serif year header,
 * filter chips, tinted era zones, axis at the bottom with three above-axis
 * lanes for event dots, and a hover card with hero image + serif year
 * watermark. The most recent event at or before initialYear is subtly
 * highlighted as the default focus.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import type { Category, CategoryMeta, EventDoc } from "@/lib/content/schema";
import { cn } from "@/lib/utils";
import { MonoDate } from "@/components/common/mono-date";
import { SafeImage } from "@/components/common/safe-image";
import { parseStartYear } from "@/lib/timeline/scale";
import { CATEGORY_COLORS, markerColor } from "@/lib/timeline/categories";

/* ---------------------------------------------------------------------------
   Layout constants (px)
--------------------------------------------------------------------------- */
const TRACK_H = 220;
const TRACK_H_MOBILE = 200;
const AXIS_BOTTOM = 50;
const LANES = [28, 58, 88]; // stem heights above axis for the three lanes
const TICK_BOTTOM = 30;
const CARD_W = 320;
const ZOOMS = [1, 1.35, 1.8, 2.4];

/* ---------------------------------------------------------------------------
   Era zones. Widths are relative weights — they sum to define the total
   scale. Matches the reference mockup so post-classical and 20th century
   get the room they earn.
--------------------------------------------------------------------------- */
interface Era {
  label: string;
  start: number;
  end: number;
  weight: number;
}
const ERAS: Era[] = [
  { label: "Prehistory",     start: -3500, end: -800, weight: 12 },
  { label: "Ancient",        start:  -800, end: -200, weight: 11 },
  { label: "Classical",      start:  -200, end:  500, weight: 10 },
  { label: "Post-classical", start:   500, end: 1500, weight: 16 },
  { label: "Early modern",   start:  1500, end: 1800, weight: 13 },
  { label: "Long 19th c.",   start:  1800, end: 1914, weight: 11 },
  { label: "20th century",   start:  1914, end: 1991, weight: 14 },
  { label: "Contemporary",   start:  1991, end: 2026, weight: 13 },
];
const TOTAL_WEIGHT = ERAS.reduce((s, e) => s + e.weight, 0);
const CUMULATIVE: number[] = (() => {
  const out: number[] = [];
  let acc = 0;
  for (const e of ERAS) {
    out.push(acc);
    acc += (e.weight / TOTAL_WEIGHT) * 100;
  }
  return out;
})();

/** year → normalised position 0..100 across the piecewise era scale */
function xOf(year: number): number {
  for (let i = 0; i < ERAS.length; i++) {
    const era = ERAS[i];
    if (year >= era.start && year <= era.end) {
      const eraWidth = (era.weight / TOTAL_WEIGHT) * 100;
      return CUMULATIVE[i] + ((year - era.start) / (era.end - era.start)) * eraWidth;
    }
  }
  return year < ERAS[0].start ? 0 : 100;
}

/** normalised position 0..100 → year */
function yearAt(pos: number): number {
  const clamped = Math.min(100, Math.max(0, pos));
  for (let i = 0; i < ERAS.length; i++) {
    const era = ERAS[i];
    const eraWidth = (era.weight / TOTAL_WEIGHT) * 100;
    const eraLeft = CUMULATIVE[i];
    if (clamped >= eraLeft && clamped <= eraLeft + eraWidth) {
      const t = eraWidth === 0 ? 0 : (clamped - eraLeft) / eraWidth;
      return Math.round(era.start + t * (era.end - era.start));
    }
  }
  return ERAS[ERAS.length - 1].end;
}

function fmtYear(y: number): string {
  const rounded = Math.round(y);
  if (rounded < 0) return `${-rounded} BCE`;
  if (rounded === 0) return "1 CE";
  return `${rounded}`;
}

function eraOf(year: number): string {
  const era = ERAS.find((e) => year >= e.start && year < e.end) ?? ERAS[ERAS.length - 1];
  return era.label;
}

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */
interface Props {
  events: EventDoc[];
  categories: CategoryMeta[];
  initialYear?: number;
}

export function TimelineCanvas({ events, categories, initialYear = 2026 }: Props) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const vpRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [zi, setZi] = useState(0);
  const [vpPx, setVpPx] = useState(0);
  const [smallScreen, setSmallScreen] = useState(false);
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [snapCursor, setSnapCursor] = useState(false);

  // Sort events chronologically so lane assignment (index % 3) is stable.
  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => parseStartYear(a.date.start) - parseStartYear(b.date.start),
      ),
    [events],
  );

  /* --- viewport size observer --- */
  useLayoutEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const measure = () => {
      const w = vp.getBoundingClientRect().width;
      if (w > 0) {
        setVpPx(w);
        setSmallScreen(window.innerWidth < 640);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    const raf = requestAnimationFrame(measure);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  /* --- track width is derived from viewport width + zoom stop --- */
  const trackPx = useMemo(() => {
    if (vpPx === 0) return 0;
    return Math.max(vpPx * ZOOMS[zi], vpPx, 1080);
  }, [vpPx, zi]);

  /* --- centre the view on initialYear once we know the track width --- */
  const didInitialCentre = useRef(false);
  useEffect(() => {
    if (!vpRef.current || trackPx === 0 || didInitialCentre.current) return;
    const target = (trackPx * xOf(initialYear)) / 100 - vpPx / 2;
    vpRef.current.scrollLeft = Math.max(0, target);
    didInitialCentre.current = true;
  }, [trackPx, vpPx, initialYear]);

  /* --- update the "you are here" year + card position as user pans --- */
  const handleScroll = useCallback(() => {
    const vp = vpRef.current;
    if (!vp || trackPx === 0) return;
    const centerPx = vp.scrollLeft + vp.clientWidth / 2;
    const pos = (centerPx / trackPx) * 100;
    setCurrentYear(yearAt(pos));
  }, [trackPx]);

  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    vp.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => vp.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* --- precomputed marker X positions in track coords (for snap) --- */
  const markerXs = useMemo(
    () =>
      sortedEvents.map(
        (e) => (xOf(parseStartYear(e.date.start)) / 100) * trackPx,
      ),
    [sortedEvents, trackPx],
  );

  /* --- pointer-drag pan + magnetic snap to nearest marker --- */
  const drag = useRef<{ startX: number; scrollLeft: number; moved: boolean } | null>(null);
  const snapRaf = useRef<number | null>(null);

  const performSnap = useCallback(
    (clientX: number, clientY: number) => {
      const vp = vpRef.current;
      if (!vp || markerXs.length === 0) return;
      const rect = vp.getBoundingClientRect();
      const xInTrack = clientX - rect.left + vp.scrollLeft;
      const yInVp = clientY - rect.top;
      const vpH = rect.height;

      let bestIdx = -1;
      let bestDist = Infinity;
      for (let i = 0; i < markerXs.length; i++) {
        if (activeCat && !sortedEvents[i].categories.includes(activeCat)) continue;
        const dx = markerXs[i] - xInTrack;
        const laneH = LANES[i % 3];
        const markerY = vpH - AXIS_BOTTOM - laneH;
        const dy = markerY - yInVp;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist) {
          bestDist = d2;
          bestIdx = i;
        }
      }

      const SNAP_R2 = 36 * 36;
      if (bestIdx >= 0 && bestDist < SNAP_R2) {
        if (pinnedIndex == null) {
          setHoveredIndex((cur) => (cur === bestIdx ? cur : bestIdx));
        }
        setSnapCursor((s) => (s ? s : true));
      } else {
        setSnapCursor((s) => (s ? false : s));
        if (pinnedIndex == null) {
          setHoveredIndex((cur) => (cur == null ? cur : null));
        }
      }
    },
    [activeCat, markerXs, pinnedIndex, sortedEvents],
  );

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-marker]") || target.closest("[data-card]") || target.closest("button")) {
      return;
    }
    const vp = vpRef.current;
    if (!vp) return;
    drag.current = { startX: e.clientX, scrollLeft: vp.scrollLeft, moved: false };
    vp.setPointerCapture(e.pointerId);
    vp.classList.add("cursor-grabbing");
    setSnapCursor(false); // let cursor-grabbing take over during drag
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      const vp = vpRef.current;
      if (!vp) return;

      if (d) {
        const dx = e.clientX - d.startX;
        if (Math.abs(dx) > 4) d.moved = true;
        vp.scrollLeft = d.scrollLeft - dx;
        return;
      }

      // No active drag → magnetic snap
      const cx = e.clientX;
      const cy = e.clientY;
      if (snapRaf.current !== null) cancelAnimationFrame(snapRaf.current);
      snapRaf.current = requestAnimationFrame(() => {
        snapRaf.current = null;
        performSnap(cx, cy);
      });
    },
    [performSnap],
  );

  const endDrag = useCallback(() => {
    drag.current = null;
    vpRef.current?.classList.remove("cursor-grabbing");
  }, []);

  const onPointerLeaveVp = useCallback(() => {
    setSnapCursor(false);
    if (pinnedIndex == null) {
      setHoveredIndex((cur) => (cur == null ? cur : null));
    }
  }, [pinnedIndex]);

  /* --- keyboard nav --- */
  const eventsByYear = sortedEvents;
  const focusEvent = useCallback(
    (idx: number, opts?: { scroll?: boolean; pin?: boolean }) => {
      if (idx < 0 || idx >= eventsByYear.length) return;
      setHoveredIndex(idx);
      if (opts?.pin) setPinnedIndex(idx);
      if (opts?.scroll && trackPx > 0 && vpRef.current) {
        const px = (trackPx * xOf(parseStartYear(eventsByYear[idx].date.start))) / 100;
        vpRef.current.scrollTo({ left: px - vpPx / 2, behavior: "smooth" });
      }
    },
    [eventsByYear, trackPx, vpPx],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const cursor = hoveredIndex ?? nearestEventIndex(eventsByYear, currentYear);
        let next = cursor + dir;
        while (
          next >= 0 &&
          next < eventsByYear.length &&
          activeCat &&
          !eventsByYear[next].categories.includes(activeCat)
        ) {
          next += dir;
        }
        if (next >= 0 && next < eventsByYear.length) {
          focusEvent(next, { scroll: true });
        }
      } else if (e.key === "Enter" && hoveredIndex != null) {
        e.preventDefault();
        setPinnedIndex((p) => (p === hoveredIndex ? null : hoveredIndex));
      } else if (e.key === "Escape") {
        setPinnedIndex(null);
        setHoveredIndex(null);
      }
    },
    [activeCat, currentYear, eventsByYear, focusEvent, hoveredIndex],
  );

  /* --- zoom actions --- */
  const zoomTo = useCallback(
    (delta: number) => {
      const vp = vpRef.current;
      if (!vp) return;
      const before = vp.scrollLeft + vp.clientWidth / 2;
      const beforeFrac = trackPx === 0 ? 0.5 : before / trackPx;
      const nextZi = Math.max(0, Math.min(ZOOMS.length - 1, zi + delta));
      setZi(nextZi);
      requestAnimationFrame(() => {
        if (!vpRef.current) return;
        const newTrack = Math.max(vpPx * ZOOMS[nextZi], vpPx, 1080);
        vpRef.current.scrollLeft = beforeFrac * newTrack - vpPx / 2;
      });
    },
    [trackPx, vpPx, zi],
  );

  const resetView = useCallback(() => {
    setZi(0);
    requestAnimationFrame(() => {
      if (!vpRef.current) return;
      const newTrack = Math.max(vpPx, 1080);
      vpRef.current.scrollLeft = (newTrack * xOf(initialYear)) / 100 - vpPx / 2;
    });
  }, [initialYear, vpPx]);

  /* --- render helpers --- */
  const shownEvent =
    pinnedIndex != null ? eventsByYear[pinnedIndex] : hoveredIndex != null ? eventsByYear[hoveredIndex] : null;
  const shownIdx = pinnedIndex ?? hoveredIndex;

  // Default subtle highlight — the most recent event at or before initialYear.
  // Only used when nothing is hovered or pinned.
  const defaultIdx = useMemo(() => {
    if (eventsByYear.length === 0) return null;
    let best = -1;
    for (let i = 0; i < eventsByYear.length; i++) {
      if (parseStartYear(eventsByYear[i].date.start) <= initialYear) best = i;
      else break;
    }
    return best === -1 ? eventsByYear.length - 1 : best;
  }, [eventsByYear, initialYear]);

  const highlightIdx = shownIdx ?? defaultIdx;

  // Header year reflects the highlighted event when one is set (snapped or
  // pinned or default), otherwise it tracks the scroll-centre year.
  const headerYear =
    highlightIdx != null
      ? parseStartYear(eventsByYear[highlightIdx].date.start)
      : currentYear;

  const visibleCount = activeCat
    ? eventsByYear.filter((e) => e.categories.includes(activeCat)).length
    : eventsByYear.length;

  /* --- portalled card position: computed from marker DOM rect --- */
  const [cardBox, setCardBox] = useState<{ x: number; y: number } | null>(null);

  const updateCardBox = useCallback(() => {
    if (shownIdx == null || !sectionRef.current || !vpRef.current) {
      setCardBox(null);
      return;
    }
    const marker = vpRef.current.querySelector<HTMLElement>(
      `[data-marker-idx="${shownIdx}"]`,
    );
    if (!marker) {
      setCardBox(null);
      return;
    }
    const rect = marker.getBoundingClientRect();
    const vpRect = vpRef.current.getBoundingClientRect();
    if (rect.right < vpRect.left - 4 || rect.left > vpRect.right + 4) {
      setCardBox(null);
      return;
    }
    const sectionRect = sectionRef.current.getBoundingClientRect();
    setCardBox({
      x: rect.left + rect.width / 2 - sectionRect.left,
      y: rect.top - sectionRect.top - 14,
    });
  }, [shownIdx]);

  useEffect(() => {
    updateCardBox();
  }, [shownIdx, updateCardBox]);

  useEffect(() => {
    const vp = vpRef.current;
    const ro = new ResizeObserver(updateCardBox);
    if (vp) {
      ro.observe(vp);
      vp.addEventListener("scroll", updateCardBox, { passive: true });
    }
    window.addEventListener("resize", updateCardBox);
    window.addEventListener("scroll", updateCardBox, { passive: true });
    return () => {
      ro.disconnect();
      if (vp) vp.removeEventListener("scroll", updateCardBox);
      window.removeEventListener("resize", updateCardBox);
      window.removeEventListener("scroll", updateCardBox);
    };
  }, [updateCardBox]);

  return (
    <section ref={sectionRef} className="not-prose relative">
      {/* Header row — "You are here" + zoom controls.
          Year tracks the highlighted event (snapped/hovered/pinned/default);
          falls back to the scroll-centre year when nothing is highlighted. */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-ink-muted">
            You are here
          </p>
          <div className="mt-2 flex items-baseline gap-4">
            <h2 className="font-serif text-[56px] italic leading-[0.88] tracking-[-0.015em] text-ink sm:text-[78px]">
              {fmtYear(headerYear)}
            </h2>
            <span className="inline-block rounded-full border border-rule/80 bg-surface/50 px-3 py-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-ink-muted">
              {eraOf(headerYear)}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <ZoomButton onClick={() => zoomTo(-1)} disabled={zi === 0} label="Zoom out">
            <Minus size={14} strokeWidth={1.5} />
          </ZoomButton>
          <ZoomButton onClick={() => zoomTo(1)} disabled={zi === ZOOMS.length - 1} label="Zoom in">
            <Plus size={14} strokeWidth={1.5} />
          </ZoomButton>
          <ZoomButton onClick={resetView} label="Reset view">
            <RotateCcw size={14} strokeWidth={1.5} />
          </ZoomButton>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <FilterChip
          active={activeCat == null}
          onClick={() => {
            setActiveCat(null);
            setPinnedIndex(null);
          }}
          label="All eras of everything"
        />
        {categories.map((cat) => {
          const c = CATEGORY_COLORS[cat.id];
          return (
            <FilterChip
              key={cat.id}
              active={activeCat === cat.id}
              onClick={() =>
                setActiveCat((prev) => {
                  if (prev === cat.id) return null;
                  return cat.id;
                })
              }
              label={cat.label}
              swatch={`light-dark(${c.light}, ${c.dark})`}
            />
          );
        })}
      </div>

      {/* Viewport */}
      <div
        ref={vpRef}
        tabIndex={0}
        role="region"
        aria-label="Timeline — drag to pan, arrow keys to browse events"
        className="relative select-none overflow-x-auto overflow-y-hidden border-y border-rule outline-none cursor-grab focus-visible:shadow-[inset_0_0_0_2px_var(--accent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: "pan-x", cursor: snapCursor ? "pointer" : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={onPointerLeaveVp}
        onKeyDown={onKeyDown}
      >
        <div
          ref={trackRef}
          className="relative"
          style={{
            height: smallScreen ? TRACK_H_MOBILE : TRACK_H,
            width: trackPx || "100%",
          }}
        >
          {/* Era zones */}
          {ERAS.map((era, i) => {
            const left = CUMULATIVE[i];
            const width = (era.weight / TOTAL_WEIGHT) * 100;
            return (
              <div
                key={era.label}
                className={cn(
                  "absolute top-0 bottom-0",
                  i > 0 && "border-l border-ink/[0.05]",
                  i % 2 === 1 && "bg-ink/[0.022] dark:bg-ink/[0.04]",
                )}
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <span
                  className="absolute left-3 whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted/70"
                  style={{ bottom: AXIS_BOTTOM + LANES[2] + 16 }}
                >
                  {era.label}
                </span>
              </div>
            );
          })}

          {/* Axis line at the bottom */}
          <div
            className="absolute right-0 left-0 h-px bg-rule"
            style={{ bottom: AXIS_BOTTOM }}
          />

          {/* Era boundary ticks below axis */}
          {ERAS.reduce<number[]>((acc, e, i) => {
            acc.push(e.start);
            if (i === ERAS.length - 1) acc.push(e.end);
            return acc;
          }, []).map((y, i, arr) => {
            const isLeftEdge = i === 0;
            const isRightEdge = i === arr.length - 1;
            const transform = isLeftEdge
              ? "translateX(8px)"
              : isRightEdge
                ? "translateX(calc(-100% - 8px))"
                : "translateX(-50%)";
            return (
              <span
                key={`tick-${y}`}
                className="absolute whitespace-nowrap font-mono text-[10.5px] text-ink-muted/70"
                style={{ bottom: TICK_BOTTOM, left: `${xOf(y)}%`, transform }}
              >
                {fmtYear(y)}
              </span>
            );
          })}

          {/* Events */}
          {sortedEvents.map((event, i) => {
            const year = parseStartYear(event.date.start);
            const cat = markerColor(event.categories);
            const laneH = LANES[i % 3];
            const isDimmed =
              activeCat != null && !event.categories.includes(activeCat);
            const isActive = highlightIdx === i;
            return (
              <div
                key={event.id}
                className={cn(
                  "absolute w-0 transition-[opacity,filter] duration-200",
                  isDimmed && "pointer-events-none opacity-[0.12] saturate-[0.35]",
                )}
                style={{
                  left: `${xOf(year)}%`,
                  bottom: AXIS_BOTTOM,
                  height: laneH,
                  color: `light-dark(${cat.light}, ${cat.dark})`,
                }}
              >
                <button
                  type="button"
                  data-marker
                  data-marker-idx={i}
                  aria-label={`${event.title}, ${event.date.display ?? fmtYear(year)}`}
                  onFocus={() => setHoveredIndex(i)}
                  onClick={(evt) => {
                    if (drag.current?.moved) {
                      evt.preventDefault();
                      return;
                    }
                    router.push(`/event/${event.slug}`);
                  }}
                  className="absolute flex items-center justify-center rounded-full bg-transparent outline-none cursor-pointer"
                  style={{
                    top: -12,
                    left: -12,
                    width: 24,
                    height: 24,
                    padding: 0,
                    border: "none",
                  }}
                >
                  <span
                    className="block rounded-full bg-current transition-transform duration-200"
                    style={{
                      width: 8,
                      height: 8,
                      transform: isActive ? "scale(1.35)" : "scale(1)",
                      boxShadow: isActive
                        ? "0 0 0 3px var(--bg), 0 0 0 6px color-mix(in oklab, currentColor 60%, transparent)"
                        : "0 0 0 3px var(--bg)",
                    }}
                  />
                </button>
              </div>
            );
          })}

        </div>
      </div>

      {/* Portalled hover / pinned card — positioned via marker DOM rect,
          so it floats above the (short) viewport without being clipped. */}
      {shownEvent && shownIdx != null && cardBox && (
        <div
          className="pointer-events-none absolute z-30"
          style={{
            left: Math.max(
              10,
              Math.min(
                cardBox.x - CARD_W / 2,
                (sectionRef.current?.clientWidth ?? 0) - CARD_W - 10,
              ),
            ),
            top: cardBox.y,
            transform: "translateY(-100%)",
          }}
        >
          <HoverCard
            event={shownEvent}
            pinned={pinnedIndex === shownIdx}
            onClose={() => {
              setPinnedIndex(null);
              setHoveredIndex(null);
            }}
            onNavigate={(slug) => router.push(`/event/${slug}`)}
          />
        </div>
      )}

      {/* Hints */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Kbd>drag</Kbd> pan
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd> browse
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <Kbd>enter</Kbd> pin
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <Kbd>esc</Kbd> close
        </span>
        <span className="ml-auto font-mono text-[11px] tracking-wider text-ink-muted/70">
          showing {visibleCount} of {sortedEvents.length} events
        </span>
      </div>

      {/* Ping keyframes — scoped */}
      <style jsx>{`
        @keyframes tl-ping {
          0% { transform: scale(0.35); opacity: 0.9; }
          70%, 100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   HoverCard
--------------------------------------------------------------------------- */

interface HoverCardProps {
  event: EventDoc;
  pinned: boolean;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

const HoverCard = ({
  event,
  pinned,
  onClose,
  onNavigate,
}: HoverCardProps) => {
  const cat = markerColor(event.categories);
  const hero = event.images[0];

  return (
    <Link
      href={`/event/${event.slug}`}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(event.slug);
      }}
      data-card
      className={cn(
        "pointer-events-auto block overflow-hidden rounded-2xl border border-rule bg-surface",
        "shadow-[0_14px_34px_rgb(0_0_0_/_0.09),0_2px_6px_rgb(0_0_0_/_0.05)]",
        "transition-[transform,box-shadow] duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgb(0_0_0_/_0.12),0_2px_6px_rgb(0_0_0_/_0.06)]",
      )}
      style={{ width: CARD_W }}
    >
      {/* Hero image with italic-serif year watermark overlaid */}
      {hero ? (
        <div
          className="relative h-[132px] overflow-hidden"
          style={{ background: cat.tint }}
        >
          <SafeImage
            src={hero.url}
            alt={hero.caption}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Bottom-fade so the watermark reads over any image */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgb(0 0 0 / 0.35) 0%, transparent 55%)",
            }}
          />
          <span
            className="pointer-events-none absolute font-serif italic leading-none tracking-[-0.02em] text-white/85"
            style={{
              right: 12,
              bottom: 6,
              fontSize: 44,
              textShadow: "0 2px 12px rgb(0 0 0 / 0.45)",
            }}
          >
            {fmtYear(parseStartYear(event.date.start))}
          </span>
        </div>
      ) : (
        <div
          className="relative h-[52px] overflow-hidden"
          style={{ background: cat.tint }}
        >
          <span
            className="pointer-events-none absolute font-serif italic leading-none tracking-[-0.02em]"
            style={{
              right: 12,
              bottom: -24,
              fontSize: 76,
              color: cat.light,
              opacity: 0.28,
            }}
          >
            {fmtYear(parseStartYear(event.date.start))}
          </span>
        </div>
      )}

      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-2">
          <MonoDate date={event.date} size="sm" className="text-ink-muted" />
          <span
            className="rounded-full px-2.5 py-[3px] font-mono text-[9.5px] font-medium uppercase tracking-[0.14em]"
            style={{ background: cat.tint, color: cat.deep }}
          >
            {categoryLabel(event.categories[0])}
          </span>
        </div>
        <div className="mt-2 text-[15.5px] font-semibold leading-snug tracking-[-0.01em] text-ink">
          {event.title}
        </div>
        <p className="mt-1 line-clamp-3 text-[12.8px] leading-[1.58] text-ink-muted">
          {event.summary}
        </p>
      </div>

      {pinned && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
          className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-surface/85 text-ink-muted backdrop-blur transition-colors hover:bg-surface hover:text-ink"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      )}
    </Link>
  );
};

/* ---------------------------------------------------------------------------
   Bits & pieces
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

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-rule/80 border-b-2 bg-surface px-[7px] py-[2px] font-mono text-[10.5px] font-medium text-ink-muted">
      {children}
    </kbd>
  );
}

function categoryLabel(id: Category): string {
  const labels: Record<Category, string> = {
    "war-conflict": "War & conflict",
    "politics-empires": "Empires & politics",
    "science-technology": "Science & technology",
    "religion-ideas": "Belief & ideas",
    "art-culture": "Arts & culture",
    "economy-trade": "Economy & trade",
    "exploration": "Exploration",
    "disaster-disease": "Disaster & disease",
  };
  return labels[id];
}

function nearestEventIndex(events: EventDoc[], year: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < events.length; i++) {
    const y = parseStartYear(events[i].date.start);
    const d = Math.abs(y - year);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}
