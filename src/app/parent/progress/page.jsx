'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

// ─── Helpers ──────────────────────────────────────────────
const COURSE_LABELS = {
  NOORANI_QAIDA:    'Noorani Qaida',
  QURAN_RECITATION: 'Quran Recitation',
  TAJWEED:          'Tajweed',
  HIFZ:             'Hifz Programme',
  ISLAMIC_STUDIES:  'Islamic Studies',
  ONE_TO_ONE:       '1-on-1 Private',
};

function Skeleton({ h = 80 }) {
  return <div style={{ height: h, borderRadius: 10, background: '#f0f4f8', animation: 'shimmer 1.5s ease infinite' }} />;
}

function AttendanceRing({ pct, size = 96 }) {
  const r    = size * 0.38;
  const c    = 2 * Math.PI * r;
  const fill = (pct / 100) * c;
  const col  = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f97316' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="5"
        strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize={size * 0.2}
        fontWeight="800" fill={col} fontFamily="system-ui">{pct}%</text>
    </svg>
  );
}

function ReportCard({ report }) {
  const [open, setOpen] = useState(false);
  const stars = report.overallRating || 0;

  const sections = [
    ['Tajweed Progress',     report.tajweedProgress],
    ['Recitation',           report.recitationNotes],
    ['Behaviour & Attitude', report.behaviourNotes],
    ['Homework & Practice',  report.homeworkNotes],
    ['Message from Teacher', report.teacherMessage],
    ['Next Steps',           report.nextSteps],
  ].filter(([, v]) => v);

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{report.period}</span>
            {stars > 0 && <span style={{ fontSize: 13, color: '#faa71a' }}>{'⭐'.repeat(Math.min(stars, 5))}</span>}
            <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.10)', borderRadius: 4, padding: '2px 7px' }}>✓ Received</span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
            {COURSE_LABELS[report.courseType] || report.courseType || 'Quran'} · {report.teacher?.name || 'Teacher'}
            {report.sentAt && ` · ${new Date(report.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </div>
        </div>
        <span style={{ color: '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: '200ms', flexShrink: 0 }}>▾</span>
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
}

// ─── Main page ────────────────────────────────────────────
export default function ParentProgressPage() {
  const { getToken }         = useAuth();
  const [data,    setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]  = useState(null);
  const [childId, setChildId] = useState(null);
  const [childName, setChildName] = useState('');

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
      const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parent/children/${childId}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load progress');
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [childId, getToken]);

  useEffect(() => { load(); }, [load]);

  const att = data?.attendance || { total: 0, present: 0, late: 0, absent: 0, excused: 0, percentage: 0 };
  const reports = data?.reports || [];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>Progress</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>{childName}&apos;s learning progress and teacher reports</div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 14, marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Attendance card */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '28px', marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Attendance Overview</div>
        {loading ? <Skeleton h={120} /> : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            <AttendanceRing pct={att.percentage} size={96} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 40px', flex: 1 }}>
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
            <div style={{ textAlign: 'center', paddingLeft: 16, borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{att.total}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>sessions</div>
            </div>
          </div>
        )}
      </div>

      {/* Progress reports */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 12 }}>
          Progress Reports {!loading && `(${reports.length})`}
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <Skeleton key={i} />)}</div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No reports yet</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Progress reports from the teacher will appear here.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reports.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}