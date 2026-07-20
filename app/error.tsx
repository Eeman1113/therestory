"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MicroCaps } from "@/components/common/micro-caps";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Therestory global error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col items-start px-8 py-24">
      <MicroCaps as="p">Something broke</MicroCaps>
      <h1 className="mt-4 max-w-[24ch] text-[44px] leading-[1.05] tracking-[-0.02em]">
        A page failed to render.
      </h1>
      <p className="mt-6 max-w-[62ch] text-sm leading-6 text-ink-muted">
        This is a static site — if you&rsquo;re seeing this in production, something
        odd happened during a client-side transition. Try again, or return home.
      </p>
      <div className="mt-8 flex items-baseline gap-6">
        <button
          type="button"
          onClick={reset}
          className="border-b border-ink pb-1 text-base transition-colors hover:text-accent"
        >
          Retry
        </button>
        <Link
          href="/"
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Return home →
        </Link>
      </div>
    </div>
  );
}
