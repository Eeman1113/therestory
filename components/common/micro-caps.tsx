import { cn } from "@/lib/utils";
import type { ElementType, HTMLAttributes } from "react";

type Props<T extends ElementType = "span"> = {
  as?: T;
  className?: string;
} & HTMLAttributes<HTMLElement>;

export function MicroCaps<T extends ElementType = "span">({
  as,
  className,
  ...rest
}: Props<T>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted",
        className,
      )}
      {...rest}
    />
  );
}
