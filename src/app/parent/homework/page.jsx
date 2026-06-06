'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

// ─── Config ───────────────────────────────────────────────
const STATUS_CFG = {
  PENDING:   { label: 'Pending',   color: '#64748b', bg: '#f0f4f8'                  },
  SUBMITTED: { label: 'Submitted', color: '#0e6e8a', bg: 'rgba(40,183,217,0.10)'   },
  GRADED:    { label: 'Graded',    color: '#22c55e', bg: 'rgba(34,197,94,0.10)'    },
  OVERDUE:   { label: 'Overdue',   color: '#ef4444', bg: 'rgba(239,68,68,0.10)'    },
};

const FILTER_TABS = ['ALL', 'PENDING', 'SUBMITTED', 'GRADED', 'OVERDUE'];

function Skeleton({ h = 80 }) {
  return <div style={{ height: h, borderRadius: 10, background: '#f0f4f8', animation: 'shimmer 1.5s ease infinite' }} />;
}

function AssignmentCard({ assignment }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[assignment.status] || STATUS_CFG.PENDING;
  const due = new Date(assignment.dueDate);
  const isPast = due < new Date() && assignment.status === 'PENDING';
  const sub = assignment.submission;

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{assignment.title}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 4, padding: '2px 7px' }}>{cfg.label}</span>
          </div>
          <div style={{ fontSize: 12, color: isPast ? '#ef4444' : '#94a3b8', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span>👤 {assignment.teacher?.name || 'Teacher'}</span>
            <span>📅 Due {due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            {sub?.grade && <span style={{ color: '#22c55e', fontWeight: 700 }}>Grade: {sub.grade}</span>}
          </div>
        </div>
        <span style={{ color: '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: '200ms', flexShrink: 0 }}>▾</span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px', background: '#fafbfc' }}>
          {/* Description */}
          {assignment.description && (
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>{assignment.description}</div>
          )}

          {/* Grade card */}
          {sub?.grade && (
            <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d', marginBottom: 4 }}>Grade: {sub.grade}</div>
              {sub.feedback && <div style={{ fontSize: 13, color: '#15803d', lineHeight: 1.6 }}>{sub.feedback}</div>}
            </div>
          )}

          {/* Submitted but not graded */}
          {sub && !sub.grade && (
            <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(40,183,217,0.08)', border: '1px solid rgba(40,183,217,0.2)', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a' }}>
                ✓ Submitted on {new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — awaiting grade
              </div>
              {sub.content && <div style={{ fontSize: 13, color: '#0e6e8a', marginTop: 4, lineHeight: 1.6 }}>{sub.content}</div>}
            </div>
          )}

          {/* Not submitted — parent view is read-only */}
          {!sub && (
            <div style={{ padding: '12px 16px', borderRadius: 8, background: '#f7f9fb', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
                {isPast ? '⚠️ This assignment is overdue and has not been submitted.' : 'Not yet submitted by the student.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function ParentHomeworkPage() {
  const { getToken }             = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filter,      setFilter]      = useState('ALL');
  const [childId,     setChildId]     = useState(null);
  const [childName,   setChildName]   = useState('');

  useEffect(() => {
    const id       = window.__parentActiveChild;
    const children = window.__parentChildren || [];
    const child    = children.find(c => c.id === id);
    setChildId(id);
    setChildName(child?.profile?.childName || 'your child');
  }, []);

  const load = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parent/children/${childId}/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load assignments');
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [childId, getToken]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'ALL'
    ? assignments
    : assignments.filter(a => a.status === filter);

  // Summary counts
  const counts = FILTER_TABS.reduce((acc, t) => {
    acc[t] = t === 'ALL' ? assignments.length : assignments.filter(a => a.status === t).length;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>Homework</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>{childName}&apos;s assignments — read-only view</div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 14, marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary cards */}
      {!loading && assignments.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            ['Pending',   counts.PENDING,   '#64748b'],
            ['Submitted', counts.SUBMITTED, '#0e6e8a'],
            ['Graded',    counts.GRADED,    '#22c55e'],
            ['Overdue',   counts.OVERDUE,   '#ef4444'],
          ].map(([label, count, color]) => (
            <div key={label} style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{count}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${filter === t ? '#0d2840' : '#e2e8f0'}`, background: filter === t ? '#0d2840' : 'white', color: filter === t ? 'white' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {t.charAt(0) + t.slice(1).toLowerCase()} {!loading && counts[t] > 0 && `(${counts[t]})`}
          </button>
        ))}
      </div>

      {/* Assignment list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <Skeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No assignments</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            {filter === 'ALL' ? 'Assignments from the teacher will appear here.' : `No ${filter.toLowerCase()} assignments.`}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(a => <AssignmentCard key={a.id} assignment={a} />)}
        </div>
      )}
    </div>
  );
}