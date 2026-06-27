export default function ComingSoon({ title, phase, blurb }) {
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
        {title}
      </h1>
      <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 28 }}>
        {blurb}
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
        <div style={{ fontSize: 34, marginBottom: 12 }}>🚧</div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 4,
          }}
        >
          Coming in {phase}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#94a3b8",
            maxWidth: 420,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          This section is part of the admin panel roadmap and will be built in{" "}
          {phase}. The navigation and access control are live now.
        </div>
      </div>
    </div>
  );
}
