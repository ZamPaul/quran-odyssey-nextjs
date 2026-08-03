"use client";

// src/components/form/TimezoneSelect.jsx  (NEW)
//
// Timezone picker scoped to the selected country.
//
//   • 91% of countries have exactly ONE clock  → resolved automatically,
//     the user makes no decision and cannot get it wrong.
//   • Multi-clock countries show their DISTINCT CLOCKS (US 8, Canada 10),
//     not the raw IANA list (US 29, Canada 23).
//   • Every option shows the CURRENT LOCAL TIME there — so it can be
//     verified against reality ("what time is it where you are?").
//   • Escape hatch: search every IANA zone (expats, VPNs, bad country data).
//   • Soft warning when the saved zone doesn't belong to the country.
//     Warn, never block — expats are real.
//
// Usage:
//   <TimezoneSelect
//     country={form.country}                 // country NAME (matches CountrySelect)
//     value={form.timezone}
//     onChange={(tz) => set('timezone', tz)}
//   />

import { useEffect, useMemo, useRef, useState } from "react";
import { TIMEZONES_BY_COUNTRY, ZONE_LABELS } from "@/lib/timezonesByCountry";

// ── helpers ───────────────────────────────────────────────
function cityOf(zone) {
  return (zone || "").split("/").pop().replace(/_/g, " ");
}
function labelOf(zone) {
  return ZONE_LABELS[zone] || cityOf(zone);
}
function timeIn(zone, at) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: zone, hour12: false, hour: "2-digit", minute: "2-digit",
    }).format(at);
  } catch { return "--:--"; }
}
function offsetIn(zone, at) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone, timeZoneName: "shortOffset",
    }).formatToParts(at);
    return parts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch { return ""; }
}
function allZones() {
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      return Intl.supportedValuesOf("timeZone");
    }
  } catch {}
  // Fallback for older browsers: the zones we ship.
  return [...new Set(Object.values(TIMEZONES_BY_COUNTRY).flat())].sort();
}

export default function TimezoneSelect({
  country,
  value,
  onChange,
  id = "timezone",
  invalid = false,
  disabled = false,
}) {
  const zones = useMemo(
    () => (country && TIMEZONES_BY_COUNTRY[country]) || [],
    [country],
  );

  const [searchAll, setSearchAll] = useState(false);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(() => new Date());

  // Live clock so the displayed times stay honest.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Auto-resolve single-clock countries. Also re-resolve when the country
  // changes to one whose clocks don't include the current value.
  const prevCountry = useRef(country);
  
  useEffect(() => {
    const changed = prevCountry.current !== country;
    prevCountry.current = country;
    if (!zones.length) return;
    if (zones.length === 1) {
      if (value !== zones[0]) onChange(zones[0]);
      return;
    }
    // Multi-clock: clear a stale value that belongs to the previous country.
    if (changed && value && !zones.includes(value)) onChange("");
  }, [country, zones]); // eslint-disable-line react-hooks/exhaustive-deps

  const mismatch = !!value && zones.length > 0 && !zones.includes(value);

  const searchResults = useMemo(() => {
    if (!searchAll) return [];
    const q = query.trim().toLowerCase();
    const list = allZones();
    if (!q) return list.slice(0, 60);
    return list.filter((z) => z.toLowerCase().includes(q)).slice(0, 60);
  }, [searchAll, query]);

  // ── No country yet ──────────────────────────────────────
  if (!country && !searchAll) {
    return (
      <div style={box(invalid)}>
        <div style={muted}>Choose a country first — the timezone follows from it.</div>
        <button type="button" onClick={() => setSearchAll(true)} style={linkBtn}>
          or search all timezones
        </button>
      </div>
    );
  }

  // ── Search-all mode ─────────────────────────────────────
  if (searchAll) {
    return (
      <div style={box(invalid)}>
        <input
          id={id}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search e.g. Toronto, Dubai, GMT…"
          autoComplete="off"
          style={input}
        />
        <div style={{ maxHeight: 200, overflowY: "auto", marginTop: 6 }}>
          {searchResults.length === 0 ? (
            <div style={{ ...muted, padding: "8px 2px" }}>No match</div>
          ) : (
            searchResults.map((z) => (
              <div
                key={z}
                onClick={() => { onChange(z); setSearchAll(false); setQuery(""); }}
                style={{
                  ...row,
                  background: z === value ? "rgba(40,183,217,0.08)" : "transparent",
                }}
              >
                <span style={{ flex: 1, color: "#0f172a" }}>{z.replace(/_/g, " ")}</span>
                <span style={timeChip}>{timeIn(z, now)}</span>
                <span style={offChip}>{offsetIn(z, now)}</span>
              </div>
            ))
          )}
        </div>
        <button type="button" onClick={() => { setSearchAll(false); setQuery(""); }} style={linkBtn}>
          ← back to {country ? country : "country"} timezones
        </button>
      </div>
    );
  }

  // ── Single clock: resolved, nothing to decide ───────────
  if (zones.length === 1) {
    const z = zones[0];
    return (
      <div style={box(invalid)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
              {labelOf(z)} <span style={{ fontWeight: 500, color: "#94a3b8" }}>· {z}</span>
            </div>
            <div style={{ fontSize: 12, color: "#0e6e8a", fontWeight: 700, marginTop: 2 }}>
              Local time there now: {timeIn(z, now)} ({offsetIn(z, now)})
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setSearchAll(true)} style={linkBtn}>
          Not right? Search all timezones
        </button>
      </div>
    );
  }

  // ── Multiple clocks: pick one ───────────────────────────
  return (
    <div style={box(invalid)}>
      <div style={{ ...muted, marginBottom: 6 }}>
        {country} has {zones.length} time zones — pick the one matching the local time.
      </div>
      <div style={{ maxHeight: 230, overflowY: "auto" }}>
        {zones.map((z) => {
          const selected = z === value;
          return (
            <div
              key={z}
              onClick={() => !disabled && onChange(z)}
              style={{
                ...row,
                border: `1px solid ${selected ? "#28b7d9" : "transparent"}`,
                background: selected ? "rgba(40,183,217,0.08)" : "transparent",
              }}
            >
              <span style={{ flex: 1 }}>
                <span style={{ fontSize: 13.5, fontWeight: selected ? 700 : 600, color: "#0f172a" }}>
                  {labelOf(z)}
                </span>
                <span style={{ fontSize: 11.5, color: "#94a3b8", marginLeft: 6 }}>{cityOf(z)}</span>
              </span>
              <span style={timeChip}>{timeIn(z, now)}</span>
              <span style={offChip}>{offsetIn(z, now)}</span>
            </div>
          );
        })}
      </div>

      {mismatch && (
        <div style={warn}>
          Saved timezone <strong>{value}</strong> isn’t one of {country}’s. Fine for
          someone living abroad — otherwise pick from the list.
        </div>
      )}

      <button type="button" onClick={() => setSearchAll(true)} style={linkBtn}>
        Not listed? Search all timezones
      </button>
    </div>
  );
}

// ── styles ────────────────────────────────────────────────
const box = (invalid) => ({
  border: `1px solid ${invalid ? "#fecaca" : "#e2e8f0"}`,
  borderRadius: 10,
  padding: 12,
  background: "white",
});
const muted = { fontSize: 12, color: "#94a3b8" };
const input = {
  width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0",
  fontSize: 13, color: "#0f172a", outline: "none", boxSizing: "border-box",
};
const row = {
  display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
  borderRadius: 8, cursor: "pointer",
};
const timeChip = {
  fontSize: 13, fontWeight: 800, color: "#0e6e8a", fontVariantNumeric: "tabular-nums",
  minWidth: 46, textAlign: "right",
};
const offChip = { fontSize: 11, color: "#94a3b8", minWidth: 62, textAlign: "right" };
const linkBtn = {
  marginTop: 8, background: "none", border: "none", padding: 0,
  fontSize: 12, fontWeight: 700, color: "#0e6e8a", cursor: "pointer",
};
const warn = {
  marginTop: 8, fontSize: 12, color: "#92400e", background: "rgba(250,167,26,0.12)",
  border: "1px solid rgba(250,167,26,0.3)", borderRadius: 8, padding: "8px 10px",
}; 