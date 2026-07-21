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
      immutable
      containerProps={{ style: { width: "100%" } }}
    />
  );
}
