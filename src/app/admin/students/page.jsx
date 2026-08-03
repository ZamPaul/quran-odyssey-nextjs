'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/students/page.jsx   (REPLACE the Phase 1 stub)
//
// All-students list: search, filter (course/country), sort, paginate.
// Rows link to the 360° profile. "+ Add student" opens a create modal
// that requires picking an account.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import CountrySelect from '@/components/form/CountrySelect';
import TimezoneSelect from '@/components/form/TimezoneSelect';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const COURSES = [
  { value: '', label: 'All courses' },
  { value: 'NOORANI_QAIDA', label: 'Noorani Qaida' },
  { value: 'QURAN_RECITATION', label: 'Quran Recitation' },
  { value: 'TAJWEED', label: 'Tajweed' },
  { value: 'HIFZ', label: 'Hifz' },
  { value: 'ISLAMIC_STUDIES', label: 'Islamic Studies' },
  { value: 'ONE_TO_ONE', label: '1-on-1' },
];

export default function StudentsPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [course, setCourse] = useState('');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (q.trim()) params.set('q', q.trim());
      if (course) params.set('course', course);
      if (country.trim()) params.set('country', country.trim());
      const res = await fetch(`${apiBase()}/api/admin/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load students');
      const data = await res.json();
      setStudents(data.students || []);
      setTotal(data.total || 0);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [q, course, country, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setQ(qInput); }, 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Students</h1>
        <button onClick={() => setShowCreate(true)} style={primaryBtn}>+ Add student</button>
      </div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Every learner, with a complete profile.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={qInput} onChange={e => setQInput(e.target.value)} placeholder="Search name or account email…"
          style={{ flex: 1, minWidth: 220, padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0f172a' }} />
        <select value={course} onChange={e => { setPage(1); setCourse(e.target.value); }} style={selStyle}>
          {COURSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input value={country} onChange={e => { setPage(1); setCountry(e.target.value); }} placeholder="Country…"
          style={{ width: 150, padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0f172a' }} />
      </div>

      {error && <div style={errBox}>⚠️ {error}</div>}

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 2fr 0.6fr 1fr 1.4fr 0.8fr 0.4fr', gap: 0, padding: '12px 18px', borderBottom: '1px solid #e2e8f0', background: '#f7f9fb' }}>
          {['Learner', 'Account', 'Age', 'Country', 'Course', 'Activity', ''].map((h, i) => (
            <div key={i} style={thStyle}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={emptyStyle}>Loading…</div>
        ) : students.length === 0 ? (
          <div style={emptyStyle}>No students found.</div>
        ) : (
          students.map(s => (
            <div key={s.id} onClick={() => router.push(`/admin/students/${s.id}`)}
              style={{ display: 'grid', gridTemplateColumns: '1.6fr 2fr 0.6fr 1fr 1.4fr 0.8fr 0.4fr', gap: 0, padding: '14px 18px', borderBottom: '1px solid #f4f8fb', cursor: 'pointer', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #faa71a, #e8920a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0d2840', flexShrink: 0 }}>
                  {(s.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {s.name}{s.isSelf && <span style={soloBadge}>SOLO</span>}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.account?.email}</div>
              <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{s.age}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.country}</div>
              <div><span style={coursePill}>{s.courseLabel}</span></div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.enrollments}e · {s.sessions}s</div>
              <div style={{ textAlign: 'right', color: '#cbd5e1', fontSize: 16 }}>›</div>
            </div>
          ))
        )}
      </div>

      {!loading && total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{total} student{total !== 1 ? 's' : ''} · page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={pageBtn(page <= 1)}>← Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={pageBtn(page >= totalPages)}>Next →</button>
          </div>
        </div>
      )}

      {showCreate && <CreateStudentModal onClose={() => setShowCreate(false)} onCreated={(s) => { setShowCreate(false); router.push(`/admin/students/${s.id}`); }} />}
    </div>
  );
}

// ─── Create modal (requires picking an account) ───────────
function CreateStudentModal({ onClose, onCreated }) {
  const { getToken } = useAuth();
  const [accountQuery, setAccountQuery] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ accountId: '', name: '', age: '', country: '', timezone: '', courseInterest: '', gender: '', dateOfBirth: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/students/meta/accounts?q=${encodeURIComponent(accountQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { const d = await res.json(); setAccounts(d.accounts || []); }
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [accountQuery]);

  const valid = form.accountId && form.name && form.age && form.country && form.timezone && form.courseInterest;

  const submit = async () => {
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to create');
      onCreated(d.student);
    } catch (err) { setError(err.message); setSaving(false); }
  };

  const selectedAccount = accounts.find(a => a.id === form.accountId);

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Add student</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Create a learner under an existing account.</div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Account *</label>
          {selectedAccount ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: '1px solid #28b7d9', background: 'rgba(40,183,217,0.06)' }}>
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{selectedAccount.name || selectedAccount.email}</span>
              <button onClick={() => set('accountId', '')} style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>change</button>
            </div>
          ) : (
            <>
              <input value={accountQuery} onChange={e => setAccountQuery(e.target.value)} placeholder="Search account by email/name…" style={inp} />
              {accounts.length > 0 && (
                <div style={{ marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 8, maxHeight: 140, overflowY: 'auto' }}>
                  {accounts.map(a => (
                    <div key={a.id} onClick={() => { set('accountId', a.id); }} style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #f4f8fb', color: '#0f172a' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f7f9fb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      {a.name || a.email.split('@')[0]} <span style={{ color: '#94a3b8' }}>· {a.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Age *</label><input type="number" value={form.age} onChange={e => set('age', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Gender</label>
            <select value={form.gender} onChange={e => set('gender', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">—</option><option value="MALE">Male</option><option value="FEMALE">Female</option>
            </select>
          </div>
          {/* <div><label style={lbl}>Country *</label><input value={form.country} onChange={e => set('country', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Timezone *</label><input value={form.timezone} onChange={e => set('timezone', e.target.value)} placeholder="Europe/London" style={inp} /></div> */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Country *</label>
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
          {/* <div className="flex flex-col gap-0">
            <label style={lbl}>Country *</label>
            <CountrySelect value={form.country} onChange={(c) => set("country", c)} />
          </div> */}
          <div><label style={lbl}>Date of birth</label><input type="date" value={form.dateOfBirth} max={new Date().toISOString().slice(0,10)} onChange={e => set('dateOfBirth', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Course *</label>
            <select value={form.courseInterest} onChange={e => set('courseInterest', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">Select…</option>
              {COURSES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={submit} disabled={saving || !valid} style={{ ...primaryBtn, opacity: (saving || !valid) ? 0.5 : 1, cursor: (saving || !valid) ? 'not-allowed' : 'pointer' }}>{saving ? 'Creating…' : 'Add student'}</button>
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const thStyle = { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8' };
const emptyStyle = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const soloBadge = { marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#0e6e8a', background: 'rgba(40,183,217,0.10)', padding: '1px 6px', borderRadius: 4 };
const coursePill = { fontSize: 11, fontWeight: 700, color: '#0e6e8a', background: 'rgba(40,183,217,0.08)', borderRadius: 5, padding: '3px 9px' };
const selStyle = { padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0f172a', background: 'white', cursor: 'pointer' };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };
const errBox = { padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primaryBtn = { padding: '9px 18px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer' };
const ghostBtn = { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const pageBtn = (d) => ({ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: d ? '#cbd5e1' : '#64748b', fontSize: 13, fontWeight: 700, cursor: d ? 'not-allowed' : 'pointer' });