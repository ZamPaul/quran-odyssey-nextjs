"use client";

// src/components/form/DateOfBirthField.jsx  (NEW)
//
// One date input that shows the derived age beneath it. Replaces the
// manual "age" number field everywhere. Uses the app's existing age.js
// helper so the calculation is identical to the ProfileTab.
//
// Controlled: value is a 'YYYY-MM-DD' string (or ''). onChange gets that
// string. The parent derives age via ageFromDob when submitting.
//
// Usage:
//   <DateOfBirthField
//     value={form.dateOfBirth}
//     onChange={(v) => set('dateOfBirth', v)}
//     label="Child's date of birth *"
//   />

import { ageFromDob } from "@/lib/age";

export default function DateOfBirthField({
  value,
  onChange,
  label = "Date of birth *",
  id = "dateOfBirth",
  invalid = false,
  hint,
}) {
  const age = value ? ageFromDob(value) : null;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[13px] font-[700] text-content-primary"
      >
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value || ""}
        max={today} // no future dates
        onChange={(e) => onChange(e.target.value)}
        className="h-[46px] px-4 rounded-[var(--radius-md)] border bg-white text-[14px] text-content-primary outline-none focus:border-brand-cyan"
        style={{ borderColor: invalid ? "#f87171" : "#e2e8f0" }}
      />
      {value && (
        <div className="text-[12px] text-content-muted">
          Age:{" "}
          <span className="font-[700] text-content-primary">{age ?? "—"}</span>{" "}
          (calculated)
        </div>
      )}
      {hint && !value && (
        <div className="text-[12px] text-content-muted">{hint}</div>
      )}
    </div>
  );
}
