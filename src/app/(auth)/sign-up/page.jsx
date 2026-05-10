import AuthLayout from "@/app/components/auth/AuthLayout";
import SignUpForm from "@/app/components/auth/SignUpForm";

export const metadata = {
  title: "Create Account — Quran Odyssey",
  description: "Create your free Quran Odyssey account and start your child's learning journey.",
};

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join 2,000+ families giving their children structured, consistent Quran education."
    >
      <SignUpForm />
    </AuthLayout>
  );
}