"use client";

import { useState } from "react";
import { LINE_META } from "@/lib/line-logos";

interface LineLogoProps {
  lineId: string;
  lineName: string;
}

export function LineLogo({ lineId, lineName }: LineLogoProps) {
  const meta = LINE_META[lineId];
  const [imgFailed, setImgFailed] = useState(false);

  const showImg = meta?.logoUrl && !imgFailed;

  if (showImg) {
    return (
      <img
        src={meta.logoUrl!}
        alt={lineName}
        height={20}
        style={{ objectFit: "contain", maxWidth: 90, display: "block" }}
        onError={() => setImgFailed(true)}
      />
    );
  }

  // Text badge with brand color accent
  const color = meta?.color ?? "var(--muted)";
  const short = meta?.short ?? lineName;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink)", letterSpacing: "0.02em" }}>
        {short}
      </span>
    </span>
  );
}
