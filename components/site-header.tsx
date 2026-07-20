import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { HairlineRule } from "@/components/common/hairline-rule";
import { PaletteTrigger } from "@/components/palette-trigger";
import { Wordmark } from "@/components/wordmark";
import { MobileNav } from "@/components/mobile-nav";

export function SiteHeader() {
  return (
    <>
      <header
        className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-5 pt-5 pb-4 sm:px-8 sm:pt-6"
        style={{
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
        }}
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-3"
          aria-label="Therestory — home"
        >
          {/* Wordmark is a touch smaller on mobile so it doesn't dominate the row. */}
          <span className="inline-block sm:hidden">
            <Wordmark size={36} />
          </span>
          <span className="hidden sm:inline-block">
            <Wordmark size={48} />
          </span>
          <span className="hidden font-mono text-[11px] tabular-nums text-ink-muted sm:inline">
            /3500 BCE → 2026
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile in favour of the hamburger sheet. */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 sm:flex"
        >
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

        {/* Mobile controls — theme toggle stays visible; hamburger opens the sheet. */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle className="h-11 w-11" />
          <MobileNav />
        </div>
      </header>
      <HairlineRule />
    </>
  );
}
