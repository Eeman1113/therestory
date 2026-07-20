import { cn } from "@/lib/utils";

/**
 * The handwritten Therestory wordmark, rendered as a CSS mask so it always
 * paints in the current theme ink colour (near-black on Paper, warm bone
 * on Ink). Using a mask instead of an <img> gives us pixel-perfect colour
 * control regardless of the source PNG's anti-aliasing.
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
  const maskCss = `url(${src}) center / contain no-repeat`;
  return (
    <span
      role="img"
      aria-label={alt}
      className={cn("inline-block bg-ink select-none align-middle", className)}
      style={{
        height: size,
        width,
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
        // Fallback shorthand for older parsers
        WebkitMask: maskCss,
        mask: maskCss,
      }}
    />
  );
}
