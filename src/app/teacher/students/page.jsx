'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

const COURSE_LABELS = {
  NOORANI_QAIDA:    'Noorani Qaida',
  QURAN_RECITATION: 'Quran Recitation',
  TAJWEED:          'Tajweed',
  HIFZ:             'Hifz',
  ISLAMIC_STUDIES:  'Islamic Studies',
  ONE_TO_ONE:       '1-on-1',
};

function AttendanceRing({ pct }) {
  const r  = 16;
  const c  = 2 * Math.PI * r;
  const fill = (pct / 100) * c;
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f97316' : '#ef4444';
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={`${fill} ${c}`} strokeLinecap="round"
        transform="rotate(-90 22 22)" />
      <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="800"
        fill={color} fontFamily="system-ui">{pct}%</text>
    </svg>
  );
}

function StudentCard({ item }) {
  const { student, enrollment } = item;
  const profile  = student;
  // const initials = (profile?.childName || student.email)
  //   .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const initials = student?.name;
  const gradients = [
    'linear-gradient(135deg,#28b7d9,#0e6e8a)',
    'linear-gradient(135deg,#faa71a,#e8920a)',
    'linear-gradient(135deg,#7c3bee,#5b21b6)',
    'linear-gradient(135deg,#22c55e,#15803d)',
  ];
  const grad = gradients[(profile?.name || '').charCodeAt(0) % gradients.length];

  return (
    <Link
      href={`/teacher/students/${student.id}`}
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        background:   'white',
        borderRadius: 12,
        border:       '1px solid #e2e8f0',
        padding:      '20px',
        display:      'flex',
        flexDirection:'column',
        gap:          14,
        cursor:       'pointer',
        transition:   'all 150ms ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#28b7d9'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(40,183,217,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: grad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: 'white', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                {profile?.name || student.email.split('@')[0]}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                {profile?.age ? `${profile.age} yrs` : ''}{profile?.country ? ` · ${profile.country}` : ''}
              </div>
            </div>
          </div>
          <AttendanceRing pct={student.attendancePercentage} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#0e6e8a',
            background: 'rgba(40,183,217,0.10)', borderRadius: 6, padding: '3px 8px',
          }}>
            {COURSE_LABELS[enrollment.courseType] || enrollment.courseType}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: enrollment.status === 'ACTIVE' ? '#15803d' : '#94a3b8',
            background: enrollment.status === 'ACTIVE' ? 'rgba(34,197,94,0.10)' : '#f0f4f8',
            borderRadius: 6, padding: '3px 8px',
          }}>
            {enrollment.status}
          </span>
          {enrollment.sessionsPerWeek && (
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {enrollment.sessionsPerWeek}× / week
            </span>
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid #f0f4f8', paddingTop: 12,
        }}>
          {/* <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {profile?.parentName ? `Parent: ${profile.parentName}` : student.email}
          </span> */}
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a', display: 'flex', alignItems: 'center', gap: 4 }}>
            View profile
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function StudentsPage() {
  const { getToken }          = useAuth();
  const [students,  setStudents]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('ACTIVE');

  const apiFetch = useCallback(async (path, opts = {}) => {
    const token = await getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
    return res.json();
  }, [getToken]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/teacher/students?status=${filter}`);
        setStudents(data.students || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, [filter]);

  useEffect(() => {
    console.log(students)
  }, [students])

  const filtered = students.filter(({ student }) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      student?.name.toLowerCase().includes(q) ||
      student.profile?.parentName?.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <style>{`@keyframes shimmer { 0%,100% { opacity:1 } 50% { opacity:0.5 } }`}</style>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          My Students
        </div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
          {loading ? 'Loading…' : `${filtered.length} student${filtered.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name…"
          style={{
            flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 8,
            border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit',
            outline: 'none', color: '#0f172a',
          }}
        />
        {['ACTIVE', 'PAUSED', 'COMPLETED'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '9px 14px', borderRadius: 8, border: `1.5px solid ${filter === s ? '#0d2840' : '#e2e8f0'}`,
            background: filter === s ? '#0d2840' : 'white', color: filter === s ? 'white' : '#64748b',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 14, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 160, borderRadius: 12, background: '#f0f4f8', animation: 'shimmer 1.5s ease infinite' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            {search ? 'No students match your search' : 'No students yet'}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            {search ? 'Try a different name.' : 'Students appear here once enrolled.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {filtered.map(item => <StudentCard key={item.student.id} item={item} />)}
        </div>
      )}
    </>
  );
}