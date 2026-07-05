'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/oversight/page.jsx  (NEW — Phase 8)
//
// The oversight / exceptions engine. Front door = what needs attention:
// teacher accountability + at-risk students, with inline actions
// (Remind teacher, Contact parent) and drill-down lists.
//
// Wire the sidebar: point the "Attendance"/"Oversight" nav item at
// /admin/oversight (see runbook).
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }
const COURSE_LABELS = { NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation', TAJWEED: 'Tajweed', HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1' };

export default function OversightPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drill, setDrill] = useState(null); // { type, filters, title }

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/oversight`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load oversight');
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = data?.summary || {};

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Oversight</h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>What needs attention right now — updated live.</p>

      {error && <div style={errBox}>⚠️ {error}</div>}

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Kpi label="Teachers with issues" value={s.teachersWithIssues} tone={s.teachersWithIssues ? 'amber' : 'ok'} loading={loading} />
        <Kpi label="Unmarked sessions" value={s.totalUnmarkedSessions} tone={s.totalUnmarkedSessions ? 'red' : 'ok'} loading={loading} />
        <Kpi label="Ungraded work" value={s.totalUngraded} tone={s.totalUngraded ? 'amber' : 'ok'} loading={loading} />
        <Kpi label="Overdue reports" value={s.totalOverdueReports} tone={s.totalOverdueReports ? 'red' : 'ok'} loading={loading} />
        <Kpi label="At-risk students" value={s.atRiskStudents} tone={s.atRiskStudents ? 'red' : 'ok'} loading={loading} />
      </div>

      {loading ? (
        <div style={{ ...card, ...emptyStyle }}>Scanning for issues…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          <AtRiskPanel students={data.atRiskStudents} onDrill={setDrill} />
          <TeacherPanel teachers={data.teacherAccountability} onRemind={load} onDrill={setDrill} />
        </div>
      )}

      {drill && <DrillModal drill={drill} onClose={() => setDrill(null)} />}
    </div>
  );
}

// ─── At-risk students panel ───────────────────────────────
function AtRiskPanel({ students, onDrill }) {
  if (!students || students.length === 0) {
    return (
      <Section title="At-risk students" subtitle="Consecutive absences or attendance below 60%.">
        <div style={{ ...emptyStyle, padding: '28px' }}>✓ No students currently at risk.</div>
      </Section>
    );
  }
  return (
    <Section title={`At-risk students (${students.length})`} subtitle="Consecutive absences or attendance below 60% — likely to churn.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {students.map(st => <AtRiskRow key={st.studentId} st={st} onDrill={onDrill} />)}
      </div>
    </Section>
  );
}

function AtRiskRow({ st, onDrill }) {
  const [showContact, setShowContact] = useState(false);
  const cons = st.reasons.find(r => r.code === 'CONSECUTIVE_ABSENCES');
  const low = st.reasons.find(r => r.code === 'LOW_ATTENDANCE');
  const b = st.stats.breakdown;

  return (
    <div style={{ ...card, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            {st.name} <span style={{ fontWeight: 500, color: '#94a3b8' }}>· {COURSE_LABELS[st.courseType] || st.courseType} · {st.teacherName}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {cons && <span style={badge('#dc2626', 'rgba(239,68,68,0.10)')}>🔴 {cons.detail}</span>}
            {low && <span style={badge('#b45309', 'rgba(250,167,26,0.14)')}>📉 {low.detail}</span>}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
            Last {st.stats.windowSize}: {b.present} present · {b.late} late · {b.absent} absent · {b.excused} excused
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShowContact(v => !v)} style={primaryBtn}>Contact parent</button>
          <button onClick={() => onDrill({ type: 'attendance', filters: { studentId: st.studentId }, title: `${st.name} — attendance` })} style={ghostBtn}>View attendance</button>
        </div>
      </div>
      {showContact && (
        <div style={{ marginTop: 12, padding: '12px 14px', background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: '#0f172a' }}><strong>{st.parent.name || 'Parent'}</strong></div>
          <div style={{ fontSize: 13, color: '#334155', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={`mailto:${st.parent.email}?subject=${encodeURIComponent(`${st.name}'s attendance`)}`} style={{ color: '#0e6e8a', fontWeight: 600, textDecoration: 'none' }}>✉️ {st.parent.email}</a>
            {st.parent.phone
              ? <a href={`tel:${st.parent.phone}`} style={{ color: '#0e6e8a', fontWeight: 600, textDecoration: 'none' }}>📞 {st.parent.phone}</a>
              : <span style={{ color: '#b45309' }}>⚠️ No phone on file</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Teacher accountability panel ─────────────────────────
function TeacherPanel({ teachers, onRemind, onDrill }) {
  if (!teachers || teachers.length === 0) {
    return (
      <Section title="Teacher accountability" subtitle="Unmarked sessions, ungraded work, overdue reports.">
        <div style={{ ...emptyStyle, padding: '28px' }}>✓ All teachers are up to date.</div>
      </Section>
    );
  }
  return (
    <Section title={`Teacher accountability (${teachers.length})`} subtitle="Teachers with outstanding duties — worst first.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {teachers.map(t => <TeacherRow key={t.teacherId} t={t} onRemind={onRemind} onDrill={onDrill} />)}
      </div>
    </Section>
  );
}

function TeacherRow({ t, onRemind, onDrill }) {
  const { getToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const remind = async () => {
    setBusy(true); setMsg('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/oversight/remind-teacher`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teacherId: t.teacherId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      setMsg(d.emailSent ? '✓ Reminder sent' : '⚠️ Saved, email failed');
    } catch (err) { setMsg(`⚠️ ${err.message}`); }
    finally { setBusy(false); }
  };

  const chip = (label, count, tone, drill) => count > 0 ? (
    <button onClick={drill} style={{ ...badge(tone[0], tone[1]), border: 'none', cursor: 'pointer' }}>{label}: {count}</button>
  ) : null;

  return (
    <div style={{ ...card, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {chip('Unmarked sessions', t.unmarkedSessions, ['#dc2626', 'rgba(239,68,68,0.10)'],
              () => onDrill({ type: 'attendance', filters: { teacherId: t.teacherId }, title: `${t.name} — attendance` }))}
            {chip('Ungraded', t.ungradedSubmissions, ['#b45309', 'rgba(250,167,26,0.14)'],
              () => onDrill({ type: 'assignments', filters: { teacherId: t.teacherId, status: 'SUBMITTED' }, title: `${t.name} — ungraded` }))}
            {chip('Overdue reports', t.overdueReports, ['#dc2626', 'rgba(239,68,68,0.10)'],
              () => onDrill({ type: 'reports', filters: { teacherId: t.teacherId, overdue: 'true' }, title: `${t.name} — overdue reports` }))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {msg && <span style={{ fontSize: 12, color: msg.startsWith('✓') ? '#15803d' : '#b45309' }}>{msg}</span>}
          <button onClick={remind} disabled={busy} style={{ ...primaryBtn, background: '#faa71a', color: '#0d2840', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Sending…' : 'Remind teacher'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Drill-down modal ─────────────────────────────────────
function DrillModal({ drill, onClose }) {
  const { getToken } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const qs = new URLSearchParams(drill.filters).toString();
        const res = await fetch(`${apiBase()}/api/admin/oversight/${drill.type}?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to load');
        const d = await res.json();
        setRows(d.records || d.assignments || d.reports || d.overdueEnrollments || []);
      } catch (err) { setError(err.message); }
    })();
  }, [drill]);

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 640, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{drill.title}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>
        {error && <div style={errBox}>⚠️ {error}</div>}
        {!rows ? <div style={emptyStyle}>Loading…</div>
          : rows.length === 0 ? <div style={emptyStyle}>Nothing here.</div>
          : <DrillTable type={drill.type} rows={rows} />}
      </div>
    </div>
  );
}

function DrillTable({ type, rows }) {
  const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const statusColor = { PRESENT: '#15803d', LATE: '#b45309', ABSENT: '#dc2626', EXCUSED: '#8b5cf6', SUBMITTED: '#0e6e8a', GRADED: '#15803d', PENDING: '#64748b', OVERDUE: '#dc2626', DRAFT: '#b45309', SENT: '#15803d' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map((r, i) => {
        if (type === 'attendance') return (
          <Row key={i} left={r.student?.name} mid={`${COURSE_LABELS[r.session?.courseType] || r.session?.courseType || ''} · ${r.teacher?.name || ''}`} right={fmt(r.session?.scheduledAt)} pill={r.status} pc={statusColor[r.status]} />
        );
        if (type === 'assignments') return (
          <Row key={i} left={r.title} mid={`${r.student?.name} · ${r.teacher?.name}`} right={`Due ${fmt(r.dueDate)}`} pill={r.status} pc={statusColor[r.status]} />
        );
        if (type === 'reports') {
          if (r.enrollmentId) return ( // overdue enrollment shape
            <Row key={i} left={r.studentName} mid={`${COURSE_LABELS[r.courseType] || r.courseType} · ${r.teacherName}`} right={`Since ${fmt(r.startDate)}`} pill="OVERDUE" pc="#dc2626" />
          );
          return <Row key={i} left={r.student?.name} mid={r.teacher?.name} right={r.period} pill={r.status} pc={statusColor[r.status]} />;
        }
        return null;
      })}
    </div>
  );
}

function Row({ left, mid, right, pill, pc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #eef2f6', borderRadius: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{left}</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{mid}</div>
      </div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{right}</div>
      {/* hkpfkpew */}
      {pill && <span style={badge(pc, '#f7f9fb')}>{pill}</span>}
    </div>
  );
}

// ─── Small UI helpers ─────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0d2840' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Kpi({ label, value, tone, loading }) {
  const tones = { ok: ['#15803d', 'white'], amber: ['#b45309', 'white'], red: ['#dc2626', 'white'] };
  const [color] = tones[tone] || tones.ok;
  return (
    <div style={{ ...card, padding: '14px 16px' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: loading ? '#e2e8f0' : color }}>{loading ? '—' : (value ?? 0)}</div>
      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
    </div>
  );
}
function badge(color, bg) { return { fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 5, padding: '3px 8px', whiteSpace: 'nowrap' }; }

const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14 };
const emptyStyle = { padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const errBox = { padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 24, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primaryBtn = { padding: '8px 14px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const ghostBtn = { padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' };