"use client";

/**
 * Shared timeline view state — consumed by both the TimelineStrip (minimap
 * at the top of every page) and the TimelineCanvas (large interactive surface
 * on the homepage).
 *
 * State model: the viewport is a window [viewStart, viewEnd] over the
 * normalized 0..1 timeline. Panning shifts the window; zooming shrinks or
 * grows it around an anchor position.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MAX_YEAR, MIN_YEAR, positionToYear } from "@/lib/timeline/scale";

interface TimelineView {
  viewStart: number;
  viewEnd: number;
  focusedEventId: string | null;

  /** Set an absolute view window, clamped to [0, 1] with minimum width. */
  setView: (start: number, end: number) => void;
  /** Shift the window by a fraction (positive = later in time). */
  pan: (delta: number) => void;
  /** Zoom by a multiplicative factor around a normalized anchor position. */
  zoomAt: (anchor: number, factor: number) => void;
  /** Reset to full range. */
  resetView: () => void;
  /** Update the currently focused event id (used for keyboard nav). */
  setFocusedEvent: (id: string | null) => void;
}

const MIN_WINDOW = 0.001; // ~5 years max zoom
const MAX_WINDOW = 1; // whole timeline

const TimelineViewContext = createContext<TimelineView | null>(null);

export function TimelineViewProvider({
  children,
  initialStart = 0,
  initialEnd = 1,
}: {
  children: ReactNode;
  initialStart?: number;
  initialEnd?: number;
}) {
  const [viewStart, setStart] = useState(initialStart);
  const [viewEnd, setEnd] = useState(initialEnd);
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);

  // Keep a ref of the current view so pan/zoom actions read the latest
  // values without needing to re-close over every render.
  const viewRef = useRef({ start: initialStart, end: initialEnd });
  useEffect(() => {
    viewRef.current = { start: viewStart, end: viewEnd };
  }, [viewStart, viewEnd]);

  const setView = useCallback((start: number, end: number) => {
    let s = Math.min(1, Math.max(0, start));
    let e = Math.min(1, Math.max(0, end));
    if (e - s < MIN_WINDOW) {
      const mid = (s + e) / 2;
      s = Math.max(0, mid - MIN_WINDOW / 2);
      e = Math.min(1, s + MIN_WINDOW);
    }
    if (e - s > MAX_WINDOW) {
      s = 0;
      e = 1;
    }
    setStart(s);
    setEnd(e);
  }, []);

  const pan = useCallback(
    (delta: number) => {
      const { start, end } = viewRef.current;
      const width = end - start;
      let s = start + delta;
      let e = end + delta;
      if (s < 0) {
        s = 0;
        e = width;
      }
      if (e > 1) {
        e = 1;
        s = 1 - width;
      }
      setView(s, e);
    },
    [setView],
  );

  const zoomAt = useCallback(
    (anchor: number, factor: number) => {
      const { start, end } = viewRef.current;
      const width = end - start;
      const newWidth = Math.min(
        MAX_WINDOW,
        Math.max(MIN_WINDOW, width * factor),
      );
      const t = width === 0 ? 0.5 : (anchor - start) / width;
      let s = anchor - t * newWidth;
      let e = s + newWidth;
      if (s < 0) {
        s = 0;
        e = newWidth;
      }
      if (e > 1) {
        e = 1;
        s = 1 - newWidth;
      }
      setView(s, e);
    },
    [setView],
  );

  const resetView = useCallback(() => setView(0, 1), [setView]);

  const setFocusedEvent = useCallback(
    (id: string | null) => setFocusedEventId(id),
    [],
  );

  const value = useMemo<TimelineView>(
    () => ({
      viewStart,
      viewEnd,
      focusedEventId,
      setView,
      pan,
      zoomAt,
      resetView,
      setFocusedEvent,
    }),
    [
      viewStart,
      viewEnd,
      focusedEventId,
      setView,
      pan,
      zoomAt,
      resetView,
      setFocusedEvent,
    ],
  );

  return (
    <TimelineViewContext.Provider value={value}>
      {children}
    </TimelineViewContext.Provider>
  );
}

export function useTimelineView(): TimelineView {
  const ctx = useContext(TimelineViewContext);
  if (!ctx) {
    // Rendered outside a provider — this happens on server-only surfaces that
    // don't need reactivity (the strip on non-homepage pages before the
    // provider mounts). Return a static default so consumers don't crash.
    return {
      viewStart: 0,
      viewEnd: 1,
      focusedEventId: null,
      setView: () => {},
      pan: () => {},
      zoomAt: () => {},
      resetView: () => {},
      setFocusedEvent: () => {},
    };
  }
  return ctx;
}

export function centerYear(view: {
  viewStart: number;
  viewEnd: number;
}): number {
  return positionToYear((view.viewStart + view.viewEnd) / 2);
}

export { MIN_YEAR, MAX_YEAR };
