"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QrCode({ value, size = 160, className }: QrCodeProps) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;

    void QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: "#004450",
        light: "#ffffff",
      },
    }).then((dataUrl) => {
      if (active) {
        setSrc(dataUrl);
      }
    });

    return () => {
      active = false;
    };
  }, [value, size]);

  if (!src) {
    return (
      <div
        className={`animate-pulse rounded-lg bg-mezi-border ${className ?? ""}`}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt={`QR code for ${value}`}
      width={size}
      height={size}
      className={`rounded-lg ${className ?? ""}`}
    />
  );
}
