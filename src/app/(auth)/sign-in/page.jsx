import AuthLayout from "@/app/components/auth/AuthLayout";
import SignInForm from "@/app/components/auth/SignInForm";

export const metadata = {
  title: "Sign In — Quran Odyssey",
  description: "Sign in to your Quran Odyssey account to access your dashboard and classes.",
};

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your dashboard, classes, and progress."
    >
      <SignInForm />
    </AuthLayout>
  );
}                