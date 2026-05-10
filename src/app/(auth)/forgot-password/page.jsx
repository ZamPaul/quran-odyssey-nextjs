// ─── src/app/auth/forgot-password/page.jsx ───────────────────
import AuthLayout from "@/app/components/auth/AuthLayout";
import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password — Quran Odyssey",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="No problem. Enter your email and we'll send a reset link immediately."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}