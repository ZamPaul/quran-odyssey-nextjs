'use client';

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
    timeZone: tz || 'UTC',
    hour: '2-digit', minute: '2-digit',
  });
}

function isLiveSession(scheduledAt) {
  const diffMins = Math.round((new Date(scheduledAt) - Date.now()) / 60000);
  return diffMins >= -30 && diffMins <= 30;
}

// ─── Sub-components ───────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = { PENDING: { label: 'Pending', bg: '#fff7e0', color: '#92400e', dot: '#f59e0b' },
    CONFIRMED: { label: 'Confirmed', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
    COMPLETED: { label: 'Completed', bg: '#f0f4f8', color: '#64748b', dot: '#94a3b8' },
    CANCELLED: { label: 'Cancelled', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' } };
  const c = cfg[status] || cfg.PENDING;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

function AttendanceRing({ pct, size = 56 }) {
  const r = size * 0.38;
  const c = 2 * Math.PI * r;
  const fill = (pct / 100) * c;
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f97316' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize={size * 0.2} fontWeight="800"
        fill={color} fontFamily="system-ui">{pct}%</text>
    </svg>
  );
}

function Skeleton({ height = 72, borderRadius = 10 }) {
  return (
    <div style={{ height, borderRadius, background: '#f0f4f8', animation: 'shimmer 1.5s ease infinite' }} />
  );
}

function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: action ? 16 : 0 }}>{sub}</div>
      {action && (
        <Link href={action.href} style={{ padding: '8px 18px', borderRadius: 8, background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, user, onSignOut }) {
  const initials = ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase()
    || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || '?';
  const displayName = user?.fullName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Student';

  return (
    <aside style={{ width: 248, background: '#0a2035', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #28b7d9, #0e6e8a)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0 }}>QO</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: -0.2 }}>Quran Odyssey</div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>Student Portal</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '16px 8px 6px' }}>Main Menu</div>
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left', background: active ? 'rgba(40,183,217,0.14)' : 'transparent', boxShadow: active ? 'inset 0 0 0 1px rgba(40,183,217,0.2)' : 'none', transition: 'background 150ms' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#28b7d9' : 'rgba(255,255,255,0.06)', color: active ? 'white' : 'rgba(255,255,255,0.4)', flexShrink: 0, fontSize: 15 }}>{item.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: active ? '#28b7d9' : 'rgba(255,255,255,0.45)', flex: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #faa71a, #e8920a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0d2840', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>Student</div>
          </div>
          <button onClick={onSignOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, fontSize: 14 }}>⏻</button>
        </div>
      </div>
    </aside>
  );
}

// ─── Overview Tab ─────────────────────────────────────────
// ─── Application status config ────────────────────────────
const APP_STATUS_CFG = {
  PENDING:          { label: 'Pending Review',    color: '#92400e', bg: '#fff7e0', border: 'rgba(245,158,11,0.3)',  icon: '⏳', next: 'We are reviewing your application. You will hear from us within 24 hours.' },
  UNDER_REVIEW:     { label: 'Under Review',      color: '#1e40af', bg: '#eff6ff', border: 'rgba(59,130,246,0.3)', icon: '🔍', next: 'Your application is being reviewed by our team. We will contact you shortly.' },
  APPROVED:         { label: 'Approved',          color: '#166534', bg: '#dcfce7', border: 'rgba(34,197,94,0.3)',  icon: '✓',  next: 'Your application is approved! Payment and scheduling details will be sent within 24 hours.' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment',  color: '#92400e', bg: '#fff7e0', border: 'rgba(245,158,11,0.3)', icon: '💳', next: 'Please complete your payment to confirm your enrollment. Check your email for payment details.' },
  ACTIVE:           { label: 'Enrolled',          color: '#166534', bg: '#dcfce7', border: 'rgba(34,197,94,0.3)',  icon: '🎓', next: 'You are enrolled! Your teacher will reach out to schedule your first class.' },
  REJECTED:         { label: 'Not Approved',      color: '#991b1b', bg: '#fee2e2', border: 'rgba(239,68,68,0.3)',  icon: '✗',  next: 'See reason below. You are welcome to submit a new application.' },
  CANCELLED:        { label: 'Cancelled',         color: '#64748b', bg: '#f0f4f8', border: 'rgba(148,163,184,0.3)', icon: '—', next: 'This application was cancelled.' },
};

const COURSE_LABEL_MAP = {
  NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation',
  TAJWEED: 'Tajweed', HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1',
};

function ApplicationStatusCard({ application, onCancel, cancelling }) {
  const cfg = APP_STATUS_CFG[application.status] || APP_STATUS_CFG.PENDING;
  const courseLabel = COURSE_LABEL_MAP[application.courseType] || application.courseType;

  return (
    <div style={{ background: 'white', borderRadius: 12, border: `1px solid ${cfg.border}`, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: cfg.bg, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${cfg.border}` }}>
        <span style={{ fontSize: 18 }}>{cfg.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: cfg.color }}>Enrollment Application — {cfg.label}</div>
          <div style={{ fontSize: 12, color: cfg.color, opacity: 0.75, marginTop: 1 }}>
            {courseLabel} · Applied {new Date(application.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: application.rejectionReason ? 12 : 0 }}>
          {cfg.next}
        </div>

        {/* Rejection reason */}
        {application.rejectionReason && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff5f5', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#991b1b', marginBottom: 4 }}>Reason</div>
            <div style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.6 }}>{application.rejectionReason}</div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {/* Can re-apply after rejection or cancellation */}
          {(application.status === 'REJECTED' || application.status === 'CANCELLED') && (
            <Link href="/enroll" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#faa71a', color: '#0d2840', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Apply Again →
            </Link>
          )}
          {/* Cancel only allowed when PENDING */}
          {application.status === 'PENDING' && (
            <button
              onClick={() => onCancel(application.id)}
              disabled={cancelling}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: cancelling ? 'wait' : 'pointer' }}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ profile, booking, user }) {
  const { getToken } = useAuth();
  const parentName  = profile?.parentName  || user?.fullName || 'there';
  const childName   = profile?.childName   || 'your child';
  const courseLabel = profile?.courseInterest?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || null;

  const [applications, setApplications] = useState([]);
  const [appLoading,   setAppLoading]   = useState(true);
  const [cancelling,   setCancelling]   = useState(false);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const token = await getToken();
        const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enrollment/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch { /* non-critical — fail silently */ }
      finally { setAppLoading(false); }
    };
    loadApplications();
  }, []);

  const handleCancel = async (applicationId) => {
    setCancelling(true);
    try {
      const token = await getToken();
      const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enrollment/${applicationId}/cancel`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status: 'CANCELLED' } : a));
      }
    } catch { /* fail silently */ }
    finally { setCancelling(false); }
  };

  // Most recent non-cancelled application (show only the latest active one)
  const activeApplication = applications.find(a => a.status !== 'CANCELLED') || applications[0] || null;

  // Show enroll button if: no active application AND no active enrollment
  const hasActiveApplication = activeApplication && !['CANCELLED','REJECTED'].includes(activeApplication.status);

  const stats = [
    { label: 'Total Classes',  value: '0',        sub: 'Trial pending'  },
    { label: 'Day Streak',     value: '🔥 0',      sub: 'Start learning' },
    { label: 'Attendance',     value: '—',         sub: 'No classes yet' },
    { label: 'Course',         value: courseLabel?.split(' ')[0] || '—', sub: courseLabel || 'Not enrolled' },
  ];

  return (
    <div>
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, #0d2840 0%, #142f4a 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(40,183,217,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Welcome back</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: -0.5, marginBottom: 6 }}>{childName}&apos;s Learning Hub</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
          {booking ? 'Trial class booked — check details below' : profile ? `Enrolled in ${courseLabel || 'Quran Learning'} · Book your free trial` : 'Complete your profile to book your free trial class'}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!booking && (
            <Link href={profile ? '/booking/trial' : '/register/profile'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#faa71a', color: '#0d2840', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
              {profile ? 'Book Free Trial →' : 'Complete Profile →'}
            </Link>
          )}
          {profile && !hasActiveApplication && (
            <Link href="/enroll" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', color: 'white', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
              📋 Enroll in a Course →
            </Link>
          )}
        </div>
      </div>

      {/* Application status card — shown when there's a recent application */}
      {!appLoading && activeApplication && (
        <div style={{ marginBottom: 24 }}>
          <ApplicationStatusCard
            application={activeApplication}
            onCancel={handleCancel}
            cancelling={cancelling}
          />
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: -1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Booking card */}
        {!booking ? (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Next Class</div>
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No classes scheduled yet</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Book your free trial to get started</div>
              <Link href="/booking/trial" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0d2840', color: 'white', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Book Free Trial →</Link>
            </div>
          </div>
        ) : (
          <BookingCard booking={booking} timezone={profile?.timezone} />
        )}

        {/* Account details */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Account Details</div>
          {[
            ['Parent Name',  profile?.parentName  || '—'],
            ['Child Name',   profile?.childName   || '—'],
            ['Email',        user?.emailAddresses?.[0]?.emailAddress || '—'],
            ['Country',      profile?.country     || '—'],
            ['Timezone',     profile?.timezone    || '—'],
            ['Course',       courseLabel          || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f4f8' }}>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, textAlign: 'right', maxWidth: '55%', wordBreak: 'break-all' }}>{value}</span>
            </div>
          ))}
          {!profile && (
            <Link href="/register/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, background: '#faa71a', color: '#0d2840', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Complete Profile →</Link>
          )}
          {profile && !hasActiveApplication && (
            <Link href="/enroll" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, background: '#0d2840', color: 'white', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>📋 Enroll in a Course</Link>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, timezone }) {
  const tz      = timezone || 'Europe/London';
  const start   = new Date(booking.slotStart);
  // Schema has no slotEnd — compute from durationMins (default 30)
  const end     = new Date(start.getTime() + (booking.durationMins || 30) * 60 * 1000);

  const dateStr = start.toLocaleDateString('en-GB', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = start.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
  const endStr  = end.toLocaleTimeString('en-GB',   { timeZone: tz, hour: '2-digit', minute: '2-digit' });
  const tzAbbr  = start.toLocaleTimeString('en-GB', { timeZone: tz, timeZoneName: 'short' }).split(' ').pop();

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ background: '#0d2840', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Upcoming Trial Class</div>
        <StatusBadge status={booking.status} />
      </div>
      <div style={{ padding: '20px 24px' }}>
        {[['Teacher', booking.teacher?.name || 'To be assigned'], ['Date', dateStr], ['Time', `${timeStr} – ${endStr} (${tzAbbr})`], ['Duration', '30 minutes']].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f4f8' }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
          </div>
        ))}
        <div style={{ marginTop: 16 }}>
          {booking.status === 'CONFIRMED' && booking.zoomLink ? (
            <a href={booking.zoomLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#22c55e', color: 'white', padding: '12px 22px', borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>▶ Join Class Now</a>
          ) : booking.status === 'PENDING' ? (
            <div style={{ padding: '12px 14px', background: '#fff7e0', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 3 }}>⏳ Zoom Link Pending</div>
              <div style={{ fontSize: 12, color: '#b45309', lineHeight: 1.5 }}>Your teacher will send the Zoom link to your email at least 1 hour before class.</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── My Classes Tab ────────────────────────────────────────
function ClassesTab({ profile }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load sessions');
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const tz = profile?.timezone || 'UTC';

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <Skeleton key={i} />)}</div>;
  if (error)   return <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 14 }}>⚠️ {error}</div>;

  const { upcoming = [], past = [] } = data || {};

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>My Classes</div>

      {/* Upcoming */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 12 }}>Upcoming</div>
        {upcoming.length === 0 ? (
          <EmptyState icon="📅" title="No upcoming classes" sub="Your scheduled sessions will appear here." action={{ href: '/booking/trial', label: 'Book Free Trial' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(s => <SessionCard key={s.id} session={s} tz={tz} showJoin />)}
          </div>
        )}
      </div>

      {/* Past */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 12 }}>Past Sessions</div>
        {past.length === 0 ? (
          <EmptyState icon="📖" title="No past sessions yet" sub="Your completed classes will appear here." />
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
    <div style={{ background: 'white', borderRadius: 12, border: `1px solid ${live ? '#28b7d9' : '#e2e8f0'}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: live ? '0 0 0 3px rgba(40,183,217,0.10)' : 'none' }}>
      {/* Time */}
      <div style={{ textAlign: 'center', minWidth: 56, flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{fmtTime(session.scheduledAt, tz)}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{session.durationMins || 30} min</div>
      </div>

      <div style={{ width: 1, height: 36, background: '#e2e8f0', flexShrink: 0 }} />

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            {COURSE_LABELS[session.courseType] || session.courseType}
          </span>
          {session.teacher?.name && (
            <span style={{ fontSize: 12, color: '#94a3b8' }}>· {session.teacher.name}</span>
          )}
          {live && <span style={{ fontSize: 11, fontWeight: 700, color: '#faa71a', background: 'rgba(250,167,26,0.12)', borderRadius: 4, padding: '2px 7px' }}>● Live</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 4, padding: '2px 7px' }}>{cfg.label}</span>
          {attCfg && (
            <span style={{ fontSize: 11, fontWeight: 700, color: attCfg.color }}>{attCfg.icon} {attCfg.label}</span>
          )}
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(session.scheduledAt, tz)}</span>
        </div>
      </div>

      {/* Join button */}
      {showJoin && live && session.zoomLink && (
        <a href={session.zoomLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#faa71a', color: '#0d2840', fontSize: 13, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>▶ Join</a>
      )}
      {showJoin && !live && session.zoomLink && session.status === 'SCHEDULED' && (
        <a href={session.zoomLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>View Link</a>
      )}
    </div>
  );
}

// ─── Progress Tab ──────────────────────────────────────────
function ProgressTab({ profile }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [expanded, setExpanded] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load progress');
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <Skeleton key={i} />)}</div>;
  if (error)   return <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 14 }}>⚠️ {error}</div>;

  const { attendance, reports } = data || {};
  const att = attendance || { total: 0, present: 0, late: 0, absent: 0, excused: 0, percentage: 0 };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Progress</div>

      {/* Attendance overview */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Attendance Overview</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <AttendanceRing pct={att.percentage} size={80} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 32px' }}>
            {[
              ['Present', att.present, '#22c55e'],
              ['Late',    att.late,    '#f97316'],
              ['Absent',  att.absent,  '#ef4444'],
              ['Excused', att.excused, '#8b5cf6'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginLeft: 'auto' }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 4 }}>Total Sessions</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{att.total}</div>
          </div>
        </div>
      </div>

      {/* Progress reports */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 12 }}>Progress Reports</div>
        {!reports || reports.length === 0 ? (
          <EmptyState icon="📊" title="No reports yet" sub="Your teacher's progress reports will appear here once sent." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reports.map(r => (
              <ReportCard key={r.id} report={r} expanded={expanded === r.id} onToggle={() => setExpanded(expanded === r.id ? null : r.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ report, expanded, onToggle }) {
  const stars = report.overallRating || 0;
  const sections = [
    ['Tajweed Progress',      report.tajweedProgress],
    ['Recitation',            report.recitationNotes],
    ['Behaviour & Attitude',  report.behaviourNotes],
    ['Homework & Practice',   report.homeworkNotes],
    ['Message from Teacher',  report.teacherMessage],
    ['Next Steps',            report.nextSteps],
  ].filter(([, v]) => v);

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{report.period}</span>
            {stars > 0 && <span style={{ fontSize: 12, color: '#faa71a' }}>{'⭐'.repeat(stars)}</span>}
            <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.10)', borderRadius: 4, padding: '2px 7px' }}>✓ Received</span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
            {COURSE_LABELS[report.courseType] || report.courseType} · {report.teacher?.name || 'Teacher'}
            {report.sentAt && ` · ${new Date(report.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </div>
        </div>
        <span style={{ color: '#94a3b8', transform: expanded ? 'rotate(180deg)' : 'none', transition: '200ms', flexShrink: 0 }}>▾</span>
      </button>

      {expanded && sections.length > 0 && (
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px', background: '#fafbfc' }}>
          {sections.map(([label, value]) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {expanded && sections.length === 0 && (
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px', color: '#94a3b8', fontSize: 13 }}>No details in this report.</div>
      )}
    </div>
  );
}

// ─── Homework Tab ──────────────────────────────────────────
const HW_TABS = ['ALL', 'PENDING', 'SUBMITTED', 'GRADED', 'OVERDUE'];

function HomeworkTab() {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filter,      setFilter]      = useState('ALL');
  const [expanded,    setExpanded]    = useState(null);
  const { getToken } = useAuth();

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const url   = `${process.env.NEXT_PUBLIC_API_URL}/api/students/assignments${filter !== 'ALL' ? `?status=${filter}` : ''}`;
      const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load assignments');
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, getToken]);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const handleSubmitSuccess = (assignmentId, submission) => {
    setAssignments(prev => prev.map(a => a.id === assignmentId
      ? { ...a, status: 'SUBMITTED', submission }
      : a
    ));
    setExpanded(null);
  };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Homework</div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {HW_TABS.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${filter === t ? '#0d2840' : '#e2e8f0'}`, background: filter === t ? '#0d2840' : 'white', color: filter === t ? 'white' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <Skeleton key={i} height={80} />)}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState icon="📋" title="No assignments" sub={filter === 'ALL' ? 'Your teacher will assign homework here.' : `No ${filter.toLowerCase()} assignments.`} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {assignments.map(a => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              expanded={expanded === a.id}
              onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
              onSubmitSuccess={(sub) => handleSubmitSuccess(a.id, sub)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment, expanded, onToggle, onSubmitSuccess }) {
  const cfg    = ASSIGNMENT_STATUS_CFG[assignment.status] || ASSIGNMENT_STATUS_CFG.PENDING;
  const due    = new Date(assignment.dueDate);
  const isPast = due < new Date() && assignment.status === 'PENDING';
  const sub    = assignment.submission;
 
  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
      <button onClick={onToggle} style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'16px 20px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{assignment.title}</span>
            <span style={{ fontSize:11, fontWeight:700, color:cfg.color, background:cfg.bg, borderRadius:4, padding:'2px 7px' }}>{cfg.label}</span>
            {assignment.attachmentUrl && (
              <span style={{ fontSize:11, fontWeight:600, color:'#94a3b8', background:'#f0f4f8', borderRadius:4, padding:'2px 7px' }}>📎 Has attachment</span>
            )}
          </div>
          <div style={{ fontSize:12, color: isPast ? '#ef4444' : '#94a3b8', display:'flex', gap:10, flexWrap:'wrap' }}>
            <span>👤 {assignment.teacher?.name || 'Teacher'}</span>
            <span>📅 Due {due.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
            {sub?.grade && <span style={{ color:'#22c55e', fontWeight:700 }}>Grade: {sub.grade}</span>}
          </div>
        </div>
        <span style={{ color:'#94a3b8', transform: expanded ? 'rotate(180deg)' : 'none', transition:'200ms', flexShrink:0 }}>▾</span>
      </button>
 
      {expanded && (
        <div style={{ borderTop:'1px solid #e2e8f0', padding:'20px', background:'#fafbfc' }}>
          {/* Description */}
          {assignment.description && (
            <div style={{ fontSize:13, color:'#64748b', lineHeight:1.7, marginBottom:16 }}>{assignment.description}</div>
          )}
 
          {/* Teacher's attachment — always visible if present */}
          {assignment.attachmentUrl && (
            <FilePreview
              url={assignment.attachmentUrl}
              fileName={assignment.attachmentName}
              fileType={assignment.attachmentType}
              label="Teacher's attachment"
            />
          )}
 
          {/* ── Graded ── */}
          {sub && sub.grade && (
            <div style={{ marginTop:14, padding:'14px 16px', borderRadius:8, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#15803d', marginBottom:4 }}>
                Grade: {sub.grade}
              </div>
              {sub.feedback && (
                <div style={{ fontSize:13, color:'#15803d', lineHeight:1.6 }}>{sub.feedback}</div>
              )}
            </div>
          )}
 
          {/* ── Submitted, awaiting grade ── */}
          {sub && !sub.grade && (
            <div style={{ marginTop:14 }}>
              <div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(40,183,217,0.08)', border:'1px solid rgba(40,183,217,0.2)', marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#0e6e8a' }}>
                  ✓ Submitted — awaiting grade
                </div>
                {sub.content && (
                  <div style={{ fontSize:13, color:'#64748b', marginTop:6, lineHeight:1.6 }}>{sub.content}</div>
                )}
              </div>
              {/* Student's submitted file */}
              {sub.fileUrl && (
                <FilePreview
                  url={sub.fileUrl}
                  fileName={sub.fileName}
                  fileType={sub.fileType}
                  label="Your submitted file"
                />
              )}
            </div>
          )}
 
          {/* ── Not yet submitted ── */}
          {!sub && assignment.status !== 'GRADED' && (
            <div style={{ marginTop: assignment.attachmentUrl ? 16 : 0 }}>
              <SubmitForm assignmentId={assignment.id} onSuccess={onSubmitSuccess} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubmitForm({ assignmentId, onSuccess }) {
  const { getToken, userId } = useAuth();
  const [content,    setContent]    = useState('');
  const [fileData,   setFileData]   = useState(null); // { url, fileName, fileType }
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
 
  const handleUploadComplete = (result) => {
    setFileData(result);
    setError('');
  };
 
  const handleFileClear = () => {
    setFileData(null);
  };
 
  const handleSubmit = async () => {
    if (!content.trim() && !fileData) {
      setError('Please add an answer or upload a file before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/students/assignments/${assignmentId}/submit`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            content:  content.trim() || undefined,
            fileUrl:  fileData?.url       || undefined,
            fileName: fileData?.fileName  || undefined,
            fileType: fileData?.fileType  || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      onSuccess(data.submission);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Text answer */}
      <div>
        <label style={{ fontSize:12, fontWeight:700, color:'#64748b', display:'block', marginBottom:6 }}>
          Your Answer
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your answer here…"
          maxLength={3000}
          rows={4}
          style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box', color:'#0f172a' }}
        />
        <div style={{ fontSize:11, color:'#94a3b8', textAlign:'right', marginTop:2 }}>{content.length}/3000</div>
      </div>
 
      {/* File upload */}
      <div>
        <label style={{ fontSize:12, fontWeight:700, color:'#64748b', display:'block', marginBottom:6 }}>
          File Upload <span style={{ fontWeight:400, color:'#94a3b8' }}>(optional — images, PDF, audio recording)</span>
        </label>
        <FileUpload
          role="student"
          userId={userId}
          label="Upload a file with your submission"
          compact={true}
          onUploadComplete={handleUploadComplete}
          onClear={handleFileClear}
          existingFile={fileData ? { url: fileData.url, fileName: fileData.fileName, fileType: fileData.fileType } : null}
        />
      </div>
 
      {error && (
        <div style={{ fontSize:12, color:'#ef4444', fontWeight:600 }}>⚠️ {error}</div>
      )}
 
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ padding:'10px 20px', borderRadius:8, border:'none', background: submitting ? '#e2e8f0' : '#0d2840', color: submitting ? '#94a3b8' : 'white', fontSize:13, fontWeight:700, cursor: submitting ? 'wait' : 'pointer', alignSelf:'flex-start' }}
      >
        {submitting ? 'Submitting…' : 'Submit Assignment'}
      </button>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────
function ProfileTab({ profile, user, onProfileUpdated }) {
  const [form,    setForm]    = useState({ parentName: '', childName: '', childAge: '', country: '', timezone: '', phone: '' });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');
  const { getToken } = useAuth();

  useEffect(() => {
    if (profile) {
      setForm({
        parentName: profile.parentName || '',
        childName:  profile.childName  || '',
        childAge:   profile.childAge   || '',
        country:    profile.country    || '',
        timezone:   profile.timezone   || '',
        phone:      profile.phone      || '',
      });
    }
  }, [profile]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setSuccess(false); setError(''); };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/profile`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSuccess(true);
      onProfileUpdated?.(data.profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const courseLabel = profile?.courseInterest?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'Not enrolled';
  const initials = (profile?.childName || profile?.parentName || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Profile & Settings</div>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>

        {/* Profile card */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #faa71a, #e8920a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#0d2840', margin: '0 auto 12px' }}>{initials}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{profile?.childName || 'Student'}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>{user?.emailAddresses?.[0]?.emailAddress}</div>
          <div style={{ background: '#e8f8fc', border: '1px solid rgba(40,183,217,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#0e6e8a' }}>📖 {courseLabel}</div>
        </div>

        {/* Edit form */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Personal Information</div>
          {profile ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                ['parentName', 'Parent Name',  'text',   'e.g. Fatimah Ahmed'],
                ['childName',  "Child's Name", 'text',   'e.g. Ahmed'],
                ['childAge',   "Child's Age",  'number', 'e.g. 10'],
                ['phone',      'Phone / WhatsApp', 'tel', '+44...'],
                ['country',    'Country',      'text',   'e.g. United Kingdom'],
                ['timezone',   'Timezone',     'text',   'e.g. Europe/London'],
              ].map(([key, label, type, placeholder]) => (
                <div key={key} style={key === 'timezone' || key === 'country' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>Complete your profile to get started.</div>
              <Link href="/register/profile" style={{ display: 'inline-flex', background: '#faa71a', color: '#0d2840', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Complete Profile</Link>
            </div>
          )}

          {error   && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}
          {success && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#15803d', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>✓ Profile updated successfully</div>}

          {profile && (
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: saving ? '#e2e8f0' : '#faa71a', color: saving ? '#94a3b8' : '#0d2840', fontSize: 14, fontWeight: 800, cursor: saving ? 'wait' : 'pointer' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken }       = useAuth();
  const { signOut }        = useClerk();
  const router             = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [profile,   setProfile]   = useState(null);
  const [booking,   setBooking]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (isLoaded && !user) router.push('/login');
  }, [isLoaded, user]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const base    = process.env.NEXT_PUBLIC_API_URL;
      const [profileRes, bookingRes] = await Promise.all([
        fetch(`${base}/api/students/profile`, { headers }),
        fetch(`${base}/api/booking/mine`,     { headers }),
      ]);
      if (profileRes.ok) { const d = await profileRes.json(); setProfile(d.profile || null); }
      if (bookingRes.ok) { const d = await bookingRes.json(); setBooking(d.booking || null); }
    } catch (err) {
      console.error('Dashboard data fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (isLoaded && user) fetchData(); }, [isLoaded, user, fetchData]);

  const handleSignOut = () => signOut(() => router.push('/'));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (!isLoaded || !user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f7f9fb' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onSignOut={handleSignOut} />

      <main style={{ marginLeft: 248, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            {greeting},{' '}
            <span style={{ color: '#0e6e8a' }}>{profile?.parentName || user.fullName || 'there'}</span> 👋
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!booking && (
              <Link href="/booking/trial" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#faa71a', color: '#0d2840', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>Book Free Trial</Link>
            )}
            <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#64748b' }}>
              Sign out
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 28, flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#28b7d9', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontSize: 14, color: '#94a3b8' }}>Loading your dashboard…</div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab profile={profile} booking={booking} user={user} />}
              {activeTab === 'classes'  && <ClassesTab  profile={profile} />}
              {activeTab === 'progress' && <ProgressTab profile={profile} />}
              {activeTab === 'homework' && <HomeworkTab />}
              {activeTab === 'profile'  && <ProfileTab  profile={profile} user={user} onProfileUpdated={setProfile} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}