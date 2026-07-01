"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import useTeacherFetch from "../../hooks/useTeacherFetch.js";
import FileUpload, {
  FileCard,
  FilePreview,
} from "../../../components/FileUpload";
import { useAuth } from "@clerk/nextjs";

// ─── Constants ────────────────────────────────────────────
const COURSE_TYPES = [
  { value: "NOORANI_QAIDA", label: "Noorani Qaida" },
  { value: "QURAN_RECITATION", label: "Quran Recitation" },
  { value: "TAJWEED", label: "Tajweed" },
  { value: "HIFZ", label: "Hifz Programme" },
  { value: "ISLAMIC_STUDIES", label: "Islamic Studies" },
  { value: "ONE_TO_ONE", label: "One-to-One Private" },
];

const STATUS_COLORS = {
  PENDING: "#f59e0b",
  SUBMITTED: "#28b7d9",
  GRADED: "#22c55e",
  OVERDUE: "#ef4444",
};

// ─── Shared input styles ──────────────────────────────────
const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#94a3b8",
  display: "block",
  marginBottom: 6,
};
const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  color: "#0f172a",
  boxSizing: "border-box",
  background: "white",
};

const btnPrimary = (disabled) => ({
  padding: "9px 18px",
  borderRadius: 8,
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  background: disabled ? "#e2e8f0" : "#0d2840",
  color: disabled ? "#94a3b8" : "white",
  fontSize: 13,
  fontWeight: 700,
});

// ─── Create Assignment Form ───────────────────────────────
function CreateForm({
  students,
  onCreated,
  onCancel,
  apiFetch,
  teacherClerkId,
}) {
  const [form, setForm] = useState({
    studentId: "",
    title: "",
    description: "",
    dueDate: "",
    courseType: "",
    // File attachment fields
    attachmentUrl: "",
    attachmentName: "",
    attachmentType: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const isValid =
    form.studentId && form.title && form.dueDate && form.courseType;

  // Auto-set courseType when student selected
  useEffect(() => {
    if (!form.studentId) return;
    const match = students.find((s) => s.student.id === form.studentId);
    if (match) set("courseType", match.enrollment.courseType);
  }, [form.studentId]);

  const handleUploadComplete = ({ url, fileName, fileType }) => {
    set("attachmentUrl", url);
    set("attachmentName", fileName);
    set("attachmentType", fileType);
  };

  const handleFileClear = () => {
    set("attachmentUrl", "");
    set("attachmentName", "");
    set("attachmentType", "");
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const body = {
        ...form,
        description: form.description || undefined,
        attachmentUrl: form.attachmentUrl || undefined,
        attachmentName: form.attachmentName || undefined,
        attachmentType: form.attachmentType || undefined,
      };
      const data = await apiFetch("/api/teacher/assignments", {
        method: "POST",
        body: JSON.stringify(body),
      });
      onCreated(data.assignment);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        border: "1px solid #28b7d9",
        boxShadow: "0 0 0 3px rgba(40,183,217,0.08)",
        padding: "24px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 18,
        }}
      >
        New Assignment
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Student */}
        <div>
          <label style={labelStyle}>Student *</label>
          <select
            value={form.studentId}
            onChange={(e) => set("studentId", e.target.value)}
            style={inputStyle}
          >
            <option value="">Select student</option>
            {students.map(({ student, enrollment }) => (
              <option key={student.id} value={student.id}>
                {student?.name || student.email} —{" "}
                {enrollment.courseType.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Course */}
        <div>
          <label style={labelStyle}>Course *</label>
          <select
            value={form.courseType}
            onChange={(e) => set("courseType", e.target.value)}
            style={inputStyle}
          >
            <option value="">Select course</option>
            {COURSE_TYPES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Title *</label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Practice Surah Al-Fatiha"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Instructions</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Detailed instructions for the student…"
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        {/* Due date */}
        <div>
          <label style={labelStyle}>Due Date *</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            style={inputStyle}
          />
        </div>

        {/* File attachment */}
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Attachment (optional)</label>
          <FileUpload
            role="teacher"
            userId={teacherClerkId}
            label="Attach worksheet, audio, or PDF"
            onUploadComplete={handleUploadComplete}
            onClear={handleFileClear}
            existingFile={
              form.attachmentUrl
                ? {
                    url: form.attachmentUrl,
                    fileName: form.attachmentName,
                    fileType: form.attachmentType,
                  }
                : null
            }
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#dc2626",
            fontSize: 13,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button
          onClick={handleSubmit}
          disabled={saving || !isValid}
          style={btnPrimary(saving || !isValid)}
        >
          {saving ? "Creating…" : "Create Assignment"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "white",
            color: "#64748b",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Grade Form ───────────────────────────────────────────
function GradeForm({ assignmentId, onGraded, apiFetch }) {
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const QUICK_GRADES = [
    "Excellent ✓",
    "MashaAllah ⭐",
    "Good Work 👍",
    "Needs Practice 📝",
  ];

  const handleSubmit = async () => {
    if (!grade.trim()) {
      setError("Enter a grade");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/teacher/assignments/${assignmentId}/grade`, {
        method: "POST",
        body: JSON.stringify({
          grade: grade.trim(),
          feedback: feedback.trim() || undefined,
        }),
      });
      onGraded(grade.trim(), feedback.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 14,
        padding: "14px",
        borderRadius: 8,
        background: "#f7f9fb",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 10,
        }}
      >
        Grade Submission
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}
      >
        {QUICK_GRADES.map((g) => (
          <button
            key={g}
            onClick={() => setGrade(g)}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: `1.5px solid ${grade === g ? "#28b7d9" : "#e2e8f0"}`,
              background: grade === g ? "rgba(40,183,217,0.08)" : "white",
              color: grade === g ? "#0e6e8a" : "#64748b",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {g}
          </button>
        ))}
      </div>
      <input
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        placeholder="Or type a custom grade…"
        style={{ ...inputStyle, marginBottom: 8 }}
      />
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={2}
        placeholder="Feedback for the student (optional)…"
        style={{ ...inputStyle, resize: "vertical" }}
      />
      {error && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#ef4444" }}>
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{ ...btnPrimary(saving), marginTop: 10 }}
      >
        {saving ? "Saving…" : "Submit Grade"}
      </button>
    </div>
  );
}

// ─── Assignment Card ──────────────────────────────────────
function AssignmentCard({
  assignment,
  expanded,
  onToggle,
  onUpdated,
  onDeleted,
  apiFetch,
}) {
  const { user } = useUser();     
  const due = new Date(assignment.dueDate);
  const isPastDue = due < new Date();
  const childName =
    assignment.student?.name ||
    assignment.student?.email?.split("@")[0] ||
    "Student";
  const sub = assignment.submission;
  const [local, setLocal] = useState(assignment);

  const [editing, setEditing] = useState(false); 
  const isGraded = local.status === "GRADED" || !!local.submission?.grade;

  const handleGraded = (grade, feedback) => {
    const updated = {
      ...local,
      status: "GRADED",
      submission: {
        ...local.submission,
        grade,
        feedback,
        gradedAt: new Date().toISOString(),
      },
    };
    setLocal(updated);
    onUpdated(updated);
  };

  const handleSavedEdit = (updatedAssignment) => {
    setLocal(updatedAssignment);
    onUpdated(updatedAssignment);
    setEditing(false);
  };

  const handleUnlocked = () => {
    const updated = {
      ...local,
      status: "PENDING",
      submission: local.submission
        ? { ...local.submission, grade: null, feedback: null, gradedAt: null }
        : local.submission,
    };
    setLocal(updated);
    onUpdated(updated);
  };

  const statusColor = STATUS_COLORS[local.status] || "#94a3b8";

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          padding: "16px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              {local.title}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: statusColor,
                background: `${statusColor}22`,
                borderRadius: 5,
                padding: "2px 7px",
              }}
            >
              {local.status}
            </span>
            {/* Attachment indicator */}
            {local.attachmentUrl && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94a3b8",
                  background: "#f0f4f8",
                  borderRadius: 5,
                  padding: "2px 7px",
                }}
              >
                📎 Attachment
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#94a3b8",
              marginTop: 3,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span>👤 {childName}</span>
            <span
              style={{
                color:
                  isPastDue && local.status === "PENDING"
                    ? "#ef4444"
                    : "#94a3b8",
              }}
            >
              📅 Due{" "}
              {due.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <span
          style={{
            color: "#94a3b8",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "200ms",
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            padding: "20px",
            background: "#fafbfc",
          }}
        >
          {/* Description */}
          {local.description && (
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              {local.description}
            </div>
          )}

          {/* Teacher's attachment — always visible */}
          {local.attachmentUrl && (
            <FilePreview
              url={local.attachmentUrl}
              fileName={local.attachmentName}
              fileType={local.attachmentType}
              label="Your attachment"
            />
          )}

          {/* Submission section */}
          {sub ? (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#94a3b8",
                  marginBottom: 8,
                }}
              >
                Student Submission
              </div>
              {sub.content && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#334155",
                    lineHeight: 1.7,
                    padding: "10px 14px",
                    background: "white",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    marginBottom: 10,
                  }}
                >
                  {sub.content}
                </div>
              )}
              {/* Student's uploaded file */}
              {sub.fileUrl && (
                <FilePreview
                  url={sub.fileUrl}
                  fileName={sub.fileName}
                  fileType={sub.fileType}
                  label="Student's file"
                />
              )}
              {/* Grade display or form */}
              {sub.grade ? (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 14px",
                    borderRadius: 8,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 800, color: "#15803d" }}
                  >
                    Grade: {sub.grade}
                  </div>
                  {sub.feedback && (
                    <div
                      style={{ fontSize: 13, color: "#15803d", marginTop: 4 }}
                    >
                      {sub.feedback}
                    </div>
                  )}
                </div>
              ) : (
                <GradeForm
                  assignmentId={local.id}
                  onGraded={handleGraded}
                  apiFetch={apiFetch}
                />
              )}
            </div>
          ) : (
            <div
              style={{
                marginTop: 14,
                fontSize: 13,
                color: "#94a3b8",
                fontStyle: "italic",
              }}
            >
              No submission yet.
            </div>
          )}

          {/* ── ACTIONS BAR ───────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid #e2e8f0",
            }}
          >
            {/* Edit — locked once graded */}
            <button
              onClick={() => setEditing(true)}
              disabled={isGraded}
              title={
                isGraded
                  ? 'Graded assignments are locked. Use "Allow resubmission" to reopen.'
                  : "Edit assignment"
              }
              style={{
                padding: "7px 14px",
                borderRadius: 7,
                border: `1px solid ${isGraded ? "#e2e8f0" : "#0d2840"}`,
                background: "white",
                color: isGraded ? "#cbd5e1" : "#0d2840",
                fontSize: 12,
                fontWeight: 700,
                cursor: isGraded ? "not-allowed" : "pointer",
              }}
            >
              Edit
            </button>

            {/* Allow resubmission — only when a submission exists */}
            {sub && (
              <UnlockButton
                assignmentId={local.id}
                apiFetch={apiFetch}
                onUnlocked={handleUnlocked}
              />
            )}

            {/* Delete (handles force path internally) */}
            <DeleteButton
              assignment={local}
              apiFetch={apiFetch}
              onDeleted={() => onDeleted(local.id)}
            />
          </div>
        </div>
      )}

      {editing && (
        <EditAssignmentModal
          assignment={local}
          apiFetch={apiFetch}
          userId={user?.id}
          onClose={() => setEditing(false)}
          onSaved={handleSavedEdit}
        />
      )}
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────
function FilterTabs({ active, onChange, counts }) {
  const tabs = ["ALL", "PENDING", "SUBMITTED", "GRADED", "OVERDUE"];
  return (
    <div
      style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}
    >
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: "7px 14px",
            borderRadius: 8,
            border: `1.5px solid ${active === t ? "#0d2840" : "#e2e8f0"}`,
            background: active === t ? "#0d2840" : "white",
            color: active === t ? "white" : "#64748b",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.charAt(0) + t.slice(1).toLowerCase()}
          {counts[t] > 0 && ` (${counts[t]})`}
        </button>
      ))}
    </div>
  );
}

// ─── UnlockButton ("Allow resubmission") ──────────────────
function UnlockButton({ assignmentId, apiFetch, onUnlocked }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
 
  const doUnlock = async () => {
    setBusy(true); setError("");
    try {
      await apiFetch(`/api/teacher/assignments/${assignmentId}/unlock`, { method: "POST" });
      onUnlocked();
    } catch (err) { setError(err.message); setBusy(false); }
  };
 
  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #28b7d9", background: "white", color: "#0e6e8a", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
      >
        Allow resubmission
      </button>
    );
  }
 
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, color: "#0e6e8a", fontWeight: 600 }}>Reopen for the student?</span>
      <button onClick={doUnlock} disabled={busy} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: busy ? "#e2e8f0" : "#28b7d9", color: busy ? "#94a3b8" : "white", fontSize: 12, fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Reopening…" : "Yes"}
      </button>
      <button onClick={() => setConfirming(false)} disabled={busy} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>No</button>
      {error && <span style={{ fontSize: 11, color: "#dc2626" }}>⚠️ {error}</span>}
    </span>
  );
}

// ─── DeleteButton (raw fetch to read the 409 requiresForce body) ──
function DeleteButton({ assignment, apiFetch, onDeleted }) {
  const { getToken } = useAuth();
  const [stage, setStage] = useState("idle"); // idle | confirm | forceConfirm
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
 
  const attempt = async (force) => {
    setBusy(true); setError("");
    try {
      const token = await getToken();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/teacher/assignments/${assignment.id}${force ? "?force=true" : ""}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
 
      if (res.status === 409 && data.requiresForce) {
        setStage("forceConfirm");
        setBusy(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Delete failed");
      onDeleted();
    } catch (err) { setError(err.message); setBusy(false); }
  };
 
  if (stage === "idle") {
    return (
      <button
        onClick={() => setStage("confirm")}
        style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #fecaca", background: "white", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
      >
        Delete
      </button>
    );
  }
 
  if (stage === "confirm") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>Delete this assignment?</span>
        <button onClick={() => attempt(false)} disabled={busy} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: busy ? "#e2e8f0" : "#dc2626", color: busy ? "#94a3b8" : "white", fontSize: 12, fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>
          {busy ? "…" : "Yes"}
        </button>
        <button onClick={() => setStage("idle")} disabled={busy} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>No</button>
        {error && <span style={{ fontSize: 11, color: "#dc2626" }}>⚠️ {error}</span>}
      </span>
    );
  }
 
  // forceConfirm — the student has a submission
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>
        Student already submitted. Delete the assignment AND their submission?
      </span>
      <button onClick={() => attempt(true)} disabled={busy} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: busy ? "#e2e8f0" : "#dc2626", color: busy ? "#94a3b8" : "white", fontSize: 12, fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Deleting…" : "Delete everything"}
      </button>
      <button onClick={() => setStage("idle")} disabled={busy} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
      {error && <span style={{ fontSize: 11, color: "#dc2626" }}>⚠️ {error}</span>}
    </span>
  );
}

// ─── EditAssignmentModal ──────────────────────────────────
function EditAssignmentModal({ assignment, apiFetch, userId, onClose, onSaved }) {
  const [title, setTitle]             = useState(assignment.title || "");
  const [description, setDescription] = useState(assignment.description || "");
  const [dueDate, setDueDate]         = useState(assignment.dueDate ? assignment.dueDate.slice(0, 16) : "");
  const [attachment, setAttachment]   = useState(
    assignment.attachmentUrl
      ? { url: assignment.attachmentUrl, fileName: assignment.attachmentName, fileType: assignment.attachmentType, path: assignment.attachmentPath }
      : null
  );
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
 
  const save = async () => {
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError("");
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
      };
      if (dueDate) body.dueDate = new Date(dueDate).toISOString();
 
      if (attachment?.url && attachment.url !== assignment.attachmentUrl) {
        body.attachmentUrl  = attachment.url;
        body.attachmentName = attachment.fileName;
        body.attachmentType = attachment.fileType;
        body.attachmentPath = attachment.path;
      } else if (removeAttachment && !attachment) {
        body.removeAttachment = true;
      }
 
      const data = await apiFetch(`/api/teacher/assignments/${assignment.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      onSaved(data.assignment);
    } catch (err) { setError(err.message); setSaving(false); }
  };
 
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,40,64,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Edit Assignment</div>
 
        {assignment.submission && (
          <div style={{ fontSize: 12, color: "#92400e", background: "#fff7e0", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "8px 12px", margin: "8px 0 4px" }}>
            ⚠️ This student has already submitted. Editing the task now may not match what they answered.
          </div>
        )}
 
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Attachment (optional)</label>
            {attachment ? (
              <div>
                <FilePreview url={attachment.url} fileName={attachment.fileName} fileType={attachment.fileType} label="Current attachment" />
                <button onClick={() => { setAttachment(null); setRemoveAttachment(true); }} style={{ marginTop: 8, padding: "6px 12px", borderRadius: 7, border: "1px solid #fecaca", background: "white", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Remove attachment
                </button>
              </div>
            ) : (
              <FileUpload role="teacher" userId={userId} label="Replace / add attachment" compact
                onUploadComplete={(r) => { setAttachment(r); setRemoveAttachment(false); }}
                onClear={() => setAttachment(null)} />
            )}
          </div>
        </div>
 
        {error && <div style={{ marginTop: 12, fontSize: 13, color: "#dc2626" }}>⚠️ {error}</div>}
 
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button onClick={save} disabled={saving} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: saving ? "#e2e8f0" : "#0d2840", color: saving ? "#94a3b8" : "white", fontSize: 14, fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function AssignmentsPage() {
  const { user } = useUser();
  const { apiFetch } = useTeacherFetch();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [aData, sData] = await Promise.all([
          apiFetch("/api/teacher/assignments"),
          apiFetch("/api/teacher/students"),
        ]);
        setAssignments(aData.assignments || []);
        setStudents(sData.students || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered =
    filter === "ALL"
      ? assignments
      : assignments.filter((a) => a.status === filter);

  const counts = ["ALL", "PENDING", "SUBMITTED", "GRADED", "OVERDUE"].reduce(
    (acc, t) => {
      acc[t] =
        t === "ALL"
          ? assignments.length
          : assignments.filter((a) => a.status === t).length;
      return acc;
    },
    {},
  );

  const handleCreated = (assignment) => {
    setAssignments((prev) => [assignment, ...prev]);
    setShowCreate(false);
  };

  const handleUpdated = (updated) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );
  };

  const handleDeleted = (deletedId) => {
    setAssignments((prev) => prev.filter((a) => a.id !== deletedId));
    setExpanded(null);
  };

  const handleBulkOverdue = async () => {
    try {
      await apiFetch("/api/teacher/assignments/bulk-overdue", {
        method: "POST",
      });
      const data = await apiFetch("/api/teacher/assignments");
      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: -0.5,
          }}
        >
          Assignments
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleBulkOverdue}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#94a3b8",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Mark Overdue
          </button>
          <button
            onClick={() => setShowCreate((s) => !s)}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "none",
              background: "#faa71a",
              color: "#0d2840",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            + New Assignment
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <CreateForm
          students={students}
          onCreated={handleCreated}
          onCancel={() => setShowCreate(false)}
          apiFetch={apiFetch}
          teacherClerkId={user?.id}
        />
      )}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#dc2626",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Filter tabs */}
      <FilterTabs active={filter} onChange={setFilter} counts={counts} />

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 72,
                borderRadius: 10,
                background: "#f0f4f8",
                animation: "shimmer 1.5s ease infinite",
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            background: "white",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 4,
            }}
          >
            No assignments
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            {filter === "ALL"
              ? "Create your first assignment above."
              : `No ${filter.toLowerCase()} assignments.`}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              expanded={expanded === a.id}
              onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}    
              apiFetch={apiFetch}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
