'use client';

// FILE: src/app/admin/settings/page.jsx  (REPLACE the ComingSoon stub)
//
// System Settings — Phase 11. Honestly scoped:
//   • Administrators: a READ-ONLY list of who holds ADMIN. Changing admins
//     happens in the Clerk Dashboard (Clerk is the source of auth truth) —
//     this is a window, not a control panel. No CRUD reimplementation.
//   • Platform configuration: deferred. There is no runtime-configurable
//     value yet. A placeholder states this plainly rather than shipping
//     toggles nobody flips.

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

// If you self-host Clerk under a custom domain, set this to your dashboard URL.
const CLERK_USERS_URL = 'https://dashboard.clerk.com/';

export default function SettingsPage() {
  const { getToken } = useAuth();
  const [admins, setAdmins] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/audit/administrators`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to load administrators');
        const d = await res.json();
        setAdmins(d.admins || []);
      } catch (err) { setError(err.message); }
    })();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Settings</h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Administrators and platform configuration.</p>

      {error && <div style={errBox}>⚠️ {error}</div>}

      {/* Administrators */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0d2840' }}>Administrators</div>
          <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
            Who currently has admin access. To add or remove an administrator, use the Clerk Dashboard —
            Clerk is the source of truth for authentication and roles.
          </div>
        </div>

        <div style={{ ...card, overflow: 'hidden' }}>
          {!admins ? (
            <div style={empty}>Loading…</div>
          ) : admins.length === 0 ? (
            <div style={empty}>No administrators found.</div>
          ) : (
            admins.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0d2840,#142f4a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {(a.name || a.email || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{a.name || '—'}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{a.email}</div>
                </div>
                {a.status === 'SUSPENDED' && <span style={pill('#dc2626', 'rgba(239,68,68,0.10)')}>Suspended</span>}
                <span style={{ fontSize: 11.5, color: '#94a3b8' }}>since {new Date(a.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
              </div>
            ))
          )}
        </div>

        <a href={CLERK_USERS_URL} target="_blank" rel="noopener noreferrer"
           style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 13, fontWeight: 700, color: '#0e6e8a', textDecoration: 'none' }}>
          Manage administrators in Clerk ↗
        </a>
      </section>

      {/* Platform configuration — deferred honestly */}
      <section>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0d2840' }}>Platform configuration</div>
        </div>
        <div style={{ ...card, padding: 20, color: '#64748b', fontSize: 13.5, lineHeight: 1.6 }}>
          There are no runtime-configurable settings yet — current platform values
          (session defaults, email senders, thresholds) are fixed in code. When the
          business needs a value to be adjustable without a deploy, it will appear here.
        </div>
      </section>
    </div>
  );
}

const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14 };
const empty = { padding: '28px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const errBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 12 };
function pill(color, bg) { return { fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 5, padding: '3px 9px', whiteSpace: 'nowrap' }; }