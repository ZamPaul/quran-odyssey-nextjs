'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/accounts/page.jsx   (REPLACE the Phase 1 stub)
//
// Accounts list: search, filter (status/role), sort, paginate, and a
// "Create account" modal. Rows link to the detail page.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const STATUS_CFG = {
  ACTIVE:    { label: 'Active',    color: '#15803d', bg: 'rgba(34,197,94,0.10)' },
  SUSPENDED: { label: 'Suspended', color: '#b45309', bg: 'rgba(250,167,26,0.14)' },
};

export default function AccountsPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [accounts, setAccounts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [q, setQ]             = useState('');
  const [status, setStatus]   = useState('');
  const [role, setRole]       = useState('');
  const [page, setPage]       = useState(1);
  const pageSize = 25;

  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (q.trim()) params.set('q', q.trim());
      if (status)   params.set('status', status);
      if (role)     params.set('role', role);
      const res = await fetch(`${apiBase()}/api/admin/accounts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
      setTotal(data.total || 0);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [q, status, role, page]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  const [qInput, setQInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setQ(qInput); }, 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Accounts</h1>
        <button onClick={() => setShowCreate(true)} style={{ background: '#0d2840', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
          + Create account
        </button>
      </div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>The parents and adult learners who own each learner.</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={qInput} onChange={e => setQInput(e.target.value)}
          placeholder="Search name, email, phone…"
          style={{ flex: 1, minWidth: 220, padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0f172a' }}
        />
        <select value={status} onChange={e => { setPage(1); setStatus(e.target.value); }} style={selStyle}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <select value={role} onChange={e => { setPage(1); setRole(e.target.value); }} style={selStyle}>
          <option value="">All roles</option>
          <option value="PARENT">Parent</option>
          <option value="STUDENT">Student (solo)</option>
        </select>
      </div>

      {error && <div style={errBox}>⚠️ {error}</div>}

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 0.8fr 1fr 0.6fr', gap: 0, padding: '12px 18px', borderBottom: '1px solid #e2e8f0', background: '#f7f9fb' }}>
          {['Name', 'Email', 'Phone', 'Learners', 'Status', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Loading…</div>
        ) : accounts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No accounts found.</div>
        ) : (
          accounts.map(a => {
            const cfg = STATUS_CFG[a.status] || STATUS_CFG.ACTIVE;
            return (
              <div key={a.id}
                onClick={() => router.push(`/admin/accounts/${a.id}`)}
                style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 0.8fr 1fr 0.6fr', gap: 0, padding: '14px 18px', borderBottom: '1px solid #f4f8fb', cursor: 'pointer', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {a.name || <span style={{ color: '#cbd5e1' }}>—</span>}
                  {a.role === 'STUDENT' && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#0e6e8a', background: 'rgba(40,183,217,0.10)', padding: '1px 6px', borderRadius: 4 }}>SOLO</span>}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{a.phone || '—'}</div>
                <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{a.studentCount}</div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 5, padding: '3px 9px' }}>{cfg.label}</span>
                </div>
                <div style={{ textAlign: 'right', color: '#cbd5e1', fontSize: 16 }}>›</div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {total} account{total !== 1 ? 's' : ''} · page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={pageBtn(page <= 1)}>← Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={pageBtn(page >= totalPages)}>Next →</button>
          </div>
        </div>
      )}

      {showCreate && <CreateAccountModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setPage(1); load(); }} />}
    </div>
  );
}

// ─── Create modal ─────────────────────────────────────────
function CreateAccountModal({ onClose, onCreated }) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({ email: '', name: '', phone: '', role: 'PARENT' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { email, temporaryPassword }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.email.trim()) { setError('Email is required.'); return; }
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account');
      setResult({ email: data.account.email, temporaryPassword: data.temporaryPassword });
    } catch (err) { setError(err.message); setSaving(false); }
  };

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={modalCard}>
        {!result ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Create account</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              Creates a sign-in account. The learner profiles are added afterwards from the account's page.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Email *" value={form.email} onChange={v => set('email', v)} placeholder="parent@example.com" type="email" />
              <Field label="Name" value={form.name} onChange={v => set('name', v)} placeholder="Full name" />
              <Field label="Phone / WhatsApp" value={form.phone} onChange={v => set('phone', v)} placeholder="+44…" type="tel" />
              <div>
                <label style={lbl}>Account type</label>
                <select value={form.role} onChange={e => set('role', e.target.value)} style={{ ...selStyle, width: '100%' }}>
                  <option value="PARENT">Parent (manages children)</option>
                  <option value="STUDENT">Solo adult learner</option>
                </select>
              </div>
            </div>
            {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={submit} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>{saving ? 'Creating…' : 'Create account'}</button>
              <button onClick={onClose} style={ghostBtn}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>✓ Account created</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Share these details with the account holder. The password is shown only once.</div>
            <div style={{ background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <Row k="Email" v={result.email} />
              {result.temporaryPassword
                ? <Row k="Temporary password" v={result.temporaryPassword} mono />
                : <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>A custom password was set. They can also use “Forgot password”.</div>}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 18, lineHeight: 1.6 }}>
              Tip: ask them to sign in and change their password, or to use “Forgot password” for a fresh one.
            </div>
            <button onClick={onCreated} style={primaryBtn}>Done</button>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', gap: 12 }}>
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{k}</span>
      <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, fontFamily: mono ? 'monospace' : 'inherit', userSelect: 'all' }}>{v}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' }} />
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────
const selStyle = { padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0f172a', background: 'white', cursor: 'pointer' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };
const errBox = { padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primaryBtn = { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' };
const ghostBtn = { padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const pageBtn = (disabled) => ({ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: disabled ? '#cbd5e1' : '#64748b', fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer' });