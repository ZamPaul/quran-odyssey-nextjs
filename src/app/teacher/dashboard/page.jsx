'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

// ─── Stat card ────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent, loading }) {
  return (
    <div style={{
      background:   'white',
      borderRadius: 12,
      border:       '1px solid #e2e8f0',
      padding:      '20px 22px',
      display:      'flex',
      alignItems:   'flex-start',
      gap:          14,
    }}>
      <div style={{
        width:          40,
        height:         40,
        borderRadius:   10,
        background:     accent ? `${accent}15` : '#f0f4f8',
        border:         `1px solid ${accent ? `${accent}30` : '#e2e8f0'}`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        color:          accent || '#64748b',
        flexShrink:     0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 4 }}>
          {label}
        </div>
        {loading ? (
          <div style={{ width: 40, height: 24, borderRadius: 4, background: '#f0f4f8', animation: 'pulse 1.5s ease infinite' }} />
        ) : (
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {value}
          </div>
        )}
        {sub && (
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

// ─── Session card ─────────────────────────────────────────
function SessionCard({ session, isToday }) {
  const scheduled  = new Date(session.scheduledAt);
  const now        = new Date();
  const diffMins   = Math.round((scheduled - now) / 60000);
  const isLive     = diffMins >= -30 && diffMins <= 30;
  const isPast     = scheduled < now && !isLive;

  useEffect(() => {
    console.log(session);
  }, [session])

  const childName  = session.student?.name || session.student?.email?.split('@')[0] || 'Student';
  const courseLabel = {
    NOORANI_QAIDA:    'Noorani Qaida',
    QURAN_RECITATION: 'Quran Recitation',
    TAJWEED:          'Tajweed',
    HIFZ:             'Hifz',
    ISLAMIC_STUDIES:  'Islamic Studies',
    ONE_TO_ONE:       '1-on-1',
  }[session.courseType] || session.courseType;

  const timeStr = scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = scheduled.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const statusColor = {
    SCHEDULED:  '#28b7d9',
    COMPLETED:  '#22c55e',
    CANCELLED:  '#ef4444',
    MISSED:     '#f97316',
  }[session.status] || '#94a3b8';

  const statusLabel = {
    SCHEDULED:  'Scheduled',
    COMPLETED:  'Completed',
    CANCELLED:  'Cancelled',
    MISSED:     'Missed',
  }[session.status] || session.status;

  return (
    <div style={{
      background:   'white',
      borderRadius: 12,
      border:       `1px solid ${isLive ? '#28b7d9' : '#e2e8f0'}`,
      padding:      '16px 18px',
      display:      'flex',
      alignItems:   'center',
      gap:          14,
      transition:   'box-shadow 150ms ease',
      boxShadow:    isLive ? '0 0 0 3px rgba(40,183,217,0.10)' : 'none',
    }}>

      {/* Time column */}
      <div style={{ textAlign: 'center', minWidth: 52, flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {timeStr}
        </div>
        {!isToday && (
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{dateStr}</div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 40, background: '#e2e8f0', flexShrink: 0 }} />

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            {childName}
          </span>
          <span style={{
            fontSize:     11,
            fontWeight:   700,
            color:        '#0e6e8a',
            background:   'rgba(40,183,217,0.10)',
            borderRadius: 4,
            padding:      '2px 7px',
          }}>
            {courseLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:        4,
            fontSize:   12,
            fontWeight: 600,
            color:      statusColor,
          }}>
            <span style={{
              width:        6,
              height:       6,
              borderRadius: '50%',
              background:   statusColor,
              display:      isLive ? 'block' : 'none',
              animation:    isLive ? 'pulse 2s ease infinite' : 'none',
            }} />
            {isLive ? '● Live now' : statusLabel}
          </span>
          {session.enrollment?.courseType && (
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              · {session.durationMins || 30} min
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      {session.zoomLink && (session.status === 'SCHEDULED' || isLive) ? (
        <a
          href={session.zoomLink}
          target="_blank"
          rel="noreferrer"
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            6,
            padding:        '8px 14px',
            borderRadius:   8,
            background:     isLive ? '#faa71a' : '#0d2840',
            color:          isLive ? '#0d2840' : 'white',
            fontSize:       13,
            fontWeight:     700,
            textDecoration: 'none',
            flexShrink:     0,
            transition:     'opacity 150ms ease',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" />
          </svg>
          {isLive ? 'Join Now' : 'Join'}
        </a>
      ) : (
        <Link
          href={`/teacher/schedule`}
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            padding:        '8px 12px',
            borderRadius:   8,
            border:         '1px solid #e2e8f0',
            color:          '#64748b',
            fontSize:       13,
            fontWeight:     600,
            textDecoration: 'none',
            flexShrink:     0,
          }}
        >
          Details
        </Link>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────
function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '40px 20px',
      background:     'white',
      borderRadius:   12,
      border:         '1px solid #e2e8f0',
      textAlign:      'center',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: action ? 16 : 0 }}>{sub}</div>
      {action && (
        <Link
          href={action.href}
          style={{
            padding:        '8px 16px',
            borderRadius:   8,
            background:     '#0d2840',
            color:          'white',
            fontSize:       13,
            fontWeight:     700,
            textDecoration: 'none',
          }}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────
function SkeletonCard({ height = 72 }) {
  return (
    <div style={{
      height,
      borderRadius:  12,
      background:    '#f0f4f8',
      animation:     'shimmer 1.5s ease infinite',
    }} />
  );
}

function UpcomingBirthdaysWidget({ birthdays, loading }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 16 }}>🎂</span>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
          Upcoming Birthdays
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkeletonCard height={56} />
          <SkeletonCard height={56} />
        </div>
      ) : !birthdays?.length ? (
        <EmptyState
          icon="🎈"
          title="No birthdays soon"
          sub="No student birthdays in the next 30 days."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {birthdays.map(b => {
            const isToday = b.days === 0;
            const when = isToday
              ? 'Today! 🎉'
              : b.days === 1
                ? 'Tomorrow'
                : `In ${b.days} days`;
            const dateLabel = new Date(b.date).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short',
            });
            return (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: isToday ? 'linear-gradient(135deg, rgba(250,167,26,0.12), rgba(40,183,217,0.10))' : 'white',
                border: `1px solid ${isToday ? 'rgba(250,167,26,0.4)' : '#e2e8f0'}`,
                borderRadius: 12, padding: '12px 16px',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: isToday ? 'linear-gradient(135deg, #faa71a, #e8920a)' : '#f0f4f8',
                  color: isToday ? '#0d2840' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800,
                }}>
                  {(b.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                    {b.name}{b.turning != null ? ` turns ${b.turning}` : ''}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{dateLabel}</div>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  color: isToday ? '#b45309' : '#0e6e8a',
                  background: isToday ? 'rgba(250,167,26,0.18)' : 'rgba(40,183,217,0.10)',
                  borderRadius: 6, padding: '4px 10px',
                }}>
                  {when}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function TeacherDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = await getToken();
        const res   = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/teacher/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error('Failed to load dashboard');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          {greeting} 👋
        </div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
          {todayStr}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          padding:      '14px 18px',
          borderRadius: 10,
          background:   'rgba(239,68,68,0.08)',
          border:       '1px solid rgba(239,68,68,0.2)',
          color:        '#dc2626',
          fontSize:     14,
          fontWeight:   600,
          marginBottom: 24,
        }}>
          ⚠️ {error} — try refreshing the page.
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap:                 14,
        marginBottom:        32,
      }}>
        <StatCard
          label="Total Students"
          value={loading ? '—' : data?.stats.totalStudents ?? 0}
          sub="Active enrollments"
          accent="#28b7d9"
          loading={loading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Sessions This Week"
          value={loading ? '—' : data?.stats.sessionsThisWeek ?? 0}
          sub="Mon – Sun"
          accent="#7c3bee"
          loading={loading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Pending Assignments"
          value={loading ? '—' : data?.stats.pendingAssignments ?? 0}
          sub="To review"
          accent={data?.stats.pendingAssignments > 0 ? '#f97316' : '#22c55e'}
          loading={loading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Draft Reports"
          value={loading ? '—' : data?.stats.draftReports ?? 0}
          sub="Unsent to parents"
          accent={data?.stats.draftReports > 0 ? '#faa71a' : '#22c55e'}
          loading={loading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      {/* Two column layout */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                 24,
        alignItems:          'start',
      }}
        className="dashboard-grid"
      >
        <style>{`
          @media (max-width: 900px) {
            .dashboard-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Today's sessions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
              Today's Classes
            </div>
            <Link
              href="/teacher/schedule"
              style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a', textDecoration: 'none' }}
            >
              Full schedule →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SkeletonCard height={76} />
              <SkeletonCard height={76} />
            </div>
          ) : !data?.todaySessions?.length ? (
            <EmptyState
              icon="📅"
              title="No classes today"
              sub="Your schedule is clear for today."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.todaySessions.map(session => (
                <SessionCard key={session.id} session={session} isToday />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming sessions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
              Coming Up
            </div>
            <Link
              href="/teacher/schedule"
              style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a', textDecoration: 'none' }}
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SkeletonCard height={76} />
              <SkeletonCard height={76} />
              <SkeletonCard height={76} />
            </div>
          ) : !data?.upcomingSessions?.length ? (
            <EmptyState
              icon="✅"
              title="All caught up"
              sub="No upcoming sessions in the next 7 days."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.upcomingSessions.map(session => (
                <SessionCard key={session.id} session={session} isToday={false} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming birthdays */}
      <div style={{ marginTop: 32 }}>
        <UpcomingBirthdaysWidget birthdays={data?.upcomingBirthdays} loading={loading} />
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { label: 'Mark Attendance',    href: '/teacher/schedule',    color: '#28b7d9' },
            { label: 'Set Assignment',     href: '/teacher/assignments', color: '#7c3bee' },
            { label: 'Write Report',       href: '/teacher/reports',     color: '#faa71a' },
            { label: 'View Students',      href: '/teacher/students',    color: '#22c55e' },
          ].map(({ label, href, color }) => (
            <Link
              key={label}
              href={href}
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            8,
                padding:        '10px 16px',
                borderRadius:   10,
                background:     'white',
                border:         `1px solid #e2e8f0`,
                color:          '#0f172a',
                fontSize:       13,
                fontWeight:     700,
                textDecoration: 'none',
                transition:     'all 150ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${color}18`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}