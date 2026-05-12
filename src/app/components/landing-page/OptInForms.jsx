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

// ─── Shared sub-components ────────────────────────────────────

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

function RadioPair({ name, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-[10px]">
        {[
          { val: "yes", label: "Yes, I am" },
          { val: "no", label: "No, I am not" },
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
              {/* Custom radio dot */}
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
        "font-[plus-eb] text-[16px] font-[800] tracking-[-0.01em] text-brand-navy",
        "shadow-[0_6px_20px_rgba(250,167,26,0.35)] transition-all duration-150",
        "hover:-translate-y-[1px] hover:bg-brand-amber-dark hover:shadow-[0_10px_28px_rgba(250,167,26,0.45)]",
        "active:translate-y-0",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
      ].join(" ")}
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

function PrivacyAndProof() {
  return (
    <>
      <p className="text-center font-[plus-r] text-[11px] text-content-subtle">
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
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-[3px] text-[16px] text-brand-amber">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>★</span>
          ))}
        </div>
        <p className="font-[plus-sb] text-[11px] font-[600] text-content-subtle">
          Rated 4.97/5 by 2,000+ Parents and Students
        </p>
      </div>
    </>
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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      /**
       * TODO: Replace stub with real API call
       * await fetch('/api/leads', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify(data),
       * });
       */
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
      "font-[plus-r] text-[14px] font-[500] text-content-primary outline-none",
      "placeholder:text-content-subtle",
      "transition-all duration-150",
      "focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
      hasError
        ? "border-rose shadow-[0_0_0_3px_rgba(251,113,131,0.10)] focus:border-rose"
        : "border-line-light hover:border-border-default focus:border-brand-cyan",
    ].join(" ");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-[18px]"
    >
      {/* Name row */}
      <div className="grid grid-cols-2 gap-[14px] max-[480px]:grid-cols-1">
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
      <div className="grid grid-cols-2 gap-[14px] max-[480px]:grid-cols-1">
        <InputField
          id="phone"
          label="Phone"
          error={errors.phone?.message}
          required
        >
          <input
            id="phone"
            type="tel"
            placeholder="+44 7700 900000"
            className={inputClass(!!errors.phone)}
            {...register("phone")}
          />
        </InputField>
        <InputField
          id="email"
          label="Email"
          error={errors.email?.message}
          required
        >
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={inputClass(!!errors.email)}
            {...register("email")}
          />
        </InputField>
      </div>

      {/* Programme description */}
      <div className="rounded-[var(--radius)] border border-line-light bg-surface-off-white px-[18px] py-4">
        <p className="font-[plus-b] text-[13px] font-[700] text-content-primary">
          Quran Odyssey is built for committed families.
        </p>
        <p className="mt-2 font-[plus-r] text-[13px] leading-[1.7] text-content-muted">
          We don&apos;t offer random one-off sessions. Instead we offer a fully
          structured programme with dedicated 1-on-1 teachers covering Tajweed,
          Hifz, Quran Recitation, and Islamic Studies — with weekly written
          progress reports for parents. We typically work with students for a
          minimum of 3 months, often 1 year+.
        </p>
      </div>

      {/* YES / NO question */}
      <div className="flex flex-col gap-3">
        <p className="font-[plus-sb] text-[14px] font-[600] leading-[1.55] text-content-primary">
          Is this what you are looking for — to give your child a real,
          structured Quran education?
        </p>
        <RadioPair
          name="isInterested"
          value={watchInterested}
          onChange={(val) =>
            setValue("isInterested", val, { shouldValidate: true })
          }
          error={errors.isInterested?.message}
        />
      </div>

      <SubmitButton loading={loading} />
      <PrivacyAndProof />
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
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,white)] font-[800] text-[18px] text-success">
          ✓
        </div>
        <p className="font-[plus-sb] text-[13px] font-[600] text-content-muted">
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
      <p className="font-[plus-sb] text-[14px] font-[600] leading-[1.55] text-content-primary">
        Is this what you are looking for — to give your child a real, structured
        Quran education?
      </p>

      <RadioPair
        name={`interested-${index}`}
        value={selected}
        onChange={(val) => {
          setSelected(val);
          setError(false);
        }}
        error={error ? "Please select an option to continue." : undefined}
      />

      <SubmitButton loading={loading} />
      <PrivacyAndProof />
    </form>
  );
}
