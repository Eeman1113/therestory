"use client";

/**
 * Client-only Highcharts host. Kept in a separate file so
 * `dynamic(() => import(...), { ssr: false })` in TimelineCanvas can code-split
 * Highcharts out of the initial bundle and away from the server render entirely.
 */

import { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/timeline";
import HighchartsReact from "highcharts-react-official";

// Bypass Highcharts's HTML sanitizer for our tooltip: our HTML is all our
// own trusted content (no user input), and the sanitizer was stripping the
// <img> tag entirely (which is why hero images never rendered) plus firing
// warning #33 on every hover.
if (typeof window !== "undefined") {
  const HC = Highcharts as unknown as {
    AST: { bypassHTMLFiltering: boolean; allowedTags?: string[]; allowedAttributes?: string[] };
  };
  if (HC.AST) {
    HC.AST.bypassHTMLFiltering = true;
    // Belt-and-suspenders: also whitelist img so if bypass isn't honored,
    // the tag survives sanitization.
    if (HC.AST.allowedTags && !HC.AST.allowedTags.includes("img")) HC.AST.allowedTags.push("img");
    if (HC.AST.allowedAttributes) {
      for (const attr of ["src", "alt", "loading", "decoding", "crossorigin", "referrerpolicy"]) {
        if (!HC.AST.allowedAttributes.includes(attr)) HC.AST.allowedAttributes.push(attr);
      }
    }
  }
  // Expose for debugging.
  (window as unknown as { __HC?: unknown }).__HC = Highcharts;
}

export function HighchartsHost({
  options,
  onChartMounted,
}: {
  options: Highcharts.Options;
  onChartMounted?: (chart: Highcharts.Chart) => void;
}) {
  const ref = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    // The wrapper exposes the chart instance via ref — bubble it up so parents
    // can drive zoom/pan/etc. imperatively.
    if (ref.current?.chart && onChartMounted) {
      onChartMounted(ref.current.chart);
    }
  }, [onChartMounted, options]);

  return (
    <HighchartsReact
      ref={ref}
      highcharts={Highcharts}
      options={options}
      containerProps={{ style: { width: "100%" } }}
    />
  );
}
