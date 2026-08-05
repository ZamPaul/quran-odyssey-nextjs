'use client';

// FILE: src/app/admin/assignments/page.jsx  (NEW)
//
// Assignments — oversight. Read + moderate, never author or grade.
// Overdue is computed from the due date, NOT the stored status: the
// teacher-side sweep is manual and per-teacher, so the stored status lags.

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const COURSE_LABELS = {
  NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation', TAJWEED: 'Tajweed',
  HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1',
};
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }

export default function AdminAssignmentsPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [facets, setFacets] = useState({ teachers: [], students: [], courses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [f, setF] = useState({ q: '', teacherId: '', course: '', status: '', flag: '' });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [sweeping, setSweeping] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const qs = new URLSearchParams({ ...f, page: String(page), pageSize: '25' });
      Object.keys(f).forEach(k => { if (!f[k]) qs.delete(k); });
      const res = await fetch(`${apiBase()}/api/admin/assignments?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load assignments');
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [f, page]);

  useEffect(() => { const t = setTimeout(load, f.q ? 300 : 0); return () => clearTimeout(t); }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/assignments/facets`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setFacets(await res.json());
      } catch {}
    })();
  }, []);

  const sweep = async () => {
    setSweeping(true); setMsg(''); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/assignments/sweep-overdue`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Sweep failed');
      setMsg(`${j.updated} assignment${j.updated === 1 ? '' : 's'} marked overdue.`);
      load();
    } catch (err) { setError(err.message); }
    finally { setSweeping(false); }
  };

  const set = (k, v) => { setPage(1); setF(p => ({ ...p, [k]: v })); };
  const rows = data?.rows || [];
  const counts = data?.counts || {};
  const grace = data?.ungradedGraceDays ?? 3;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const FLAGS = [
    { key: 'overdue', label: 'Overdue', count: counts.overdue, tone: ['#dc2626','rgba(239,68,68,0.10)'] },
    { key: 'ungraded', label: `Ungraded ${grace}+ days`, count: counts.ungraded, tone: ['#dc2626','rgba(239,68,68,0.10)'] },
    { key: 'awaiting-grading', label: 'Awaiting grading', count: counts.awaitingGrading, tone: ['#b45309','rgba(250,167,26,0.14)'] },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Assignments</h1>
        <button onClick={sweep} disabled={sweeping} style={ghost}>
          {sweeping ? 'Sweeping…' : '↻ Run overdue sweep'}
        </button>
      </div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
        All homework set across the platform, what came back, and what’s waiting to be marked.
      </p>

      {error && <div style={errBox}>⚠️ {error}</div>}
      {msg && <div style={okBox}>{msg}</div>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={() => set('flag', '')} style={chipBtn(!f.flag)}>All</button>
        {FLAGS.map(fl => (
          <button key={fl.key} onClick={() => set('flag', f.flag === fl.key ? '' : fl.key)} style={chipBtn(f.flag === fl.key, fl.tone)}>
            {fl.label} <span style={{ opacity: 0.65 }}>{fl.count ?? 0}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input value={f.q} onChange={e => set('q', e.target.value)} placeholder="Search title, learner or teacher…" style={{ ...inp, minWidth: 230, flex: 1 }} />
        <select value={f.teacherId} onChange={e => set('teacherId', e.target.value)} style={inp}>
          <option value="">All teachers</option>
          {facets.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={f.course} onChange={e => set('course', e.target.value)} style={inp}>
          <option value="">All courses</option>
          {(facets.courses || []).map(c => <option key={c} value={c}>{COURSE_LABELS[c] || c}</option>)}
        </select>
        <select value={f.status} onChange={e => set('status', e.target.value)} style={inp}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="GRADED">Graded</option>
          <option value="OVERDUE">Overdue (stored)</option>
        </select>
      </div>

      {loading ? <div style={{ ...card, ...empty }}>Loading…</div>
        : rows.length === 0 ? <div style={{ ...card, ...empty }}>No assignments match.</div>
        : (
        <div style={{ ...card, overflow: 'hidden' }}>
          {rows.map(a => (
            <div key={a.id} onClick={() => setOpen(a.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                background: a.isOverdue || a.ungradedDays >= 3 ? 'rgba(239,68,68,0.03)' : 'white' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.title}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {a.student?.name} · {a.teacher?.name} · {COURSE_LABELS[a.courseType] || a.courseType} · due {fmtDate(a.dueDate)}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  {a.isOverdue && <span style={pill('#dc2626','rgba(239,68,68,0.10)')}>overdue</span>}
                  {a.staleStatus && <span style={pill('#b45309','rgba(250,167,26,0.14)')}>status not swept</span>}
                  {a.awaitingGrading && <span style={pill(a.ungradedDays >= 3 ? '#dc2626' : '#b45309', a.ungradedDays >= 3 ? 'rgba(239,68,68,0.10)' : 'rgba(250,167,26,0.14)')}>
                    ungraded {a.ungradedDays}d
                  </span>}
                  {a.submission?.fileUrl && <span style={pill('#0e6e8a','rgba(40,183,217,0.10)')}>file submitted</span>}
                </div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', minWidth: 44, textAlign: 'right' }}>
                {a.submission?.grade || '—'}
              </span>
              <span style={statusPill(a)}>{a.submission ? (a.submission.gradedAt ? 'Graded' : 'Submitted') : (a.isOverdue ? 'Overdue' : 'Pending')}</span>
            </div>
          ))}
        </div>
      )}

      {data && totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={ghost}>Prev</button>
          <span style={{ fontSize: 13, color: '#64748b' }}>Page {page} of {totalPages} · {data.total} assignments</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={ghost}>Next</button>
        </div>
      )}

      {open && <AssignmentModal id={open} onClose={() => setOpen(null)} onChanged={() => { setOpen(null); load(); }} />}
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────
function AssignmentModal({ id, onClose, onChanged }) {
  const { getToken } = useAuth();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);       // { url, fileName, fileType } after audited access
  const [confirmDel, setConfirmDel] = useState(false);
  const [typed, setTyped] = useState('');
  const [force, setForce] = useState(false);

  const fetchOne = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/assignments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load');
      setD(await res.json());
    } catch (err) { setError(err.message); }
  }, [id]);
  useEffect(() => { fetchOne(); }, [fetchOne]);

  // Every access to a child's submitted media is recorded before the URL is released.
  const openSubmission = async (intent) => {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/assignments/${id}/submission-access`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ intent }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setFile(j);
      if (intent === 'download') window.open(j.url, '_blank', 'noopener');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const del = async () => {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/assignments/${id}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ confirmName: typed, force }),
      });
      const j = await res.json();
      if (!res.ok) {
        if (j.requiresForce) { setForce(true); setError('This has a student submission. Tick the box to confirm you want it deleted too.'); return; }
        throw new Error(j.error || 'Failed');
      }
      onChanged();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const a = d?.assignment;
  const sub = a?.submission;
  const isAudio = file?.fileType?.startsWith('audio/');
  const isVideo = file?.fileType?.startsWith('video/');
  const isImage = file?.fileType?.startsWith('image/');

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 620, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Assignment</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>
        {error && <div style={errBox}>⚠️ {error}</div>}
        {!a ? <div style={empty}>Loading…</div> : (
          <>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{a.title}</div>
            <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2, marginBottom: 12 }}>
              {a.student.name} · set by {a.teacher.name} · {COURSE_LABELS[a.courseType] || a.courseType} · due {fmtDate(a.dueDate)}
            </div>

            {d.isOverdue && <div style={warnBox}>Past due with no submission.</div>}

            {a.description && (
              <div style={{ marginBottom: 12 }}>
                <div style={lbl}>Task</div>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{a.description}</div>
              </div>
            )}

            {a.attachmentUrl && (
              <a href={a.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ ...ghost, display: 'inline-block', textDecoration: 'none', marginBottom: 12 }}>
                📎 {a.attachmentName || 'Teacher attachment'}
              </a>
            )}

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginBottom: 12 }}>
              <div style={lbl}>Submission</div>
              {!sub ? (
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Nothing submitted yet.</div>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 8 }}>
                    Submitted {fmtDate(sub.submittedAt)}
                    {sub.gradedAt ? ` · graded ${fmtDate(sub.gradedAt)} · ${sub.grade}` : ' · not yet graded'}
                  </div>
                  {sub.content && (
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 10 }}>{sub.content}</div>
                  )}
                  {sub.feedback && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={lbl}>Teacher feedback</div>
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{sub.feedback}</div>
                    </div>
                  )}
                  {sub.fileUrl && !file && (
                    <div>
                      <div style={{ ...warnBox, marginBottom: 8 }}>
                        Opening a learner’s recording is recorded in the audit log.
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openSubmission('view')} disabled={busy} style={primary}>
                          {busy ? 'Opening…' : `▶ Open ${sub.fileName || 'submission'}`}
                        </button>
                        <button onClick={() => openSubmission('download')} disabled={busy} style={ghost}>Download</button>
                      </div>
                    </div>
                  )}
                  {file && (
                    <div>
                      {isAudio && <audio controls src={file.url} style={{ width: '100%' }} />}
                      {isVideo && <video controls src={file.url} style={{ width: '100%', borderRadius: 8 }} />}
                      {isImage && <img src={file.url} alt="submission" style={{ maxWidth: '100%', borderRadius: 8 }} />}
                      {!isAudio && !isVideo && !isImage && (
                        <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ ...ghost, display: 'inline-block', textDecoration: 'none' }}>
                          Open {file.fileName}
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {!confirmDel ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setConfirmDel(true)} style={{ ...ghost, color: '#dc2626', borderColor: '#fecaca' }}>Delete</button>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10, lineHeight: 1.6 }}>
                  Permanently deletes this assignment{sub ? ' and the learner’s submitted work' : ''}. <strong>Cannot be undone.</strong>
                </div>
                {sub && (
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: '#dc2626', marginBottom: 10 }}>
                    <input type="checkbox" checked={force} onChange={e => setForce(e.target.checked)} />
                    I understand the learner’s submission will be deleted too
                  </label>
                )}
                <div style={lbl}>Type the learner’s name to confirm</div>
                <input value={typed} onChange={e => setTyped(e.target.value)} placeholder={a.student.name}
                  style={{ ...inp, width: '100%', marginBottom: 12, borderColor: typed && typed !== a.student.name ? '#fecaca' : '#e2e8f0' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={del} disabled={busy || typed !== a.student.name || (!!sub && !force)}
                    style={{ ...primary, background: (busy || typed !== a.student.name || (!!sub && !force)) ? '#e2e8f0' : '#dc2626',
                             color: (busy || typed !== a.student.name || (!!sub && !force)) ? '#94a3b8' : 'white' }}>
                    {busy ? 'Deleting…' : 'Permanently delete'}
                  </button>
                  <button onClick={() => { setConfirmDel(false); setTyped(''); setForce(false); }} style={ghost}>Cancel</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14 };
const empty = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const errBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 12 };
const okBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#15803d', fontSize: 13, marginBottom: 12 };
const warnBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(250,167,26,0.12)', border: '1px solid rgba(250,167,26,0.3)', color: '#92400e', fontSize: 12.5, marginBottom: 12, lineHeight: 1.6 };
const inp = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', background: 'white', outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: 4 };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 24, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primary = { padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const ghost = { padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
function pill(color, bg) { return { fontSize: 10.5, fontWeight: 700, color, background: bg, borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap' }; }
function statusPill(a) {
  if (a.submission?.gradedAt) return pill('#15803d', 'rgba(34,197,94,0.10)');
  if (a.submission) return pill('#0e6e8a', 'rgba(40,183,217,0.10)');
  if (a.isOverdue) return pill('#dc2626', 'rgba(239,68,68,0.10)');
  return pill('#64748b', '#f1f5f9');
}
function chipBtn(active, tone) {
  const [c, b] = tone || ['#0d2840', '#0d2840'];
  return {
    padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
    border: `1.5px solid ${active ? c : '#e2e8f0'}`,
    background: active ? (tone ? b : '#0d2840') : 'white',
    color: active ? (tone ? c : 'white') : '#64748b',
  };
}