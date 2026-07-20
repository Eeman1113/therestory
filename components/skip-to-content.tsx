/**
 * Keyboard-visible "Skip to content" link — hidden until focused.
 * Sits as the first tabbable element on every page.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:border focus:border-accent focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-ink focus:shadow-lg"
    >
      Skip to content
    </a>
  );
}
