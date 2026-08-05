'use client';

// FILE: src/app/admin/reports/page.jsx  (NEW)
//
// Progress Reports — oversight. Read + moderate, never author.
// Attention chips surface the things that are actually wrong: a parent
// holding a stale version, a failed delivery, a draft nobody ever sent.

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const COURSE_LABELS = {
  NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation', TAJWEED: 'Tajweed',
  HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1',
};
const FLAGS = [
  { key: 'edited-not-resent', label: 'Edited, not re-sent', countKey: 'editedNotResent', tone: ['#dc2626','rgba(239,68,68,0.10)'] },
  { key: 'delivery-failed',   label: 'Delivery failed',     countKey: 'deliveryFailed',  tone: ['#dc2626','rgba(239,68,68,0.10)'] },
  { key: 'stale-draft',       label: 'Draft 30+ days',      countKey: 'staleDraft',      tone: ['#b45309','rgba(250,167,26,0.14)'] },
  { key: 'thin',              label: 'Thin report',         countKey: 'thin',            tone: ['#b45309','rgba(250,167,26,0.14)'] },
  { key: 'no-rating',         label: 'No rating',           countKey: 'noRating',        tone: ['#64748b','#f1f5f9'] },
];

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }

export default function AdminReportsPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [facets, setFacets] = useState({ teachers: [], students: [], courses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [f, setF] = useState({ q: '', teacherId: '', studentId: '', course: '', status: '', flag: '' });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const qs = new URLSearchParams({ ...f, page: String(page), pageSize: '25' });
      Object.keys(f).forEach(k => { if (!f[k]) qs.delete(k); });
      const res = await fetch(`${apiBase()}/api/admin/reports?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load reports');
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [f, page]);

  useEffect(() => { const t = setTimeout(load, f.q ? 300 : 0); return () => clearTimeout(t); }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/reports/facets`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setFacets(await res.json());
      } catch {}
    })();
  }, []);

  const set = (k, v) => { setPage(1); setF(p => ({ ...p, [k]: v })); };
  const rows = data?.rows || [];
  const counts = data?.counts || {};
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Progress Reports</h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
        Every report teachers have written, and whether families actually received them.
      </p>

      {error && <div style={errBox}>⚠️ {error}</div>}
      {data && data.commsAvailable === false && (
        <div style={noteBox}>Delivery status unavailable — the communications log isn’t deployed yet.</div>
      )}

      {/* Attention chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={() => set('flag', '')} style={chipBtn(!f.flag)}>All</button>
        {FLAGS.map(fl => (
          <button key={fl.key} onClick={() => set('flag', f.flag === fl.key ? '' : fl.key)}
            style={chipBtn(f.flag === fl.key, fl.tone)}>
            {fl.label} <span style={{ opacity: 0.65 }}>{counts[fl.countKey] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input value={f.q} onChange={e => set('q', e.target.value)} placeholder="Search period, learner or teacher…" style={{ ...inp, minWidth: 230, flex: 1 }} />
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
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
        </select>
      </div>

      {loading ? <div style={{ ...card, ...empty }}>Loading…</div>
        : rows.length === 0 ? <div style={{ ...card, ...empty }}>No reports match.</div>
        : (
        <div style={{ ...card, overflow: 'hidden' }}>
          {rows.map(r => (
            <div key={r.id} onClick={() => setOpen(r.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {r.student?.name} <span style={{ color: '#94a3b8', fontWeight: 500 }}>· {r.period}</span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {COURSE_LABELS[r.courseType] || r.courseType} · {r.teacher?.name} · {r.status === 'SENT' ? `sent ${fmtDate(r.sentAt)}` : `created ${fmtDate(r.createdAt)}`}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  {r.updatedSinceSent && <span style={pill('#dc2626','rgba(239,68,68,0.10)')}>edited, not re-sent</span>}
                  {r.deliveryFailed && <span style={pill('#dc2626','rgba(239,68,68,0.10)')}>delivery failed</span>}
                  {r.isThin && <span style={pill('#b45309','rgba(250,167,26,0.14)')}>thin</span>}
                  {r.overallRating == null && <span style={pill('#64748b','#f1f5f9')}>no rating</span>}
                  {r.attachmentUrl && <span style={pill('#0e6e8a','rgba(40,183,217,0.10)')}>attachment</span>}
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', minWidth: 30, textAlign: 'right' }}>
                {r.overallRating ? `${r.overallRating}/5` : '—'}
              </span>
              <span style={r.status === 'SENT' ? pill('#15803d','rgba(34,197,94,0.10)') : pill('#64748b','#f1f5f9')}>
                {r.status === 'SENT' ? 'Sent' : 'Draft'}
              </span>
            </div>
          ))}
        </div>
      )}

      {data && totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={ghost}>Prev</button>
          <span style={{ fontSize: 13, color: '#64748b' }}>Page {page} of {totalPages} · {data.total} reports</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={ghost}>Next</button>
        </div>
      )}

      {open && <ReportModal id={open} onClose={() => setOpen(null)} onChanged={() => { setOpen(null); load(); }} />}
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────
function ReportModal({ id, onClose, onChanged }) {
  const { getToken } = useAuth();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const [typed, setTyped] = useState('');

  const fetchOne = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/reports/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load');
      setD(await res.json());
    } catch (err) { setError(err.message); }
  }, [id]);
  useEffect(() => { fetchOne(); }, [fetchOne]);

  const act = async (path, body, method = 'POST') => {
    setBusy(true); setError(''); setMsg('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/reports/${id}${path}`, {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      return j;
    } catch (err) { setError(err.message); return null; }
    finally { setBusy(false); }
  };

  const resend = async () => {
    const j = await act('/resend');
    if (j) { setMsg(j.sent ? `Re-sent to ${j.sentTo}` : `Send failed: ${j.error}`); fetchOne(); }
  };
  const nudge = async () => {
    setBusy(true); setError(''); setMsg('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/oversight/remind-teacher`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teacherId: d.report.teacher.id }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setMsg('Reminder sent to the teacher.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const del = async () => {
    const j = await act('', { confirmName: typed }, 'DELETE');
    if (j) onChanged();
  };

  const r = d?.report;
  const sections = r ? [
    ['Tajweed', r.tajweedProgress], ['Recitation', r.recitationNotes],
    ['Behaviour', r.behaviourNotes], ['Homework', r.homeworkNotes],
    ['Message to parent', r.teacherMessage], ['Next steps', r.nextSteps],
  ].filter(([, v]) => v) : [];

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 640, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Progress report</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>
        {error && <div style={errBox}>⚠️ {error}</div>}
        {msg && <div style={okBox}>{msg}</div>}
        {!r ? <div style={empty}>Loading…</div> : (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                {r.student.name} — {r.period}
              </div>
              <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
                {COURSE_LABELS[r.courseType] || r.courseType} · by {r.teacher.name} · parent {r.student.account.email}
              </div>
            </div>

            {r.updatedSinceSent && (
              <div style={warnBox}>
                This report was edited after it was sent. The parent still has the older version — re-send to correct that.
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#64748b', marginBottom: 14 }}>
              <span>Rating: <strong style={{ color: '#0f172a' }}>{r.overallRating ? `${r.overallRating}/5` : 'none'}</strong></span>
              <span>Created: {fmtDate(r.createdAt)}</span>
              <span>Sent: {fmtDate(r.sentAt)}</span>
              <span>Last sent: {fmtDate(r.lastSentAt)}</span>
            </div>

            {sections.length === 0
              ? <div style={warnBox}>This report has no written content at all.</div>
              : sections.map(([k, v]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={lbl}>{k}</div>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{v}</div>
                </div>
              ))}

            {r.attachmentUrl && (
              <a href={r.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ ...ghost, display: 'inline-block', textDecoration: 'none', marginBottom: 12 }}>
                📎 {r.attachmentName || 'Attachment'}
              </a>
            )}

            {/* Delivery history */}
            <div style={{ marginTop: 8, marginBottom: 14 }}>
              <div style={lbl}>Delivery</div>
              {(!d.delivery || d.delivery.length === 0)
                ? <div style={{ fontSize: 12.5, color: '#94a3b8' }}>No delivery records.</div>
                : d.delivery.map(x => (
                  <div key={x.id} style={{ fontSize: 12.5, color: x.status === 'FAILED' && !x.resolvedAt ? '#dc2626' : '#64748b', padding: '3px 0' }}>
                    {x.status === 'SENT' ? '✓ Sent' : '✗ Failed'} → {x.toAddress} · {fmtDate(x.createdAt)}
                    {x.failureReason ? ` — ${x.failureReason}` : ''}
                  </div>
                ))}
            </div>

            {!confirmDel ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {r.status === 'SENT'
                  ? <button onClick={resend} disabled={busy} style={primary}>{busy ? 'Sending…' : 'Re-send to parent'}</button>
                  : <span style={{ fontSize: 12.5, color: '#94a3b8', alignSelf: 'center' }}>Drafts are sent by the teacher.</span>}
                <button onClick={nudge} disabled={busy} style={ghost}>Nudge teacher</button>
                <button onClick={() => setConfirmDel(true)} style={{ ...ghost, color: '#dc2626', borderColor: '#fecaca' }}>Delete</button>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10, lineHeight: 1.6 }}>
                  Permanently deletes this report{r.attachmentUrl ? ' and its attachment' : ''}. The parent keeps any email
                  already delivered — this only removes your record. <strong>Cannot be undone.</strong>
                </div>
                <div style={lbl}>Type the learner’s name to confirm</div>
                <input value={typed} onChange={e => setTyped(e.target.value)} placeholder={r.student.name}
                  style={{ ...inp, width: '100%', marginBottom: 12, borderColor: typed && typed !== r.student.name ? '#fecaca' : '#e2e8f0' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={del} disabled={busy || typed !== r.student.name}
                    style={{ ...primary, background: (busy || typed !== r.student.name) ? '#e2e8f0' : '#dc2626', color: (busy || typed !== r.student.name) ? '#94a3b8' : 'white' }}>
                    {busy ? 'Deleting…' : 'Permanently delete'}
                  </button>
                  <button onClick={() => { setConfirmDel(false); setTyped(''); }} style={ghost}>Cancel</button>
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
const noteBox = { ...warnBox };
const inp = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', background: 'white', outline: 'none', boxSizing: 'border-box' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: 4 };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 24, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primary = { padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const ghost = { padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
function pill(color, bg) { return { fontSize: 10.5, fontWeight: 700, color, background: bg, borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap' }; }
function chipBtn(active, tone) {
  const [c, b] = tone || ['#0d2840', '#0d2840'];
  return {
    padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
    border: `1.5px solid ${active ? c : '#e2e8f0'}`,
    background: active ? (tone ? b : '#0d2840') : 'white',
    color: active ? (tone ? c : 'white') : '#64748b',
  };
}