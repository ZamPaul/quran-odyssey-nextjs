// app/booking/trial/error.jsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BookingError({ error, reset }) {
  useEffect(() => {
    console.error("Booking error:", error);
  }, [error]);

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
      <div style={{ textAlign: "center", maxWidth: 440, padding: "0 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 8,
          }}
        >
          Booking unavailable
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            marginBottom: 28,
            lineHeight: 1.7,
          }}
        >
          We couldn&apos;t load the booking page. Please try again or contact us
          directly.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: "#faa71a",
              color: "#0d2840",
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: "white",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
