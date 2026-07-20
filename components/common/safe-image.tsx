"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders an image with a graceful placeholder if the URL fails to load.
 * Wikimedia file paths do occasionally 404 when renamed/deleted upstream — this
 * keeps the layout intact and hides the raw broken-image icon.
 */
export function SafeImage({
  src,
  alt,
  className,
  loading = "lazy",
  aspectRatio,
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  aspectRatio?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        aria-label={`Missing image: ${alt}`}
        className={cn(
          "flex items-center justify-center border border-rule bg-surface p-6 text-center text-xs text-ink-muted",
          className,
        )}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <span className="line-clamp-6">Image temporarily unavailable</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setBroken(true)}
      className={cn("bg-surface", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    />
  );
}
