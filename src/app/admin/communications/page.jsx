'use client';

// FILE: src/app/admin/communications/page.jsx  (REPLACE the ComingSoon stub)
//
// Communications log. Failures float to the top and are visually loud.
// Actions: view, retry (as-is), resend-with-edit, dismiss (mark resolved).

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const TYPE_LABELS = {
  LEAD_CONFIRMATION: 'Lead confirmation', ADMIN_LEAD_NOTIFICATION: 'Admin: new lead',
  TRIAL_BOOKING_CONFIRMATION: 'Trial confirmation', ADMIN_TRIAL_NOTIFICATION: 'Admin: new trial',
  ENROLLMENT_ADMIN_NOTIFICATION: 'Admin: enrolment', ENROLLMENT_APPROVED: 'Enrolment approved',
  ENROLLMENT_REJECTED: 'Enrolment rejected', PROGRESS_REPORT: 'Progress report',
  TEACHER_DUTIES_REMINDER: 'Teacher reminder', MIGRATION_NOTICE: "Migration notice" , OTHER: 'Other',
};

export default function CommunicationsPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '', q: '' });
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const qs = new URLSearchParams({ ...filters, page: String(page), pageSize: '25' });
      Object.keys(filters).forEach(k => { if (!filters[k]) qs.delete(k); });
      const res = await fetch(`${apiBase()}/api/admin/communications?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load');
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const rows = data?.rows || [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Communications</h1>
        {data?.failedUnresolved > 0 && (
          <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '6px 12px' }}>
            ⚠️ {data.failedUnresolved} failed send{data.failedUnresolved > 1 ? 's' : ''} need attention
          </span>
        )}
      </div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 18 }}>Every email the system has sent — successes and failures.</p>

      {error && <div style={errBox}>⚠️ {error}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <select value={filters.status} onChange={e => { setPage(1); setFilters(f => ({ ...f, status: e.target.value })); }} style={sel}>
          <option value="">All statuses</option>
          <option value="FAILED">Failed only</option>
          <option value="SENT">Sent only</option>
        </select>
        <select value={filters.type} onChange={e => { setPage(1); setFilters(f => ({ ...f, type: e.target.value })); }} style={sel}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input value={filters.q} onChange={e => { setPage(1); setFilters(f => ({ ...f, q: e.target.value })); }} placeholder="Search recipient or subject…" style={{ ...sel, minWidth: 220 }} />
      </div>

      {loading ? (
        <div style={{ ...card, ...empty }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ ...card, ...empty }}>No communications match.</div>
      ) : (
        <div style={{ ...card, overflow: 'hidden' }}>
          {rows.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #f1f5f9', background: r.status === 'FAILED' && !r.resolvedAt ? 'rgba(239,68,68,0.03)' : 'white' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: r.status === 'FAILED' ? (r.resolvedAt ? '#94a3b8' : '#dc2626') : '#22c55e' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.subject || '(no subject)'}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {TYPE_LABELS[r.type] || r.type} · {r.toAddress} · {new Date(r.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  {r.resendOfId && ' · resend'}
                </div>
                {r.status === 'FAILED' && r.failureReason && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 2 }}>✗ {r.failureReason}</div>
                )}
              </div>
              {r.status === 'FAILED'
                ? <span style={pill(r.resolvedAt ? '#64748b' : '#dc2626', r.resolvedAt ? '#f1f5f9' : 'rgba(239,68,68,0.10)')}>{r.resolvedAt ? 'Resolved' : 'Failed'}</span>
                : <span style={pill('#15803d', 'rgba(34,197,94,0.10)')}>Sent</span>}
              <button onClick={() => setViewing(r.id)} style={ghost}>View</button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={ghost}>Prev</button>
          <span style={{ fontSize: 13, color: '#64748b' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={ghost}>Next</button>
        </div>
      )}

      {viewing && <CommModal id={viewing} onClose={() => setViewing(null)} onDone={() => { setViewing(null); load(); }} />}
    </div>
  );
}

// ─── View / retry / resend-with-edit modal ────────────────
function CommModal({ id, onClose, onDone }) {
  const { getToken } = useAuth();
  const [row, setRow] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({ to: '', subject: '', html: '' });
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/communications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to load');
        const d = await res.json();
        setRow(d.row);
        setEdit({ to: d.row.toAddress, subject: d.row.subject || '', html: d.row.html || '' });
      } catch (err) { setError(err.message); }
    })();
  }, [id]);

  const call = async (path, body) => {
    setBusy(true); setError(''); setResult(null);
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/communications/${id}/${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      if (path === 'dismiss') { onDone(); return; }
      setResult(d.success ? '✓ Sent successfully' : `✗ Still failed: ${d.failureReason || ''}`);
      if (d.success) setTimeout(onDone, 1200);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 680, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Communication</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>
        {error && <div style={errBox}>⚠️ {error}</div>}
        {!row ? <div style={empty}>Loading…</div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <Field label="To" value={editing ? undefined : row.toAddress} />
              <Field label="Status" value={editing ? undefined : (row.status === 'SENT' ? 'Sent' : (row.resolvedAt ? 'Failed (resolved)' : 'Failed'))} />
            </div>
            {row.status === 'FAILED' && row.failureReason && (
              <div style={{ ...errBox, marginBottom: 14 }}>Failure reason: {row.failureReason}{row.failureCode ? ` (${row.failureCode})` : ''}</div>
            )}

            {!editing ? (
              <>
                <Field label="Subject" value={row.subject} />
                <div style={{ marginTop: 12 }}>
                  <div style={lbl}>Body preview</div>
                  <iframe title="email" srcDoc={row.html || '<p>(no stored body)</p>'} style={{ width: '100%', height: 300, border: '1px solid #e2e8f0', borderRadius: 8, background: 'white' }} />
                </div>
                {result && <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: result.startsWith('✓') ? '#15803d' : '#dc2626' }}>{result}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  <button onClick={() => call('retry')} disabled={busy || !row.html} style={primary}>{busy ? 'Sending…' : '↻ Retry as-is'}</button>
                  <button onClick={() => setEditing(true)} disabled={!row.html} style={ghost}>✎ Resend with edit</button>
                  {row.status === 'FAILED' && !row.resolvedAt && <button onClick={() => call('dismiss')} disabled={busy} style={{ ...ghost, color: '#64748b' }}>Dismiss</button>}
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 10 }}>
                  <div style={lbl}>To</div>
                  <input value={edit.to} onChange={e => setEdit(v => ({ ...v, to: e.target.value }))} style={inp} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={lbl}>Subject</div>
                  <input value={edit.subject} onChange={e => setEdit(v => ({ ...v, subject: e.target.value }))} style={inp} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={lbl}>Body (HTML)</div>
                  <textarea value={edit.html} onChange={e => setEdit(v => ({ ...v, html: e.target.value }))} rows={10} style={{ ...inp, fontFamily: 'monospace', fontSize: 12 }} />
                </div>
                {result && <div style={{ marginBottom: 10, fontSize: 13, fontWeight: 700, color: result.startsWith('✓') ? '#15803d' : '#dc2626' }}>{result}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => call('resend', edit)} disabled={busy} style={primary}>{busy ? 'Sending…' : 'Send edited email'}</button>
                  <button onClick={() => setEditing(false)} style={ghost}>Back</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  if (value === undefined) return null;
  return (
    <div>
      <div style={lbl}>{label}</div>
      <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14 };
const empty = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const errBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 12 };
const sel = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', background: 'white', cursor: 'pointer' };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', boxSizing: 'border-box', outline: 'none' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: 5 };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 24, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primary = { padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const ghost = { padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
function pill(color, bg) { return { fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 5, padding: '3px 9px', whiteSpace: 'nowrap' }; }