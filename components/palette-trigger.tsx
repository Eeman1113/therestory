"use client";

import { cn } from "@/lib/utils";

export const PALETTE_OPEN_EVENT = "therestory:open-palette";

export function openPalette() {
  window.dispatchEvent(new CustomEvent(PALETTE_OPEN_EVENT));
}

export function PaletteTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => openPalette()}
      aria-label="Open search"
      className={cn(
        "inline-flex items-baseline gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink",
        className,
      )}
    >
      <span className="font-mono">⌘K</span>
    </button>
  );
}
