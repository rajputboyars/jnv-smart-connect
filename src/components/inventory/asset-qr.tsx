"use client";

import { useEffect, useRef } from "react";

export function AssetQr({ value, size = 160 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    let cancelled = false;

    // Dynamically imported: qrcode is only needed when an asset's QR label
    // dialog is actually opened, not as part of every Inventory page load.
    import("qrcode").then((QRCode) => {
      if (cancelled || !ref.current) return;
      QRCode.toCanvas(ref.current, value, { width: size, margin: 1 }).catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return <canvas ref={ref} width={size} height={size} aria-label={`QR code for ${value}`} />;
}
