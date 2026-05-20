"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─── Zod schema ───────────────────────────────────────────────
const schema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "Must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Must be at least 2 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+\d\s\-()]{7,}$/, "Please enter a valid phone number"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  isInterested: z.enum(["yes", "no"], {
    required_error: "Please select an option to continue",
  }),
});

// ─── Sub-components ───────────────────────────────────────────

function InputField({ id, label, error, required, children }) {
  return (
    <div className="flex flex-col gap-[5px]">
      {label && (
        <label
          htmlFor={id}
          className="text-[12px] font-[700] tracking-[0.02em] text-content-primary"
        >
          {label}
          {required && <span className="ml-1 text-rose">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-[11px] font-[700] text-rose" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function RadioPair({ value, onChange, error }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-[10px]">
        {[
          { val: "yes", label: "Yes, absolutely" },
          { val: "no", label: "I’d like to learn more" },
        ].map(({ val, label }) => {
          const checked = value === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              className={[
                "flex cursor-pointer items-center gap-[10px] rounded-[8px] border-[1.5px] px-4 py-[11px] text-left transition-all duration-150 select-none",
                checked
                  ? "border-brand-cyan bg-[color-mix(in_srgb,var(--brand-cyan)_10%,white)] font-[700] text-brand-cyan-dark"
                  : "border-line-light bg-surface-off-white font-[600] text-content-muted hover:border-brand-cyan hover:bg-surface-cyan-tint hover:text-brand-cyan-dark",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  checked
                    ? "border-brand-cyan bg-brand-cyan shadow-[inset_0_0_0_3px_white]"
                    : "border-border-default bg-white",
                ].join(" ")}
              />
              <span className="text-[13px] leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-[11px] font-[700] text-rose" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ loading, label = "Book My Free Discovery Call →" }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={[
        "flex w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-brand-amber px-6 py-[15px]",
        "text-[16px] font-[800] tracking-[-0.01em] text-brand-navy",
        "transition-all duration-150",
        "hover:-translate-y-[1px] hover:bg-brand-amber-dark",
        "active:translate-y-0",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
      ].join(" ")}
      style={{ boxShadow: "0 6px 20px rgba(250,167,26,0.30)" }}
    >
      {loading ? (
        <>
          <svg
            className="h-[18px] w-[18px] animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="40"
              strokeDashoffset="10"
              strokeLinecap="round"
            />
          </svg>
          Booking your call…
        </>
      ) : (
        label
      )}
    </button>
  );
}

export function RatingRow() {
  return (
    <div className="flex flex-col items-center gap-1 pt-1">
      <div className="flex gap-[3px] text-[15px] text-brand-amber">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
      <p className="text-[12px] font-[600] text-content-muted">
        Rated 4.97/5 by 2,000+ Parents and Students
      </p>
    </div>
  );
}

function PrivacyRow() {
  return (
    <p className="text-center text-[11px] text-content-subtle">
      <a
        href="/privacy"
        className="underline underline-offset-2 transition hover:text-brand-cyan-dark"
      >
        Privacy Policy
      </a>
      {" · "}
      <a
        href="/terms"
        className="underline underline-offset-2 transition hover:text-brand-cyan-dark"
      >
        Terms of Service
      </a>
    </p>
  );
}

// ─── Main lead capture form ───────────────────────────────────
export function OptInMainForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { isInterested: undefined },
  });

  const watchInterested = watch("isInterested");

  const onSubmit = async () => {
    setLoading(true);
    try {
      // TODO: replace stub with real API call
      await new Promise((r) => setTimeout(r, 1200));
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    [
      "w-full rounded-[var(--radius-sm)] border bg-white px-4 py-[11px]",
      "text-[14px] font-[500] text-content-primary outline-none",
      "placeholder:text-content-subtle transition-all duration-150",
      "focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
      hasError
        ? "border-rose shadow-[0_0_0_3px_rgba(251,113,131,0.10)] focus:border-rose"
        : "border-line-light hover:border-border-default focus:border-brand-cyan",
    ].join(" ");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-[16px]"
    >
      {/* Name row */}
      <div className="grid grid-cols-2 gap-[12px] max-[460px]:grid-cols-1">
        <InputField
          id="firstName"
          label="First Name"
          error={errors.firstName?.message}
          required
        >
          <input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            className={inputClass(!!errors.firstName)}
            {...register("firstName")}
          />
        </InputField>
        <InputField
          id="lastName"
          label="Last Name"
          error={errors.lastName?.message}
          required
        >
          <input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            className={inputClass(!!errors.lastName)}
            {...register("lastName")}
          />
        </InputField>
      </div>

      {/* Phone + Email row */}
      <div className="grid grid-cols-2 gap-[12px] max-[460px]:grid-cols-1">
        <InputField
          id="phone"
          label="Phone *"
          error={errors.phone?.message}
          required
        >
          <input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            className={inputClass(!!errors.phone)}
            {...register("phone")}
          />
        </InputField>
        <InputField
          id="email"
          label="Email *"
          error={errors.email?.message}
          required
        >
          <input
            id="email"
            type="email"
            placeholder="you@email.com"
            className={inputClass(!!errors.email)}
            {...register("email")}
          />
        </InputField>
      </div>

      {/* Programme description */}
      <div className="rounded-[var(--radius-sm)] border border-line-light bg-surface-off-white px-4 py-4">
        <p className="text-[13px] font-[700] text-content-primary">
          Quran Odyssey is designed for families who want more than just Quran
          classes.
        </p>
        <p className="mt-2 text-[13px] leading-[1.7] text-content-muted">
          We provide a structured, engaging, and child-friendly Quran learning
          journey through dedicated 1-on-1 sessions with qualified teachers,
          interactive animated lessons, Noorani Qaida, Quran Reading, Quran
          Memorization (Hifz), Salah (Namaz), duas, and regular progress reports
          for parents. <br />
          Our mission is simple: <br />
          To help children build a lasting connection with the Quran — with
          love, confidence, and consistency.
        </p>
      </div>

      {/* YES / NO */}
      <div className="flex flex-col gap-[10px]">
        <p className="text-[13px] font-[600] leading-[1.55] text-content-primary">
          Would you like your child to experience Quran learning in a more
          engaging and meaningful way?
        </p>
        <RadioPair
          value={watchInterested}
          onChange={(val) =>
            setValue("isInterested", val, { shouldValidate: true })
          }
          error={errors.isInterested?.message}
        />
      </div>

      <SubmitButton loading={loading} label="Submit" />
      <PrivacyRow />
      <RatingRow />
    </form>
  );
}

// ─── Sticky repeating mini-form ───────────────────────────────
export function OptInStickyForm({ index, onYes }) {
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError(true);
      return;
    }
    setError(false);
    if (selected === "yes") {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      setLoading(false);
      onYes?.();
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,white)] text-[18px] font-[800] text-success">
          ✓
        </div>
        <p className="text-[13px] font-[600] text-content-muted">
          No problem! If you change your mind,{" "}
          <a
            href="#mainForm"
            className="font-[700] text-brand-cyan-dark underline-offset-2 hover:underline"
          >
            book a call here.
          </a>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-[14px]"
    >
      <p className="text-[14px] font-[600] leading-[1.55] text-content-primary">
        Is this what you are looking for — to give your child a real, structured
        Quran education?
      </p>
      <RadioPair
        value={selected}
        onChange={(val) => {
          setSelected(val);
          setError(false);
        }}
        error={error ? "Please select an option to continue." : undefined}
      />
      <SubmitButton loading={loading} />
      <PrivacyRow />
      <RatingRow />
    </form>
  );
}
