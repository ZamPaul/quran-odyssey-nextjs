// app/register/profile/page.jsx  — REWORKED for multi-learner
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

const COURSES = [
  { value: "NOORANI_QAIDA",    label: "Noorani Qaida",     desc: "Arabic alphabet & basic reading · Ages 5–10" },
  { value: "QURAN_RECITATION", label: "Quran Recitation",  desc: "Fluent recitation with Tajweed · All ages" },
  { value: "TAJWEED",          label: "Tajweed Rules",     desc: "Science of correct recitation · Ages 8+" },
  { value: "HIFZ",             label: "Hifz Programme",    desc: "Full Quran memorisation · Ages 7+" },
  { value: "ISLAMIC_STUDIES",  label: "Islamic Studies",   desc: "Stories, pillars, character · Ages 6–14" },
  { value: "ONE_TO_ONE",       label: "One-to-One Private", desc: "Fully custom · All ages & levels" },
];

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia",
  "Ireland", "South Africa", "New Zealand", "Other",
];

export default function ProfilePage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [step, setStep] = useState(1);          // 1 = account holder, 2 = learner, 3 = course
  const [isSelf, setIsSelf] = useState(false);  // "I'm learning for myself"
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // account holder
    accountName: "",
    phone: "",
    // first learner
    learnerName: "",
    learnerAge: "",
    country: "",
    timezone: "",
    courseInterest: "",
  });

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setForm((prev) => ({ ...prev, timezone: detected }));
  }, []);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // When "learning for myself" is toggled on, prefill the learner name
  // from the account holder name and hide the separate name field.
  const toggleSelf = (val) => {
    setIsSelf(val);
    setError("");
    if (val) {
      setForm((prev) => ({ ...prev, learnerName: prev.accountName }));
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.accountName.trim()) return "Please enter your full name.";
      if(!form.phone) return "Please enter your phone.";
    }
    if (step === 2) {
      if (!isSelf && !form.learnerName.trim()) return "Please enter the learner's name.";
      if (!form.learnerAge) return "Please enter an age.";
      if (!form.country) return "Please select a country.";
    }
    if (step === 3) {
      if (!form.courseInterest) return "Please select a course to get started.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    // If learning for self, keep learnerName synced to accountName
    if (step === 1 && isSelf) {
      setForm((prev) => ({ ...prev, learnerName: prev.accountName }));
    }
    setStep((s) => s + 1);
  };

  const submit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError("");

    try {
      const token = await getToken();

      // ONE call: create the first Student AND set the account holder's
      // name/phone on the User (the backend POST /api/students accepts
      // optional accountName / accountPhone for first-time onboarding).
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // learner
          name:           (isSelf ? form.accountName : form.learnerName).trim(),
          age:            parseInt(form.learnerAge, 10),
          country:        form.country,
          timezone:       form.timezone,
          courseInterest: form.courseInterest,
          isSelf,
          // account holder (set on User if not already set)
          accountName:    form.accountName.trim(),
          accountPhone:   form.phone.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const stepLabel =
    step === 1 ? "Your details" : step === 2 ? (isSelf ? "Learner details" : "Child's details") : "Choose a course";

  return (
    <div className="min-h-screen bg-surface-off-white flex flex-col">
      <div className="relative h-[100px] flex items-center justify-center py-8" />

      <div className="flex-1 flex items-start justify-center px-6 pb-12 pt-4">
        <div className="w-full max-w-[560px]">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-[700] text-content-muted">Step {step} of 3</span>
              <span className="text-[13px] font-[700] text-brand-cyan-dark">{stepLabel}</span>
            </div>
            <div className="h-[3px] w-full rounded bg-line-light overflow-hidden">
              <div className="h-full rounded bg-brand-cyan transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[var(--radius-lg)] border border-line-light p-8">

            {/* ── STEP 1 — Account holder ── */}
            {step === 1 && (
              <div>
                <h2 className="text-[22px] font-[800] tracking-[-0.03em] text-content-primary mb-1">
                  Tell us about yourself
                </h2>
                <p className="text-[14px] text-content-muted mb-6">
                  You&apos;re the account holder. You can add one or more learners next.
                </p>

                <div className="flex flex-col gap-5">
                  <Field
                    label="Your full name *" id="accountName" type="text"
                    placeholder="e.g. Fatimah Ahmed"
                    value={form.accountName} onChange={(v) => set("accountName", v)}
                  />
                  <Field
                    label="WhatsApp number" id="phone" type="tel"
                    placeholder="e.g. 447911123456 (no + sign)"
                    value={form.phone} onChange={(v) => set("phone", v)}
                    hint="We'll send booking confirmations here. Include country code."
                  />

                  {/* Learning for myself toggle */}
                  <label className="flex items-center gap-3 cursor-pointer select-none mt-1">
                    <button
                      type="button"
                      onClick={() => toggleSelf(!isSelf)}
                      className="relative w-[44px] h-[24px] rounded-full transition-colors flex-shrink-0"
                      style={{ background: isSelf ? "#28b7d9" : "#e2e8f0" }}
                      aria-pressed={isSelf}
                    >
                      <span
                        className="absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform"
                        style={{ transform: isSelf ? "translateX(20px)" : "translateX(0)" }}
                      />
                    </button>
                    <span className="text-[13px] font-[600] text-content-primary">
                      I&apos;m learning for myself (no separate child)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ── STEP 2 — Learner ── */}
            {step === 2 && (
              <div>
                <h2 className="text-[22px] font-[800] tracking-[-0.03em] text-content-primary mb-1">
                  {isSelf ? "Your learning details" : "Tell us about your child"}
                </h2>
                <p className="text-[14px] text-content-muted mb-6">
                  This helps us match the right teacher and course.
                </p>

                <div className="flex flex-col gap-5">
                  {!isSelf && (
                    <Field
                      label="Child's first name *" id="learnerName" type="text"
                      placeholder="e.g. Ahmed"
                      value={form.learnerName} onChange={(v) => set("learnerName", v)}
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label={isSelf ? "Your age *" : "Child's age *"} id="learnerAge" type="number"
                      placeholder="e.g. 10"
                      value={form.learnerAge} onChange={(v) => set("learnerAge", v)}
                    />
                    <div className="flex flex-col gap-2">
                      <label htmlFor="country" className="text-[13px] font-[700] text-content-primary">Country *</label>
                      <select
                        id="country" value={form.country} onChange={(e) => set("country", e.target.value)}
                        className="h-[46px] px-4 rounded-[var(--radius-md)] border border-line-light bg-white text-[14px] text-content-primary outline-none focus:border-brand-cyan"
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="text-[12px] text-content-muted">
                    Timezone detected: <span className="font-[700] text-content-primary">{form.timezone || "—"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3 — Course ── */}
            {step === 3 && (
              <div>
                <h2 className="text-[22px] font-[800] tracking-[-0.03em] text-content-primary mb-1">
                  Choose a course to start
                </h2>
                <p className="text-[14px] text-content-muted mb-6">
                  You can change this later or enroll in more courses.
                </p>

                <div className="flex flex-col gap-3">
                  {COURSES.map((c) => {
                    const active = form.courseInterest === c.value;
                    return (
                      <button
                        key={c.value} type="button" onClick={() => set("courseInterest", c.value)}
                        className="text-left rounded-[var(--radius-md)] border p-4 transition"
                        style={{
                          borderColor: active ? "#28b7d9" : "#e2e8f0",
                          background: active ? "rgba(40,183,217,0.06)" : "white",
                        }}
                      >
                        <div className="text-[15px] font-[800] text-content-primary">{c.label}</div>
                        <div className="text-[13px] text-content-muted mt-[2px]">{c.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-5 px-4 py-3 rounded-[var(--radius-md)] text-[13px] font-[600]"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626" }}>
                {error}
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-7">
              {step > 1 ? (
                <button type="button" onClick={() => setStep((s) => s - 1)}
                  className="text-[14px] font-[700] text-content-muted">← Back</button>
              ) : <span />}

              {step < 3 ? (
                <button type="button" onClick={next}
                  className="inline-flex items-center rounded-[var(--radius-md)] bg-brand-navy px-7 py-3 text-[14px] font-[800] text-white">
                  Continue →
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={submitting}
                  className="inline-flex items-center rounded-[var(--radius-md)] px-7 py-3 text-[14px] font-[800]"
                  style={{ background: submitting ? "#cbd5e1" : "#faa71a", color: "#0d2840", cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Creating…" : "Finish & Go to Dashboard"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────
function Field({ label, id, type, placeholder, value, onChange, hint }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-[700] text-content-primary">{label}</label>
      <input
        id={id} type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[46px] px-4 rounded-[var(--radius-md)] border border-line-light bg-white text-[14px] text-content-primary outline-none focus:border-brand-cyan"
      />
      {hint && <span className="text-[12px] text-content-muted">{hint}</span>}
    </div>
  );
}