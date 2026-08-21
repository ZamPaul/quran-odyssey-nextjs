'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/teachers/page.jsx   (REPLACE the Phase 1 stub)
//
// Teachers list: search, active filter, and an "Onboard teacher" modal
// that creates the Clerk account + DB user + Teacher row in one go.
// Rows link to the teacher profile.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import CountrySelect from '@/components/form/CountrySelect';
import TimezoneSelect from '@/components/form/TimezoneSelect';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const SPECIALTIES = [
  { value: 'NOORANI_QAIDA', label: 'Noorani Qaida' },
  { value: 'QURAN_RECITATION', label: 'Quran Recitation' },
  { value: 'TAJWEED', label: 'Tajweed' },
  { value: 'HIFZ', label: 'Hifz' },
  { value: 'ISLAMIC_STUDIES', label: 'Islamic Studies' },
  { value: 'ONE_TO_ONE', label: '1-on-1' },
];
const SPECIALTY_LABELS = Object.fromEntries(SPECIALTIES.map(s => [s.value, s.label]));

export default function TeachersPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [active, setActive] = useState('');
  const [showOnboard, setShowOnboard] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (active) params.set('active', active);
      const res = await fetch(`${apiBase()}/api/admin/teachers?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load teachers');
      const d = await res.json();
      setTeachers(d.teachers || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [q, active]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(() => setQ(qInput), 350); return () => clearTimeout(t); }, [qInput]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Teachers</h1>
        <button onClick={() => setShowOnboard(true)} style={primaryBtn}>+ Onboard teacher</button>
      </div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Onboard, manage, and reassign teaching staff.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={qInput} onChange={e => setQInput(e.target.value)} placeholder="Search name or email…"
          style={{ flex: 1, minWidth: 220, padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0f172a' }} />
        <select value={active} onChange={e => setActive(e.target.value)} style={selStyle}>
          <option value="">All teachers</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
      </div>

      {error && <div style={errBox}>⚠️ {error}</div>}

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 2fr 1.6fr 0.8fr 0.8fr 0.4fr', gap: 0, padding: '12px 18px', borderBottom: '1px solid #e2e8f0', background: '#f7f9fb' }}>
          {['Teacher', 'Email', 'Specialties', 'Students', 'Status', ''].map((h, i) => <div key={i} style={thStyle}>{h}</div>)}
        </div>

        {loading ? <div style={emptyStyle}>Loading…</div>
          : teachers.length === 0 ? <div style={emptyStyle}>No teachers found.</div>
          : teachers.map(t => (
            <div key={t.id} onClick={() => router.push(`/admin/teachers/${t.id}`)}
              style={{ display: 'grid', gridTemplateColumns: '1.6fr 2fr 1.6fr 0.8fr 0.8fr 0.4fr', gap: 0, padding: '14px 18px', borderBottom: '1px solid #f4f8fb', cursor: 'pointer', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #28b7d9, #0e6e8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                  {(t.name || 'T').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{t.name}</span>
              </div>
              <div style={{ fontSize: 13, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.email}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{(t.specialty || []).map(s => SPECIALTY_LABELS[s] || s).join(', ') || '—'}</div>
              <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{t.enrollments}</div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.isActive ? '#15803d' : '#b45309', background: t.isActive ? 'rgba(34,197,94,0.10)' : 'rgba(250,167,26,0.14)', borderRadius: 5, padding: '3px 9px' }}>
                  {t.isActive ? 'Active' : 'Inactive'}
                </span>
                {!t.linked && <span title="No Clerk account linked" style={{ marginLeft: 4, fontSize: 11 }}>⚠️</span>}
              </div>
              <div style={{ textAlign: 'right', color: '#cbd5e1', fontSize: 16 }}>›</div>
            </div>
          ))}
      </div>

      {showOnboard && <OnboardModal onClose={() => setShowOnboard(false)} onDone={() => { setShowOnboard(false); load(); }} />}
    </div>
  );
}

// ─── Onboard modal ────────────────────────────────────────
function OnboardModal({ onClose, onDone }) {
  const { getToken } = useAuth();
  // const [form, setForm] = useState({ email: '', name: '', specialty: [], timezone: '', gender: '', calendarId: '00000000', bio: '' });
  const [form, setForm] = useState({ email: '', name: '', specialty: [], timezone: '', gender: '', calendarId: `samp${Math.random()}`, bio: '', country: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleSpec = (val) => setForm(p => ({ ...p, specialty: p.specialty.includes(val) ? p.specialty.filter(s => s !== val) : [...p.specialty, val] }));

  const valid = form.email && form.name && form.timezone && form.gender;

  const submit = async () => {
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/teachers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to onboard');
      setResult({ email: d.teacher.email, temporaryPassword: d.temporaryPassword });
    } catch (err) { setError(err.message); setSaving(false); }
  };

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        {!result ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Onboard teacher</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Creates their sign-in account, sets the teacher role, and links their calendar.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Full name *</label><input value={form.name} onChange={e => set('name', e.target.value)} style={inp} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Email *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="teacher@example.com" style={inp} /></div>
              <div><label style={lbl}>Gender *</label><select value={form.gender} onChange={e => set('gender', e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="">Select…</option><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
              {/* <div><label style={lbl}>Timezone *</label><input value={form.timezone} onChange={e => set('timezone', e.target.value)} placeholder="Europe/London" style={inp} /></div> */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Country</label>
                <CountrySelect value={form.country} onChange={(c) => set('country', c)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Timezone *</label>
                <TimezoneSelect
                  country={form.country}
                  value={form.timezone}
                  onChange={(tz) => set('timezone', tz)}
                />
              </div>
              {/* <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Calendar ID *</label>
                <input value={form.calendarId} onChange={e => set('calendarId', e.target.value)} placeholder="teacher's Google Calendar ID" style={inp} />
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>The teacher's Google Calendar ID (often their Google email). Must be unique.</div>
              </div> */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Specialties</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SPECIALTIES.map(s => (
                    <button key={s.value} onClick={() => toggleSpec(s.value)} type="button"
                      style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${form.specialty.includes(s.value) ? '#28b7d9' : '#e2e8f0'}`,
                        background: form.specialty.includes(s.value) ? 'rgba(40,183,217,0.10)' : 'white',
                        color: form.specialty.includes(s.value) ? '#0e6e8a' : '#64748b' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Bio</label><textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} /></div>
            </div>
            {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={submit} disabled={saving || !valid} style={{ ...primaryBtn, opacity: (saving || !valid) ? 0.5 : 1, cursor: (saving || !valid) ? 'not-allowed' : 'pointer' }}>{saving ? 'Onboarding…' : 'Onboard teacher'}</button>
              <button onClick={onClose} style={ghostBtn}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>✓ Teacher onboarded</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Share these sign-in details. The password is shown only once.</div>
            <div style={{ background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <Row k="Email" v={result.email} />
              {result.temporaryPassword
                ? <Row k="Temporary password" v={result.temporaryPassword} mono />
                : <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>A custom password was set, or they can use "Forgot password".</div>}
            </div>
            <button onClick={onDone} style={primaryBtn}>Done</button>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, mono }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', gap: 12 }}>
    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{k}</span>
    <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, fontFamily: mono ? 'monospace' : 'inherit', userSelect: 'all' }}>{v}</span>
  </div>;
}

const thStyle = { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8' };
const emptyStyle = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const selStyle = { padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0f172a', background: 'white', cursor: 'pointer' };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };
const errBox = { padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primaryBtn = { padding: '9px 18px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer' };
const ghostBtn = { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' };