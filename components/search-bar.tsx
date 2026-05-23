"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
}

export function SearchBar({ defaultValue = "", placeholder = "Search cruises — destination, port, ship..." }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const data = new FormData(form);
      const q = (data.get("q") as string)?.trim();
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <form onSubmit={handleSubmit} role="search">
      <div style={{ display: "flex", gap: 8 }}>
        <label htmlFor="search-input" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
          Search cruises
        </label>
        <input
          id="search-input"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            flex: 1,
            height: 48,
            padding: "0 16px",
            fontSize: 16,
            border: "1px solid var(--border)",
            borderRadius: 8,
            backgroundColor: "var(--surface)",
            color: "var(--ink)",
            outline: "none",
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          style={{
            height: 48,
            padding: "0 24px",
            backgroundColor: "var(--accent)",
            color: "var(--accent-fg)",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
            minWidth: 44,
          }}
        >
          Search
        </button>
      </div>
    </form>
  );
}
