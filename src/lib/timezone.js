// src/lib/timezone.js  (NEW)
//
// Single helper for auto-detecting the browser timezone. Parents/students
// never type this — it's detected and sent silently.

export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// Convert a 'YYYY-MM-DDTHH:mm' wall-clock string in `timeZone` to a UTC ISO string.
export function zonedInputToUtcISO(localInput, timeZone) {
  if (!localInput) return null;
  const [datePart, timePart] = localInput.split('T');
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, mi] = timePart.split(':').map(Number);
  const wallAsUTC = Date.UTC(y, mo - 1, d, h, mi, 0);
  const offAt = (instant) => {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const parts = dtf.formatToParts(new Date(instant));
    const m = {}; for (const p of parts) m[p.type] = p.value;
    const hh = m.hour === '24' ? 0 : +m.hour;
    return Date.UTC(+m.year, +m.month - 1, +m.day, hh, +m.minute, +m.second) - instant;
  };
  const off1 = offAt(wallAsUTC);
  let utc = wallAsUTC - off1;
  const off2 = offAt(utc);
  if (off2 !== off1) utc = wallAsUTC - off2;
  return new Date(utc).toISOString();
}
