"use client";

// src/components/admin/DeleteImpactModal.jsx  (NEW)
//
// Shared delete confirmation for accounts and learners.
//
// A hard delete is irreversible and reaches further than people expect — it
// takes sessions, assignments, submitted recordings, reports and attendance
// with it. This modal fetches the exact blast radius from the server and
// shows it BEFORE the admin types the confirmation.
//
// Usage:
//   <DeleteImpactModal
//     kind="account"                  // 'account' | 'student'
//     id={account.id}
//     label={account.email}           // the string that must be typed
//     onClose={() => setModal(null)}
//     onDeleted={() => router.push('/admin/accounts')}
//   />

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL;
}

const CFG = {
  account: {
    base: "accounts",
    title: "Delete this account?",
    confirmKey: "confirmEmail",
    prompt: "Type the account email to confirm",
    extra:
      "Their sign-in is removed too, which frees the email address for future use.",
  },
  student: {
    base: "students",
    title: "Delete this learner?",
    confirmKey: "confirmName",
    prompt: "Type the learner's name to confirm",
    extra: "The parent account itself is not affected.",
  },
};

const ROWS = [
  ["students", "Learners"],
  ["enrollments", "Enrolments"],
  ["sessions", "Class sessions"],
  ["attendance", "Attendance records"],
  ["assignments", "Assignments"],
  ["submissions", "Submitted work"],
  ["reports", "Progress reports"],
  ["trials", "Trial bookings"],
  ["enrollmentRequests", "Enrolment requests"],
];

export default function DeleteImpactModal({
  kind,
  id,
  label,
  onClose,
  onDeleted,
}) {
  const cfg = CFG[kind];
  const { getToken } = useAuth();
  const [impact, setImpact] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${apiBase()}/api/admin/${cfg.base}/${id}/delete-impact`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Failed to calculate impact");
        setImpact(d);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [id, kind]);

  const doDelete = async () => {
    setBusy(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/${cfg.base}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [cfg.confirmKey]: typed }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Delete failed");
      // Surface a partial purge rather than claiming a clean delete.
      if (d.purge && !d.purge.ok) {
        setResult(d);
        return;
      }
      onDeleted();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const counts = impact?.counts || {};
  const nonZero = ROWS.filter(([k]) => (counts[k] || 0) > 0);
  const blocked = impact && impact.canDelete === false;
  const matches = typed === label;

  // ── Post-delete: some external cleanup failed ──
  if (result) {
    const f = result.purge;
    return (
      <div onClick={onDeleted} style={overlay}>
        <div onClick={(e) => e.stopPropagation()} style={modalCard}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "#b45309",
              marginBottom: 10,
            }}
          >
            Deleted — but some cleanup failed
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#64748b",
              lineHeight: 1.7,
              marginBottom: 12,
            }}
          >
            The records are gone. {f.filesDeleted} file(s) and {f.eventsDeleted}{" "}
            calendar event(s) were removed, but{" "}
            <strong>{f.failures.length}</strong> item(s) could not be cleaned
            up. The full list is in the Audit Log against this deletion, so it
            can be finished by hand.
          </div>
          <div
            style={{
              maxHeight: 160,
              overflowY: "auto",
              background: "#f8fafc",
              borderRadius: 8,
              padding: 10,
              marginBottom: 14,
            }}
          >
            {f.failures.slice(0, 12).map((x, i) => (
              <div
                key={i}
                style={{ fontSize: 11.5, color: "#64748b", padding: "2px 0" }}
              >
                {x.kind}: {x.ref} — {x.error}
              </div>
            ))}
          </div>
          <button onClick={onDeleted} style={primary}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={overlay}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ ...modalCard, maxHeight: "88vh", overflowY: "auto" }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#dc2626",
            marginBottom: 8,
          }}
        >
          {cfg.title}
        </div>

        {error && <div style={errBox}>⚠️ {error}</div>}

        {!impact ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            Calculating impact…
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              This permanently deletes <strong>{label}</strong>. {cfg.extra}{" "}
              <strong>It cannot be undone.</strong>
            </div>

            {blocked ? (
              <div style={warnBox}>
                {impact.blockers.map((b, i) => (
                  <div key={i}>• {b}</div>
                ))}
              </div>
            ) : (
              <>
                <div style={lbl}>What will be destroyed</div>
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginBottom: 12,
                  }}
                >
                  {nonZero.length === 0 ? (
                    <div
                      style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}
                    >
                      No linked records — a clean delete.
                    </div>
                  ) : (
                    nonZero.map(([k, l]) => (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: 13,
                        }}
                      >
                        <span style={{ color: "#334155" }}>{l}</span>
                        <span style={{ fontWeight: 800, color: "#0f172a" }}>
                          {counts[k]}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {(counts.files > 0 || counts.calendarEvents > 0) && (
                  <div style={warnBox}>
                    Also removes <strong>{counts.files}</strong> uploaded
                    file(s)
                    {counts.submissions > 0 &&
                      " — including learner recordings"}{" "}
                    and <strong>{counts.calendarEvents}</strong> calendar
                    event(s).
                  </div>
                )}

                <div style={lbl}>{cfg.prompt}</div>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={label}
                  style={{
                    ...inp,
                    marginBottom: 16,
                    borderColor: typed && !matches ? "#fecaca" : "#e2e8f0",
                  }}
                />
              </>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              {!blocked && (
                <button
                  onClick={doDelete}
                  disabled={busy || !matches}
                  style={{
                    ...primary,
                    background: busy || !matches ? "#e2e8f0" : "#dc2626",
                    color: busy || !matches ? "#94a3b8" : "white",
                  }}
                >
                  {busy ? "Deleting…" : "Permanently delete"}
                </button>
              )}
              <button onClick={onClose} disabled={busy} style={ghost}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(13,40,64,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: 20,
};
const modalCard = {
  background: "white",
  borderRadius: 16,
  padding: 26,
  width: "100%",
  maxWidth: 470,
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};
const errBox = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.2)",
  color: "#dc2626",
  fontSize: 13,
  marginBottom: 12,
};
const warnBox = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(250,167,26,0.12)",
  border: "1px solid rgba(250,167,26,0.3)",
  color: "#92400e",
  fontSize: 12.5,
  marginBottom: 14,
  lineHeight: 1.7,
};
const inp = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 13,
  color: "#0f172a",
  boxSizing: "border-box",
  outline: "none",
};
const lbl = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#94a3b8",
  marginBottom: 6,
};
const primary = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#0d2840",
  color: "white",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};
const ghost = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "white",
  color: "#64748b",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};