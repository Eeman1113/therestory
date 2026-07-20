"use client";

import { useCallback, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const bindMounted = useCallback((node: HTMLButtonElement | null) => {
    if (node) setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      ref={bindMounted}
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      suppressHydrationWarning
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center text-ink-muted transition-colors hover:text-ink",
        className,
      )}
    >
      <Icon size={16} strokeWidth={1.5} aria-hidden />
    </button>
  );
}
