"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import { openPalette } from "@/components/palette-trigger";
import { Wordmark } from "@/components/wordmark";

/**
 * MobileNav — the hamburger + slide-in sheet used at sub-`sm` widths.
 * Same links as the desktop nav, plus a search entry that fires the ⌘K palette.
 * Keeps the sheet dependency-free (no headless UI, no radix): just an inline
 * overlay + panel with focus trap and Esc to close.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on route change. Skip the initial mount so we don't spuriously
  // toggle state during the first render.
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    setOpen(false);
  }, [pathname]);

  // Esc to close + focus management + scroll lock.
  useEffect(() => {
    if (!open) return;
    // Capture the current trigger element for a stable cleanup reference.
    const triggerAtOpen = triggerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the first link after the panel paints.
    const raf = requestAnimationFrame(() => firstLinkRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(raf);
      // Return focus to the trigger on close.
      triggerAtOpen?.focus();
    };
  }, [open]);

  const handleSearch = useCallback(() => {
    setOpen(false);
    // Wait a tick so the sheet is unmounted before the palette mounts —
    // avoids two scroll-locks fighting.
    requestAnimationFrame(() => openPalette());
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-sheet"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center text-ink-muted transition-colors hover:text-ink"
      >
        {open ? (
          <X size={20} strokeWidth={1.5} aria-hidden />
        ) : (
          <Menu size={20} strokeWidth={1.5} aria-hidden />
        )}
      </button>

      {open && (
        <div
          id="mobile-nav-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 sm:hidden"
        >
          {/* Backdrop — quiet ink wash, no candy blur. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 cursor-default bg-ink/40"
          />
          {/* Panel — full width, top-anchored sheet in the paper palette. */}
          <div
            className="relative ml-auto flex h-full w-full max-w-[380px] flex-col bg-bg"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <Link
                href="/"
                onClick={close}
                className="inline-flex items-center gap-3"
                aria-label="Therestory — home"
              >
                <Wordmark size={32} />
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="inline-flex h-11 w-11 items-center justify-center text-ink-muted transition-colors hover:text-ink"
              >
                <X size={20} strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <HairlineRule />
            <nav
              aria-label="Primary"
              className="flex flex-1 flex-col gap-1 px-5 pt-6"
            >
              <MobileLink ref={firstLinkRef} href="/events" onClick={close}>
                Events
              </MobileLink>
              <MobileLink href="/eras" onClick={close}>
                Eras
              </MobileLink>
              <MobileLink href="/about" onClick={close}>
                About
              </MobileLink>
              <button
                type="button"
                onClick={handleSearch}
                className="mt-2 inline-flex min-h-[48px] items-baseline justify-between border-b border-rule py-3 text-left text-lg text-ink-muted transition-colors hover:text-ink"
              >
                <span>Search</span>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted/80">
                  ⌘K
                </span>
              </button>
            </nav>
            <div className="mt-auto px-5 pb-6 pt-8">
              <MicroCaps>Therestory</MicroCaps>
              <p className="mt-2 max-w-[32ch] text-xs leading-5 text-ink-muted">
                A global history in progress. Every fact is sourced, every
                image credited.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const MobileLink = function MobileLink({
  ref,
  href,
  onClick,
  children,
}: {
  ref?: React.Ref<HTMLAnchorElement>;
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      className="inline-flex min-h-[48px] items-baseline border-b border-rule py-3 text-lg text-ink transition-colors hover:text-accent"
    >
      {children}
    </Link>
  );
};
