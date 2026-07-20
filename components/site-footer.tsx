import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";

export function SiteFooter() {
  return (
    <footer className="mt-24">
      <HairlineRule />
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-8 py-8 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="max-w-md text-sm text-ink-muted">
          Therestory is a global history in progress. Every fact is sourced,
          every image credited. Corrections welcome.
        </p>
        <div className="flex items-baseline gap-6">
          <MicroCaps>v0.1 — in development</MicroCaps>
        </div>
      </div>
    </footer>
  );
}
