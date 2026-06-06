'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

// ─── Config ───────────────────────────────────────────────
const COURSE_LABELS = {
  NOORANI_QAIDA:    'Noorani Qaida',
  QURAN_RECITATION: 'Quran Recitation',
  TAJWEED:          'Tajweed',
  HIFZ:             'Hifz Programme',
  ISLAMIC_STUDIES:  'Islamic Studies',
  ONE_TO_ONE:       '1-on-1 Private',
};

const ATT_CFG = {
  PRESENT: { label: 'Present', color: '#22c55e', bg: 'rgba(34,197,94,0.10)',  icon: '✓'  },
  LATE:    { label: 'Late',    color: '#f97316', bg: 'rgba(249,115,22,0.10)', icon: '⏰' },
  ABSENT:  { label: 'Absent',  color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  icon: '✗'  },
  EXCUSED: { label: 'Excused', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', icon: '📋' },
};

// ─── Helpers ──────────────────────────────────────────────
function Skeleton({ h = 80 }) {
  return <div style={{ height: h, borderRadius: 10, background: '#f0f4f8', animation: 'shimmer 1.5s ease infinite' }} />;
}

function AttendanceRing({ pct, size = 120 }) {
  const r    = size * 0.38;
  const c    = 2 * Math.PI * r;
  const fill = (pct / 100) * c;
  const col  = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f97316' : '#ef4444';
  const msg  = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Needs Improvement' : 'Needs Attention';
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="6"
          strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x={size/2} y={size/2} textAnchor="middle" fontSize={size * 0.2}
          fontWeight="800" fill={col} fontFamily="system-ui" dy="0.35em">{pct}%</text>
      </svg>
      <div style={{ fontSize: 12, fontWeight: 700, color: col, marginTop: 6 }}>{msg}</div>
    </div>
  );
}

// Group records by month
function groupByMonth(records, tz) {
  const groups = {};
  records.forEach(r => {
    const key = new Date(r.markedAt).toLocaleDateString('en-GB', {
      timeZone: tz, year: 'numeric', month: 'long',
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  return groups;
}

function MonthGroup({ month, records, tz }) {
  const [open, setOpen] = useState(true);
  const present = records.filter(r => r.status === 'PRESENT').length;
  const late    = records.filter(r => r.status === 'LATE').length;
  const absent  = records.filter(r => r.status === 'ABSENT').length;

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 10 }}>
      {/* Month header */}
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{month}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {present > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.10)', borderRadius: 4, padding: '2px 7px' }}>{present} present</span>}
            {late    > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', background: 'rgba(249,115,22,0.10)', borderRadius: 4, padding: '2px 7px' }}>{late} late</span>}
            {absent  > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.10)', borderRadius: 4, padding: '2px 7px' }}>{absent} absent</span>}
          </div>
        </div>
        <span style={{ color: '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: '200ms' }}>▾</span>
      </button>

      {/* Records */}
      {open && (
        <div style={{ borderTop: '1px solid #f0f4f8' }}>
          {records.map(r => {
            const cfg = ATT_CFG[r.status] || ATT_CFG.ABSENT;
            const dateStr = new Date(r.markedAt).toLocaleDateString('en-GB', {
              timeZone: tz, weekday: 'short', day: 'numeric', month: 'short',
            });
            const timeStr = r.session?.scheduledAt
              ? new Date(r.session.scheduledAt).toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' })
              : null;

            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid #f0f4f8' }}>
                {/* Status dot */}
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {cfg.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{dateStr}</span>
                    {timeStr && <span style={{ fontSize: 12, color: '#94a3b8' }}>at {timeStr}</span>}
                    <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 4, padding: '2px 7px' }}>{cfg.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, display: 'flex', gap: 8 }}>
                    {r.session?.courseType && <span>{COURSE_LABELS[r.session.courseType] || r.session.courseType}</span>}
                    {r.session?.teacher?.name && <span>· {r.session.teacher.name}</span>}
                    {r.notes && <span>· &ldquo;{r.notes}&rdquo;</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function ParentAttendancePage() {
  const { getToken }          = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [childId, setChildId] = useState(null);
  const [childTz, setChildTz] = useState('UTC');
  const [childName, setChildName] = useState('');

  useEffect(() => {
    const id       = window.__parentActiveChild;
    const children = window.__parentChildren || [];
    const child    = children.find(c => c.id === id);
    setChildId(id);
    setChildTz(child?.profile?.timezone || 'UTC');
    setChildName(child?.profile?.childName || 'your child');
  }, []);

  const load = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parent/children/${childId}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load attendance');
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [childId, getToken]);

  useEffect(() => { load(); }, [load]);

  const stats   = data?.stats   || { total: 0, present: 0, late: 0, absent: 0, excused: 0, percentage: 0 };
  const records = data?.records || [];
  const monthGroups = groupByMonth(records, childTz);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>Attendance</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>{childName}&apos;s full attendance history</div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 14, marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary card */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '28px', marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Attendance Summary</div>
        {loading ? <Skeleton h={140} /> : (
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <AttendanceRing pct={stats.percentage} size={120} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[
                  ['Total Sessions', stats.total,   '#0f172a'],
                  ['Attended',       stats.present + stats.late, '#22c55e'],
                  ['Absent',         stats.absent,  '#ef4444'],
                  ['Excused',        stats.excused, '#8b5cf6'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ background: '#f7f9fb', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color }}>{val}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
              {stats.late > 0 && (
                <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                  Attended includes {stats.present} present + {stats.late} late
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Monthly breakdown */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 12 }}>
          Session History {!loading && `(${records.length} sessions)`}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <Skeleton key={i} />)}</div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No attendance records yet</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Attendance will be marked by the teacher after each class.</div>
          </div>
        ) : (
          Object.entries(monthGroups).map(([month, recs]) => (
            <MonthGroup key={month} month={month} records={recs} tz={childTz} />
          ))
        )}
      </div>
    </div>
  );
}