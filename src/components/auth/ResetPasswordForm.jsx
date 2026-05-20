"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthInput, AuthButton } from "../ui/AuthInput";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-rose", "bg-brand-amber", "bg-success"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={[
              "h-[3px] flex-1 rounded-full transition-all duration-300",
              i < score ? colors[score - 1] : "bg-line-light",
            ].join(" ")}
          />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span
            key={c.label}
            className={[
              "text-[11px] font-[600]",
              c.pass ? "text-[color-mix(in_srgb,var(--success)_70%,black)]" : "text-content-subtle",
            ].join(" ")}
          >
            {c.pass ? "✓" : "·"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,white)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <h3 className="text-[18px] font-[800] tracking-[-0.02em] text-content-primary">
          Password updated
        </h3>
        <p className="mt-2 text-[14px] leading-[1.65] text-content-muted">
          Your password has been changed successfully. You can now sign in with your new password.
        </p>
      </div>
      <Link
        href="/auth/sign-in"
        className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-6 py-[13px] text-[14px] font-[800] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark"
      >
        Sign in to your account
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetSchema) });

  const watchPassword = watch("password", "");

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);
    try {
      /**
       * TODO: Replace with Clerk's useSignIn hook.
       *
       * const { signIn, setActive } = useSignIn();
       * const result = await signIn.resetPassword({
       *   password: data.password,
       *   signOutOfOtherSessions: true,
       * });
       * if (result.status === "complete") {
       *   await setActive({ session: result.createdSessionId });
       *   setSuccess(true);
       * }
       */
      await new Promise((r) => setTimeout(r, 1200)); // stub
      setSuccess(true);
    } catch (err) {
      setServerError(
        err?.errors?.[0]?.message ||
          "This link may have expired. Please request a new one."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) return <SuccessState />;

  return (
    <div className="flex flex-col gap-5">
      {serverError && (
        <div className="flex items-start gap-3 rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--rose)_20%,transparent)] bg-[color-mix(in_srgb,var(--rose)_8%,white)] px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-[1px] flex-shrink-0 text-rose" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-[13px] font-[600] text-rose">{serverError}</p>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-start gap-3 rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--brand-cyan)_20%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_6%,white)] px-4 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-[1px] flex-shrink-0 text-brand-cyan" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        <p className="text-[13px] font-[600] text-brand-cyan-dark">
          Choose a strong password you haven&apos;t used before. All other sessions will be signed out.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <AuthInput
            id="newPassword"
            label="New password"
            type="password"
            placeholder="Create a strong password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={watchPassword} />
        </div>

        <AuthInput
          id="newConfirmPassword"
          label="Confirm new password"
          type="password"
          placeholder="Repeat your new password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <AuthButton loading={isLoading}>Set new password</AuthButton>
      </form>

      <div className="text-center">
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-1 text-[12px] font-[600] text-content-subtle transition hover:text-content-muted"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}