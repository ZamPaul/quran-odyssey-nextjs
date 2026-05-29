// app/not-found.jsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f9fb",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: "0 24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#e2e8f0",
            letterSpacing: -4,
            marginBottom: 8,
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 8,
            letterSpacing: -0.5,
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#64748b",
            marginBottom: 32,
            lineHeight: 1.7,
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              padding: "11px 22px",
              borderRadius: 8,
              background: "#0d2840",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Go home
          </Link>
          <Link
            href="/contact"
            style={{
              padding: "11px 22px",
              borderRadius: 8,
              background: "white",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
