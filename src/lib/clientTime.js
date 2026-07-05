// src/lib/clientTime.js  (NEW — shared client-side timezone helpers)
//
// ONE home for browser-side wall-clock⇄UTC conversion in a given IANA zone.
// The create modal, bulk modal, and SessionPanel all import from here so the
// logic can't drift between them again. Mirrors the tested backend
// zonedWallClockToUtc (same two-pass DST algorithm).

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
 * string AS SEEN IN `timeZone`. This is what a <input type="datetime-local">
 * must be seeded with so the admin sees the STUDENT's local time, not their own.
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
