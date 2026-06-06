'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

// ─── Helpers ──────────────────────────────────────────────
const COURSE_LABELS = {
  NOORANI_QAIDA:    'Noorani Qaida',
  QURAN_RECITATION: 'Quran Recitation',
  TAJWEED:          'Tajweed',
  HIFZ:             'Hifz Programme',
  ISLAMIC_STUDIES:  'Islamic Studies',
  ONE_TO_ONE:       '1-on-1 Private',
};

const ATT_COLOR = pct => pct >= 80 ? '#22c55e' : pct >= 60 ? '#f97316' : '#ef4444';

function AttendanceRing({ pct, size = 52 }) {
  const r    = size * 0.38;
  const c    = 2 * Math.PI * r;
  const fill = (pct / 100) * c;
  const col  = ATT_COLOR(pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="4"
        strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+4} textAnchor="middle" fontSize={size*0.22}
        fontWeight="800" fill={col} fontFamily="system-ui">{pct}%</text>
    </svg>
  );
}

function Skeleton({ h = 72, r = 10 }) {
  return <div style={{ height: h, borderRadius: r, background: '#f0f4f8', animation: 'shimmer 1.5s ease infinite' }} />;
}

function ChildCard({ child }) {
  const name        = child.profile?.childName || 'Student';
  const course      = COURSE_LABELS[child.profile?.courseInterest] || child.profile?.courseInterest || 'No course yet';
  const pct         = child.attendancePercentage || 0;
  const nextSession = child.nextSession;
  const tz          = child.profile?.timezone || 'UTC';
  const initials    = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const nextStr = nextSession
    ? new Date(nextSession.scheduledAt).toLocaleString('en-GB', {
        timeZone: tz, weekday: 'short', day: 'numeric',
        month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ background: 'linear-gradient(135deg, #0d2840, #142f4a)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #faa71a, #e8920a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#0d2840', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: -0.3 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{course}</div>
        </div>
        <AttendanceRing pct={pct} size={52} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #f0f4f8' }}>
        {[
          ['Sessions',    child.totalSessions || 0],
          ['Attendance',  `${pct}%`],
          ['Streak',      '—'],
        ].map(([label, value]) => (
          <div key={label} style={{ padding: '14px 16px', textAlign: 'center', borderRight: '1px solid #f0f4f8' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Next class */}
      <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 3 }}>Next Class</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            {nextStr || 'No upcoming sessions'}
          </div>
          {nextSession?.teacher?.name && (
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>with {nextSession.teacher.name}</div>
          )}
        </div>
        {nextSession?.zoomLink && (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', background: '#f0f4f8', padding: '4px 10px', borderRadius: 6 }}>
            Zoom link available
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function ParentDashboardPage() {
  const { getToken }         = useAuth();
  const [data,    setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]  = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parent/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load dashboard data');
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const parentName = data?.parent?.name || '';

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>
          {greeting}{parentName ? `, ${parentName}` : ''} 👋
        </div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
          Here&apos;s an overview of your {data?.children?.length === 1 ? "child's" : "children's"} learning progress.
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 14, marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[1, 2].map(i => <Skeleton key={i} h={260} r={14} />)}
        </div>
      )}

      {/* Children cards */}
      {!loading && data && data.children.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 32 }}>
            {data.children.map(child => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>

          {/* Quick links */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Quick Access</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { href: '/parent/schedule',   label: '📅 Class Schedule', color: '#0d2840' },
                { href: '/parent/progress',   label: '📊 Progress Reports', color: '#0d2840' },
                { href: '/parent/homework',   label: '📋 Homework',       color: '#0d2840' },
                { href: '/parent/attendance', label: '✓ Attendance',      color: '#0d2840' },
              ].map(({ href, label, color }) => (
                <Link key={href} href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: '#f7f9fb', border: '1px solid #e2e8f0', color, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* No children */}
      {!loading && data && data.children.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍👩‍👧</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No children linked yet</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Contact us to link your child&apos;s account to this parent portal.</div>
        </div>
      )}
    </div>
  );
}