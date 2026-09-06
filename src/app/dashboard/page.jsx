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
import { deleteFile } from '../../lib/uploadFile';
import { ageFromDob, dobInputValue, isBirthdayToday } from '@/lib/age';
import { useProfileGate } from '@/hooks/useProfileGate';

import CountrySelect from '@/components/form/CountrySelect';
import DateOfBirthField from '@/components/form/DateOfBirthField';
import { detectTimezone } from '@/lib/timezone';
// ageFromDob is already imported in this file.

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

// ─── v2 parent-dashboard palette (matches the client reference) ───
const QO = {
  blue: '#19AEE2', blueDark: '#0B8FC1', gold: '#F6A800', goldSoft: '#FFF3D4',
  green: '#16C098', violet: '#8B5CF6', ink: '#101828', muted: '#667085',
  line: '#E8EEF5', sky: '#EAF8FD', white: '#ffffff',
};
const GLASS = { background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(14px)', border: `1px solid rgba(232,238,245,0.9)` };
const CARD = { borderRadius: 28, boxShadow: '0 10px 30px rgba(16,24,40,.06)' };
const glassCard = { ...GLASS, ...CARD };

function fmtCountdown(ms) {
  if (ms == null || ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${ss}`;
}

// ═══════════════════════════════════════════════════════════
// SHARED SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════
function Skeleton() {
  return <div style={{ height: "100vh", borderRadius: 12, background: '#f0f4f8', animation: 'shimmer 1.5s ease infinite' }} />;
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

function BirthdayBanner({ student }) {
  if (!student?.dateOfBirth || !isBirthdayToday(student.dateOfBirth)) return null;
  const age = ageFromDob(student.dateOfBirth);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'linear-gradient(135deg, rgba(250,167,26,0.14), rgba(40,183,217,0.12))',
      border: '1px solid rgba(250,167,26,0.35)', borderRadius: 14,
      padding: '14px 18px', marginBottom: 20,
    }}>
      <span style={{ fontSize: 26 }}>🎉</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0d2840' }}>
          Happy Birthday, {student.name}!
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          {age != null ? `Turning ${age} today — ` : ''}wishing you a wonderful year ahead. 🌟
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CHILD SELECTOR (only shown when 2+ learners)
// ═══════════════════════════════════════════════════════════
function ChildSelector({ students, activeId, onSelect }) {
  if (!students || students.length < 2) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: QO.muted }}>
        Your children
      </span>
      {students.map(s => {
        const active = s.id === activeId;
        const face = s.gender === 'FEMALE' ? '👧' : '👦';
        const sub = courseLabelFromEnum(s.courseInterest) || 'Learner';
        return (
          <button key={s.id} onClick={() => onSelect(s.id)} style={{
            display: 'flex', flexShrink: 0, alignItems: 'center', gap: 12, borderRadius: 16, padding: '10px 16px', cursor: 'pointer',
            border: `1px solid ${active ? QO.blue : QO.line}`,
            background: active ? QO.blue : '#fff',
            boxShadow: active ? '0 10px 24px rgba(25,174,226,.28)' : '0 10px 30px rgba(16,24,40,.06)',
            transition: 'all 150ms ease',
          }}>
            <span style={{ display: 'grid', placeItems: 'center', height: 36, width: 36, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.2)' : QO.sky, fontSize: 18 }}>{face}</span>
            <span style={{ textAlign: 'left' }}>
              <b style={{ display: 'block', fontSize: 14, lineHeight: 1.2, color: active ? '#fff' : QO.ink }}>{s.name}</b>
              <span style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.8)' : QO.muted }}>{sub}</span>
            </span>
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
    <aside className="qo-sidebar" style={{
      position: 'sticky', top: 24, alignSelf: 'flex-start', height: 'calc(100vh - 48px)',
      width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
      borderRadius: 28, ...GLASS, boxShadow: '0 16px 45px rgba(15,23,42,.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 28 }}>
        <div style={{ display: 'grid', placeItems: 'center', height: 44, width: 44, borderRadius: 16, background: `linear-gradient(135deg, ${QO.blue}, ${QO.blueDark})`, color: '#fff', fontSize: 20, boxShadow: '0 10px 15px -3px rgba(186,230,253,.7)' }}>📖</div>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.4 }}>
          <span style={{ color: QO.blue }}>Quran</span> <span style={{ color: QO.gold }}>Odyssey</span>
        </div>
      </div>

      <nav style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15 }}>
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, borderRadius: 16, padding: '12px 16px',
              fontWeight: active ? 700 : 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              background: active ? QO.sky : 'transparent', color: active ? QO.blueDark : '#475569',
              transition: 'background 150ms ease',
            }}>
              <span style={{ width: 20, textAlign: 'center' }}>{item.icon}</span>{item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: 20 }}>
        <div style={{ overflow: 'hidden', borderRadius: 24, border: `1px solid ${QO.line}`, background: `linear-gradient(135deg, ${QO.sky}, #fff)`, padding: 20 }}>
          <div style={{ fontSize: 40 }}>📖</div>
          <h3 style={{ margin: '16px 0 0', fontSize: 18, fontWeight: 800, color: QO.ink }}>Keep the journey alive.</h3>
          <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.6, color: QO.muted }}>Consistency today, excellence tomorrow.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '0 4px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${QO.gold}, #e8920a)`, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, color: QO.ink, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: QO.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
            <div style={{ fontSize: 10, color: QO.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account?.email}</div>
          </div>
          <button onClick={onSignOut} title="Sign out" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: QO.muted, fontSize: 18, flexShrink: 0 }}>⎋</button>
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════
function Ring({ pct, size = 176, thickness = 22, track = '#edf2f7', color = QO.blue, children }) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `conic-gradient(${color} ${p * 3.6}deg, ${track} 0deg)`, display: 'grid', placeItems: 'center' }}>
      <div style={{ width: size - thickness * 2, height: size - thickness * 2, borderRadius: '50%', background: '#fff',
        display: 'grid', placeItems: 'center', textAlign: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,.05)' }}>
        {children}
      </div>
    </div>
  );
}

function Bar({ label, pct, color }) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '118px 1fr 42px', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: QO.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ height: 10, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden', display: 'block' }}>
        <span style={{ display: 'block', height: '100%', width: `${p}%`, borderRadius: 999, background: color, transition: 'width 600ms ease' }} />
      </span>
      <span style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: QO.ink }}>{p}%</span>
    </div>
  );
}

function Bento({ col = 'col-4', children, style }) {
  return <article className={col} style={{ ...glassCard, padding: 24, ...style }}>{children}</article>;
}

function OverviewTab({ account, student }) {
  const { getToken } = useAuth();
  const childName   = student?.name || 'your child';
  const courseLabel = courseLabelFromEnum(student?.courseInterest);
  const face        = student?.gender === 'FEMALE' ? '👧' : '👦';

  const [gam,     setGam]     = useState(null);
  const [prog,    setProg]    = useState(null);
  const [sessions,setSessions]= useState(null);
  const [loading, setLoading] = useState(true);
  const [now,     setNow]     = useState(Date.now());

  useEffect(() => {
    if (!student) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [gRes, pRes, sRes] = await Promise.all([
          fetch(`${apiBase()}/api/students/${student.id}/gamification`, { headers }),
          fetch(`${apiBase()}/api/students/${student.id}/progress`,     { headers }),
          fetch(`${apiBase()}/api/students/${student.id}/sessions`,     { headers }),
        ]);
        if (cancelled) return;
        setGam(gRes.ok  ? await gRes.json()  : null);
        setProg(pRes.ok ? await pRes.json() : null);
        setSessions(sRes.ok ? await sRes.json() : null);
      } catch { /* non-critical */ }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [student?.id]);

  // Tick the countdown once a second while there is an upcoming lesson.
  const nextSession = (sessions?.upcoming || [])[0] || null;
  useEffect(() => {
    if (!nextSession) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [nextSession?.id]);

  if (loading) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: 300, color: QO.muted, fontWeight: 600 }}>Loading {childName}&apos;s dashboard…</div>;
  }

  const level   = gam?.level || {};
  const xp      = gam?.xp || {};
  const streak  = gam?.streak || {};
  const journey = gam?.journey || {};
  const totals  = gam?.totals || {};
  const att     = prog?.attendance || { total: 0, present: 0, late: 0, absent: 0, excused: 0, percentage: 0 };
  const tz      = student?.timezone || 'UTC';
  const isNew   = gam?.isNew || (att.total === 0 && (xp.total || 0) === 0);

  const stage      = level.level || 1;
  const stageName  = level.arabic || level.name || '—';
  const stars      = xp.total || 0;
  const journeyPct = journey.percentOfJourney || 0;
  const stagePct   = level.percentToNext || 0;
  const hwPct      = totals.homeworkSubmitted ? Math.round((totals.homeworkOnTime / totals.homeworkSubmitted) * 100) : 0;
  const recent     = journey.recentSteps || [];
  const nextBadge  = gam?.nextBadge || null;
  const earned     = gam?.earnedBadges || [];
  const topBadge   = earned[earned.length - 1] || null;

  const countdown = nextSession ? fmtCountdown(new Date(nextSession.scheduledAt).getTime() - now) : null;

  // New / dormant learner → keep the original onboarding path (trial + enrollment).
  if (isNew) {
    return <OverviewOnboarding account={account} student={student} childName={childName} courseLabel={courseLabel} />;
  }

  return (
    <div className="qo-bento">
      {/* Featured child */}
      <article className="col-4" style={{ ...CARD, overflow: 'hidden', background: QO.blue, color: '#fff' }}>
        <div style={{ position: 'relative', padding: 28 }}>
          <div style={{ position: 'absolute', right: 22, top: 22, color: QO.gold, fontSize: 28 }}>✦</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ display: 'grid', placeItems: 'center', height: 96, width: 96, flexShrink: 0, borderRadius: '50%', border: '4px solid #fff', background: '#fff', fontSize: 44 }}>{face}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>{student?.name}</h2>
              <p style={{ margin: '6px 0 0', fontWeight: 600 }}>{student?.age ? `Age ${student.age} • ` : ''}Stage {stage} · {stageName}</p>
              <p style={{ margin: '14px 0 0', maxWidth: 260, color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.5 }}>“The best among you are those who learn the Quran and teach it.”</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.95)', color: QO.ink }}>
          <div style={{ padding: 18, textAlign: 'center' }}><div style={{ color: QO.gold, fontSize: 22 }}>★</div><b>{stage}</b><p style={{ margin: 0, fontSize: 12, color: QO.muted }}>Stage</p></div>
          <div style={{ padding: 18, textAlign: 'center', borderLeft: `1px solid ${QO.line}`, borderRight: `1px solid ${QO.line}` }}><div style={{ color: QO.blue, fontSize: 22 }}>📘</div><b style={{ fontSize: 13 }}>{courseLabel || 'Quran'}</b><p style={{ margin: 0, fontSize: 12, color: QO.muted }}>Course</p></div>
          <div style={{ padding: 18, textAlign: 'center' }}><div style={{ color: QO.gold, fontSize: 22 }}>🏆</div><b>{stars}</b><p style={{ margin: 0, fontSize: 12, color: QO.muted }}>Stars</p></div>
        </div>
      </article>

      {/* Overall progress */}
      <Bento col="col-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: QO.ink }}>Overall Progress</h2>
        </div>
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <Ring pct={journeyPct} size={168} color={QO.blue}>
            <div><b style={{ display: 'block', fontSize: 34, lineHeight: 1, color: QO.ink }}>{Math.round(journeyPct)}%</b><p style={{ margin: '4px 0 0', fontSize: 13, color: QO.muted }}>Journey</p></div>
          </Ring>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Bar label="Journey" pct={journeyPct} color={QO.blue} />
            <Bar label="This stage" pct={stagePct} color={QO.gold} />
            <Bar label="Attendance" pct={att.percentage} color={QO.green} />
            <Bar label="Homework" pct={hwPct} color={QO.violet} />
          </div>
        </div>
      </Bento>

      {/* Daily lesson */}
      <Bento col="col-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: QO.ink }}>Next Lesson</h2>
        </div>
        {nextSession ? (
          <div style={{ marginTop: 20, borderRadius: 24, background: `linear-gradient(90deg, #fff, ${QO.sky})`, padding: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: QO.muted }}>{fmtDate(nextSession.scheduledAt, tz)} · {fmtTime(nextSession.scheduledAt, tz)}</p>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: QO.ink }}>{COURSE_LABELS[nextSession.courseType] || nextSession.courseType}</h3>
                <p style={{ margin: '4px 0 0', color: QO.muted }}>{nextSession.teacher?.name ? `with ${nextSession.teacher.name}` : 'Teacher to be assigned'}</p>
              </div>
              <div style={{ fontSize: 48 }}>📖</div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 20, borderRadius: 24, border: `1px dashed ${QO.line}`, padding: 24, textAlign: 'center', color: QO.muted }}>
            <div style={{ fontSize: 34 }}>📅</div>
            <p style={{ margin: '10px 0 14px', fontSize: 14 }}>No upcoming lessons scheduled.</p>
            <Link href={`/booking/trial?studentId=${student?.id}`} style={{ display: 'inline-flex', background: QO.blue, color: '#fff', padding: '10px 18px', borderRadius: 14, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Book a class</Link>
          </div>
        )}
        {journey.nextMilestone && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, borderRadius: 16, border: `1px solid ${QO.line}`, padding: 14 }}>
            <span style={{ display: 'grid', placeItems: 'center', height: 40, width: 40, borderRadius: 12, background: QO.goldSoft }}>{journey.nextMilestone.type === 'badge' ? (journey.nextMilestone.icon || '🏅') : '✦'}</span>
            <div><b style={{ color: QO.ink }}>{journey.nextMilestone.remaining} {journey.nextMilestone.unit} to {journey.nextMilestone.arabic || journey.nextMilestone.label}</b><p style={{ margin: 0, fontSize: 13, color: QO.muted }}>Keep the streak going!</p></div>
          </div>
        )}
      </Bento>

      {/* Attendance */}
      <Bento col="col-3" style={{ height: '100%' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: QO.ink }}>Attendance</h2>
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Ring pct={att.percentage} size={128} thickness={18} color={QO.green}>
            <div><b style={{ fontSize: 24, color: QO.ink }}>{att.percentage}%</b><p style={{ margin: 0, fontSize: 11, color: QO.muted }}>Present</p></div>
          </Ring>
          <ul style={{ flex: 1, minWidth: 130, listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, fontWeight: 600 }}>
            {[['Present', att.present, QO.green], ['Late', att.late, QO.gold], ['Absent', att.absent, '#ef4444'], ['Excused', att.excused, QO.violet]].map(([l, v, c]) => (
              <li key={l} style={{ display: 'flex', justifyContent: 'space-between', borderRadius: 12, background: '#fff', border: `1px solid ${QO.line}`, padding: '8px 12px' }}>{l}<span style={{ color: c, fontWeight: 800 }}>{v}</span></li>
            ))}
          </ul>
        </div>
      </Bento>

      {/* This week */}
      <Bento col="col-5" style={{ height: '100%' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: QO.ink }}>This Week</h2>
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[['⭐', xp.thisWeek ?? 0, 'Stars this week', QO.gold], ['🔥', streak.current ?? 0, 'Day streak', QO.blue], ['✓', totals.sessionsAttended ?? 0, 'Classes', QO.green], ['🏅', gam?.badgeCount ?? 0, 'Badges', QO.violet]].map(([ic, v, l, c]) => (
            <div key={l} style={{ borderRadius: 18, border: `1px solid ${QO.line}`, padding: '16px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 22 }}>{ic}</div>
              <b style={{ display: 'block', fontSize: 24, color: c }}>{v}</b>
              <p style={{ margin: 0, fontSize: 11, color: QO.muted }}>{l}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: QO.muted }}>Recent classes</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 64 }}>
            {recent.length ? recent.map((s, i) => {
              const c = s.status === 'ABSENT' ? '#ef4444' : s.status === 'LATE' ? QO.gold : QO.green;
              const h = s.status === 'ABSENT' ? 22 : s.status === 'LATE' ? 44 : 60;
              return <span key={i} title={`${s.status} · ${fmtDate(s.at, tz)}`} style={{ flex: 1, height: h, borderRadius: 8, background: c, opacity: 0.9 }} />;
            }) : <span style={{ fontSize: 13, color: QO.muted }}>No classes recorded yet.</span>}
          </div>
        </div>
      </Bento>

      {/* Recent activity */}
      <Bento col="col-2" style={{ height: '100%' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: QO.ink }}>Activity</h2>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
          {recent.slice(-3).reverse().map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <span style={{ display: 'grid', placeItems: 'center', height: 34, width: 34, borderRadius: 12, background: QO.sky, flexShrink: 0 }}>{s.status === 'ABSENT' ? '✗' : '✓'}</span>
              <div><b style={{ color: QO.ink }}>{s.status === 'ABSENT' ? 'Missed class' : 'Attended class'}</b><p style={{ margin: 0, color: QO.muted }}>{fmtDate(s.at, tz)}</p></div>
            </div>
          ))}
          {!recent.length && <p style={{ margin: 0, color: QO.muted }}>Activity will appear here.</p>}
        </div>
      </Bento>

      {/* Achievement */}
      <Bento col="col-2" style={{ padding: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 280, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: QO.ink }}>Achievement</h2>
            {topBadge && <span style={{ flexShrink: 0, borderRadius: 999, background: QO.goldSoft, padding: '4px 10px', fontSize: 11, fontWeight: 900, color: QO.gold }}>Earned</span>}
          </div>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'grid', placeItems: 'center', height: 96, width: 96, borderRadius: '50%', background: `linear-gradient(135deg, ${QO.goldSoft}, #fff)` }}>
              <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: `2px dashed rgba(246,168,0,0.5)` }} />
              <span style={{ position: 'relative', fontSize: 44 }}>{topBadge?.icon || nextBadge?.icon || '🏅'}</span>
            </div>
            <h3 style={{ margin: '16px 0 0', fontSize: 16, fontWeight: 900, lineHeight: 1.3, color: QO.ink }}>{topBadge?.name || nextBadge?.name || 'Keep going!'}</h3>
            <p style={{ margin: '8px 0 0', maxWidth: 180, fontSize: 12, lineHeight: 1.4, color: QO.muted }}>
              {topBadge ? `Mashallah ${childName}! Badge unlocked.` : nextBadge ? `${nextBadge.remaining} to go — you're close!` : 'Attend classes to earn badges.'}
            </p>
          </div>
        </div>
      </Bento>

      {/* Upcoming lesson banner */}
      <article className="col-8" style={{ ...CARD, border: `1px solid ${QO.line}`, background: `linear-gradient(90deg, ${QO.goldSoft}, #fff, ${QO.sky})`, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 56 }}>🕌</div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: QO.ink }}>Upcoming Lesson</h2>
            <p style={{ margin: '4px 0 0', color: QO.muted }}>
              {nextSession ? `${COURSE_LABELS[nextSession.courseType] || nextSession.courseType} • ${nextSession.teacher?.name || 'Teacher TBA'} • ${fmtTime(nextSession.scheduledAt, tz)}` : 'No lesson scheduled yet.'}
            </p>
          </div>
          {nextSession && countdown && (
            <div style={{ borderRadius: 16, background: '#fff', padding: '12px 20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(16,24,40,.06)' }}>
              <p style={{ margin: 0, fontSize: 12, color: QO.muted }}>Starts in</p><b style={{ fontSize: 26, color: QO.gold }}>{countdown}</b>
            </div>
          )}
          {nextSession && isLiveSession(nextSession.scheduledAt) && nextSession.zoomLink && (
            <a href={nextSession.zoomLink} target="_blank" rel="noreferrer" style={{ borderRadius: 16, background: QO.blue, color: '#fff', padding: '14px 24px', fontWeight: 900, textDecoration: 'none' }}>Join Lesson</a>
          )}
        </div>
      </article>

      {/* Inspiration */}
      <article className="col-4" style={{ ...CARD, background: QO.sky, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ fontSize: 48 }}>📖</div>
          <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: QO.ink }}>Every step in the Quran journey is a step towards Jannah.</h2><p style={{ margin: '8px 0 0', color: QO.muted }}>Keep guiding, keep inspiring 💙</p></div>
        </div>
      </article>
    </div>
  );
}

// New/dormant learner: keep the original onboarding (trial + enrollment).
function OverviewOnboarding({ account, student, childName, courseLabel }) {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState([]);
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    const load = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [appRes, trialRes] = await Promise.all([
          fetch(`${apiBase()}/api/enrollment/my?studentId=${student.id}`, { headers }),
          fetch(`${apiBase()}/api/booking/mine?studentId=${student.id}`, { headers }),
        ]);
        if (appRes.ok)   { const d = await appRes.json();   setApplications(d.applications || []); }
        if (trialRes.ok) { const d = await trialRes.json(); setTrials(d.bookings || []); }
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    };
    load();
  }, [student?.id]);

  const latestTrial = trials[0] || null;
  const activeApplication = applications.find(a => a.status !== 'CANCELLED' && a.status !== 'REJECTED') || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <article style={{ ...glassCard, padding: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: QO.ink }}>Welcome, {childName}! 🌟</div>
        <div style={{ fontSize: 14, color: QO.muted, marginTop: 6 }}>
          {courseLabel ? `Interested in ${courseLabel}. ` : ''}Let&apos;s get the first class booked — the journey map fills up as {childName} attends.
        </div>
      </article>

      {latestTrial && (
        <article style={{ ...glassCard, padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: QO.muted, marginBottom: 10 }}>Trial Class</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: QO.ink }}>{fmtDate(latestTrial.slotStart, student?.timezone)} · {fmtTime(latestTrial.slotStart, student?.timezone)}</div>
              <div style={{ fontSize: 13, color: QO.muted, marginTop: 2 }}>Status: {latestTrial.status}</div>
            </div>
            {latestTrial.zoomLink && isLiveSession(latestTrial.slotStart) && (
              <a href={latestTrial.zoomLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: QO.green, color: '#fff', padding: '12px 22px', borderRadius: 14, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>▶ Join Class Now</a>
            )}
          </div>
        </article>
      )}

      <article style={{ ...glassCard, padding: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: QO.muted, marginBottom: 10 }}>Enrollment</div>
        {loading ? (
          <div style={{ fontSize: 13, color: QO.muted }}>Loading…</div>
        ) : activeApplication ? (
          <div><div style={{ fontSize: 15, fontWeight: 800, color: QO.ink }}>{activeApplication.courseLabel || activeApplication.courseType}</div><div style={{ fontSize: 13, color: QO.muted, marginTop: 2 }}>Application status: {activeApplication.status}</div></div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 13, color: QO.muted }}>No active enrollment application for {childName}.</div>
            <Link href={`/enroll?studentId=${student?.id}`} style={{ display: 'inline-flex', background: QO.ink, color: '#fff', padding: '9px 18px', borderRadius: 14, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Start enrollment →</Link>
          </div>
        )}
      </article>

      {!latestTrial && (
        <EmptyState icon="📅" title={`Book a free trial for ${childName}`} sub="A 30-minute trial class to get started." action={{ href: `/booking/trial?studentId=${student?.id}`, label: 'Book Free Trial' }} />
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

  // Authenticated report PDF download (route is SENT-only + ownership-checked).
  const downloadReportPdf = async (report) => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${apiBase()}/api/students/${student.id}/reports/${report.id}/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) { alert('Could not generate the PDF. Please try again.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(report.period || 'report').replace(/\s+/g, '_')}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Could not generate the PDF. Please try again.'); }
  };

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
                      {(r.lastSentAt || r.sentAt) && ` · Sent ${new Date(r.lastSentAt || r.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </div>
                  </div>
                  <span style={{ color: '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: '200ms' }}>▾</span>
                </button>
                {open && (
                  <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px', background: '#fafbfc' }}>
                    {sections.length === 0 ? (
                      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>No details in this report.</div>
                    ) : sections.map(([label, value]) => (
                      <div key={label} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>{value}</div>
                      </div>
                    ))}

                    {/* Attachment (same read-only preview students see for assignments) */}
                    {r.attachmentUrl && (
                      <FilePreview url={r.attachmentUrl} fileName={r.attachmentName} fileType={r.attachmentType} label="Attachment" />
                    )}

                    {/* Download PDF */}
                    <div style={{ marginTop: 16 }}>
                      <button onClick={() => downloadReportPdf(r)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                        background: '#0d2840', color: 'white', border: 'none', borderRadius: 8,
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}>
                        ⬇ Download PDF
                      </button>
                    </div>
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
              onSubmissionChanged={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment, studentId, expanded, onToggle, onSubmitSuccess, onSubmissionChanged }) {
  const cfg    = ASSIGNMENT_STATUS_CFG[assignment.status] || ASSIGNMENT_STATUS_CFG.PENDING;
  const due    = new Date(assignment.dueDate);
  const isPast = due < new Date() && assignment.status === 'PENDING';
  const sub    = assignment.submission;
  const isGraded = !!sub?.grade || assignment.status === 'GRADED';

  const [editing, setEditing] = useState(false);

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

          {/* GRADED — locked, read-only */}
          {sub && isGraded && (
            <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d', marginBottom: 4 }}>Grade: {sub.grade}</div>
              {sub.feedback && <div style={{ fontSize: 13, color: '#15803d', lineHeight: 1.6, marginBottom: sub.content || sub.fileUrl ? 10 : 0 }}>{sub.feedback}</div>}
              {sub.content && <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginTop: 8 }}>{sub.content}</div>}
              {sub.fileUrl && <div style={{ marginTop: 10 }}><FilePreview url={sub.fileUrl} fileName={sub.fileName} fileType={sub.fileType} label="Your submitted file" /></div>}
            </div>
          )}

          {/* SUBMITTED, NOT graded — editable */}
          {sub && !isGraded && !editing && (
            <div style={{ marginTop: 14 }}>
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(40,183,217,0.08)', border: '1px solid rgba(40,183,217,0.2)', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a' }}>✓ Submitted — awaiting grade</div>
                {sub.content && <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 1.6 }}>{sub.content}</div>}
              </div>
              {sub.fileUrl && <FilePreview url={sub.fileUrl} fileName={sub.fileName} fileType={sub.fileType} label="Submitted file" />}

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setEditing(true)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #0d2840', background: 'white', color: '#0d2840', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Edit submission
                </button>
                <DeleteSubmissionButton
                  assignmentId={assignment.id}
                  studentId={studentId}
                  onDeleted={() => onSubmissionChanged?.()}
                />
              </div>
            </div>
          )}

          {/* EDIT MODE */}
          {sub && !isGraded && editing && (
            <div style={{ marginTop: 14 }}>
              <SubmitForm
                assignmentId={assignment.id}
                studentId={studentId}
                mode="edit"
                existing={sub}
                onSuccess={(updated) => { setEditing(false); onSubmissionChanged?.(updated); }}
                onCancel={() => setEditing(false)}
              />
            </div>
          )}

          {/* NO submission yet — submit form */}
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

// ─── DeleteSubmissionButton ───────────────────────────────
function DeleteSubmissionButton({ assignmentId, studentId, onDeleted }) {
  const { getToken } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const doDelete = async () => {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/students/${studentId}/assignments/${assignmentId}/submission`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      onDeleted?.();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #fecaca', background: 'white', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        Delete submission
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Delete and resubmit later?</span>
      <button onClick={doDelete} disabled={busy} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: busy ? '#e2e8f0' : '#dc2626', color: busy ? '#94a3b8' : 'white', fontSize: 12, fontWeight: 700, cursor: busy ? 'wait' : 'pointer' }}>
        {busy ? 'Deleting…' : 'Yes, delete'}
      </button>
      <button onClick={() => setConfirming(false)} disabled={busy} style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        Cancel
      </button>
      {error && <span style={{ fontSize: 12, color: '#dc2626' }}>⚠️ {error}</span>}
    </div>
  );
}

// ─── SubmitForm (supports submit AND edit) ────────────────
function SubmitForm({ assignmentId, studentId, onSuccess, onCancel, mode = 'create', existing = null }) {
  const { getToken, userId } = useAuth();
  const [content,    setContent]    = useState(existing?.content || '');
  const [fileData,   setFileData]   = useState(
    existing?.fileUrl ? { url: existing.fileUrl, fileName: existing.fileName, fileType: existing.fileType, path: existing.filePath } : null
  );
  const [removeFile, setRemoveFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const isEdit = mode === 'edit';

  const handleSubmit = async () => {
    if (!content.trim() && !fileData) { setError('Add an answer or upload a file before submitting.'); return; }
    setSubmitting(true); setError('');
    try {
      const token = await getToken();
      const base  = `${apiBase()}/api/students/${studentId}/assignments/${assignmentId}/submission`;

      if (isEdit) {
        // PATCH the existing submission
        const res = await fetch(base, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            content:  content.trim() || undefined,
            fileUrl:  fileData?.url       || undefined,
            fileName: fileData?.fileName  || undefined,
            fileType: fileData?.fileType  || undefined,
            filePath: fileData?.path      || undefined,
            removeFile: removeFile && !fileData ? true : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update failed');
        onSuccess(data.submission);
      } else {
        // POST a new submission (existing /submit route)
        const res = await fetch(`${apiBase()}/api/students/${studentId}/assignments/${assignmentId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            content:  content.trim() || undefined,
            fileUrl:  fileData?.url       || undefined,
            fileName: fileData?.fileName  || undefined,
            fileType: fileData?.fileType  || undefined,
            filePath: fileData?.path      || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Submission failed');
        onSuccess(data.submission);
      }
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
        <FileUpload
          role="student" userId={userId} label="Upload a file with this submission" compact
          onUploadComplete={(r) => { setFileData(r); setRemoveFile(false); setError(''); }}
          onClear={() => { setFileData(null); if (isEdit && existing?.fileUrl) setRemoveFile(true); }}
          existingFile={fileData ? { url: fileData.url, fileName: fileData.fileName, fileType: fileData.fileType } : null}
        />
      </div>
      {error && <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚠️ {error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSubmit} disabled={submitting}
          style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: submitting ? '#e2e8f0' : '#0d2840', color: submitting ? '#94a3b8' : 'white', fontSize: 13, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer' }}>
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit Assignment'}
        </button>
        {isEdit && onCancel && (
          <button onClick={onCancel} disabled={submitting} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
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
  const [learner, setLearner] = useState({ name: '', age: '', country: '', timezone: '', gender: '', dateOfBirth: '' });
  // Account form
  const [acct, setAcct] = useState({ name: '', phone: '' });

  const [savingLearner, setSavingLearner] = useState(false);
  const [savingAcct,    setSavingAcct]    = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (student) setLearner({
      name: student.name || '', age: student.age || '', country: student.country || '',
      timezone: student.timezone || '', gender: student.gender || '', dateOfBirth: dobInputValue(student.dateOfBirth),
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
        // body: JSON.stringify(learner),
        body: JSON.stringify({
          name: learner.name,
          country: learner.country,
          timezone: learner.timezone,
          gender: learner.gender,
          dateOfBirth: learner.dateOfBirth || '',   // '' clears it
          // omit age — backend derives it from dateOfBirth (option c)
        }),
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
              {!learner.dateOfBirth && (
                <div>
                  <label style={labelStyle}>Age</label>
                  <input type="number" value={learner.age}
                    onChange={e => setLearner(p => ({ ...p, age: e.target.value }))} style={inputStyle} />
                </div>
              )}
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input
                  type="date"
                  value={learner.dateOfBirth}
                  max={new Date().toISOString().slice(0, 10)}   /* no future dates */
                  onChange={e => setLearner(p => ({ ...p, dateOfBirth: e.target.value }))}
                  style={inputStyle}
                />
                {learner.dateOfBirth && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Age: <strong>{ageFromDob(learner.dateOfBirth) ?? '—'}</strong> (calculated)
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select value={learner.gender} onChange={e => setLearner(p => ({ ...p, gender: e.target.value }))} style={inputStyle}>
                  <option value="">Not specified</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              {/* <div>
                <label style={labelStyle}>Country</label>
                <input value={learner.country} onChange={e => setLearner(p => ({ ...p, country: e.target.value }))} style={inputStyle} />
              </div> */}
              <div className="flex flex-col gap-0">
                <label style={labelStyle}>Country</label>
                <CountrySelect value={learner.country} onChange={e => setLearner(p => ({ ...p, country: e }))} />
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

  // Auto-detect timezone once (parent never types it)
  useEffect(() => {
    setForm(p => ({ ...p, timezone: detectTimezone() }));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Valid = name + DOB (valid age) + country + course. Timezone is auto, not user-entered.
  const dobAge = form.dateOfBirth ? ageFromDob(form.dateOfBirth) : null;
  const valid = form.name && form.dateOfBirth && dobAge != null && dobAge >= 1 && dobAge <= 99
                && form.country && form.courseInterest;

  // const valid = form.name && form.age && form.country && form.timezone && form.courseInterest;

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name:           form.name,
          dateOfBirth:    form.dateOfBirth,     // ← primary
          age:            dobAge,               // ← satisfies POST's required-field check
          country:        form.country,
          timezone:       form.timezone,        // ← auto-detected, not typed
          courseInterest: form.courseInterest,
          gender:         form.gender,
        }),
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
          {/* <div>
            <label style={labelStyle}>Age *</label>
            <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 9" style={inputStyle} />
          </div> */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Date of Birth *</label>
            <input
              type="date"
              value={form.dateOfBirth || ""}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => set('dateOfBirth', e.target.value)}
              style={inputStyle}
            />
            {form.dateOfBirth && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Age: <strong>{dobAge ?? '—'}</strong> (calculated)
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select value={form.gender} onChange={e => set('gender', e.target.value)} style={inputStyle}>
              <option value="">Not specified</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          {/* <div>
            <label style={labelStyle}>Country *</label>
            <input value={form.country} onChange={e => set('country', e.target.value)} placeholder="e.g. United Kingdom" style={inputStyle} />
          </div> */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Country *</label>
            <CountrySelect value={form.country} onChange={(c) => set('country', c)} />
          </div>
          {/* <div>
            <label style={labelStyle}>Timezone *</label>
            <input value={form.timezone} onChange={e => set('timezone', e.target.value)} placeholder="Europe/London" style={inputStyle} />
          </div> */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Timezone detected: <strong style={{ color: '#0f172a' }}>{form.timezone || '—'}</strong>
            </div>
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
  const { checking, complete } = useProfileGate();

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

  if (checking) return (
    <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9fb",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "4px solid #e2e8f0",
              borderTopColor: "#28b7d9",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>
            Checking your profile...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    </div>
  );

  if (!complete) return null;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', color: QO.ink, fontFamily: "'Plus Jakarta Sans', plus-r, system-ui, sans-serif",
      background: `radial-gradient(circle at 82% 6%, rgba(246,168,0,.12), transparent 24%), radial-gradient(circle at 14% 20%, rgba(25,174,226,.12), transparent 22%), linear-gradient(180deg,#ffffff 0%,#f7fbff 100%)` }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes qfloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .qo-bento{ display:grid; gap:20px; grid-template-columns:repeat(12,minmax(0,1fr)); }
        .qo-bento .col-2{grid-column:span 2} .qo-bento .col-3{grid-column:span 3}
        .qo-bento .col-4{grid-column:span 4} .qo-bento .col-5{grid-column:span 5}
        .qo-bento .col-8{grid-column:span 8}
        @media (max-width:1200px){ .qo-bento{grid-template-columns:repeat(6,minmax(0,1fr))} .qo-bento .col-8{grid-column:span 6} .qo-bento .col-5{grid-column:span 6} .qo-bento .col-4{grid-column:span 3} .qo-bento .col-3{grid-column:span 3} .qo-bento .col-2{grid-column:span 3} }
        @media (max-width:820px){ .qo-bento{grid-template-columns:1fr} .qo-bento>*{grid-column:auto !important} }
        @media (max-width:1023px){ .qo-sidebar{display:none !important} }
      `}</style>

      {/* decorative celestial doodles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.7, zIndex: 0 }} aria-hidden="true">
        <div style={{ position: 'absolute', right: 40, top: 70, fontSize: 44, color: QO.gold, animation: 'qfloat 5s ease-in-out infinite' }}>☾</div>
        <div style={{ position: 'absolute', right: 130, top: 170, fontSize: 30, color: QO.gold, animation: 'qfloat 6s ease-in-out infinite' }}>✦</div>
      </div>

      <main style={{ position: 'relative', zIndex: 1, margin: '0 auto', maxWidth: 1720, display: 'flex', gap: 24, padding: 24 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} account={account} onSignOut={handleSignOut} />

        <section style={{ minWidth: 0, flex: 1 }}>
          {/* Header */}
          <header style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: QO.muted }}>{greeting}, {greetName}! 👋</p>
              <h1 style={{ margin: '4px 0 0', fontSize: 34, fontWeight: 900, letterSpacing: -0.8, color: QO.ink }}>Parent Dashboard</h1>
              {activeStudent && <p style={{ margin: '8px 0 0', color: QO.muted }}>Here&apos;s how <b style={{ color: QO.ink }}>{activeStudent.name}</b> is progressing on the Quran journey.</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {activeStudent && (
                <Link href={`/learn/${activeStudent.id}`} title="Open the child's gamified journey" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(90deg,#FF7EB6,#8B5CF6)', color: '#fff', padding: '11px 18px', borderRadius: 16, fontSize: 14, fontWeight: 800, textDecoration: 'none', boxShadow: '0 3px 0 #b45aa8' }}>✨ Journey</Link>
              )}
              <button onClick={() => setShowAddChild(true)} style={{ borderRadius: 16, border: `1px solid ${QO.line}`, background: '#fff', padding: '11px 16px', fontWeight: 700, color: QO.ink, cursor: 'pointer', boxShadow: '0 10px 30px rgba(16,24,40,.06)' }}>+ Add a child</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 16, border: `1px solid ${QO.line}`, background: '#fff', padding: '8px 14px', boxShadow: '0 10px 30px rgba(16,24,40,.06)' }}>
                <div style={{ display: 'grid', placeItems: 'center', height: 38, width: 38, borderRadius: '50%', background: QO.sky, fontSize: 18 }}>👤</div>
                <div><b style={{ fontSize: 13, color: QO.ink }}>{account?.name || 'Parent'}</b><p style={{ margin: 0, fontSize: 11, color: QO.muted }}>Parent</p></div>
              </div>
            </div>
          </header>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: QO.blue, animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontSize: 14, color: QO.muted }}>Loading your dashboard…</div>
            </div>
          ) : students.length === 0 ? (
            <div style={{ ...glassCard, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 36 }}>👋</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: QO.ink, marginTop: 10 }}>Welcome! Add your first learner</div>
              <div style={{ fontSize: 14, color: QO.muted, marginTop: 6, marginBottom: 18 }}>Create a learner profile to book trials, enroll in courses, and track progress.</div>
              <button onClick={() => setShowAddChild(true)} style={{ display: 'inline-flex', background: QO.ink, color: 'white', padding: '11px 24px', borderRadius: 14, fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer' }}>+ Add your first learner</button>
            </div>
          ) : (
            <>
              <ChildSelector students={students} activeId={activeId} onSelect={setActiveId} />
              <BirthdayBanner student={activeStudent} />

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
        </section>
      </main>

      {showAddChild && <AddChildModal onClose={() => setShowAddChild(false)} onCreated={handleChildCreated} />}
    </div>
  );
}
