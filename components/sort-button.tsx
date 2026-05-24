"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "date-asc",   label: "Date — soonest first" },
  { value: "date-desc",  label: "Date — latest first" },
  { value: "price-asc",  label: "Price — lowest first" },
  { value: "price-desc", label: "Price — highest first" },
  { value: "nights-asc", label: "Duration — shortest first" },
  { value: "nights-desc",label: "Duration — longest first" },
];

export function SortButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const current = searchParams.get("sortBy") ?? "date-asc";
  const currentLabel = SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Date — soonest first";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "date-asc") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }
    params.delete("offset");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          fontSize: 13,
          fontWeight: 500,
          border: "1px solid var(--border)",
          borderRadius: 6,
          background: "var(--surface)",
          color: "var(--ink)",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <SortIcon />
        <span>{currentLabel}</span>
        <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 2 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Sort options"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            zIndex: 50,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            minWidth: 220,
            overflow: "hidden",
            padding: "4px 0",
          }}
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = option.value === current;
            return (
              <button
                key={option.value}
                role="option"
                aria-selected={isActive}
                onClick={() => setSort(option.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 14px",
                  fontSize: 13,
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: isActive ? "var(--ink)" : "var(--muted)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <span style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: `2px solid ${isActive ? "var(--ink)" : "var(--border)"}`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {isActive && (
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--ink)",
                      display: "block",
                    }} />
                  )}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SortIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <path d="M2 4h9M4 7h5M6 10h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
