"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthInput, AuthButton } from "../ui/AuthInput";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

function SuccessState({ email }) {
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,white)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 6L9 17l-5-5"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div>
        <h3 className="text-[18px] font-[800] tracking-[-0.02em] text-content-primary">
          Check your inbox
        </h3>
        <p className="mt-2 text-[14px] leading-[1.65] text-content-muted">
          We&apos;ve sent a password reset link to{" "}
          <strong className="font-[700] text-content-primary">{email}</strong>.
          The link expires in 1 hour.
        </p>
      </div>

      <div className="w-full rounded-[var(--radius)] border border-line-light bg-surface-off-white px-4 py-4">
        <div className="mb-2 text-[12px] font-[800] uppercase tracking-[0.10em] text-content-subtle">
          Didn&apos;t receive it?
        </div>
        <ul className="space-y-1 text-[13px] font-[500] text-content-muted">
          <li className="flex items-start gap-2">
            <span className="mt-[3px] text-brand-cyan">·</span>
            Check your spam or junk folder
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[3px] text-brand-cyan">·</span>
            Make sure you used the right email address
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[3px] text-brand-cyan">·</span>
            Wait a few minutes and try again
          </li>
        </ul>
      </div>

      <Link
        href="/sign-in"
        className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-6 py-[13px] text-[14px] font-[800] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark"
      >
        Back to sign in
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);
    try {
      /**
       * TODO: Replace with Clerk's useSignIn().
       *
       * const { signIn } = useSignIn();
       * await signIn.create({
       *   strategy: "reset_password_email_code",
       *   identifier: data.email,
       * });
       * router.push("/auth/reset-password");
       */
      await new Promise((r) => setTimeout(r, 1200)); // stub
      setSuccessEmail(data.email);
    } catch (err) {
      setServerError(
        err?.errors?.[0]?.message ||
          "We couldn't find an account with that email. Please check and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (successEmail) return <SuccessState email={successEmail} />;

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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <AuthInput
          id="forgotEmail"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          required
          hint="Enter the email you registered with and we'll send a reset link."
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthButton loading={isLoading}>Send reset link</AuthButton>
      </form>

      <Link
        href="/sign-in"
        className="inline-flex items-center justify-center gap-1 text-[13px] font-[700] text-content-muted transition hover:text-content-primary"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to sign in
      </Link>
    </div>
  );
}