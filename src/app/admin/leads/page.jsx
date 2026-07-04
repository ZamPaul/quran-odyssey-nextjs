'use client';

// FILE: src/app/admin/leads/page.jsx  (REPLACE the ComingSoon stub)
//
// Lead pipeline: NEW → CONTACTED → BOOKED → CONVERTED → LOST.
// Column counts, filterable list, per-lead detail with status, notes, and
// the legitimate conversion link (detect matched account → confirm-link).

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const STATUSES = ['NEW', 'CONTACTED', 'BOOKED', 'CONVERTED', 'LOST'];
const STATUS_CFG = {
  NEW:       { label: 'New',       color: '#0e6e8a', bg: 'rgba(40,183,217,0.10)' },
  CONTACTED: { label: 'Contacted', color: '#b45309', bg: 'rgba(250,167,26,0.14)' },
  BOOKED:    { label: 'Booked',    color: '#7c3aed', bg: 'rgba(139,92,246,0.12)' },
  CONVERTED: { label: 'Converted', color: '#15803d', bg: 'rgba(34,197,94,0.12)' },
  LOST:      { label: 'Lost',      color: '#64748b', bg: '#f1f5f9' },
};

export default function LeadsPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const qs = new URLSearchParams();
      if (filter) qs.set('status', filter);
      if (q.trim()) qs.set('q', q.trim());
      const res = await fetch(`${apiBase()}/api/admin/leads?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load leads');
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filter, q]);

  useEffect(() => { const t = setTimeout(load, q ? 300 : 0); return () => clearTimeout(t); }, [load]);

  const leads = data?.leads || [];
  const counts = data?.counts || {};

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Leads</h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 18 }}>Enquiries from first contact through to conversion.</p>

      {error && <div style={errBox}>⚠️ {error}</div>}

      {/* Pipeline summary — clickable status filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => setFilter('')} style={pipeBtn(!filter)}>
          All <span style={{ opacity: 0.6 }}>{data ? Object.values(counts).reduce((a, b) => a + b, 0) : ''}</span>
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(filter === s ? '' : s)} style={pipeBtn(filter === s, STATUS_CFG[s])}>
            {STATUS_CFG[s].label} <span style={{ opacity: 0.6 }}>{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email or phone…" style={{ ...inp, maxWidth: 320, marginBottom: 16 }} />

      {loading ? (
        <div style={{ ...card, ...empty }}>Loading…</div>
      ) : leads.length === 0 ? (
        <div style={{ ...card, ...empty }}>No leads match.</div>
      ) : (
        <div style={{ ...card, overflow: 'hidden' }}>
          {leads.map(l => {
            const cfg = STATUS_CFG[l.status] || STATUS_CFG.NEW;
            return (
              <div key={l.id} onClick={() => setOpen(l.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{l.firstName} {l.lastName}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{l.email} · {l.phone} · {new Date(l.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                {l.convertedUserId && <span style={{ fontSize: 11, color: '#15803d' }}>🔗 linked</span>}
                <span style={pill(cfg.color, cfg.bg)}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {open && <LeadModal id={open} onClose={() => setOpen(null)} onDone={() => { setOpen(null); load(); }} />}
    </div>
  );
}

// ─── Lead detail modal ────────────────────────────────────
function LeadModal({ id, onClose, onDone }) {
  const { getToken } = useAuth();
  const [lead, setLead] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchLead = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load');
      const d = await res.json();
      setLead(d.lead); setCandidate(d.candidate);
      setNotes(d.lead.notes || ''); setStatus(d.lead.status);
    } catch (err) { setError(err.message); }
  }, [id]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  const save = async () => {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/leads/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      onDone();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  const link = async () => {
    if (!candidate) return;
    setBusy(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/leads/${id}/link`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: candidate.userId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      onDone();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Lead detail</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>
        {error && <div style={errBox}>⚠️ {error}</div>}
        {!lead ? <div style={empty}>Loading…</div> : (
          <>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{lead.firstName} {lead.lastName}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{lead.email} · {lead.phone}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Source: {lead.source} · {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>

            {/* Conversion link */}
            {lead.convertedUserId ? (
              <div style={{ padding: '12px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>🔗 Converted — linked to {lead.convertedUser?.email}</div>
              </div>
            ) : candidate ? (
              <div style={{ padding: '12px 14px', background: 'rgba(40,183,217,0.06)', border: '1px solid rgba(40,183,217,0.25)', borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a' }}>Matched account found</div>
                <div style={{ fontSize: 12, color: '#334155', marginTop: 3 }}>
                  {candidate.email} — {candidate.studentCount} learner{candidate.studentCount !== 1 ? 's' : ''}, {candidate.activeEnrollments} active enrolment{candidate.activeEnrollments !== 1 ? 's' : ''}
                </div>
                <button onClick={link} disabled={busy} style={{ ...primary, marginTop: 10, background: '#28b7d9' }}>Link &amp; mark converted</button>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>No matching account yet (no registered user with this email).</div>
            )}

            <div style={{ marginBottom: 12 }}>
              <div style={lbl}>Status</div>
              <select value={status} onChange={e => setStatus(e.target.value)} style={inp}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={lbl}>Notes</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Call notes, follow-up reminders…" style={{ ...inp, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={save} disabled={busy} style={primary}>{busy ? 'Saving…' : 'Save'}</button>
              <button onClick={onClose} style={ghost}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14 };
const empty = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const errBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 12 };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', boxSizing: 'border-box', outline: 'none' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: 5 };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 24, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primary = { padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const ghost = { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
function pill(color, bg) { return { fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 5, padding: '3px 9px', whiteSpace: 'nowrap' }; }

function pipeBtn(active, cfg) {
  return {
    padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
    border: `1.5px solid ${active ? (cfg?.color || '#0d2840') : '#e2e8f0'}`,
    background: active ? (cfg?.bg || '#0d2840') : 'white',
    color: active ? (cfg?.color || 'white') : '#64748b',
  };
}