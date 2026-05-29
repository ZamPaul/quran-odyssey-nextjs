// app/teacher/layout.jsx
"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeacherLayout({ children }) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Extra client-side role guard
    // The backend enforces this too — this just prevents flash of wrong UI
    const checkRole = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/teacher/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.ok) {
          // Not a teacher — send to student dashboard
          router.push("/dashboard");
        }
      } catch {
        router.push("/dashboard");
      }
    };

    checkRole();
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9fb",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "3px solid #e2e8f0",
            borderTopColor: "#28b7d9",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
