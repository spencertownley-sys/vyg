"use client";

import { useState } from "react";
import Link from "next/link";

interface PhotoCardProps {
  href: string;
  name: string;
  photoUrl: string;
  count?: number;
}

export function PhotoCard({ href, name, photoUrl, count }: PhotoCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: 12,
        overflow: "hidden",
        textDecoration: "none",
        background: "#1a2636",
        cursor: "pointer",
      }}
    >
      {/* Photo */}
      {!imgError && (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImgError(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            willChange: "transform",
          }}
        />
      )}

      {/* Gradient overlay — darkens more on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered
            ? "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.06) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.16) 50%, rgba(0,0,0,0.0) 100%)",
          transition: "background 0.35s ease",
        }}
      />

      {/* Name + count */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 14px 14px",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            lineHeight: 1.25,
            letterSpacing: hovered ? "0.02em" : "0em",
            transform: hovered ? "scale(1.07)" : "scale(1)",
            transformOrigin: "left bottom",
            transition: "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), letter-spacing 0.35s ease",
          }}
        >
          {name}
        </div>
        {count !== undefined && (
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.72)",
              marginTop: 3,
              opacity: hovered ? 1 : 0.8,
              transition: "opacity 0.35s ease",
            }}
          >
            {count} sailing{count !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
