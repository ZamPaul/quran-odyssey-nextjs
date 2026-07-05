'use client';

// FILE: src/app/admin/audit/page.jsx  (NEW — the /admin/audit nav link
// currently 404s; this fills it.)
//
// Audit Trail Viewer. Every admin action is already recorded by logAudit();
// this makes the whole panel accountable — who did what, to whom, when.
// Searchable, filterable (actor / action / target type / date), paginated,
// with metadata drill-down.

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

// Human labels for audit actions. Extend as new actions appear.
const ACTION_LABELS = {
  'account.create': 'created an account', 'account.update': 'updated an account',
  'account.suspend': 'suspended an account', 'account.reactivate': 'reactivated an account',
  'account.delete': 'deleted an account', 'account.softDelete': 'removed an account',
  'account.restore': 'restored an account', 'account.erase': 'permanently erased an account',
  'student.create': 'created a learner', 'student.update': 'updated a learner',
  'student.delete': 'deleted a learner', 'student.softDelete': 'removed a learner',
  'student.restore': 'restored a learner', 'student.erase': 'permanently erased a learner',
  'student.move': 'moved a learner', 'student.enroll': 'enrolled a learner',
  'teacher.create': 'onboarded a teacher', 'teacher.update': 'updated a teacher',
  'teacher.deactivate': 'deactivated a teacher', 'teacher.reassign': 'reassigned a teacher',
  'enrollmentRequest.approve': 'approved an enrolment request',
  'enrollmentRequest.reject': 'rejected an enrolment request',
  'trial.assign': 'assigned a trial teacher',
  'session.create': 'created a session', 'session.delete': 'deleted a session',
  'session.cancel': 'cancelled a session', 'session.bulkCreate': 'bulk-created sessions',
  'session.bulkReassign': 'bulk-reassigned sessions', 'session.bulkStatus': 'bulk-changed session status',
  'session.bulkDelete': 'bulk-deleted sessions', 'session.syncCalendar': 'synced sessions to calendar',
  'oversight.remindTeacher': 'reminded a teacher',
  'comms.retry': 'retried an email', 'comms.resendEdited': 'resent an edited email',
  'comms.dismiss': 'dismissed a failed email',
  'lead.update': 'updated a lead', 'lead.convert': 'converted a lead',
  'lead.unlink': 'unlinked a lead',
};
function actionLabel(a) { return ACTION_LABELS[a] || a.replace(/[._]/g, ' '); }

// Colour a family of actions so the eye can scan
function actionTone(action) {
  if (/(delete|erase|reject|deactivate|suspend|cancel)/.test(action)) return ['#dc2626', 'rgba(239,68,68,0.09)'];
  if (/(create|approve|enroll|convert|restore|reactivate|onboard)/.test(action)) return ['#15803d', 'rgba(34,197,94,0.10)'];
  if (/(update|reassign|move|edit|sync|remind|retry|resend)/.test(action)) return ['#0e6e8a', 'rgba(40,183,217,0.10)'];
  return ['#64748b', '#f1f5f9'];
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); return `${d}d ago`;
}

export default function AuditPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [facets, setFacets] = useState({ actors: [], actions: [], targetTypes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', actorEmail: '', action: '', targetType: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const qs = new URLSearchParams({ ...filters, page: String(page), pageSize: '50' });
      Object.keys(filters).forEach(k => { if (!filters[k]) qs.delete(k); });
      const res = await fetch(`${apiBase()}/api/admin/audit?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load audit log');
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/audit/facets`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setFacets(await res.json());
      } catch {}
    })();
  }, []);

  const rows = data?.rows || [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const setF = (k, v) => { setPage(1); setFilters(f => ({ ...f, [k]: v })); };
  const clearFilters = () => { setPage(1); setFilters({ q: '', actorEmail: '', action: '', targetType: '', from: '', to: '' }); };
  const anyFilter = Object.values(filters).some(Boolean);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Audit Log</h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 18 }}>Every administrative action, recorded — who did what, to whom, and when.</p>

      {error && <div style={errBox}>⚠️ {error}</div>}

      {/* Filters */}
      <div style={{ ...card, padding: 14, marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={filters.q} onChange={e => setF('q', e.target.value)} placeholder="Search target or actor…" style={{ ...inp, minWidth: 200, flex: 1 }} />
        <select value={filters.actorEmail} onChange={e => setF('actorEmail', e.target.value)} style={inp}>
          <option value="">All admins</option>
          {facets.actors.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filters.action} onChange={e => setF('action', e.target.value)} style={inp}>
          <option value="">All actions</option>
          {facets.actions.map(a => <option key={a} value={a}>{actionLabel(a)}</option>)}
        </select>
        <select value={filters.targetType} onChange={e => setF('targetType', e.target.value)} style={inp}>
          <option value="">All targets</option>
          {facets.targetTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="date" value={filters.from} onChange={e => setF('from', e.target.value)} style={inp} title="From" />
        <input type="date" value={filters.to} onChange={e => setF('to', e.target.value)} style={inp} title="To" />
        {anyFilter && <button onClick={clearFilters} style={ghost}>Clear</button>}
      </div>

      {loading ? (
        <div style={{ ...card, ...empty }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ ...card, ...empty }}>{anyFilter ? 'No entries match these filters.' : 'No activity recorded yet.'}</div>
      ) : (
        <div style={{ ...card, overflow: 'hidden' }}>
          {rows.map(r => {
            const [color, bg] = actionTone(r.action);
            const hasMeta = r.metadata && Object.keys(r.metadata).length > 0;
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div
                  onClick={() => hasMeta && setExpanded(isOpen ? null : r.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: hasMeta ? 'pointer' : 'default' }}
                >
                  <span style={{ ...pill(color, bg), flexShrink: 0 }}>{actionLabel(r.action)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#0f172a' }}>
                      <span style={{ fontWeight: 700 }}>{r.actorEmail || 'system'}</span>
                      {r.targetLabel && <span style={{ color: '#64748b' }}> → {r.targetLabel}</span>}
                      {r.targetType && <span style={{ color: '#94a3b8' }}> ({r.targetType})</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                      {new Date(r.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {timeAgo(r.createdAt)}
                      {r.ip && <span> · {r.ip}</span>}
                    </div>
                  </div>
                  {hasMeta && <span style={{ fontSize: 12, color: '#94a3b8' }}>{isOpen ? '▲ hide' : '▾ details'}</span>}
                </div>
                {isOpen && hasMeta && (
                  <div style={{ padding: '0 16px 14px 16px' }}>
                    <pre style={{ margin: 0, background: '#0d2840', color: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 12, overflowX: 'auto', fontFamily: 'ui-monospace, monospace' }}>
                      {JSON.stringify(r.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data && totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={ghost}>Prev</button>
          <span style={{ fontSize: 13, color: '#64748b' }}>Page {page} of {totalPages} · {data.total} entries</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={ghost}>Next</button>
        </div>
      )}
    </div>
  );
}

const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14 };
const empty = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const errBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 12 };
const inp = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', background: 'white', outline: 'none' };
const ghost = { padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
function pill(color, bg) { return { fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 5, padding: '3px 9px', whiteSpace: 'nowrap' }; }