// app/register/profile/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const COURSES = [
  {
    value: "NOORANI_QAIDA",
    label: "Noorani Qaida",
    desc: "Arabic alphabet & basic reading · Ages 5–10",
  },
  {
    value: "QURAN_RECITATION",
    label: "Quran Recitation",
    desc: "Fluent recitation with Tajweed · All ages",
  },
  {
    value: "TAJWEED",
    label: "Tajweed Rules",
    desc: "Science of correct recitation · Ages 8+",
  },
  {
    value: "HIFZ",
    label: "Hifz Programme",
    desc: "Full Quran memorisation · Ages 7+",
  },
  {
    value: "ISLAMIC_STUDIES",
    label: "Islamic Studies",
    desc: "Stories, pillars, character · Ages 6–14",
  },
  {
    value: "ONE_TO_ONE",
    label: "One-to-One Private",
    desc: "Fully custom · All ages & levels",
  },
];

const COUNTRIES = [
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Ireland",
  "South Africa",
  "New Zealand",
  "Other",
];

export default function ProfilePage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [step, setStep] = useState(1); // 1 = parent info, 2 = child info, 3 = course
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    parentName: "",
    phone: "",
    childName: "",
    childAge: "",
    country: "",
    timezone: "",
    courseInterest: "",
  });

  // Auto-detect timezone on mount
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setForm((prev) => ({ ...prev, timezone: detected }));
  }, []);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.parentName.trim()) return "Please enter your full name.";
    }
    if (step === 2) {
      if (!form.childName.trim()) return "Please enter your child's name.";
      if (!form.childAge) return "Please enter your child's age.";
      if (!form.country) return "Please select your country.";
    }
    if (step === 3) {
      if (!form.courseInterest) return "Please select a course to get started.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setStep((s) => s + 1);
  };

  const submit = async () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = await getToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/students/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            parentName: form.parentName.trim(),
            phone: form.phone.trim() || undefined,
            childName: form.childName.trim(),
            childAge: parseInt(form.childAge, 10),
            country: form.country,
            timezone: form.timezone,
            courseInterest: form.courseInterest,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      console.log("student apis response: ", data);

      router.push("/dashboard");
    } catch (err) {
      console.log("ERROR: ", err);
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-off-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center py-8">
        <a href="/">
          <img src="/logo2.png" alt="Quran Odyssey" className="h-10 w-auto" />
        </a>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pb-12 pt-4">
        <div className="w-full max-w-[560px]">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-[700] text-content-muted">
                Step {step} of 3
              </span>
              <span className="text-[13px] font-[700] text-brand-cyan-dark">
                {step === 1
                  ? "Your details"
                  : step === 2
                    ? "Your child's details"
                    : "Choose a course"}
              </span>
            </div>
            <div className="h-[3px] w-full rounded bg-line-light overflow-hidden">
              <div
                className="h-full rounded bg-brand-cyan transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[var(--radius-lg)] border border-line-light p-8">
            {/* Step 1 — Parent Info */}
            {step === 1 && (
              <div>
                <h2 className="text-[22px] font-[800] tracking-[-0.03em] text-content-primary mb-1">
                  Tell us about yourself
                </h2>
                <p className="text-[14px] text-content-muted mb-6">
                  You&apos;re the parent or guardian creating this account.
                </p>

                <div className="flex flex-col gap-5">
                  <Field
                    label="Your full name *"
                    id="parentName"
                    type="text"
                    placeholder="e.g. Fatimah Ahmed"
                    value={form.parentName}
                    onChange={(v) => set("parentName", v)}
                  />
                  <Field
                    label="WhatsApp number (optional)"
                    id="phone"
                    type="tel"
                    placeholder="e.g. 447911123456 (no + sign)"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    hint="We'll send booking confirmations here. Include country code."
                  />
                </div>
              </div>
            )}

            {/* Step 2 — Child Info */}
            {step === 2 && (
              <div>
                <h2 className="text-[22px] font-[800] tracking-[-0.03em] text-content-primary mb-1">
                  Tell us about your child
                </h2>
                <p className="text-[14px] text-content-muted mb-6">
                  This helps us match the right teacher and course.
                </p>

                <div className="flex flex-col gap-5">
                  <Field
                    label="Child's first name *"
                    id="childName"
                    type="text"
                    placeholder="e.g. Ahmed"
                    value={form.childName}
                    onChange={(v) => set("childName", v)}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-[700] text-content-primary">
                        Child&apos;s age *
                      </label>
                      <select
                        className={selectClass}
                        value={form.childAge}
                        onChange={(e) => set("childAge", e.target.value)}
                      >
                        <option value="">Select age</option>
                        {Array.from({ length: 15 }, (_, i) => i + 4).map(
                          (age) => (
                            <option key={age} value={age}>
                              {age} years old
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-[700] text-content-primary">
                        Your country *
                      </label>
                      <select
                        className={selectClass}
                        value={form.country}
                        onChange={(e) => set("country", e.target.value)}
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-[700] text-content-primary">
                      Your timezone
                    </label>
                    <input
                      className={inputClass}
                      type="text"
                      value={form.timezone}
                      onChange={(e) => set("timezone", e.target.value)}
                    />
                    <p className="text-[11px] text-content-muted">
                      Auto-detected from your browser. Edit if incorrect.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Course Selection */}
            {step === 3 && (
              <div>
                <h2 className="text-[22px] font-[800] tracking-[-0.03em] text-content-primary mb-1">
                  What would you like to learn?
                </h2>
                <p className="text-[14px] text-content-muted mb-6">
                  Not sure? Your trial class teacher will recommend the best
                  starting point.
                </p>

                <div className="flex flex-col gap-3">
                  {COURSES.map((course) => (
                    <button
                      key={course.value}
                      type="button"
                      onClick={() => set("courseInterest", course.value)}
                      className={[
                        "w-full text-left rounded-[var(--radius)] border-2 p-4 transition-all",
                        form.courseInterest === course.value
                          ? "border-brand-cyan bg-[color-mix(in_srgb,var(--brand-cyan)_8%,transparent)]"
                          : "border-line-light bg-white hover:border-line-default",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[14px] font-[800] text-content-primary">
                            {course.label}
                          </div>
                          <div className="text-[12px] text-content-muted mt-[2px]">
                            {course.desc}
                          </div>
                        </div>
                        {form.courseInterest === course.value && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-cyan text-white text-[11px] font-[900] flex-shrink-0 ml-3">
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-[var(--radius-sm)] border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-[13px] font-[600] text-[#dc2626]">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="text-[14px] font-[700] text-content-muted hover:text-content-primary transition"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-6 py-[11px] text-[14px] font-[800] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-6 py-[11px] text-[14px] font-[800] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting
                    ? "Setting up your account…"
                    : "Book my free trial →"}
                </button>
              )}
            </div>
          </div>

          {/* Trust signal */}
          <p className="text-center text-[13px] text-content-muted mt-5">
            🔒 Your details are private and never shared.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable sub-components ──────────────────────────────

const inputClass = [
  "w-full rounded-[var(--radius-sm)] border border-line-light bg-white",
  "px-4 py-[11px] text-[14px] font-[500] text-content-primary outline-none transition",
  "placeholder:text-content-subtle",
  "focus:border-brand-cyan focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
].join(" ");

const selectClass = [
  "w-full rounded-[var(--radius-sm)] border border-line-light bg-white",
  "px-4 py-[11px] text-[14px] font-[600] text-content-primary outline-none transition cursor-pointer",
  "focus:border-brand-cyan focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
].join(" ");

function Field({ label, id, type, placeholder, value, onChange, hint }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[12px] font-[700] text-content-primary"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {hint && <p className="text-[11px] text-content-muted">{hint}</p>}
    </div>
  );
}
