import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { HairlineRule } from "@/components/common/hairline-rule";
import { PaletteTrigger } from "@/components/palette-trigger";

export function SiteHeader() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-[1400px] items-baseline justify-between px-8 pt-6 pb-4">
        <Link
          href="/"
          className="group inline-flex items-baseline gap-2"
          aria-label="Therestory — home"
        >
          <span className="text-lg tracking-[-0.02em] font-medium">Therestory</span>
          <span className="font-mono text-[11px] tabular-nums text-ink-muted">
            /3500 BCE → 2026
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-6">
          <Link
            href="/events"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Events
          </Link>
          <Link
            href="/eras"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Eras
          </Link>
          <Link
            href="/about"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            About
          </Link>
          <PaletteTrigger className="hidden sm:inline" />
          <ThemeToggle />
        </nav>
      </header>
      <HairlineRule />
    </>
  );
}
