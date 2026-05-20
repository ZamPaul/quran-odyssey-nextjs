"use client";

import { useMemo, useState } from "react";

const SUBJECTS = [
  { value: "", label: "Select a topic" },
  { value: "trial", label: "Booking a free trial" },
  { value: "pricing", label: "Pricing / packages" },
  { value: "teacher", label: "Teacher / course guidance" },
  { value: "technical", label: "Technical / platform issue" },
  { value: "other", label: "Other" },
];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const errors = useMemo(() => {
    const next = {};
    if (values.name.trim().length <= 1) next.name = "Please enter your name.";
    if (!isValidEmail(values.email.trim()))
      next.email = "Please enter a valid email.";
    if (!values.subject) next.subject = "Please choose a subject.";
    if (values.message.trim().length <= 10)
      next.message = "Please write a slightly longer message.";
    return next;
  }, [values]);

  const charCount = values.message.length;

  const setField = (field, value) =>
    setValues((v) => ({ ...v, [field]: value }));

  const markTouched = (field) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const onSubmit = async () => {
    setTouched({ name: true, email: true, subject: true, message: true });
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    // Matches the HTML: fake submit + success state
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="form-success rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--success)_20%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,white)] p-6">
        <div className="flex items-start gap-3">
          <div className="mt-[2px] flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_20%,white)] text-[color-mix(in_srgb,var(--success)_70%,black)]">
            ✓
          </div>
          <div>
            <div className="text-[16px] font-[900] text-content-primary">
              Message sent.
            </div>
            <div className="mt-1 text-[13px] font-[600] text-content-muted">
              We&apos;ll reply within 24 hours. If it&apos;s urgent, WhatsApp us for
              the fastest response.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          id="name"
          label="Full name"
          value={values.name}
          placeholder="Your name"
          error={touched.name ? errors.name : ""}
          onBlur={() => markTouched("name")}
          onChange={(v) => setField("name", v)}
        />
        <Field
          id="email"
          label="Email"
          value={values.email}
          placeholder="you@example.com"
          error={touched.email ? errors.email : ""}
          onBlur={() => markTouched("email")}
          onChange={(v) => setField("email", v)}
        />
      </div>

      <FieldSelect
        id="subject"
        label="Subject"
        value={values.subject}
        error={touched.subject ? errors.subject : ""}
        onBlur={() => markTouched("subject")}
        onChange={(v) => setField("subject", v)}
        options={SUBJECTS}
      />

      <FieldTextarea
        id="message"
        label="Message"
        value={values.message}
        placeholder="Tell us about your child, your goals, and what you’d like help with…"
        error={touched.message ? errors.message : ""}
        onBlur={() => markTouched("message")}
        onChange={(v) => setField("message", v)}
      />

      <div className="text-right text-[11px] font-[500] text-content-subtle">
        {charCount} / 600
      </div>

      <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
        <button
          type="button"
          className="btn-submit inline-flex items-center justify-center rounded-[var(--radius)] bg-brand-amber px-6 py-3 text-[14px] font-[900] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark disabled:opacity-60 disabled:hover:translate-y-0"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "Sending…" : "Send message"}
        </button>
        <p className="text-[12px] font-[600] text-content-muted">
          We never share your details. Read our privacy policy.
        </p>
      </div>
    </div>
  );
}

function Field({ id, label, value, placeholder, error, onChange, onBlur }) {
  return (
    <div className={["field flex flex-col gap-2", error ? "field-error" : ""].join(" ")}>
      <label htmlFor={`inp-${id}`} className="text-[12px] font-[700] text-content-primary">
        {label}
      </label>
      <input
        id={`inp-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={[
          "w-full rounded-[var(--radius-sm)] border border-line-light bg-white px-4 py-[11px] text-[14px] font-[500] text-content-primary outline-none transition",
          "placeholder:text-content-subtle focus:border-brand-cyan focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
          error
            ? "border-[#ef4444] shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
            : "",
        ].join(" ")}
      />
      {error ? <div className="text-[11px] font-[600] text-[#ef4444]">{error}</div> : null}
    </div>
  );
}

function FieldSelect({ id, label, value, error, onChange, onBlur, options }) {
  return (
    <div className={["field flex flex-col gap-2", error ? "field-error" : ""].join(" ")}>
      <label htmlFor={`inp-${id}`} className="text-[12px] font-[700] text-content-primary">
        {label}
      </label>
      <select
        id={`inp-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={[
          "w-full cursor-pointer appearance-none rounded-[var(--radius-sm)] border border-line-light bg-white px-4 py-[11px] pr-9 text-[14px] font-[600] text-content-primary outline-none transition",
          "focus:border-brand-cyan focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
          error
            ? "border-[#ef4444] shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
            : "",
        ].join(" ")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <div className="text-[11px] font-[600] text-[#ef4444]">{error}</div> : null}
    </div>
  );
}

function FieldTextarea({ id, label, value, placeholder, error, onChange, onBlur }) {
  return (
    <div className={["field flex flex-col gap-2", error ? "field-error" : ""].join(" ")}>
      <label htmlFor={`inp-${id}`} className="text-[12px] font-[700] text-content-primary">
        {label}
      </label>
      <textarea
        id={`inp-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={600}
        className={[
          "min-h-[110px] w-full resize-y rounded-[var(--radius-sm)] border border-line-light bg-white px-4 py-[11px] text-[14px] font-[500] leading-[1.6] text-content-primary outline-none transition",
          "placeholder:text-content-subtle focus:border-brand-cyan focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
          error
            ? "border-[#ef4444] shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
            : "",
        ].join(" ")}
      />
      {error ? <div className="text-[11px] font-[600] text-[#ef4444]">{error}</div> : null}
    </div>
  );
}

