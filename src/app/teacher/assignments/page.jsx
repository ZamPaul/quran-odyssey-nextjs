'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

const COURSE_TYPES = [
  { value:'NOORANI_QAIDA', label:'Noorani Qaida' },
  { value:'QURAN_RECITATION', label:'Quran Recitation' },
  { value:'TAJWEED', label:'Tajweed' },
  { value:'HIFZ', label:'Hifz' },
  { value:'ISLAMIC_STUDIES', label:'Islamic Studies' },
  { value:'ONE_TO_ONE', label:'1-on-1' },
];

const STATUS_TABS = ['ALL','PENDING','SUBMITTED','GRADED','OVERDUE'];
const STATUS_COLORS = {
  PENDING:'#64748b', SUBMITTED:'#0e6e8a', GRADED:'#22c55e', OVERDUE:'#ef4444',
};

// ── Input helpers ─────────────────────────────────────────
const inputStyle = {
  width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0',
  fontSize:13, fontFamily:'inherit', outline:'none', color:'#0f172a', boxSizing:'border-box',
};
const labelStyle = { fontSize:12, fontWeight:700, color:'#64748b', marginBottom:4, display:'block' };
const btnPrimary = (disabled) => ({
  padding:'9px 18px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor: disabled ? 'not-allowed' : 'pointer',
  background: disabled ? '#e2e8f0' : '#0d2840', color: disabled ? '#94a3b8' : 'white',
});

// ── Create form ───────────────────────────────────────────
function CreateForm({ students, onCreated, onCancel, apiFetch }) {
  const [form, setForm] = useState({ studentId:'', title:'', description:'', dueDate:'', courseType:'' });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k,v) => setForm(p => ({ ...p, [k]:v }));
  const isValid = form.studentId && form.title && form.dueDate && form.courseType;

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const data = await apiFetch('/api/teacher/assignments', {
        method:'POST',
        body: JSON.stringify({ ...form, description: form.description || undefined }),
      });
      onCreated(data.assignment);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // Auto-set courseType when student selected
  useEffect(() => {
    if (!form.studentId) return;
    const match = students.find(s => s.student.id === form.studentId);
    if (match) set('courseType', match.enrollment.courseType);
  }, [form.studentId]);

  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #28b7d9', boxShadow:'0 0 0 3px rgba(40,183,217,0.08)', padding:'24px', marginBottom:16 }}>
      <div style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:18 }}>New Assignment</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div>
          <label style={labelStyle}>Student *</label>
          <select value={form.studentId} onChange={e => set('studentId', e.target.value)} style={inputStyle}>
            <option value="">Select student</option>
            {students.map(({ student, enrollment }) => (
              <option key={student.id} value={student.id}>
                {student.profile?.childName || student.email} — {enrollment.courseType.replace(/_/g,' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Course *</label>
          <select value={form.courseType} onChange={e => set('courseType', e.target.value)} style={inputStyle}>
            <option value="">Select course</option>
            {COURSE_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={labelStyle}>Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Practice Surah Al-Fatiha" style={inputStyle} />
        </div>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={2} placeholder="Instructions for the student…"
            style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }} />
        </div>
        <div>
          <label style={labelStyle}>Due Date *</label>
          <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]} style={inputStyle} />
        </div>
      </div>
      {error && <div style={{ marginTop:12, fontSize:12, color:'#ef4444', fontWeight:700 }}>{error}</div>}
      <div style={{ display:'flex', gap:8, marginTop:18 }}>
        <button onClick={handleSubmit} disabled={saving||!isValid} style={btnPrimary(saving||!isValid)}>
          {saving ? 'Creating…' : 'Create Assignment'}
        </button>
        <button onClick={onCancel} style={{ padding:'9px 14px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#64748b', fontSize:13, cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Grade form ────────────────────────────────────────────
function GradeForm({ assignmentId, onGraded, apiFetch }) {
  const [grade,    setGrade]    = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const QUICK_GRADES = ['Excellent ✓', 'MashaAllah ⭐', 'Good Work 👍', 'Needs Practice 📝'];

  const handleSubmit = async () => {
    if (!grade.trim()) { setError('Enter a grade'); return; }
    setSaving(true); setError('');
    try {
      await apiFetch(`/api/teacher/assignments/${assignmentId}/grade`, {
        method:'POST',
        body: JSON.stringify({ grade: grade.trim(), feedback: feedback.trim()||undefined }),
      });
      onGraded(grade.trim(), feedback.trim());
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ marginTop:14, padding:'14px', borderRadius:8, background:'#f7f9fb', border:'1px solid #e2e8f0' }}>
      <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>
        Grade Submission
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
        {QUICK_GRADES.map(g => (
          <button key={g} onClick={() => setGrade(g)} style={{
            padding:'5px 10px', borderRadius:6, border:`1.5px solid ${grade===g?'#28b7d9':'#e2e8f0'}`,
            background: grade===g?'rgba(40,183,217,0.08)':'white', color: grade===g?'#0e6e8a':'#64748b',
            fontSize:12, fontWeight:700, cursor:'pointer',
          }}>{g}</button>
        ))}
      </div>
      <input value={grade} onChange={e => setGrade(e.target.value)}
        placeholder="Or type a custom grade…" style={{ ...inputStyle, marginBottom:8 }} />
      <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
        rows={2} placeholder="Feedback for the student (optional)…"
        style={{ ...inputStyle, resize:'vertical' }} />
      {error && <div style={{ marginTop:6, fontSize:12, color:'#ef4444' }}>{error}</div>}
      <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary(saving), marginTop:10 }}>
        {saving ? 'Saving…' : 'Submit Grade'}
      </button>
    </div>
  );
}

// ── Assignment card ───────────────────────────────────────
function AssignmentCard({ assignment, expanded, onToggle, onUpdated, apiFetch }) {
  const due       = new Date(assignment.dueDate);
  const isPastDue = due < new Date();
  const childName = assignment.student?.studentProfile?.childName || assignment.student?.email?.split('@')[0] || 'Student';
  const sub       = assignment.submission;
  const [localAssignment, setLocalAssignment] = useState(assignment);

  const handleGraded = (grade, feedback) => {
    setLocalAssignment(prev => ({
      ...prev,
      status: 'GRADED',
      submission: { ...prev.submission, grade, feedback, gradedAt: new Date().toISOString() },
    }));
    onUpdated({ ...localAssignment, status:'GRADED' });
  };

  const statusColor = STATUS_COLORS[localAssignment.status] || '#94a3b8';

  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
      <button onClick={onToggle} style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'16px 18px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{localAssignment.title}</span>
            <span style={{ fontSize:11, fontWeight:700, color:statusColor, background:`${statusColor}15`, borderRadius:5, padding:'2px 7px' }}>
              {localAssignment.status}
            </span>
          </div>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:3, display:'flex', gap:10 }}>
            <span>👤 {childName}</span>
            <span style={{ color: isPastDue && localAssignment.status==='PENDING' ? '#ef4444' : '#94a3b8' }}>
              📅 Due {due.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
            </span>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, color:'#94a3b8', transform: expanded?'rotate(180deg)':'rotate(0deg)', transition:'200ms ease' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ padding:'0 18px 18px', borderTop:'1px solid #e2e8f0' }}>
          {localAssignment.description && (
            <p style={{ fontSize:13, color:'#64748b', lineHeight:1.6, margin:'14px 0 10px' }}>{localAssignment.description}</p>
          )}

          {/* No submission yet */}
          {!sub && (
            <div style={{ padding:'12px 14px', borderRadius:8, background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.15)', fontSize:13, color:'#c2410c', fontWeight:600, marginTop:14 }}>
              No submission yet.
            </div>
          )}

          {/* Submission exists */}
          {sub && (
            <div style={{ marginTop:14, padding:'14px', borderRadius:8, background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#15803d', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>
                ✓ Submitted {new Date(sub.submittedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
              </div>
              {sub.content && <p style={{ fontSize:13, color:'#334155', lineHeight:1.6, margin:'0 0 8px' }}>"{sub.content}"</p>}
              {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#0e6e8a', fontWeight:700 }}>📎 View file</a>}

              {sub.grade ? (
                <div style={{ marginTop:8, fontSize:13, fontWeight:700, color:'#22c55e' }}>
                  Grade: {sub.grade}
                  {sub.feedback && <span style={{ fontWeight:400, color:'#64748b' }}> · {sub.feedback}</span>}
                </div>
              ) : (
                <GradeForm assignmentId={localAssignment.id} onGraded={handleGraded} apiFetch={apiFetch} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────
export default function AssignmentsPage() {
  const { getToken }     = useAuth();
  const [assignments,  setAssignments]  = useState([]);
  const [students,     setStudents]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedId,   setExpandedId]   = useState(null);
  const [showCreate,   setShowCreate]   = useState(false);

  const apiFetch = useCallback(async (path, opts = {}) => {
    const token = await getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...opts,
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}`, ...opts.headers },
    });
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error||'Failed'); }
    return res.json();
  }, [getToken]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [aData, sData] = await Promise.all([
          apiFetch(`/api/teacher/assignments${statusFilter!=='ALL'?`?status=${statusFilter}`:''}`),
          apiFetch('/api/teacher/students'),
        ]);
        setAssignments(aData.assignments || []);
        setStudents(sData.students || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, [statusFilter]);

  const handleCreated = (assignment) => {
    setAssignments(prev => [assignment, ...prev]);
    setShowCreate(false);
  };

  const handleUpdated = (updated) => {
    setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  return (
    <>
      <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:'#0f172a', letterSpacing:'-0.03em' }}>Assignments</div>
          <div style={{ fontSize:14, color:'#94a3b8', marginTop:4 }}>
            {loading ? 'Loading…' : `${assignments.length} assignment${assignments.length!==1?'s':''}`}
          </div>
        </div>
        <button onClick={() => setShowCreate(p=>!p)} style={{
          display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, border:'none',
          background: showCreate ? '#e2e8f0' : '#0d2840', color: showCreate ? '#64748b' : 'white',
          fontSize:13, fontWeight:700, cursor:'pointer',
        }}>
          {showCreate ? '✕ Cancel' : '+ New Assignment'}
        </button>
      </div>

      {showCreate && (
        <CreateForm
          students={students}
          onCreated={handleCreated}
          onCancel={() => setShowCreate(false)}
          apiFetch={apiFetch}
        />
      )}

      {/* Status filter */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding:'7px 14px', borderRadius:8, border:`1.5px solid ${statusFilter===s?'#0d2840':'#e2e8f0'}`,
            background: statusFilter===s?'#0d2840':'white', color: statusFilter===s?'white':'#64748b',
            fontSize:13, fontWeight:600, cursor:'pointer',
          }}>
            {s.charAt(0)+s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <div style={{ padding:'12px 16px', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#dc2626', fontSize:14, marginBottom:16 }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[1,2,3].map(i=><div key={i} style={{ height:76, borderRadius:12, background:'#f0f4f8', animation:'shimmer 1.5s ease infinite' }}/>)}
        </div>
      ) : assignments.length === 0 ? (
        <div style={{ padding:'60px 20px', textAlign:'center', background:'white', borderRadius:12, border:'1px solid #e2e8f0' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:6 }}>No assignments</div>
          <div style={{ fontSize:13, color:'#94a3b8' }}>Click "+ New Assignment" to create one.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {assignments.map(a => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              expanded={expandedId === a.id}
              onToggle={() => setExpandedId(p => p===a.id ? null : a.id)}
              onUpdated={handleUpdated}
              apiFetch={apiFetch}
            />
          ))}
        </div>
      )}
    </>
  );
}