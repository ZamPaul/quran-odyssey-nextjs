// app/teacher/dashboard/page.jsx
"use client";

import { useUser, useClerk, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TeacherDashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchTeacher = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/teacher/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.ok) {
          router.push("/dashboard");
          return;
        }

        const data = await res.json();
        setTeacher(data.teacher);
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [isLoaded, user]);

  const handleSignOut = () => signOut(() => router.push("/"));

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9fb",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <p style={{ fontSize: 14, color: "#64748b" }}>
          Loading teacher portal…
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f9fb",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: 40,
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #28b7d9, #0e6e8a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 800,
                color: "white",
              }}
            >
              {teacher?.name
                ?.split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2) || "T"}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                {teacher?.name || "Teacher"}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                {teacher?.specialty?.join(" · ")}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              color: "#64748b",
            }}
          >
            Sign out
          </button>
        </div>

        {/* Phase 2 confirmation card */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            padding: 40,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Teacher Portal — Phase 2 Complete
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#64748b",
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            Authentication is working correctly.
            <br />
            The full dashboard UI will be built in Phase 7.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              maxWidth: 400,
              margin: "0 auto 24px",
            }}
          >
            {[
              ["Name", teacher?.name || "—"],
              ["Email", teacher?.email || "—"],
              ["Timezone", teacher?.timezone || "—"],
              ["Rating", teacher?.rating ? `⭐ ${teacher.rating}` : "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  background: "#f7f9fb",
                  borderRadius: 8,
                  padding: "12px 14px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#94a3b8",
                    marginBottom: 4,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#0d2840",
              color: "white",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Back to Site
          </Link>
        </div>
      </div>
    </div>
  );
}
