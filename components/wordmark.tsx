import { cn } from "@/lib/utils";

/**
 * The handwritten Therestory wordmark. Uses the raw PNG so the exact ink
 * strokes stay intact. In dark mode we invert the artwork so black becomes
 * white — this only works because the source is a pure black-on-transparent
 * PNG. If we ever swap in a coloured mark, replace `dark:invert` with a
 * dark-mode-specific asset.
 */
export function Wordmark({
  className,
  size = 26,
  alt = "Therestory",
}: {
  className?: string;
  /** rendered height in px (aspect ratio is preserved) */
  size?: number;
  alt?: string;
}) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const src = `${base}/wordmark.png`;
  const width = Math.round((size * 442) / 207);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={size}
      className={cn(
        "block h-auto object-contain select-none",
        "dark:invert",
        className,
      )}
      style={{ height: size, width }}
      draggable={false}
    />
  );
}
