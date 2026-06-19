'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

const COURSE_TYPES = [
  { value:'NOORANI_QAIDA',label:'Noorani Qaida'}, { value:'QURAN_RECITATION',label:'Quran Recitation'},
  { value:'TAJWEED',label:'Tajweed'}, { value:'HIFZ',label:'Hifz'},
  { value:'ISLAMIC_STUDIES',label:'Islamic Studies'}, { value:'ONE_TO_ONE',label:'1-on-1'},
];

const inputStyle = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:13, fontFamily:'inherit', outline:'none', color:'#0f172a', boxSizing:'border-box' };
const labelStyle = { fontSize:12, fontWeight:700, color:'#64748b', marginBottom:4, display:'block' };

// ── Star rating ───────────────────────────────────────────
function StarRating({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(value===n ? 0 : n)} style={{
          border:'none', background:'transparent', cursor:'pointer', fontSize:22,
          color: n<=value ? '#faa71a' : '#e2e8f0', padding:'0 2px',
          transition:'color 150ms ease',
        }}>★</button>
      ))}
    </div>
  );
}

// ── Report form (create / edit) ───────────────────────────
function ReportForm({ students, editReport, onSaved, onCancel, apiFetch }) {
  const isEdit = !!editReport;
  const [form, setForm] = useState({
    studentId:       editReport?.studentId || '',
    period:          editReport?.period || '',
    courseType:      editReport?.courseType || '',
    overallRating:   editReport?.overallRating || 0,
    tajweedProgress: editReport?.tajweedProgress || '',
    recitationNotes: editReport?.recitationNotes || '',
    behaviourNotes:  editReport?.behaviourNotes  || '',
    homeworkNotes:   editReport?.homeworkNotes   || '',
    teacherMessage:  editReport?.teacherMessage  || '',
    nextSteps:       editReport?.nextSteps       || '',
  });
  const [saving,   setSaving]   = useState(false);
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState('');

  const set = (k,v) => setForm(p => ({ ...p, [k]:v }));
  const isValid = form.studentId && form.period && form.courseType;

  // Auto-set courseType when student selected
  useEffect(() => {
    if (!form.studentId || isEdit) return;
    const match = students.find(s => s.student.id === form.studentId);
    if (match) set('courseType', match.enrollment.courseType);
  }, [form.studentId]);

  const save = async (andSend = false) => {
    if (!isValid) { setError('Student, period, and course are required'); return; }
    andSend ? setSending(true) : setSaving(true);
    setError('');
    try {
      let report;
      if (isEdit) {
        const data = await apiFetch(`/api/teacher/reports/${editReport.id}`, {
          method:'PATCH', body: JSON.stringify(form),
        });
        report = data.report;
      } else {
        const data = await apiFetch('/api/teacher/reports', {
          method:'POST',
          body: JSON.stringify({ ...form, overallRating: form.overallRating||undefined }),
        });
        report = data.report;
      }
      if (andSend) {
        const sendData = await apiFetch(`/api/teacher/reports/${report.id}/send`, { method:'POST' });
        report = sendData.report;
      }
      onSaved(report, isEdit);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); setSending(false); }
  };

  const fields = [
    { key:'tajweedProgress', label:'Tajweed Progress',     placeholder:'What Tajweed rules did they cover? Any breakthroughs or struggles?' },
    { key:'recitationNotes', label:'Recitation Notes',     placeholder:'How is their reading fluency, makharij, and overall recitation?' },
    { key:'behaviourNotes',  label:'Behaviour & Attitude', placeholder:'Focus, participation, attitude toward learning…' },
    { key:'homeworkNotes',   label:'Homework & Practice',  placeholder:'Did they complete homework? How was their home practice?' },
    { key:'teacherMessage',  label:'Personal Message to Parent', placeholder:'A warm personal note from you to the parent…' },
    { key:'nextSteps',       label:'Next Steps',           placeholder:'What will you focus on next week or month?' },
  ];

  return (
    <div style={{ background:'white', borderRadius:12, border:'1px solid #28b7d9', boxShadow:'0 0 0 3px rgba(40,183,217,0.08)', padding:'24px', marginBottom:16 }}>
      <div style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:18 }}>
        {isEdit ? `Edit Report — ${editReport.period}` : 'New Progress Report'}
      </div>

      {/* Top row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:14 }}>
        <div>
          <label style={labelStyle}>Student *</label>
          <select value={form.studentId} onChange={e=>set('studentId',e.target.value)} style={inputStyle} disabled={isEdit}>
            <option value="">Select student</option>
            {students.map(({student,enrollment}) => (
              <option key={student.id} value={student.id}>
                {student?.name||student.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Period *</label>
          <input value={form.period} onChange={e=>set('period',e.target.value)}
            placeholder='e.g. "Week 12" or "June 2026"' style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Course *</label>
          <select value={form.courseType} onChange={e=>set('courseType',e.target.value)} style={inputStyle}>
            <option value="">Select course</option>
            {COURSE_TYPES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Rating */}
      <div style={{ marginBottom:18 }}>
        <label style={labelStyle}>Overall Rating</label>
        <StarRating value={form.overallRating} onChange={v=>set('overallRating',v)} />
      </div>

      {/* Content fields */}
      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:18 }}>
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <textarea
              value={form[key]}
              onChange={e=>set(key,e.target.value)}
              placeholder={placeholder}
              rows={2}
              style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }}
            />
          </div>
        ))}
      </div>

      {error && <div style={{ marginBottom:12, fontSize:12, color:'#ef4444', fontWeight:700 }}>{error}</div>}

      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <button onClick={() => save(false)} disabled={saving||sending||!isValid} style={{
          padding:'9px 18px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor: saving||!isValid?'not-allowed':'pointer',
          background: saving||!isValid?'#e2e8f0':'#0d2840', color: saving||!isValid?'#94a3b8':'white',
        }}>
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button onClick={() => save(true)} disabled={saving||sending||!isValid} style={{
          padding:'9px 18px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor: sending||!isValid?'not-allowed':'pointer',
          background: sending||!isValid?'#e2e8f0':'#faa71a', color: sending||!isValid?'#94a3b8':'#0d2840',
        }}>
          {sending ? 'Sending…' : '📧 Save & Send to Parent'}
        </button>
        <button onClick={onCancel} style={{ padding:'9px 14px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#64748b', fontSize:13, cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Report card ───────────────────────────────────────────
function ReportCard({ report, onEdit, onSent, apiFetch }) {
  const [expanded, setExpanded]     = useState(false);
  const [sending,  setSending]      = useState(false);
  const [error,    setError]        = useState('');
  const [localReport, setLocalReport] = useState(report);

  const isSent = localReport.status === 'SENT';
  const childName = localReport.student?.name || localReport.student?.email?.split('@')[0] || 'Student';

  const handleSend = async () => {
    setSending(true); setError('');
    try {
      const data = await apiFetch(`/api/teacher/reports/${localReport.id}/send`, { method:'POST' });
      setLocalReport(data.report);
      onSent(data.report);
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  const contentFields = [
    ['Tajweed Progress',      localReport.tajweedProgress],
    ['Recitation',            localReport.recitationNotes],
    ['Behaviour & Attitude',  localReport.behaviourNotes],
    ['Homework & Practice',   localReport.homeworkNotes],
    ['Message to Parent',     localReport.teacherMessage],
    ['Next Steps',            localReport.nextSteps],
  ].filter(([, v]) => v);

  return (
    <div style={{ background:'white', borderRadius:12, border:`1px solid ${isSent?'#e2e8f0':'#fed7aa'}`, overflow:'hidden' }}>
      <button onClick={() => setExpanded(p=>!p)} style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'16px 18px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>
              {localReport.period}
            </span>
            {localReport.overallRating > 0 && (
              <span style={{ fontSize:12, color:'#faa71a' }}>
                {'⭐'.repeat(localReport.overallRating)}
              </span>
            )}
            <span style={{
              fontSize:11, fontWeight:700,
              color: isSent?'#22c55e':'#f97316',
              background: isSent?'rgba(34,197,94,0.10)':'rgba(249,115,22,0.10)',
              borderRadius:5, padding:'2px 7px',
            }}>
              {isSent ? '✓ Sent' : '✎ Draft'}
            </span>
          </div>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:3 }}>
            👤 {childName} · {localReport.courseType?.replace(/_/g,' ')}
            {isSent && localReport.sentAt && ` · Sent ${new Date(localReport.sentAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}`}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, color:'#94a3b8', transform:expanded?'rotate(180deg)':'rotate(0deg)', transition:'200ms ease' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop:'1px solid #e2e8f0', padding:'18px', background:'#fafbfc' }}>
          {contentFields.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
              {contentFields.map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#94a3b8', marginBottom:4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize:13, color:'#334155', lineHeight:1.7 }}>{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color:'#94a3b8', fontSize:13, marginBottom:16 }}>
              No content filled in yet.
            </div>
          )}

          {error && <div style={{ fontSize:12, color:'#ef4444', marginBottom:10 }}>{error}</div>}

          {!isSent && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button onClick={() => onEdit(localReport)} style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#0d2840', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                ✎ Edit
              </button>
              <button onClick={handleSend} disabled={sending} style={{
                padding:'8px 14px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor:sending?'wait':'pointer',
                background:sending?'#e2e8f0':'#faa71a', color:sending?'#94a3b8':'#0d2840',
              }}>
                {sending ? 'Sending…' : '📧 Send to Parent'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────
export default function ReportsPage() {
  const { getToken } = useAuth();
  const [reports,   setReports]   = useState([]);
  const [students,  setStudents]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [tab,       setTab]       = useState('DRAFT');
  const [showForm,  setShowForm]  = useState(false);
  const [editReport, setEditReport] = useState(null);

  const apiFetch = useCallback(async (path, opts = {}) => {
    const token = await getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...opts,
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}`, ...opts.headers },
    });
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error||'Failed'); }
    return res.json();
  }, [getToken]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const [rData, sData] = await Promise.all([
        apiFetch('/api/teacher/reports'),
        apiFetch('/api/teacher/students'),
      ]);
      setReports(rData.reports || []);
      setStudents(sData.students || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [apiFetch]);

  useEffect(() => { loadReports(); }, []);

  const filteredReports = reports.filter(r => r.status === tab);

  const handleSaved = (report, isEdit) => {
    if (isEdit) {
      setReports(prev => prev.map(r => r.id===report.id ? report : r));
    } else {
      setReports(prev => [report, ...prev]);
    }
    setShowForm(false);
    setEditReport(null);
    // Switch to correct tab
    setTab(report.status);
  };

  const handleEdit = (report) => {
    setEditReport(report);
    setShowForm(true);
  };

  const handleSent = (updatedReport) => {
    setReports(prev => prev.map(r => r.id===updatedReport.id ? updatedReport : r));
    setTab('SENT');
  };

  return (
    <>
      <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:'#0f172a', letterSpacing:'-0.03em' }}>Progress Reports</div>
          <div style={{ fontSize:14, color:'#94a3b8', marginTop:4 }}>
            {loading ? 'Loading…' : `${reports.length} report${reports.length!==1?'s':''} total`}
          </div>
        </div>
        <button onClick={() => { setShowForm(p=>!p); setEditReport(null); }} style={{
          display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, border:'none',
          background: showForm&&!editReport ? '#e2e8f0' : '#0d2840',
          color: showForm&&!editReport ? '#64748b' : 'white',
          fontSize:13, fontWeight:700, cursor:'pointer',
        }}>
          {showForm && !editReport ? '✕ Cancel' : '+ New Report'}
        </button>
      </div>

      {(showForm || editReport) && (
        <ReportForm
          students={students}
          editReport={editReport}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditReport(null); }}
          apiFetch={apiFetch}
        />
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid #e2e8f0' }}>
        {['DRAFT','SENT'].map(t => {
          const count = reports.filter(r=>r.status===t).length;
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'10px 16px', border:'none', background:'transparent', cursor:'pointer',
              fontSize:13, fontWeight: tab===t ? 700 : 500,
              color: tab===t ? '#0d2840' : '#94a3b8',
              borderBottom: tab===t ? '2px solid #0d2840' : '2px solid transparent',
              marginBottom:-1, display:'flex', alignItems:'center', gap:6,
            }}>
              {t==='DRAFT' ? '✎ Drafts' : '✓ Sent'}
              {count > 0 && (
                <span style={{ fontSize:11, fontWeight:700, background: tab===t?'#0d2840':'#e2e8f0', color: tab===t?'white':'#64748b', borderRadius:10, padding:'1px 6px' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <div style={{ padding:'12px 16px', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#dc2626', fontSize:14, marginBottom:16 }}>⚠️ {error}</div>}

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[1,2].map(i=><div key={i} style={{ height:76, borderRadius:12, background:'#f0f4f8', animation:'shimmer 1.5s ease infinite' }}/>)}
        </div>
      ) : filteredReports.length === 0 ? (
        <div style={{ padding:'60px 20px', textAlign:'center', background:'white', borderRadius:12, border:'1px solid #e2e8f0' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>{tab==='DRAFT'?'✎':'📬'}</div>
          <div style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:6 }}>
            {tab==='DRAFT' ? 'No draft reports' : 'No sent reports yet'}
          </div>
          <div style={{ fontSize:13, color:'#94a3b8' }}>
            {tab==='DRAFT' ? 'Click "+ New Report" to write one.' : 'Sent reports appear here.'}
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filteredReports.map(r => (
            <ReportCard
              key={r.id}
              report={r}
              onEdit={handleEdit}
              onSent={handleSent}
              apiFetch={apiFetch}
            />
          ))}
        </div>
      )}
    </>
  );
}