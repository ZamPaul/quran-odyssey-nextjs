// app/auth/callback/page.jsx
"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const redirect = async () => {
      try {
        const token = await getToken();
        if (!token) {
          router.push("/dashboard");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/students/profile`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === "TEACHER") {
            router.push("/teacher/dashboard");
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/dashboard");
      }
    };

    redirect();
  }, [isLoaded, user]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f9fb",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid #e2e8f0",
          borderTopColor: "#28b7d9",
          animation: "spin 0.8s linear infinite",
          marginBottom: 16,
        }}
      />
      <p style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>
        Loading your dashboard…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
