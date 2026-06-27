"use client";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 6,
        }}
      >
        Dashboard
      </h1>
      <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 28 }}>
        Welcome to the Quran Odyssey admin panel.
      </p>
      <div
        style={{
          background: "white",
          border: "1px dashed #cbd5e1",
          borderRadius: 14,
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 34, marginBottom: 12 }}>📊</div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 4,
          }}
        >
          Foundation is live
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#94a3b8",
            maxWidth: 460,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Admin sign-in, the audit trail, and the panel shell are now in place.
          KPI cards, charts, and the activity feed arrive in Phase 2.
        </div>
      </div>
    </div>
  );
}
