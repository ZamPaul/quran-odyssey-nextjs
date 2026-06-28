'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/enrollment-requests/page.jsx (REPLACE stub)
//
// Enrollment request queue: status tabs, request rows, and a review
// panel to approve / reject / move through lifecycle / convert.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const COURSE_LABELS = { NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation', TAJWEED: 'Tajweed', HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1' };
const STATUS_TABS = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'AWAITING_PAYMENT', 'ACTIVE', 'REJECTED', 'CANCELLED'];
const STATUS_CFG = {
  PENDING: ['#b45309', 'rgba(250,167,26,0.14)'], UNDER_REVIEW: ['#0e6e8a', 'rgba(40,183,217,0.10)'],
  APPROVED: ['#15803d', 'rgba(34,197,94,0.10)'], AWAITING_PAYMENT: ['#b45309', 'rgba(250,167,26,0.14)'],
  ACTIVE: ['#15803d', 'rgba(34,197,94,0.10)'], REJECTED: ['#dc2626', 'rgba(239,68,68,0.08)'], CANCELLED: ['#64748b', '#f0f4f8'],
};
function pill(s) { const [c, b] = STATUS_CFG[s] || ['#64748b', '#f0f4f8']; return { fontSize: 11, fontWeight: 700, color: c, background: b, borderRadius: 5, padding: '3px 9px' }; }

export default function RequestsPage() {
  const { getToken } = useAuth();
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('PENDING');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/enrollment-requests?status=${tab}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load requests');
      const d = await res.json();
      setRequests(d.requests || []); setCounts(d.counts || {});
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Enrolment Requests</h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Review and process enrolment applications.</p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setTab(s)} style={{ padding: '9px 13px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: tab === s ? 800 : 600, color: tab === s ? '#0d2840' : '#94a3b8', borderBottom: `2px solid ${tab === s ? '#28b7d9' : 'transparent'}`, marginBottom: -1, whiteSpace: 'nowrap' }}>
            {s.replace(/_/g, ' ')} {counts[s] ? <span style={{ color: '#cbd5e1' }}>{counts[s]}</span> : ''}
          </button>
        ))}
      </div>

      {error && <div style={errBox}>⚠️ {error}</div>}

      {loading ? <div style={emptyStyle}>Loading…</div>
        : requests.length === 0 ? <div style={{ ...card, ...emptyStyle }}>No {tab.replace(/_/g, ' ').toLowerCase()} requests.</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {requests.map(r => (
              <div key={r.id} onClick={() => setSelected(r)} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '16px 18px' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#28b7d9'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{r.student.name} <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>· {COURSE_LABELS[r.courseType] || r.courseType}</span></div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                    {r.student.account.email} · {r.student.country} · {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    {r.preferredTime ? ` · prefers ${r.preferredTime.toLowerCase()}` : ''}
                  </div>
                </div>
                <span style={pill(r.status)}>{r.status.replace(/_/g, ' ')}</span>
                <span style={{ color: '#cbd5e1', fontSize: 16 }}>›</span>
              </div>
            ))}
          </div>
        )}

      {selected && <ReviewPanel request={selected} onClose={() => setSelected(null)} onChanged={() => { setSelected(null); load(); }} />}
    </div>
  );
}

// ─── Review panel (slide-over style modal) ────────────────
function ReviewPanel({ request, onClose, onChanged }) {
  const { getToken } = useAuth();
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const setStatus = async (status, extra = {}) => {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/enrollment-requests/${request.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, adminNotes, ...extra }),
      });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onChanged();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  if (showConvert) return <ConvertPanel request={request} adminNotes={adminNotes} onBack={() => setShowConvert(false)} onConverted={onChanged} onClose={onClose} />;

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{request.student.name}</div>
          <span style={pill(request.status)}>{request.status.replace(/_/g, ' ')}</span>
        </div>

        <div style={{ background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <DRow k="Course" v={COURSE_LABELS[request.courseType] || request.courseType} />
          <DRow k="Account" v={request.student.account.email} />
          <DRow k="Phone" v={request.student.account.phone || '—'} />
          <DRow k="Country" v={request.student.country} />
          <DRow k="Age" v={request.student.age} />
          {request.genderPreference && <DRow k="Teacher pref" v={request.genderPreference} />}
          {request.preferredDays?.length > 0 && <DRow k="Preferred days" v={request.preferredDays.join(', ')} />}
          {request.preferredTime && <DRow k="Preferred time" v={request.preferredTime} />}
        </div>

        {request.message && (
          <div style={{ marginBottom: 16 }}>
            <div style={lbl}>Family message</div>
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, padding: '10px 14px', background: '#f7f9fb', borderRadius: 8 }}>{request.message}</div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Admin notes (internal)</label>
          <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} placeholder="Notes for your team…" />
        </div>

        {showReject && (
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Rejection reason (sent to family) *</label>
            <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} />
          </div>
        )}

        {error && <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>⚠️ {error}</div>}

        {/* Lifecycle actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {request.status === 'PENDING' && <button onClick={() => setStatus('UNDER_REVIEW')} disabled={busy} style={ghostBtn}>Mark under review</button>}
          {['PENDING', 'UNDER_REVIEW'].includes(request.status) && (
            <>
              <button onClick={() => setStatus('APPROVED')} disabled={busy} style={{ ...primaryBtn, background: '#22c55e' }}>Approve</button>
              {!showReject
                ? <button onClick={() => setShowReject(true)} disabled={busy} style={{ ...ghostBtn, color: '#dc2626', borderColor: '#fecaca' }}>Reject</button>
                : <button onClick={() => { if (!rejectionReason.trim()) { setError('Rejection reason required'); return; } setStatus('REJECTED', { rejectionReason }); }} disabled={busy} style={{ ...primaryBtn, background: '#dc2626' }}>Confirm rejection</button>}
            </>
          )}
          {['APPROVED', 'AWAITING_PAYMENT'].includes(request.status) && (
            <button onClick={() => setShowConvert(true)} disabled={busy} style={primaryBtn}>Convert to enrolment →</button>
          )}
          {adminNotes !== (request.adminNotes || '') && (
            <button onClick={() => setStatus(request.status)} disabled={busy} style={ghostBtn}>Save notes</button>
          )}
          <button onClick={onClose} style={ghostBtn}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Convert panel ────────────────────────────────────────
function ConvertPanel({ request, adminNotes, onBack, onConverted, onClose }) {
  const { getToken } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ teacherId: '', sessionsPerWeek: '2', startDate: new Date().toISOString().slice(0, 10), notes: adminNotes || '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  useEffect(() => {
    (async () => { try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/enrollment-requests/meta/teachers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setTeachers(d.teachers || []); }
    } catch {} })();
  }, []);
  const convert = async () => {
    if (!form.teacherId) { setError('Pick a teacher'); return; }
    setBusy(true); setError('');
    try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/enrollment-requests/${request.id}/convert`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onConverted();
    } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 500 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Convert to enrolment</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 18 }}>Creates an active enrolment for {request.student.name} and emails the family.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Teacher *</label>
            <select value={form.teacherId} onChange={e => set('teacherId', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">Select a teacher…</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}{t.specialty?.length ? ` · ${t.specialty.join(', ')}` : ''}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Sessions / week</label><input type="number" min="1" max="7" value={form.sessionsPerWeek} onChange={e => set('sessionsPerWeek', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Start date</label><input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={inp} /></div>
        </div>
        {error && <div style={{ fontSize: 13, color: '#dc2626', marginTop: 12 }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={convert} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}>{busy ? 'Converting…' : 'Convert & notify'}</button>
          <button onClick={onBack} style={ghostBtn}>Back</button>
        </div>
      </div>
    </div>
  );
}

function DRow({ k, v }) { return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', gap: 12 }}><span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{k}</span><span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{v}</span></div>; }

const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, transition: 'border-color 150ms' };
const emptyStyle = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };
const errBox = { padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primaryBtn = { padding: '10px 18px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer' };
const ghostBtn = { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' };