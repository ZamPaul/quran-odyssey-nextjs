'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const COURSE_LABELS = {
  NOORANI_QAIDA:'Noorani Qaida', QURAN_RECITATION:'Quran Recitation',
  TAJWEED:'Tajweed', HIFZ:'Hifz', ISLAMIC_STUDIES:'Islamic Studies', ONE_TO_ONE:'1-on-1',
};
const ATT_CFG = {
  PRESENT:{ label:'Present', color:'#22c55e', icon:'✓' },
  LATE:   { label:'Late',    color:'#f97316', icon:'⏰' },
  ABSENT: { label:'Absent',  color:'#ef4444', icon:'✗' },
  EXCUSED:{ label:'Excused', color:'#8b5cf6', icon:'📋' },
};

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 12px', background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', flex: 1, minWidth: 80 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || '#0f172a', letterSpacing: '-0.03em' }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', marginTop: 3 }}>{label}</div>
    </div>
  );
}

function SessionRow({ session }) {
  const att = session.attendance;
  const cfg = att ? ATT_CFG[att.status] : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f4f8' }}>
      <div style={{ minWidth: 52, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
        {new Date(session.scheduledAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
      </div>
      <div style={{ fontSize: 13, color: '#64748b', flex: 1 }}>
        {new Date(session.scheduledAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
        {' · '}{COURSE_LABELS[session.courseType] || session.courseType}
      </div>
      {cfg ? (
        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: `${cfg.color}18`, borderRadius: 5, padding: '2px 7px' }}>
          {cfg.icon} {cfg.label}
        </span>
      ) : (
        <span style={{ fontSize: 11, color: '#94a3b8' }}>—</span>
      )}
    </div>
  );
}

function AssignmentRow({ assignment }) {
  const statusColors = { PENDING:'#64748b', SUBMITTED:'#0e6e8a', GRADED:'#22c55e', OVERDUE:'#ef4444' };
  const due = new Date(assignment.dueDate);
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f4f8' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{assignment.title}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            Due {due.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: statusColors[assignment.status] || '#64748b', background: `${statusColors[assignment.status] || '#64748b'}15`, borderRadius: 5, padding: '3px 8px', flexShrink: 0 }}>
          {assignment.status}
        </span>
      </div>
      {assignment.submission?.grade && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#22c55e', fontWeight: 700 }}>
          Grade: {assignment.submission.grade}
          {assignment.submission.feedback && ` · "${assignment.submission.feedback}"`}
        </div>
      )}
    </div>
  );
}

function ReportRow({ report }) {
  const isSent = report.status === 'SENT';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f4f8' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{report.period}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
          {COURSE_LABELS[report.courseType]} · {report.overallRating ? `${'⭐'.repeat(report.overallRating)} ` : ''}
          {new Date(report.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
        </div>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700,
        color: isSent ? '#22c55e' : '#f97316',
        background: isSent ? 'rgba(34,197,94,0.10)' : 'rgba(249,115,22,0.10)',
        borderRadius: 5, padding: '3px 8px',
      }}>
        {isSent ? '✓ Sent' : '✎ Draft'}
      </span>
    </div>
  );
}

const TABS = ['Overview', 'Sessions', 'Assignments', 'Reports', 'Attendance'];

export default function StudentDetailPage() {
  const { id }            = useParams();
  const { getToken }      = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState('Overview');

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
      try { setData(await apiFetch(`/api/teacher/students/${id}`)); }
      catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Loading student…</div>
  );
  if (error) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#ef4444', fontSize: 14 }}>⚠️ {error}</div>
  );

  const { student, enrollment, sessions, assignments, progressReports, attendance } = data;
  const profile  = student.profile;
  const initials = (profile?.childName || student.email).split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const attColor = attendance.percentage >= 80 ? '#22c55e' : attendance.percentage >= 60 ? '#f97316' : '#ef4444';

  return (
    <>
      {/* Back */}
      <Link href="/teacher/students" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:13, fontWeight:700, color:'#64748b', textDecoration:'none', marginBottom:20 }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Students
      </Link>

      {/* Profile header */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:'24px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#28b7d9,#0e6e8a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'white', flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>
              {profile?.childName || student.email.split('@')[0]}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:6 }}>
              {profile?.childAge    && <span style={{ fontSize:12, color:'#64748b' }}>👤 {profile.childAge} yrs</span>}
              {/* {profile?.country     && <span style={{ fontSize:12, color:'#64748b' }}>🌍 {profile.country}</span>} */}
              {/* {profile?.timezone    && <span style={{ fontSize:12, color:'#64748b' }}>🕐 {profile.timezone}</span>} */}
              {/* {profile?.parentName  && <span style={{ fontSize:12, color:'#64748b' }}>👨‍👩‍👧 {profile.parentName}</span>} */}
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#0e6e8a', background:'rgba(40,183,217,0.10)', borderRadius:6, padding:'4px 10px' }}>
              {COURSE_LABELS[enrollment.courseType]}
            </span>
            <span style={{ fontSize:11, fontWeight:700, color:'#22c55e', background:'rgba(34,197,94,0.10)', borderRadius:6, padding:'4px 10px' }}>
              {enrollment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <Stat label="Attendance" value={`${attendance.percentage}%`} color={attColor} />
        <Stat label="Sessions"   value={sessions.length} />
        <Stat label="Assignments" value={assignments.length} />
        <Stat label="Reports"    value={progressReports.length} />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid #e2e8f0', paddingBottom:0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'10px 16px', border:'none', background:'transparent', cursor:'pointer',
            fontSize:13, fontWeight: tab===t ? 700 : 500,
            color: tab===t ? '#0d2840' : '#94a3b8',
            borderBottom: tab===t ? '2px solid #0d2840' : '2px solid transparent',
            marginBottom:-1,
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Section title="Recent Sessions">
            {sessions.slice(0,5).length === 0 ? <Empty label="No sessions yet" /> :
              sessions.slice(0,5).map(s => <SessionRow key={s.id} session={s} />)}
          </Section>
          <Section title="Pending Assignments">
            {assignments.filter(a=>a.status==='PENDING'||a.status==='OVERDUE').length === 0
              ? <Empty label="No pending assignments" />
              : assignments.filter(a=>a.status==='PENDING'||a.status==='OVERDUE').map(a => <AssignmentRow key={a.id} assignment={a} />)}
          </Section>
        </div>
      )}

      {tab === 'Sessions' && (
        <Section title={`All Sessions (${sessions.length})`}>
          {sessions.length === 0 ? <Empty label="No sessions recorded" /> :
            sessions.map(s => <SessionRow key={s.id} session={s} />)}
        </Section>
      )}

      {tab === 'Assignments' && (
        <Section title={`Assignments (${assignments.length})`}>
          {assignments.length === 0 ? <Empty label="No assignments yet" /> :
            assignments.map(a => <AssignmentRow key={a.id} assignment={a} />)}
        </Section>
      )}

      {tab === 'Reports' && (
        <Section title={`Progress Reports (${progressReports.length})`}>
          {progressReports.length === 0 ? <Empty label="No reports yet" /> :
            progressReports.map(r => <ReportRow key={r.id} report={r} />)}
        </Section>
      )}

      {tab === 'Attendance' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
            {[
              ['Present', attendance.present, '#22c55e'],
              ['Late',    attendance.late,    '#f97316'],
              ['Absent',  attendance.absent,  '#ef4444'],
              ['Excused', attendance.excused, '#8b5cf6'],
            ].map(([l,v,c]) => <Stat key={l} label={l} value={v} color={c} />)}
          </div>
          <Section title={`Attendance Records (${attendance.total})`}>
            {attendance.records.length === 0 ? <Empty label="No attendance recorded" /> :
              attendance.records.map(r => {
                const cfg = ATT_CFG[r.status];
                return (
                  <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #f0f4f8' }}>
                    <div style={{ minWidth:70, fontSize:13, color:'#64748b' }}>
                      {new Date(r.markedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:cfg?.color||'#94a3b8', background:`${cfg?.color||'#94a3b8'}15`, borderRadius:5, padding:'2px 8px' }}>
                      {cfg?.icon} {cfg?.label}
                    </span>
                    {r.notes && <span style={{ fontSize:12, color:'#94a3b8', fontStyle:'italic' }}>"{r.notes}"</span>}
                  </div>
                );
              })}
          </Section>
        </div>
      )}
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:'20px' }}>
      <div style={{ fontSize:14, fontWeight:800, color:'#0f172a', marginBottom:12 }}>{title}</div>
      {children}
    </div>
  );
}

function Empty({ label }) {
  return <div style={{ padding:'24px 0', textAlign:'center', fontSize:13, color:'#94a3b8' }}>{label}</div>;
}