'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/trials/page.jsx   (REPLACE the Phase 1 stub)
//
// Trial bookings: filter (unassigned / by status), assign a teacher
// (creates the calendar event), set zoom link, reschedule, cancel,
// and convert to enrolment.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const COURSE_LABELS = { NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation', TAJWEED: 'Tajweed', HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1' };
const STATUS_CFG = { PENDING: ['#b45309', 'rgba(250,167,26,0.14)'], CONFIRMED: ['#0e6e8a', 'rgba(40,183,217,0.10)'], COMPLETED: ['#15803d', 'rgba(34,197,94,0.10)'], CANCELLED: ['#64748b', '#f0f4f8'] };
function pill(s) { const [c, b] = STATUS_CFG[s] || ['#64748b', '#f0f4f8']; return { fontSize: 11, fontWeight: 700, color: c, background: b, borderRadius: 5, padding: '3px 9px' }; }
function fmtDateTime(iso) { return iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'; }

const FILTERS = [
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'all', label: 'All' },
];

export default function TrialsPage() {
  const { getToken } = useAuth();
  const [trials, setTrials] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('unassigned');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (filter === 'unassigned') params.set('unassigned', 'true');
      else if (filter !== 'all') params.set('status', filter);
      const res = await fetch(`${apiBase()}/api/admin/trials?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load trials');
      const d = await res.json();
      setTrials(d.trials || []); setCounts(d.counts || {});
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Trial Bookings</h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Assign teachers, set links, reschedule, and convert trials.</p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: filter === f.key ? 800 : 600, color: filter === f.key ? '#0d2840' : '#94a3b8', borderBottom: `2px solid ${filter === f.key ? '#28b7d9' : 'transparent'}`, marginBottom: -1 }}>
            {f.label}{f.key === 'unassigned' && counts.unassigned ? <span style={{ color: '#cbd5e1' }}> {counts.unassigned}</span> : ''}
          </button>
        ))}
      </div>

      {error && <div style={errBox}>⚠️ {error}</div>}

      {loading ? <div style={emptyStyle}>Loading…</div>
        : trials.length === 0 ? <div style={{ ...card, ...emptyStyle }}>No trials here.</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trials.map(t => (
              <div key={t.id} onClick={() => setSelected(t)} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '16px 18px' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#28b7d9'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{t.student.name} <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>· {COURSE_LABELS[t.courseInterest] || t.courseInterest}</span></div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                    {fmtDateTime(t.slotStart)} · {t.teacher ? `👩‍🏫 ${t.teacher.name}` : <span style={{ color: '#b45309', fontWeight: 700 }}>⚠️ Unassigned</span>}
                    {t.zoomLink ? ' · 📹 link set' : ''}
                  </div>
                </div>
                <span style={pill(t.status)}>{t.status}</span>
                <span style={{ color: '#cbd5e1', fontSize: 16 }}>›</span>
              </div>
            ))}
          </div>
        )}

      {selected && <TrialPanel trial={selected} onClose={() => setSelected(null)} onChanged={() => { setSelected(null); load(); }} />}
    </div>
  );
}

// ─── Trial action panel ───────────────────────────────────
function TrialPanel({ trial, onClose, onChanged }) {
  const { getToken } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState(trial.teacher?.id || '');
  const [zoomLink, setZoomLink] = useState(trial.zoomLink || '');
  const [slotStart, setSlotStart] = useState(new Date(trial.slotStart).toISOString().slice(0, 16));
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [showConvert, setShowConvert] = useState(false);

  useEffect(() => {
    (async () => { try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/trials/meta/teachers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setTeachers(d.teachers || []); }
    } catch {} })();
  }, []);

  const call = async (path, body, method = 'POST') => {
    setBusy(true); setError('');
    try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/trials/${trial.id}${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onChanged();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  const assign = () => { if (!teacherId) { setError('Pick a teacher'); return; } call('/assign', { teacherId, zoomLink }); };
  const saveZoom = () => call('', { zoomLink }, 'PATCH');
  const reschedule = () => call('', { slotStart: new Date(slotStart).toISOString() }, 'PATCH');
  const cancel = () => call('/cancel', {});

  if (showConvert) return <TrialConvert trial={trial} onBack={() => setShowConvert(false)} onConverted={onChanged} onClose={onClose} />;

  const cancelled = trial.status === 'CANCELLED';

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{trial.student.name}</div>
          <span style={pill(trial.status)}>{trial.status}</span>
        </div>

        <div style={{ background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <DRow k="Course" v={COURSE_LABELS[trial.courseInterest] || trial.courseInterest} />
          <DRow k="Slot" v={fmtDateTime(trial.slotStart)} />
          <DRow k="Account" v={trial.student.account.email} />
          <DRow k="Country" v={trial.student.country} />
          {trial.genderPreference && <DRow k="Teacher pref" v={trial.genderPreference} />}
        </div>

        {!cancelled && (
          <>
            {/* Assign teacher */}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Teacher {!trial.teacher && <span style={{ color: '#b45309', textTransform: 'none' }}>· unassigned</span>}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={teacherId} onChange={e => setTeacherId(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Select a teacher…</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}{t.specialty?.length ? ` · ${t.specialty.join(', ')}` : ''}</option>)}
                </select>
                <button onClick={assign} disabled={busy} style={{ ...primaryBtn, whiteSpace: 'nowrap' }}>{trial.teacher ? 'Reassign' : 'Assign'}</button>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Assigning creates a calendar event on the teacher's calendar.</div>
            </div>

            {/* Zoom link */}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Zoom link</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={zoomLink} onChange={e => setZoomLink(e.target.value)} placeholder="https://zoom.us/…" style={inp} />
                <button onClick={saveZoom} disabled={busy} style={ghostBtn}>Save</button>
              </div>
            </div>

            {/* Reschedule */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Reschedule slot</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="datetime-local" value={slotStart} onChange={e => setSlotStart(e.target.value)} style={inp} />
                <button onClick={reschedule} disabled={busy} style={ghostBtn}>Update</button>
              </div>
            </div>
          </>
        )}

        {error && <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>⚠️ {error}</div>}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!cancelled && trial.teacher && trial.status !== 'COMPLETED' && (
            <button onClick={() => setShowConvert(true)} disabled={busy} style={{ ...primaryBtn, background: '#22c55e' }}>Convert to enrolment →</button>
          )}
          {!cancelled && <button onClick={cancel} disabled={busy} style={{ ...ghostBtn, color: '#dc2626', borderColor: '#fecaca' }}>Cancel trial</button>}
          <button onClick={onClose} style={ghostBtn}>Close</button>
        </div>
      </div>
    </div>
  );
}

function TrialConvert({ trial, onBack, onConverted, onClose }) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({ courseType: trial.courseInterest, sessionsPerWeek: '2', startDate: new Date().toISOString().slice(0, 10), notes: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const convert = async () => {
    setBusy(true); setError('');
    try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/trials/${trial.id}/convert`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onConverted();
    } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 500 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Convert trial to enrolment</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 18 }}>For {trial.student.name} with {trial.teacher?.name}. Emails the family.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
const primaryBtn = { padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer' };
const ghostBtn = { padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' };