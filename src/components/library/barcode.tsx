"use client";

import { useEffect, useRef } from "react";

export function Barcode({ value, height = 40 }: { value: string; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    let cancelled = false;

    // Dynamically imported: jsbarcode is only needed when a barcode dialog
    // is actually opened, not as part of every Library page's initial bundle.
    import("jsbarcode").then(({ default: JsBarcode }) => {
      if (cancelled || !ref.current) return;
      try {
        JsBarcode(ref.current, value, {
          format: "CODE128",
          height,
          width: 1.6,
          fontSize: 12,
          margin: 4,
          displayValue: true,
        });
      } catch {
        // Invalid characters for CODE128 — leave the SVG empty rather than crash.
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value, height]);

  return <svg ref={ref} role="img" aria-label={`Barcode for ${value}`} />;
}
