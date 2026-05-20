"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { OTPInput, AuthButton } from "../ui/AuthInput";

const RESEND_COOLDOWN_SECS = 60;

export default function VerifyEmailForm({ email = "your email" }) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    const code = otp.replace(/\s/g, "");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      /**
       * TODO: Replace with Clerk's useSignUp hook.
       *
       * const { signUp, setActive } = useSignUp();
       * const result = await signUp.attemptEmailAddressVerification({ code });
       * if (result.status === "complete") {
       *   await setActive({ session: result.createdSessionId });
       *   router.push("/dashboard");
       * }
       */
      await new Promise((r) => setTimeout(r, 1200)); // stub
      setSuccess(true);
    } catch (err) {
      setError(
        err?.errors?.[0]?.message ||
          "That code is incorrect or has expired. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError("");
    try {
      /**
       * TODO: Replace with Clerk.
       * await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
       */
      await new Promise((r) => setTimeout(r, 800)); // stub
      setCooldown(RESEND_COOLDOWN_SECS);
      setOtp("");
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Auto-submit when 6 digits are filled
  const handleOtpChange = useCallback(
    (val) => {
      setOtp(val);
      setError("");
      if (val.replace(/\s/g, "").length === 6) {
        // Small delay so user can see the last digit filled
        setTimeout(() => handleSubmit(), 300);
      }
    },
    [] // handleSubmit is stable
  );

  if (success) {
    return (
      <div className="flex flex-col items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,white)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="text-[18px] font-[800] tracking-[-0.02em] text-content-primary">
            Email verified!
          </h3>
          <p className="mt-2 text-[14px] leading-[1.65] text-content-muted">
            Your account is ready. Redirecting you to your dashboard…
          </p>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-line-light">
          <div
            className="h-full rounded-full bg-brand-cyan"
            style={{ animation: "progressBar 2s ease-in-out forwards" }}
          />
        </div>
        <style>{`@keyframes progressBar { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Email badge */}
      <div className="flex items-center gap-3 rounded-[var(--radius)] border border-line-light bg-surface-off-white px-4 py-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,white)] text-brand-cyan-dark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.6" />
            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </div>
        <div>
          <div className="text-[12px] font-[700] uppercase tracking-[0.08em] text-content-subtle">
            Code sent to
          </div>
          <div className="text-[13px] font-[800] text-content-primary">{email}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-[6px]">
          <label className="text-[13px] font-[700] text-content-primary">
            Verification code <span className="text-rose">*</span>
          </label>
          <OTPInput value={otp} onChange={handleOtpChange} error={error} />
        </div>

        <AuthButton loading={isLoading}>Verify email address</AuthButton>
      </form>

      {/* Resend */}
      <div className="flex items-center justify-between rounded-[var(--radius)] border border-line-light bg-surface-off-white px-4 py-3">
        <span className="text-[13px] font-[500] text-content-muted">
          Didn&apos;t get a code?
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className={[
            "text-[13px] font-[800] transition",
            cooldown > 0 || isResending
              ? "cursor-not-allowed text-content-subtle"
              : "text-brand-cyan-dark hover:text-brand-cyan",
          ].join(" ")}
        >
          {isResending
            ? "Sending…"
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend code"}
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/auth/sign-up"
          className="inline-flex items-center gap-1 text-[12px] font-[600] text-content-subtle transition hover:text-content-muted"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Wrong email? Go back
        </Link>
      </div>
    </div>
  );
}