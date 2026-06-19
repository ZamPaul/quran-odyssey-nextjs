'use client';

// ═══════════════════════════════════════════════════════════
// UNIFIED ACCOUNT-HOLDER DASHBOARD  (Phase 5)
//
// Replaces both the old student dashboard and the parent dashboard.
// One account holder (parent OR solo adult) logs in and sees their
// learner(s). If 1 learner → no selector. If 2+ → child-selector strip.
// Read-write: the account holder acts on the selected learner's behalf.
//
// Data model:
//   GET /api/students                       → { account, students[] }
//   GET /api/students/:id/sessions          → { upcoming, past }
//   GET /api/students/:id/progress          → { attendance, reports }
//   GET /api/students/:id/assignments       → { assignments }
//   POST /api/students/:id/assignments/:aid/submit
//   PATCH /api/students/:id                  → update learner
//   PATCH /api/students/account/me           → update account holder
// ═══════════════════════════════════════════════════════════

import { useUser, useClerk, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import FileUpload, { FileCard, FilePreview } from '../../components/FileUpload';

// ─── Constants ────────────────────────────────────────────
const COURSE_LABELS = {
  NOORANI_QAIDA:    'Noorani Qaida',
  QURAN_RECITATION: 'Quran Recitation',
  TAJWEED:          'Tajweed',
  HIFZ:             'Hifz',
  ISLAMIC_STUDIES:  'Islamic Studies',
  ONE_TO_ONE:       '1-on-1',
};

const ATT_CFG = {
  PRESENT: { label: 'Present', color: '#22c55e', bg: 'rgba(34,197,94,0.10)',  icon: '✓'  },
  LATE:    { label: 'Late',    color: '#f97316', bg: 'rgba(249,115,22,0.10)', icon: '⏰' },
  ABSENT:  { label: 'Absent',  color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  icon: '✗'  },
  EXCUSED: { label: 'Excused', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', icon: '📋' },
};

const SESSION_STATUS_CFG = {
  SCHEDULED:  { label: 'Scheduled',  color: '#28b7d9', bg: 'rgba(40,183,217,0.10)'  },
  COMPLETED:  { label: 'Completed',  color: '#22c55e', bg: 'rgba(34,197,94,0.10)'   },
  CANCELLED:  { label: 'Cancelled',  color: '#ef4444', bg: 'rgba(239,68,68,0.10)'   },
  MISSED:     { label: 'Missed',     color: '#f97316', bg: 'rgba(249,115,22,0.10)'  },
};

const ASSIGNMENT_STATUS_CFG = {
  PENDING:   { label: 'Pending',   color: '#64748b', bg: '#f0f4f8'                  },
  SUBMITTED: { label: 'Submitted', color: '#0e6e8a', bg: 'rgba(40,183,217,0.10)'   },
  GRADED:    { label: 'Graded',    color: '#22c55e', bg: 'rgba(34,197,94,0.10)'    },
  OVERDUE:   { label: 'Overdue',   color: '#ef4444', bg: 'rgba(239,68,68,0.10)'    },
};

const NAV = [
  { id: 'overview',  label: 'Overview',          icon: '⊞' },
  { id: 'classes',   label: 'My Classes',         icon: '📅' },
  { id: 'progress',  label: 'Progress',           icon: '📊' },
  { id: 'homework',  label: 'Homework',           icon: '📋' },
  { id: 'profile',   label: 'Profile & Settings', icon: '👤' },
];

// ─── Helpers ──────────────────────────────────────────────
function fmtDate(iso, tz) {
  return new Date(iso).toLocaleDateString('en-GB', {
    timeZone: tz || 'UTC',
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}
function fmtTime(iso, tz) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    timeZone: tz || 'UTC', hour: '2-digit', minute: '2-digit',
  });
}
function isLiveSession(scheduledAt) {
  const start = new Date(scheduledAt).getTime();
  const now   = Date.now();
  return now >= start - 5 * 60 * 1000 && now <= start + 30 * 60 * 1000;
}
function courseLabelFromEnum(c) {
  return c ? (COURSE_LABELS[c] || c.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase())) : null;
}
function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

// ═══════════════════════════════════════════════════════════
// SHARED SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════
function Skeleton() {
  return <div style={{ height: 72, borderRadius: 12, background: '#f0f4f8', animation: 'shimmer 1.5s ease infinite' }} />;
}
function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#94a3b8' }}>{sub}</div>
      {action && (
        <Link href={action.href} style={{ display: 'inline-flex', marginTop: 14, background: '#faa71a', color: '#0d2840', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
function ErrorBox({ msg }) {
  return <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 14 }}>⚠️ {msg}</div>;
}

// ═══════════════════════════════════════════════════════════
// CHILD SELECTOR (only shown when 2+ learners)
// ═══════════════════════════════════════════════════════════
function ChildSelector({ students, activeId, onSelect }) {
  if (!students || students.length < 2) return null;
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginRight: 4 }}>
        Viewing
      </span>
      {students.map(s => {
        const active = s.id === activeId;
        const initials = (s.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        return (
          <button key={s.id} onClick={() => onSelect(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 8px', borderRadius: 999, cursor: 'pointer',
            border: `1.5px solid ${active ? '#0d2840' : '#e2e8f0'}`,
            background: active ? '#0d2840' : 'white',
            transition: 'all 150ms ease',
          }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: active ? '#28b7d9' : '#f0f4f8', color: active ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
              {initials}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'white' : '#0f172a' }}>{s.name}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════
function Sidebar({ activeTab, setActiveTab, account, onSignOut }) {
  const displayName = account?.name || account?.email?.split('@')[0] || 'Account';
  const initials = (displayName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside style={{ width: 248, background: '#0a2035', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #28b7d9, #0e6e8a)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0 }}>QO</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: -0.2 }}>Quran Odyssey</div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>Family Portal</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '16px 8px 6px' }}>Main Menu</div>
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
              background: active ? 'rgba(40,183,217,0.14)' : 'transparent',
              color: active ? 'white' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: active ? 700 : 500,
            }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #faa71a, #e8920a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0d2840', flexShrink: 0 }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account?.email}</div>
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════
function OverviewTab({ account, student }) {
  const { getToken } = useAuth();
  const childName   = student?.name || 'your child';
  const courseLabel = courseLabelFromEnum(student?.courseInterest);

  const [applications, setApplications] = useState([]);
  const [trials,       setTrials]       = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!student) return;
    const load = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [appRes, trialRes] = await Promise.all([
          fetch(`${apiBase()}/api/enrollment/my?studentId=${student.id}`, { headers }),
          fetch(`${apiBase()}/api/booking/mine?studentId=${student.id}`,   { headers }),
        ]);
        if (appRes.ok)   { const d = await appRes.json();   setApplications(d.applications || []); }
        if (trialRes.ok) { const d = await trialRes.json(); setTrials(d.bookings || []); }
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    };
    load();
  }, [student?.id]);

  const activeApplication = applications.find(a => a.status !== 'CANCELLED' && a.status !== 'REJECTED') || null;
  const latestTrial = trials[0] || null;

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
        {childName}'s Overview
      </div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
        {courseLabel ? `Enrolled interest: ${courseLabel}` : 'No course selected yet'}
      </div>

      {/* Trial booking card */}
      {latestTrial && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 10 }}>Trial Class</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                {fmtDate(latestTrial.slotStart, student?.timezone)} · {fmtTime(latestTrial.slotStart, student?.timezone)}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Status: {latestTrial.status}</div>
            </div>
            {latestTrial.zoomLink && isLiveSession(latestTrial.slotStart) ? (
              <a href={latestTrial.zoomLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#22c55e', color: 'white', padding: '12px 22px', borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>▶ Join Class Now</a>
            ) : latestTrial.status === 'PENDING' ? (
              <div style={{ padding: '12px 14px', background: '#fff7e0', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 3 }}>⏳ Zoom Link Pending</div>
                <div style={{ fontSize: 12, color: '#b45309', lineHeight: 1.5 }}>The teacher will email the link at least 1 hour before class.</div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Enrollment application status */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 10 }}>Enrollment</div>
        {loading ? (
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Loading…</div>
        ) : activeApplication ? (
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{activeApplication.courseLabel || activeApplication.courseType}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Application status: {activeApplication.status}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>No active enrollment application for {childName}.</div>
            <Link href={`/enroll?studentId=${student?.id}`} style={{ display: 'inline-flex', background: '#0d2840', color: 'white', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Enroll {childName} →
            </Link>
          </div>
        )}
      </div>

      {/* Book trial CTA if no trial yet */}
      {!latestTrial && (
        <EmptyState
          icon="📅"
          title={`Book a free trial for ${childName}`}
          sub="A 30-minute trial class to get started."
          action={{ href: `/booking/trial?studentId=${student?.id}`, label: 'Book Free Trial' }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MY CLASSES TAB
// ═══════════════════════════════════════════════════════════
function ClassesTab({ student }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!student) return;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/students/${student.id}/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load sessions');
        setData(await res.json());
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, [student?.id]);

  const tz = student?.timezone || 'UTC';

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <Skeleton key={i} />)}</div>;
  if (error)   return <ErrorBox msg={error} />;

  const { upcoming = [], past = [] } = data || {};

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>{student?.name}'s Classes</div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 12 }}>Upcoming</div>
        {upcoming.length === 0 ? (
          <EmptyState icon="📅" title="No upcoming classes" sub="Scheduled sessions will appear here." action={{ href: `/booking/trial?studentId=${student?.id}`, label: 'Book Free Trial' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(s => <SessionCard key={s.id} session={s} tz={tz} showJoin />)}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 12 }}>Past Sessions</div>
        {past.length === 0 ? (
          <EmptyState icon="📖" title="No past sessions yet" sub="Completed classes will appear here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {past.map(s => <SessionCard key={s.id} session={s} tz={tz} showJoin={false} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session, tz, showJoin }) {
  const live = isLiveSession(session.scheduledAt);
  const cfg  = SESSION_STATUS_CFG[session.status] || SESSION_STATUS_CFG.SCHEDULED;
  const attCfg = session.attendance ? ATT_CFG[session.attendance.status] : null;

  return (
    <div style={{ background: 'white', borderRadius: 12, border: `1px solid ${live ? '#28b7d9' : '#e2e8f0'}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{COURSE_LABELS[session.courseType] || session.courseType}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 5, padding: '2px 7px' }}>{cfg.label}</span>
          {attCfg && <span style={{ fontSize: 11, fontWeight: 700, color: attCfg.color, background: attCfg.bg, borderRadius: 5, padding: '2px 7px' }}>{attCfg.icon} {attCfg.label}</span>}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span>📅 {fmtDate(session.scheduledAt, tz)}</span>
          <span>🕐 {fmtTime(session.scheduledAt, tz)}</span>
          {session.teacher?.name && <span>👤 {session.teacher.name}</span>}
        </div>
      </div>
      {showJoin && live && session.zoomLink && (
        <a href={session.zoomLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#faa71a', color: '#0d2840', fontSize: 13, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>▶ Join</a>
      )}
      {showJoin && !live && session.zoomLink && session.status === 'SCHEDULED' && (
        <a href={session.zoomLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>View Link</a>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROGRESS TAB
// ═══════════════════════════════════════════════════════════
function ProgressTab({ student }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [expanded, setExpanded] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!student) return;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/students/${student.id}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load progress');
        setData(await res.json());
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, [student?.id]);

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <Skeleton key={i} />)}</div>;
  if (error)   return <ErrorBox msg={error} />;

  const { attendance, reports } = data || {};
  const att = attendance || { total: 0, present: 0, late: 0, absent: 0, excused: 0, percentage: 0 };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>{student?.name}'s Progress</div>

      {/* Attendance ring + stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 12px' }}>
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f0f4f8" strokeWidth="12" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#28b7d9" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - att.percentage / 100)}`} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>{att.percentage}%</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Attendance</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{att.total} sessions tracked</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            ['Present', att.present, ATT_CFG.PRESENT],
            ['Late',    att.late,    ATT_CFG.LATE],
            ['Absent',  att.absent,  ATT_CFG.ABSENT],
            ['Excused', att.excused, ATT_CFG.EXCUSED],
          ].map(([label, val, cfg]) => (
            <div key={label} style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: cfg.color }}>{val}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports */}
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 12 }}>Progress Reports</div>
      {(!reports || reports.length === 0) ? (
        <EmptyState icon="📊" title="No reports yet" sub="Your teacher's progress reports will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.map(r => {
            const open = expanded === r.id;
            const sections = [
              ['Tajweed Progress', r.tajweedProgress],
              ['Recitation Notes', r.recitationNotes],
              ['Behaviour',        r.behaviourNotes],
              ['Homework',         r.homeworkNotes],
              ['Teacher Message',  r.teacherMessage],
              ['Next Steps',       r.nextSteps],
            ].filter(([, v]) => v);
            return (
              <div key={r.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <button onClick={() => setExpanded(open ? null : r.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{r.period} · {COURSE_LABELS[r.courseType] || r.courseType}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {r.teacher?.name && `${r.teacher.name} · `}{r.overallRating ? '⭐'.repeat(r.overallRating) : 'No rating'}
                    </div>
                  </div>
                  <span style={{ color: '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: '200ms' }}>▾</span>
                </button>
                {open && (
                  <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px', background: '#fafbfc' }}>
                    {sections.length === 0 ? (
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>No details in this report.</div>
                    ) : sections.map(([label, value]) => (
                      <div key={label} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HOMEWORK TAB (read-write — account holder submits on child's behalf)
// ═══════════════════════════════════════════════════════════
const HW_TABS = ['ALL', 'PENDING', 'SUBMITTED', 'GRADED', 'OVERDUE'];

function HomeworkTab({ student }) {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filter,      setFilter]      = useState('ALL');
  const [expanded,    setExpanded]    = useState(null);
  const { getToken } = useAuth();

  const load = useCallback(async () => {
    if (!student) return;
    setLoading(true); setError(null);
    try {
      const token = await getToken();
      const url = `${apiBase()}/api/students/${student.id}/assignments${filter !== 'ALL' ? `?status=${filter}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load assignments');
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filter, student?.id, getToken]);

  useEffect(() => { load(); }, [load]);

  const handleSubmitSuccess = (assignmentId, submission) => {
    setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: 'SUBMITTED', submission } : a));
    setExpanded(null);
  };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>{student?.name}'s Homework</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {HW_TABS.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${filter === t ? '#0d2840' : '#e2e8f0'}`, background: filter === t ? '#0d2840' : 'white', color: filter === t ? 'white' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <Skeleton key={i} />)}</div>
      ) : error ? (
        <ErrorBox msg={error} />
      ) : assignments.length === 0 ? (
        <EmptyState icon="📋" title="No assignments" sub={filter === 'ALL' ? 'Assignments from the teacher will appear here.' : `No ${filter.toLowerCase()} assignments.`} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {assignments.map(a => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              studentId={student.id}
              expanded={expanded === a.id}
              onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
              onSubmitSuccess={(submission) => handleSubmitSuccess(a.id, submission)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment, studentId, expanded, onToggle, onSubmitSuccess }) {
  const cfg    = ASSIGNMENT_STATUS_CFG[assignment.status] || ASSIGNMENT_STATUS_CFG.PENDING;
  const due    = new Date(assignment.dueDate);
  const isPast = due < new Date() && assignment.status === 'PENDING';
  const sub    = assignment.submission;

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{assignment.title}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 4, padding: '2px 7px' }}>{cfg.label}</span>
            {assignment.attachmentUrl && <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', background: '#f0f4f8', borderRadius: 4, padding: '2px 7px' }}>📎 Attachment</span>}
          </div>
          <div style={{ fontSize: 12, color: isPast ? '#ef4444' : '#94a3b8', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span>👤 {assignment.teacher?.name || 'Teacher'}</span>
            <span>📅 Due {due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            {sub?.grade && <span style={{ color: '#22c55e', fontWeight: 700 }}>Grade: {sub.grade}</span>}
          </div>
        </div>
        <span style={{ color: '#94a3b8', transform: expanded ? 'rotate(180deg)' : 'none', transition: '200ms', flexShrink: 0 }}>▾</span>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px', background: '#fafbfc' }}>
          {assignment.description && (
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>{assignment.description}</div>
          )}
          {assignment.attachmentUrl && (
            <FilePreview url={assignment.attachmentUrl} fileName={assignment.attachmentName} fileType={assignment.attachmentType} label="Teacher's attachment" />
          )}

          {sub && sub.grade && (
            <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d', marginBottom: 4 }}>Grade: {sub.grade}</div>
              {sub.feedback && <div style={{ fontSize: 13, color: '#15803d', lineHeight: 1.6 }}>{sub.feedback}</div>}
            </div>
          )}

          {sub && !sub.grade && (
            <div style={{ marginTop: 14 }}>
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(40,183,217,0.08)', border: '1px solid rgba(40,183,217,0.2)', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a' }}>✓ Submitted — awaiting grade</div>
                {sub.content && <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 1.6 }}>{sub.content}</div>}
              </div>
              {sub.fileUrl && <FilePreview url={sub.fileUrl} fileName={sub.fileName} fileType={sub.fileType} label="Submitted file" />}
            </div>
          )}

          {!sub && assignment.status !== 'GRADED' && (
            <div style={{ marginTop: assignment.attachmentUrl ? 16 : 0 }}>
              <SubmitForm assignmentId={assignment.id} studentId={studentId} onSuccess={onSubmitSuccess} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubmitForm({ assignmentId, studentId, onSuccess }) {
  const { getToken, userId } = useAuth();
  const [content,    setContent]    = useState('');
  const [fileData,   setFileData]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const handleSubmit = async () => {
    if (!content.trim() && !fileData) { setError('Add an answer or upload a file before submitting.'); return; }
    setSubmitting(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/students/${studentId}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          content:  content.trim() || undefined,
          fileUrl:  fileData?.url       || undefined,
          fileName: fileData?.fileName  || undefined,
          fileType: fileData?.fileType  || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      onSuccess(data.submission);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Answer</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write the answer here…" maxLength={3000} rows={4}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', color: '#0f172a' }} />
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 2 }}>{content.length}/3000</div>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>
          File Upload <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional — image, PDF, audio recording)</span>
        </label>
        <FileUpload role="student" userId={userId} label="Upload a file with this submission" compact
          onUploadComplete={(r) => { setFileData(r); setError(''); }} onClear={() => setFileData(null)}
          existingFile={fileData ? { url: fileData.url, fileName: fileData.fileName, fileType: fileData.fileType } : null} />
      </div>
      {error && <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚠️ {error}</div>}
      <button onClick={handleSubmit} disabled={submitting}
        style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: submitting ? '#e2e8f0' : '#0d2840', color: submitting ? '#94a3b8' : 'white', fontSize: 13, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer', alignSelf: 'flex-start' }}>
        {submitting ? 'Submitting…' : 'Submit Assignment'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILE & SETTINGS TAB
// Edit the selected learner + the account holder's own info.
// ═══════════════════════════════════════════════════════════
function ProfileTab({ account, student, onStudentUpdated, onAccountUpdated, onAddChild }) {
  const { getToken } = useAuth();

  // Learner form
  const [learner, setLearner] = useState({ name: '', age: '', country: '', timezone: '', gender: '' });
  // Account form
  const [acct, setAcct] = useState({ name: '', phone: '' });

  const [savingLearner, setSavingLearner] = useState(false);
  const [savingAcct,    setSavingAcct]    = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (student) setLearner({
      name: student.name || '', age: student.age || '', country: student.country || '',
      timezone: student.timezone || '', gender: student.gender || '',
    });
  }, [student?.id]);

  useEffect(() => {
    if (account) setAcct({ name: account.name || '', phone: account.phone || '' });
  }, [account?.id]);

  const courseLabel = courseLabelFromEnum(student?.courseInterest) || 'Not enrolled';
  const initials = (student?.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const saveLearner = async () => {
    setSavingLearner(true); setMsg({ type: '', text: '' });
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(learner),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setMsg({ type: 'ok', text: 'Learner details updated' });
      onStudentUpdated?.(data.student);
    } catch (err) { setMsg({ type: 'err', text: err.message }); }
    finally { setSavingLearner(false); }
  };

  const saveAccount = async () => {
    setSavingAcct(true); setMsg({ type: '', text: '' });
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/students/account/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(acct),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setMsg({ type: 'ok', text: 'Account details updated' });
      onAccountUpdated?.(data.account);
    } catch (err) { setMsg({ type: 'err', text: err.message }); }
    finally { setSavingAcct(false); }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
  const labelStyle = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Profile & Settings</div>
        <button onClick={onAddChild} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#faa71a', color: '#0d2840', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer', border: 'none' }}>
          + Add a child
        </button>
      </div>

      {msg.text && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: msg.type === 'ok' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: msg.type === 'ok' ? '#15803d' : '#dc2626' }}>
          {msg.type === 'ok' ? '✓ ' : '⚠️ '}{msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        {/* Learner card */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, textAlign: 'center', alignSelf: 'start' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #faa71a, #e8920a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#0d2840', margin: '0 auto 12px' }}>{initials}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{student?.name || 'Learner'}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>{account?.email}</div>
          <div style={{ background: '#e8f8fc', border: '1px solid rgba(40,183,217,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#0e6e8a' }}>📖 {courseLabel}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Learner details */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Learner Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input value={learner.name} onChange={e => setLearner(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" value={learner.age} onChange={e => setLearner(p => ({ ...p, age: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select value={learner.gender} onChange={e => setLearner(p => ({ ...p, gender: e.target.value }))} style={inputStyle}>
                  <option value="">Not specified</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <input value={learner.country} onChange={e => setLearner(p => ({ ...p, country: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Timezone</label>
                <input value={learner.timezone} onChange={e => setLearner(p => ({ ...p, timezone: e.target.value }))} placeholder="e.g. Europe/London" style={inputStyle} />
              </div>
            </div>
            <button onClick={saveLearner} disabled={savingLearner} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: savingLearner ? '#e2e8f0' : '#faa71a', color: savingLearner ? '#94a3b8' : '#0d2840', fontSize: 14, fontWeight: 800, cursor: savingLearner ? 'wait' : 'pointer' }}>
              {savingLearner ? 'Saving…' : 'Save Learner'}
            </button>
          </div>

          {/* Account holder details */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Account Holder</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Your Name</label>
                <input value={acct.name} onChange={e => setAcct(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone / WhatsApp</label>
                <input type="tel" value={acct.phone} onChange={e => setAcct(p => ({ ...p, phone: e.target.value }))} placeholder="+44..." style={inputStyle} />
              </div>
            </div>
            <button onClick={saveAccount} disabled={savingAcct} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: savingAcct ? '#e2e8f0' : '#0d2840', color: savingAcct ? '#94a3b8' : 'white', fontSize: 14, fontWeight: 800, cursor: savingAcct ? 'wait' : 'pointer' }}>
              {savingAcct ? 'Saving…' : 'Save Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADD-A-CHILD MODAL
// ═══════════════════════════════════════════════════════════
function AddChildModal({ onClose, onCreated }) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({ name: '', age: '', country: '', timezone: '', courseInterest: '', gender: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.name && form.age && form.country && form.timezone && form.courseInterest;

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add child');
      onCreated(data.student);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
  const labelStyle = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Add a Child</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Create a new learner under your account.</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Child's Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ahmed" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Age *</label>
            <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 9" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select value={form.gender} onChange={e => set('gender', e.target.value)} style={inputStyle}>
              <option value="">Not specified</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Country *</label>
            <input value={form.country} onChange={e => set('country', e.target.value)} placeholder="e.g. United Kingdom" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Timezone *</label>
            <input value={form.timezone} onChange={e => set('timezone', e.target.value)} placeholder="Europe/London" style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Course Interest *</label>
            <select value={form.courseInterest} onChange={e => set('courseInterest', e.target.value)} style={inputStyle}>
              <option value="">Select a course</option>
              {Object.entries(COURSE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
        </div>

        {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={handleSubmit} disabled={saving || !valid} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: (saving || !valid) ? 'not-allowed' : 'pointer', background: (saving || !valid) ? '#e2e8f0' : '#0d2840', color: (saving || !valid) ? '#94a3b8' : 'white', fontSize: 14, fontWeight: 800 }}>
            {saving ? 'Adding…' : 'Add Child'}
          </button>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken }       = useAuth();
  const { signOut }        = useClerk();
  const router             = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [account,   setAccount]   = useState(null);
  const [students,  setStudents]  = useState([]);
  const [activeId,  setActiveId]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) router.push('/login');
  }, [isLoaded, user]);

  const fetchAccount = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${apiBase()}/api/students`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAccount(data.account || null);
        setStudents(data.students || []);
        // Keep current selection if still valid, else default to first learner
        setActiveId(prev => {
          if (prev && data.students?.some(s => s.id === prev)) return prev;
          return data.students?.[0]?.id || null;
        });
      }
    } catch (err) {
      console.error('Account fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (isLoaded && user) fetchAccount(); }, [isLoaded, user, fetchAccount]);

  const handleSignOut = () => signOut(() => router.push('/'));
  const activeStudent = students.find(s => s.id === activeId) || null;

  const handleChildCreated = (student) => {
    setStudents(prev => [...prev, student]);
    setActiveId(student.id);
    setShowAddChild(false);
  };

  const handleStudentUpdated = (updated) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetName = account?.name || user?.fullName || 'there';

  if (!isLoaded || !user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f7f9fb' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} account={account} onSignOut={handleSignOut} />

      <main style={{ marginLeft: 248, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            {greeting}, <span style={{ color: '#0e6e8a' }}>{greetName}</span> 👋
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setShowAddChild(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#faa71a', color: '#0d2840', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer' }}>+ Add a child</button>
            <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#64748b' }}>Sign out</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 28, flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#28b7d9', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontSize: 14, color: '#94a3b8' }}>Loading your dashboard…</div>
            </div>
          ) : students.length === 0 ? (
            <EmptyState
              icon="👋"
              title="Welcome! Add your first learner"
              sub="Create a learner profile to book trials, enroll in courses, and track progress."
              action={null}
            />
          ) : (
            <>
              <ChildSelector students={students} activeId={activeId} onSelect={setActiveId} />

              {activeTab === 'overview' && <OverviewTab account={account} student={activeStudent} />}
              {activeTab === 'classes'  && <ClassesTab  student={activeStudent} />}
              {activeTab === 'progress' && <ProgressTab student={activeStudent} />}
              {activeTab === 'homework' && <HomeworkTab student={activeStudent} />}
              {activeTab === 'profile'  && (
                <ProfileTab
                  account={account}
                  student={activeStudent}
                  onStudentUpdated={handleStudentUpdated}
                  onAccountUpdated={setAccount}
                  onAddChild={() => setShowAddChild(true)}
                />
              )}
            </>
          )}

          {students.length === 0 && !loading && (
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button onClick={() => setShowAddChild(true)} style={{ display: 'inline-flex', background: '#0d2840', color: 'white', padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                + Add your first learner
              </button>
            </div>
          )}
        </div>
      </main>

      {showAddChild && <AddChildModal onClose={() => setShowAddChild(false)} onCreated={handleChildCreated} />}
    </div>
  );
}