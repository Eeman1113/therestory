"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, X } from "lucide-react";
import type { EventDoc, EraMeta, RegionMeta } from "@/lib/content/schema";
import { formatDate } from "@/lib/date/format";
import { MicroCaps } from "@/components/common/micro-caps";
import { cn } from "@/lib/utils";
import { PALETTE_OPEN_EVENT } from "./palette-trigger";

interface Props {
  events: Array<
    Pick<EventDoc, "id" | "slug" | "title" | "date" | "era" | "categories" | "summary">
  >;
  eras: EraMeta[];
  regions: RegionMeta[];
}

export function CommandPalette({ events, eras, regions }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    // Lock scroll behind the modal
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const go = useCallback(
    (href: string) => {
      closePalette();
      router.push(href);
    },
    [closePalette, router],
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Search Therestory"
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]"
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={closePalette}
        className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
      />
      <Command
        label="Site search"
        className="relative flex w-full max-w-xl flex-col border border-rule bg-surface shadow-[0_20px_80px_-20px_rgb(0_0_0_/_0.35)]"
        loop
      >
        <div className="flex items-center gap-3 border-b border-rule px-4 py-3">
          <Search size={16} strokeWidth={1.5} className="text-ink-muted" aria-hidden />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            autoFocus
            placeholder="Search events, eras, regions…"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
          <MicroCaps className="hidden sm:inline">Esc</MicroCaps>
          <button
            type="button"
            onClick={closePalette}
            className="ml-1 text-ink-muted transition-colors hover:text-ink sm:hidden"
            aria-label="Close"
          >
            <X size={14} strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto py-2">
          <Command.Empty className="px-4 py-6 text-sm text-ink-muted">
            No results.
          </Command.Empty>

          <Command.Group
            heading="Events"
            className={cn(
              "px-2 pb-2 pt-1",
              "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2",
              "[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium",
              "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em]",
              "[&_[cmdk-group-heading]]:text-ink-muted",
            )}
          >
            {events.map((e) => (
              <Command.Item
                key={e.id}
                value={`${e.title} ${e.era} ${e.categories.join(" ")}`}
                onSelect={() => go(`/event/${e.slug}`)}
                className={cn(
                  "flex cursor-pointer items-baseline justify-between gap-4 px-2 py-2",
                  "text-sm text-ink",
                  "aria-selected:bg-ink/[0.04] dark:aria-selected:bg-ink/[0.06]",
                )}
              >
                <span className="truncate">{e.title}</span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-muted">
                  {formatDate(e.date)}
                </span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group
            heading="Eras"
            className={cn(
              "px-2 pb-2 pt-1",
              "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2",
              "[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium",
              "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em]",
              "[&_[cmdk-group-heading]]:text-ink-muted",
            )}
          >
            {eras.map((era) => (
              <Command.Item
                key={era.id}
                value={`${era.label} ${era.description}`}
                onSelect={() => go(`/eras/${era.id}`)}
                className={cn(
                  "flex cursor-pointer items-baseline justify-between gap-4 px-2 py-2",
                  "text-sm text-ink",
                  "aria-selected:bg-ink/[0.04] dark:aria-selected:bg-ink/[0.06]",
                )}
              >
                <span>{era.label}</span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-muted">
                  {formatYearShort(era.startYear)} → {formatYearShort(era.endYear)}
                </span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group
            heading="Regions"
            className={cn(
              "px-2 pb-2 pt-1",
              "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-2",
              "[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium",
              "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em]",
              "[&_[cmdk-group-heading]]:text-ink-muted",
            )}
          >
            {regions.map((r) => (
              <Command.Item
                key={r.id}
                value={`${r.label} ${r.description}`}
                onSelect={() => {
                  // Regions don't have their own route in v1; jump to eras page.
                  go(`/eras`);
                }}
                className={cn(
                  "flex cursor-pointer items-baseline justify-between gap-4 px-2 py-2",
                  "text-sm text-ink-muted",
                  "aria-selected:bg-ink/[0.04] dark:aria-selected:bg-ink/[0.06]",
                )}
              >
                <span>{r.label}</span>
                <span className="text-[10px] uppercase tracking-[0.14em]">soon</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        <div className="border-t border-rule px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
          <span className="font-mono">↑ ↓</span> navigate ·{" "}
          <span className="font-mono">↵</span> open · <span className="font-mono">esc</span> close
        </div>
      </Command>
    </div>
  );
}

function formatYearShort(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  if (y === 0) return "1 CE";
  return `${y}`;
}
