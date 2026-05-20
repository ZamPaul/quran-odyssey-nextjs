"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthInput, AuthCheckbox, AuthButton } from "../ui/AuthInput";

// ─── Validation schema ────────────────────────────────────────
const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Please enter your full name")
      .max(80, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["student", "parent"], {
      required_error: "Please select your role",
    }),
    agreeToTerms: z
      .boolean()
      .refine((v) => v === true, "You must agree to the terms to continue"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Role selector card ───────────────────────────────────────
function RoleCard({ id, value, label, description, icon, selected, onChange }) {
  return (
    <label
      htmlFor={id}
      className={[
        "flex cursor-pointer items-start gap-3 rounded-[var(--radius)] border p-4 transition-all",
        selected
          ? "border-brand-cyan bg-[color-mix(in_srgb,var(--brand-cyan)_6%,white)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]"
          : "border-line-light bg-white hover:border-border-default",
      ].join(" ")}
    >
      <input
        type="radio"
        id={id}
        name="role"
        value={value}
        checked={selected}
        onChange={onChange}
        className="sr-only"
      />
      <div
        className={[
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border transition-colors",
          selected
            ? "border-[color-mix(in_srgb,var(--brand-cyan)_30%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,white)] text-brand-cyan"
            : "border-line-light bg-surface-light text-content-muted",
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="flex-1 pt-[2px]">
        <div
          className={[
            "text-[14px] font-[800] tracking-[-0.01em] transition-colors",
            selected ? "text-brand-cyan-dark" : "text-content-primary",
          ].join(" ")}
        >
          {label}
        </div>
        <div className="mt-[2px] text-[12px] font-[500] leading-[1.5] text-content-muted">
          {description}
        </div>
      </div>
      {/* Checkmark */}
      <div
        className={[
          "mt-[2px] flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-all",
          selected
            ? "border-brand-cyan bg-brand-cyan"
            : "border-border-default bg-white",
        ].join(" ")}
      >
        {selected && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </label>
  );
}

// ─── Password strength meter ──────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-rose", "bg-brand-amber", "bg-success"];
  const labels = ["Weak", "Fair", "Strong"];

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
      <div className="flex items-center gap-3">
        {score > 0 && (
          <span
            className={[
              "text-[11px] font-[700]",
              score === 1
                ? "text-rose"
                : score === 2
                  ? "text-brand-amber-dark"
                  : "text-[color-mix(in_srgb,var(--success)_70%,black)]",
            ].join(" ")}
          >
            {labels[score - 1]}
          </span>
        )}
        <div className="flex gap-2">
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

function OrDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-line-light" />
      <span className="text-[12px] font-[600] text-content-subtle">or</span>
      <div className="h-px flex-1 bg-line-light" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function SignUpForm() {
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("parent");
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "parent", agreeToTerms: false },
  });

  const watchPassword = watch("password", "");

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);

    try {
      /**
       * TODO: Replace with Clerk's useSignUp hook.
       *
       * const { signUp } = useSignUp();
       * await signUp.create({
       *   firstName: data.fullName.split(" ")[0],
       *   lastName: data.fullName.split(" ").slice(1).join(" "),
       *   emailAddress: data.email,
       *   password: data.password,
       *   unsafeMetadata: { role: data.role },
       * });
       * await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
       * router.push("/auth/verify-email");
       */
      await new Promise((r) => setTimeout(r, 1200)); // stub
      console.log("Sign up payload:", data);
    } catch (err) {
      setServerError(
        err?.errors?.[0]?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue("role", role, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-5">
      <GoogleButton onClick={() => console.log("Google OAuth")} />

      <OrDivider />

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
          id="fullName"
          label="Full name"
          placeholder="Your full name"
          required
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <AuthInput
          id="signUpEmail"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Role selector */}
        <div className="flex flex-col gap-[6px]">
          <span className="text-[13px] font-[700] text-content-primary">
            I am a <span className="text-rose">*</span>
          </span>
          <div className="grid grid-cols-2 gap-3">
            <RoleCard
              id="role-parent"
              value="parent"
              label="Parent"
              description="Enrol my child in classes"
              selected={selectedRole === "parent"}
              onChange={() => handleRoleChange("parent")}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              }
            />
            <RoleCard
              id="role-student"
              value="student"
              label="Student"
              description="Learning for myself"
              selected={selectedRole === "student"}
              onChange={() => handleRoleChange("student")}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              }
            />
          </div>
          {errors.role && (
            <p className="text-[12px] font-[600] text-rose">{errors.role.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <AuthInput
            id="signUpPassword"
            label="Password"
            type="password"
            placeholder="Create a strong password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={watchPassword} />
        </div>

        <AuthInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <AuthCheckbox
          id="agreeToTerms"
          error={errors.agreeToTerms?.message}
          label={
            <>
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-[700] text-brand-cyan-dark underline-offset-2 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-[700] text-brand-cyan-dark underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
            </>
          }
          {...register("agreeToTerms")}
        />

        <AuthButton loading={isLoading}>Create my account</AuthButton>
      </form>

      <p className="text-center text-[13px] font-[500] text-content-muted">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-[700] text-brand-cyan-dark transition hover:text-brand-cyan"
        >
          Sign in
        </Link>
      </p>

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