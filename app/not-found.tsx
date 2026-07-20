import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MicroCaps } from "@/components/common/micro-caps";
import { HairlineRule } from "@/components/common/hairline-rule";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col items-start px-8 py-24">
      <MicroCaps as="p">404 · not in the record</MicroCaps>
      <h1 className="mt-4 max-w-[24ch] font-mono text-[112px] leading-[0.9] tracking-[-0.03em]">
        404
      </h1>
      <p className="mt-8 max-w-[62ch] text-lg leading-8 text-ink-muted">
        There is nothing at this address. Either the page has moved, the URL
        was mistyped, or the moment you were looking for hasn&rsquo;t been
        catalogued yet. If you were expecting content here, please open an
        issue on the repository.
      </p>
      <HairlineRule className="mt-12" />
      <ul className="mt-8 flex flex-col gap-6">
        <li>
          <Link
            href="/"
            className="group inline-flex items-baseline gap-3 border-b border-ink pb-1"
          >
            <span>Return to the timeline</span>
            <ArrowRight
              size={16}
              strokeWidth={1.5}
              className="translate-y-[2px] transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </li>
        <li>
          <Link
            href="/events"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            All events →
          </Link>
        </li>
        <li>
          <Link
            href="/eras"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Browse by era →
          </Link>
        </li>
      </ul>
    </div>
  );
}
