"use client";

import { useState } from "react";

/**
 * AuthInput — shared input for auth forms
 * Accepts react-hook-form's `register` return value spread as props
 */
export function AuthInput({
  label,
  id,
  type = "text",
  placeholder,
  error,
  hint,
  required,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-[6px]">
      {label && (
        <label
          htmlFor={id}
          className="text-[13px] font-[700] text-content-primary"
        >
          {label}
          {required && <span className="ml-1 text-rose">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={[
            "w-full rounded-[var(--radius-sm)] border bg-white px-4 py-[11px] text-[14px] font-[500] text-content-primary outline-none transition-all duration-150",
            "placeholder:text-content-subtle",
            "focus:border-brand-cyan focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
            isPassword ? "pr-11" : "",
            error
              ? "border-rose shadow-[0_0_0_3px_rgba(251,113,131,0.10)]"
              : "border-line-light hover:border-border-default",
          ].join(" ")}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle transition hover:text-content-primary"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-[12px] font-[600] text-rose" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[12px] font-[500] text-content-subtle">{hint}</p>
      )}
    </div>
  );
}

/**
 * AuthCheckbox — checkbox for terms / remember me
 */
export function AuthCheckbox({ label, id, error, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <div className="relative mt-[2px] flex-shrink-0">
          <input
            id={id}
            type="checkbox"
            className="peer h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-line-light bg-white transition checked:border-brand-cyan checked:bg-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
            {...rest}
          />
          <svg
            className="pointer-events-none absolute left-[2px] top-[2px] hidden peer-checked:block"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[13px] font-[500] leading-[1.5] text-content-muted">
          {label}
        </span>
      </label>
      {error && (
        <p className="text-[12px] font-[600] text-rose" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * AuthButton — primary submit button with loading state
 */
export function AuthButton({ loading, children, ...rest }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={[
        "relative w-full overflow-hidden rounded-[var(--radius)] bg-brand-amber px-6 py-[13px]",
        "text-[14px] font-[800] tracking-[-0.01em] text-brand-navy",
        "transition-all duration-150 hover:-translate-y-[1px] hover:bg-brand-amber-dark",
        "focus:outline-none focus:ring-2 focus:ring-brand-amber/40",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
      ].join(" ")}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Please wait…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * OTPInput — 6-digit single-character inputs wired together
 */
export function OTPInput({ value, onChange, error }) {
  const digits = Array.from({ length: 6 });

  const handleChange = (index, char) => {
    const sanitized = char.replace(/\D/g, "").slice(-1);
    const arr = value.split("");
    arr[index] = sanitized;
    const next = arr.join("").padEnd(6, " ").trimEnd();
    onChange(next.slice(0, 6));

    if (sanitized && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, " ").trimEnd());
    e.preventDefault();
    const lastFilled = Math.min(pasted.length, 5);
    document.getElementById(`otp-${lastFilled}`)?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3" onPaste={handlePaste}>
        {digits.map((_, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] && value[i] !== " " ? value[i] : ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={[
              "h-[54px] w-full rounded-[var(--radius)] border text-center text-[20px] font-[800] tracking-[-0.02em] text-content-primary outline-none transition-all",
              "focus:border-brand-cyan focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
              value[i] && value[i] !== " "
                ? "border-brand-cyan bg-[color-mix(in_srgb,var(--brand-cyan)_6%,white)]"
                : "border-line-light bg-white",
              error ? "border-rose" : "",
            ].join(" ")}
          />
        ))}
      </div>
      {error && (
        <p className="text-[12px] font-[600] text-rose" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}