'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/accounts/[id]/page.jsx   (NEW)
//
// One account: profile, all linked learners, a roll-up, and actions —
// edit (name/phone/role), suspend/reactivate, hard-delete.
// Consumes GET /api/admin/accounts/:id.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import DeleteImpactModal from '@/components/admin/DeleteImpactModal';
import Link from 'next/link';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const COURSE_LABELS = {
  NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation',
  TAJWEED: 'Tajweed', HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1',
};
const STATUS_CFG = {
  ACTIVE:    { label: 'Active',    color: '#15803d', bg: 'rgba(34,197,94,0.10)' },
  SUSPENDED: { label: 'Suspended', color: '#b45309', bg: 'rgba(250,167,26,0.14)' },
};

export default function AccountDetailPage() {
  const { getToken } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) throw new Error('Account not found');
      if (!res.ok) throw new Error('Failed to load account');
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async () => {
    const next = data.account.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setBusy(true); setActionMsg('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/accounts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setActionMsg(next === 'SUSPENDED' ? 'Account suspended — they can no longer sign in.' : 'Account reactivated.');
      await load();
    } catch (err) { setActionMsg('⚠️ ' + err.message); }
    finally { setBusy(false); }
  };

  // const doDelete = async () => {
  //   setBusy(true); setActionMsg('');
  //   try {
  //     const token = await getToken();
  //     const res = await fetch(`${apiBase()}/api/admin/accounts/${id}?confirm=true`, {
  //       method: 'DELETE',
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
  //     router.push('/admin/accounts');
  //   } catch (err) { setActionMsg('⚠️ ' + err.message); setBusy(false); }
  // };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error)   return (
    <div>
      <Link href="/admin/accounts" style={backLink}>← Back to accounts</Link>
      <div style={errBox}>⚠️ {error}</div>
    </div>
  );

  const { account, rollup } = data;
  const cfg = STATUS_CFG[account.status] || STATUS_CFG.ACTIVE;
  const suspended = account.status === 'SUSPENDED';

  return (
    <div>
      <Link href="/admin/accounts" style={backLink}>← Back to accounts</Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{account.name || account.email.split('@')[0]}</h1>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 5, padding: '3px 9px' }}>{cfg.label}</span>
            {account.role === 'STUDENT' && <span style={{ fontSize: 10, fontWeight: 700, color: '#0e6e8a', background: 'rgba(40,183,217,0.10)', padding: '2px 7px', borderRadius: 4 }}>SOLO ADULT</span>}
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{account.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setEditing(true)} style={ghostBtn}>Edit</button>
          <button onClick={toggleStatus} disabled={busy} style={{ ...ghostBtn, color: suspended ? '#15803d' : '#b45309', borderColor: suspended ? 'rgba(34,197,94,0.4)' : 'rgba(250,167,26,0.5)' }}>
            {suspended ? 'Reactivate' : 'Suspend'}
          </button>
          <button onClick={() => setConfirmDelete(true)} disabled={busy} style={{ ...ghostBtn, color: '#dc2626', borderColor: '#fecaca' }}>Delete</button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: actionMsg.startsWith('⚠️') ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
          border: `1px solid ${actionMsg.startsWith('⚠️') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          color: actionMsg.startsWith('⚠️') ? '#dc2626' : '#15803d' }}>
          {actionMsg}
        </div>
      )}

      {/* Info + rollup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 22 }}>
        <div style={card}>
          <div style={cardTitle}>Account</div>
          <InfoRow k="Name" v={account.name || '—'} />
          <InfoRow k="Email" v={account.email} />
          <InfoRow k="Phone" v={account.phone || '—'} />
          <InfoRow k="Type" v={account.role === 'PARENT' ? 'Parent' : 'Solo adult'} />
          <InfoRow k="Joined" v={new Date(account.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>

        <div style={card}>
          <div style={cardTitle}>Activity roll-up (across all learners)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {[
              ['Enrolments', rollup.enrollments],
              ['Sessions', rollup.sessions],
              ['Assignments', rollup.assignments],
              ['Trials', rollup.trials],
              ['Requests', rollup.enrollmentRequests],
            ].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center', padding: '14px 8px', background: '#f7f9fb', borderRadius: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{val}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learners */}
      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
        Learners ({account.managedStudents.length})
      </div>
      {account.managedStudents.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#94a3b8', fontSize: 14, padding: '32px' }}>
          No learners under this account yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {account.managedStudents.map(s => (
            <div key={s.id}
              onClick={() => router.push(`/admin/students/${s.id}`)}
              style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '14px 18px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#28b7d9'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #faa71a, #e8920a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#0d2840', flexShrink: 0 }}>
                {(s.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Age {s.age} · {s.country} · {COURSE_LABELS[s.courseInterest] || s.courseInterest}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 12 }}>
                <span>{s._count.enrollments} enrol.</span>
                <span>{s._count.classSessions} sess.</span>
              </div>
              <span style={{ color: '#cbd5e1', fontSize: 16 }}>›</span>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditAccountModal account={account} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />
      )}

      {/* {confirmDelete && (
        <DeleteConfirmModal
          account={account}
          studentCount={account.managedStudents.length}
          busy={busy}
          onConfirm={doDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )} */}

      {confirmDelete && (
        <DeleteImpactModal
          kind="account"
          id={account.id}
          label={account.email}
          onClose={() => setConfirmDelete(false)}
          onDeleted={() => router.push('/admin/accounts')}
        />
      )}
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────
function EditAccountModal({ account, onClose, onSaved }) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({ name: account.name || '', phone: account.phone || '', role: account.role });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/accounts/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to save');
      onSaved();
    } catch (err) { setError(err.message); setSaving(false); }
  };

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={modalCard}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Edit account</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Phone / WhatsApp</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Account type</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="PARENT">Parent (manages children)</option>
              <option value="STUDENT">Solo adult learner</option>
            </select>
          </div>
        </div>
        {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={save} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Save'}</button>
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────

// function DeleteConfirmModal({ account, studentCount, busy, onConfirm, onClose }) {
//   const [typed, setTyped] = useState('');
//   const target = account.email;
//   return (
//     <div onClick={onClose} style={modalOverlay}>
//       <div onClick={e => e.stopPropagation()} style={modalCard}>
//         <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626', marginBottom: 8 }}>Delete this account?</div>
//         <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>
//           This permanently deletes <strong>{account.email}</strong>
//           {studentCount > 0 && <> and <strong>{studentCount} learner{studentCount !== 1 ? 's' : ''}</strong> with all their enrolments, sessions, assignments, attendance, and reports</>}.
//           This cannot be undone.
//         </div>
//         <label style={lbl}>Type the email to confirm</label>
//         <input value={typed} onChange={e => setTyped(e.target.value)} placeholder={target}
//           style={{ ...inp, marginBottom: 18, borderColor: typed && typed !== target ? '#fecaca' : '#e2e8f0' }} />
//         <div style={{ display: 'flex', gap: 8 }}>
//           <button onClick={onConfirm} disabled={busy || typed !== target}
//             style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: (busy || typed !== target) ? '#e2e8f0' : '#dc2626', color: (busy || typed !== target) ? '#94a3b8' : 'white', fontSize: 14, fontWeight: 800, cursor: (busy || typed !== target) ? 'not-allowed' : 'pointer' }}>
//             {busy ? 'Deleting…' : 'Permanently delete'}
//           </button>
//           <button onClick={onClose} disabled={busy} style={ghostBtn}>Cancel</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// ─── bits ─────────────────────────────────────────────────
function InfoRow({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f4f8fb', gap: 12 }}>
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{k}</span>
      <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
    </div>
  );
}

const backLink = { display: 'inline-block', fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 600, marginBottom: 16 };
const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, transition: 'border-color 150ms' };
const cardTitle = { fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', marginBottom: 14 };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };
const errBox = { padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primaryBtn = { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' };
const ghostBtn = { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' };