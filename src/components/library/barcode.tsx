"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export function Barcode({ value, height = 40 }: { value: string; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
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
  }, [value, height]);

  return <svg ref={ref} role="img" aria-label={`Barcode for ${value}`} />;
}
