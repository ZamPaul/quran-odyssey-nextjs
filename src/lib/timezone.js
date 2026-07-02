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
