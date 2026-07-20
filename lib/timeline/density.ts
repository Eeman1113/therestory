/**
 * Zoom-based marker density.
 *
 * The rule: when the viewport spans a large chunk of history, only the very
 * highest-significance events show. As you zoom in, the threshold drops and
 * more markers appear. This keeps the timeline readable across scales.
 *
 * Thresholds are picked from the size of the visible window (viewEnd - viewStart)
 * in normalized [0, 1] units:
 *
 *   window > 0.5   → significance >= 5   (whole eras visible)
 *   window > 0.2   → significance >= 4
 *   window > 0.05  → significance >= 3
 *   window > 0.015 → significance >= 2
 *   else           → all
 */

export function minSignificanceFor(windowSize: number): number {
  if (windowSize > 0.5) return 5;
  if (windowSize > 0.2) return 4;
  if (windowSize > 0.05) return 3;
  if (windowSize > 0.015) return 2;
  return 1;
}
