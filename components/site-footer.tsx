import Link from "next/link";
import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";
import { Wordmark } from "@/components/wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-24">
      <HairlineRule />
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Therestory — home">
          <Wordmark size={36} />
          <span className="max-w-md text-sm text-ink-muted">
            A global history in progress. Every fact is sourced, every image credited.
          </span>
        </Link>
        <div className="flex items-baseline gap-6">
          <MicroCaps>v0.1 — in development</MicroCaps>
        </div>
      </div>
    </footer>
  );
}
