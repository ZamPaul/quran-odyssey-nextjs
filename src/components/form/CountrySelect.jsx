"use client";

// src/components/form/CountrySelect.jsx  (NEW)
//
// Searchable country combobox. Type to filter ~235 ISO 3166 countries;
// common countries (UK/US/Canada) float to the top when no search is active.
// Keyboard: ↑/↓ to move, Enter to pick, Esc to close.
//
// Controlled: value is the country NAME string (matches how the backend
// stores Student.country today — a plain string).
//
// Usage:
//   <CountrySelect value={form.country} onChange={(c) => set('country', c)} />

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, COMMON_COUNTRIES } from "@/lib/countries";

export default function CountrySelect({
  value,
  onChange,
  placeholder = "Search country…",
  id = "country",
  invalid = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // No search: commons first, then the rest (minus commons), all alphabetical.
      const rest = COUNTRIES.filter((c) => !COMMON_COUNTRIES.includes(c));
      return [...COMMON_COUNTRIES, ...rest];
    }
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  const choose = (c) => {
    onChange(c);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (options[highlight]) choose(options[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  // Keep highlighted row in view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlight];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* Trigger / search input */}
      <div
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 46,
          padding: "0 14px",
          borderRadius: "var(--radius-md, 8px)",
          border: `1px solid ${invalid ? "#f87171" : open ? "#28b7d9" : "#e2e8f0"}`,
          background: "white",
          cursor: "text",
          transition: "border-color 150ms",
        }}
      >
        <input
          id={id}
          value={open ? query : value || ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={value ? value : placeholder}
          autoComplete="off"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 14,
            color: "#0f172a",
            background: "transparent",
          }}
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            color: "#94a3b8",
            transform: open ? "rotate(180deg)" : "none",
            transition: "200ms",
            flexShrink: 0,
          }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 60,
            maxHeight: 260,
            overflowY: "auto",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            boxShadow: "0 12px 32px rgba(13,40,64,0.12)",
            padding: 4,
          }}
        >
          {options.length === 0 ? (
            <div
              style={{ padding: "12px 14px", fontSize: 13, color: "#94a3b8" }}
            >
              No match
            </div>
          ) : (
            options.map((c, i) => {
              const active = i === highlight;
              const selected = c === value;
              const isCommonDivider =
                !query.trim() && i === COMMON_COUNTRIES.length;
              return (
                <div key={c}>
                  {isCommonDivider && (
                    <div
                      style={{
                        height: 1,
                        background: "#f0f4f8",
                        margin: "4px 8px",
                      }}
                    />
                  )}
                  <div
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => choose(c)}
                    style={{
                      padding: "9px 12px",
                      borderRadius: 7,
                      fontSize: 13.5,
                      cursor: "pointer",
                      color: selected ? "#0e6e8a" : "#0f172a",
                      fontWeight: selected ? 700 : 500,
                      background: active
                        ? "rgba(40,183,217,0.10)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {c}
                    {selected && <span style={{ color: "#28b7d9" }}>✓</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
