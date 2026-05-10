"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthInput, AuthCheckbox, AuthButton } from "../ui/AuthInput";

// ─── Validation schema ────────────────────────────────────────
const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

// ─── Social divider ───────────────────────────────────────────
function OrDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-line-light" />
      <span className="text-[12px] font-[600] text-content-subtle">or</span>
      <div className="h-px flex-1 bg-line-light" />
    </div>
  );
}

// ─── Google SSO button ────────────────────────────────────────
function GoogleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-[var(--radius)] border border-line-light bg-white px-5 py-[11px] text-[14px] font-[700] text-content-primary transition hover:-translate-y-[1px] hover:border-border-default hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
    >
      {/* Google G logo */}
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
        <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
      </svg>
      Continue with Google
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function SignInForm() {
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);

    try {
      /**
       * TODO: Replace with Clerk's useSignIn hook.
       *
       * const { signIn, setActive } = useSignIn();
       * const result = await signIn.create({ identifier: data.email, password: data.password });
       * if (result.status === "complete") {
       *   await setActive({ session: result.createdSessionId });
       *   router.push("/dashboard");
       * }
       */
      await new Promise((r) => setTimeout(r, 1200)); // stub
      console.log("Sign in payload:", data);
    } catch (err) {
      setServerError(
        err?.errors?.[0]?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Google SSO */}
      <GoogleButton onClick={() => console.log("Google OAuth")} />

      <OrDivider />

      {/* Server-level error */}
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
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[13px] font-[700] text-content-primary">
              Password <span className="text-rose">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[13px] font-[700] text-brand-cyan-dark transition hover:text-brand-cyan"
            >
              Forgot password?
            </Link>
          </div>
          <AuthInput
            id="password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <AuthCheckbox
          id="rememberMe"
          label="Keep me signed in for 30 days"
          {...register("rememberMe")}
        />

        <AuthButton loading={isLoading}>Sign in to your account</AuthButton>
      </form>

      {/* Sign up link */}
      <p className="text-center text-[13px] font-[500] text-content-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-[700] text-brand-cyan-dark transition hover:text-brand-cyan"
        >
          Create one free
        </Link>
      </p>

      {/* Back to home */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[12px] font-[600] text-content-subtle transition hover:text-content-muted"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Quran Odyssey
        </Link>
      </div>
    </div>
  );
}