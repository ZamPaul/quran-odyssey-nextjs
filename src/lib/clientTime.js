// src/lib/clientTime.js  (REPLACE — adds admin-timezone helpers)
//
// ONE home for browser-side wall-clock⇄UTC conversion in a given IANA zone.
// The create modal, bulk modal, SessionPanel and the sessions list all import
// from here so the logic can't drift between them. Mirrors the tested backend
// zonedWallClockToUtc (same two-pass DST algorithm).
//
// NOTE ON CONVENTION (changed): admin session inputs/displays are now anchored
// to the ADMIN's local timezone (getAdminTimezone), not the student's. The
// student's zone is still used for the "Student sees …" readouts so nobody
// schedules blind for a family in another country.

// Offset (ms) of `timeZone` at a given UTC instant.
function offsetAt(timeZone, instantMs) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const m = {};
  for (const p of dtf.formatToParts(new Date(instantMs))) m[p.type] = p.value;
  const hh = m.hour === "24" ? 0 : +m.hour;
  return (
    Date.UTC(+m.year, +m.month - 1, +m.day, hh, +m.minute, +m.second) -
    instantMs
  );
}

/**
 * A 'YYYY-MM-DDTHH:mm' wall-clock string, interpreted in `timeZone`, → UTC ISO.
 * DST-correct (two-pass). Returns null for empty input.
 */
export function zonedInputToUtcISO(localInput, timeZone) {
  if (!localInput) return null;
  const [datePart, timePart] = localInput.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);
  const wallAsUTC = Date.UTC(y, mo - 1, d, h, mi, 0);
  const off1 = offsetAt(timeZone, wallAsUTC);
  let utc = wallAsUTC - off1;
  const off2 = offsetAt(timeZone, utc);
  if (off2 !== off1) utc = wallAsUTC - off2;
  return new Date(utc).toISOString();
}

/**
 * A UTC instant (Date | ISO string) → the 'YYYY-MM-DDTHH:mm' wall-clock
 * string AS SEEN IN `timeZone`. Use this to seed <input type="datetime-local">.
 */
export function utcToZonedInput(utcInstant, timeZone) {
  if (!utcInstant) return "";
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const m = {};
  for (const p of dtf.formatToParts(new Date(utcInstant))) m[p.type] = p.value;
  const hh = m.hour === "24" ? "00" : m.hour;
  return `${m.year}-${m.month}-${m.day}T${hh}:${m.minute}`;
}

/** Pretty display of a UTC instant in a given zone, 24-hour. */
export function formatInZone(utcInstant, timeZone, opts = {}) {
  return new Date(utcInstant).toLocaleString("en-GB", {
    timeZone,
    hour12: false,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  });
}

// ─── NEW: admin-timezone helpers ──────────────────────────

/**
 * The admin's own IANA timezone, from the browser. Never throws.
 *
 * Safe against SSR/hydration in this app because every timezone-dependent
 * render happens AFTER a client-side fetch or a user interaction (the modals
 * only mount on click; the list renders only once `sessions` has loaded).
 * If you ever render a zone label during the first server pass, move this into
 * a useEffect-backed state instead.
 */
export function getAdminTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Short zone label for display, e.g. "GMT+5", "BST", "EDT". Falls back to the IANA name. */
export function zoneAbbr(timeZone, at = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(at);
    return parts.find((p) => p.type === "timeZoneName")?.value || timeZone;
  } catch {
    return timeZone;
  }
}

/**
 * The 'YYYY-MM-DD' calendar day of a UTC instant AS SEEN IN `timeZone`.
 * Use this for day-bucketing/grouping — NOT toISOString().slice(0,10), which
 * buckets by UTC and puts late-evening sessions under the wrong day.
 */
export function zonedDateKey(utcInstant, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const m = {};
  for (const p of dtf.formatToParts(new Date(utcInstant))) m[p.type] = p.value;
  return `${m.year}-${m.month}-${m.day}`;
}

/** Human day label from a 'YYYY-MM-DD' key, relative to today in `timeZone`. */
export function dayLabelFromKey(dateKey, timeZone) {
  const todayKey = zonedDateKey(new Date(), timeZone);
  const [y, mo, d] = dateKey.split("-").map(Number);
  const [ty, tmo, td] = todayKey.split("-").map(Number);
  const diff = Math.round(
    (Date.UTC(y, mo - 1, d) - Date.UTC(ty, tmo - 1, td)) / 86400000,
  );
  const base = new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  if (diff === 0) return `Today · ${base}`;
  if (diff === 1) return `Tomorrow · ${base}`;
  if (diff === -1) return `Yesterday · ${base}`;
  return base;
}