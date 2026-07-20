import { MicroCaps } from "@/components/common/micro-caps";

/**
 * Rendered during client-side navigation while the next static page arrives.
 * Static export means initial page loads never trigger this — it only appears
 * on Link-driven transitions.
 */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] items-baseline gap-3 px-8 py-16 text-ink-muted">
      <MicroCaps>Loading</MicroCaps>
      <span className="font-mono text-xs tabular-nums">·</span>
      <span className="animate-pulse text-sm">please stand by</span>
    </div>
  );
}
