import { cn } from "@/lib/utils";
import { formatDate, formatRange, type HistoricalDate } from "@/lib/date/format";

type Size = "xl" | "md" | "sm" | "tick";

const sizeMap: Record<Size, string> = {
  xl: "text-[32px] leading-8 tracking-[-0.02em]",
  md: "text-sm leading-[1.3]",
  sm: "text-xs leading-none",
  tick: "text-[11px] leading-none tracking-[0.02em]",
};

export function MonoDate({
  date,
  range = false,
  size = "md",
  className,
}: {
  date: HistoricalDate;
  range?: boolean;
  size?: Size;
  className?: string;
}) {
  const text = range ? formatRange(date) : formatDate(date);
  return (
    <time
      dateTime={date.start}
      className={cn("font-mono tabular-nums", sizeMap[size], className)}
    >
      {text}
    </time>
  );
}
