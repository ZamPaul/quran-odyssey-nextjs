"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function LearnerPicker({ value, onChange, lockedId }) {
  const { getToken } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/students`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
          // Auto-select if exactly one learner and nothing chosen yet
          if (!value && data.students?.length === 1)
            onChange(data.students[0].id);
          // Honor a locked/deep-linked id
          if (lockedId && data.students?.some((s) => s.id === lockedId))
            onChange(lockedId);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div style={{ fontSize: 13, color: "#94a3b8" }}>Loading learners…</div>
    );

  if (students.length === 0) {
    return (
      <div style={{ fontSize: 13, color: "#64748b" }}>
        No learners yet.{" "}
        <a
          href="/register/profile"
          style={{ color: "#0e6e8a", fontWeight: 700 }}
        >
          Add one first →
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {students.map((s) => {
        const active = value === s.id;
        const locked = lockedId && lockedId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => !lockedId && onChange(s.id)}
            disabled={!!lockedId && !locked}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              cursor: lockedId ? "default" : "pointer",
              border: `1.5px solid ${active ? "#0d2840" : "#e2e8f0"}`,
              background: active ? "#0d2840" : "white",
              color: active ? "white" : "#0f172a",
              fontSize: 13,
              fontWeight: 700,
              opacity: lockedId && !locked ? 0.4 : 1,
            }}
          >
            {s.name} · age {s.age}
          </button>
        );
      })}
    </div>
  );
}
