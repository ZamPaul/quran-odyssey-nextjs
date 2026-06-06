"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

// ─── Constants ────────────────────────────────────────────
const COURSE_LABELS = {
  NOORANI_QAIDA: "Noorani Qaida",
  QURAN_RECITATION: "Quran Recitation",
  TAJWEED: "Tajweed",
  HIFZ: "Hifz Programme",
  ISLAMIC_STUDIES: "Islamic Studies",
  ONE_TO_ONE: "1-on-1 Private",
};

const SESSION_STATUS_CFG = {
  SCHEDULED: {
    label: "Scheduled",
    color: "#28b7d9",
    bg: "rgba(40,183,217,0.10)",
  },
  COMPLETED: {
    label: "Completed",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.10)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.10)",
  },
  MISSED: { label: "Missed", color: "#f97316", bg: "rgba(249,115,22,0.10)" },
};

const ATT_CFG = {
  PRESENT: { label: "Present", color: "#22c55e", icon: "✓" },
  LATE: { label: "Late", color: "#f97316", icon: "⏰" },
  ABSENT: { label: "Absent", color: "#ef4444", icon: "✗" },
  EXCUSED: { label: "Excused", color: "#8b5cf6", icon: "📋" },
};

// ─── Helpers ──────────────────────────────────────────────
function fmtDate(iso, tz) {
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: tz || "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
function fmtTime(iso, tz) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: tz || "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function isLive(scheduledAt) {
  const diff = Math.round((new Date(scheduledAt) - Date.now()) / 60000);
  return diff >= -30 && diff <= 30;
}

// ─── Sub-components ───────────────────────────────────────
function Skeleton({ h = 80 }) {
  return (
    <div
      style={{
        height: h,
        borderRadius: 10,
        background: "#f0f4f8",
        animation: "shimmer 1.5s ease infinite",
      }}
    />
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px 20px",
        background: "white",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, color: "#94a3b8" }}>{sub}</div>
    </div>
  );
}

function SessionCard({ session, tz }) {
  const cfg =
    SESSION_STATUS_CFG[session.status] || SESSION_STATUS_CFG.SCHEDULED;
  const attCfg = session.attendance ? ATT_CFG[session.attendance.status] : null;
  const live = isLive(session.scheduledAt);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        border: `1px solid ${live ? "#28b7d9" : "#e2e8f0"}`,
        padding: "16px 20px",
        boxShadow: live ? "0 0 0 3px rgba(40,183,217,0.10)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        {/* Date block */}
        <div
          style={{
            textAlign: "center",
            minWidth: 48,
            flexShrink: 0,
            background: "#f7f9fb",
            borderRadius: 8,
            padding: "8px 6px",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1,
            }}
          >
            {new Date(session.scheduledAt).toLocaleDateString("en-GB", {
              timeZone: tz || "UTC",
              day: "numeric",
            })}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#94a3b8",
              letterSpacing: "0.05em",
            }}
          >
            {new Date(session.scheduledAt).toLocaleDateString("en-GB", {
              timeZone: tz || "UTC",
              month: "short",
            })}
          </div>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              {COURSE_LABELS[session.courseType] || session.courseType}
            </span>
            {live && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#faa71a",
                  background: "rgba(250,167,26,0.12)",
                  borderRadius: 4,
                  padding: "2px 7px",
                }}
              >
                ● Live Now
              </span>
            )}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: cfg.color,
                background: cfg.bg,
                borderRadius: 4,
                padding: "2px 7px",
              }}
            >
              {cfg.label}
            </span>
            {attCfg && (
              <span
                style={{ fontSize: 11, fontWeight: 700, color: attCfg.color }}
              >
                {attCfg.icon} {attCfg.label}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span>🕐 {fmtTime(session.scheduledAt, tz)}</span>
            <span>⏱ {session.durationMins || 30} min</span>
            {session.teacher?.name && <span>👤 {session.teacher.name}</span>}
          </div>
        </div>

        {/* Zoom link — read-only for parent (no Join button) */}
        {session.zoomLink && session.status === "SCHEDULED" && (
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                fontWeight: 600,
                background: "#f0f4f8",
                padding: "6px 10px",
                borderRadius: 6,
                textAlign: "center",
              }}
            >
              Zoom ready
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function ParentSchedulePage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [childId, setChildId] = useState(null);
  const [childTz, setChildTz] = useState("UTC");

  // Read active child from layout's window var
  useEffect(() => {
    const id = window.__parentActiveChild;
    const children = window.__parentChildren || [];
    const child = children.find((c) => c.id === id);
    setChildId(id);
    setChildTz(child?.profile?.timezone || "UTC");
  }, []);

  const load = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/parent/children/${childId}/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to load sessions");
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [childId, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const { upcoming = [], past = [] } = data || {};

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: -0.5,
          }}
        >
          Class Schedule
        </div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
          All sessions shown in {childTz} timezone
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#dc2626",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Upcoming */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#94a3b8",
            marginBottom: 12,
          }}
        >
          Upcoming Sessions {!loading && `(${upcoming.length})`}
        </div>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No upcoming sessions"
            sub="Sessions will appear here once scheduled by the admin."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map((s) => (
              <SessionCard key={s.id} session={s} tz={childTz} />
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#94a3b8",
            marginBottom: 12,
          }}
        >
          Past Sessions {!loading && `(${past.length})`}
        </div>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2].map((i) => (
              <Skeleton key={i} />
            ))}
          </div>
        ) : past.length === 0 ? (
          <EmptyState
            icon="📖"
            title="No past sessions yet"
            sub="Completed classes will appear here."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {past.map((s) => (
              <SessionCard key={s.id} session={s} tz={childTz} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
