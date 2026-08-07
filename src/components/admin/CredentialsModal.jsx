'use client';

// src/components/admin/CredentialsModal.jsx  (NEW)
//
// Sign-in help for an account holder or a teacher. Three actions, ordered
// safest-first:
//
//   1. Email a one-time sign-in link  ← default. Nobody relays a credential.
//   2. Set a new password             ← shown once, never stored.
//   3. Sign out of all devices
//
// Nothing here can retrieve an existing password — Clerk stores one-way
// digests, so there is nothing to read back. This is by design.
//
// Usage:
//   <CredentialsModal
//     base="accounts"          // 'accounts' | 'teachers'
//     id={account.id}
//     label={account.email}
//     name={account.name}
//     onClose={() => setModal(null)}
//   />

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

export default function CredentialsModal({ base, id, label, name, onClose }) {
  const { getToken } = useAuth();
  const [tab, setTab] = useState('link'); // 'link' | 'password' | 'sessions'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { kind, ...data }

  // set-password options
  const [custom, setCustom] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [emailIt, setEmailIt] = useState(true);
  const [signOutEverywhere, setSignOutEverywhere] = useState(true);
  const [copied, setCopied] = useState(false);

  const call = async (path, body) => {
    setBusy(true); setError(''); setResult(null);
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/${base}/${id}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      return d;
    } catch (err) { setError(err.message); return null; }
    finally { setBusy(false); }
  };

  const sendLink = async () => {
    const d = await call('signin-link');
    if (d) setResult({ kind: 'link', ...d });
  };

  const setPassword = async () => {
    const d = await call('password', {
      password: useCustom && custom ? custom : undefined,
      signOutEverywhere,
      emailIt,
    });
    if (d) setResult({ kind: 'password', ...d });
  };

  const revoke = async () => {
    const d = await call('revoke-sessions');
    if (d) setResult({ kind: 'sessions', ...d });
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const TABS = [
    ['link', 'Email a sign-in link'],
    ['password', 'Set a password'],
    ['sessions', 'Sign out devices'],
  ];

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Sign-in help</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>{name ? `${name} · ` : ''}{label}</div>

        {/* Existing passwords cannot be retrieved — say so plainly. */}
        <div style={infoBox}>
          Existing passwords can&apos;t be looked up — they&apos;re stored one-way and nobody,
          including us, can read them back. Use one of the options below instead.
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {TABS.map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setResult(null); setError(''); }} style={tabBtn(tab === k)}>{l}</button>
          ))}
        </div>

        {error && <div style={errBox}>⚠️ {error}</div>}

        {/* ── Result panels ── */}
        {result?.kind === 'link' && (
          <div style={okBox}>
            Sign-in link emailed to <strong>{result.sentTo}</strong>. It works once and expires in {result.expiresMinutes} minutes.
          </div>
        )}
        {result?.kind === 'sessions' && (
          <div style={okBox}>Signed out of {result.revoked} active session{result.revoked === 1 ? '' : 's'}.</div>
        )}
        {result?.kind === 'password' && (
          <div>
            <div style={okBox}>
              Password changed.{result.emailed ? ' It has been emailed to them.' : ''}
              {result.noticeSent ? ' A security notice was sent.' : ' (Security notice failed to send.)'}
            </div>
            <div style={lbl}>New password — shown once, not stored anywhere</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <code style={{ flex: 1, fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#0f172a', background: '#f1f5f9', borderRadius: 8, padding: '12px 14px', userSelect: 'all', letterSpacing: 1 }}>
                {result.password}
              </code>
              <button onClick={() => copy(result.password)} style={ghost}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
              Once you close this window it cannot be shown again. Ask them to change it after signing in.
            </div>
            <button onClick={onClose} style={primary}>Done</button>
          </div>
        )}

        {/* ── Action panels ── */}
        {!result && tab === 'link' && (
          <>
            <p style={body}>
              Emails a one-time link that signs them straight in — no password changes hands.
              They set a new password themselves once inside. <strong>This is the safest option.</strong>
            </p>
            <button onClick={sendLink} disabled={busy} style={primary}>
              {busy ? 'Sending…' : 'Email sign-in link'}
            </button>
          </>
        )}

        {!result && tab === 'password' && (
          <>
            <p style={body}>
              Sets a new password immediately. You&apos;ll see it once so you can pass it on.
            </p>
            <label style={checkRow}>
              <input type="checkbox" checked={!useCustom} onChange={() => setUseCustom(v => !v)} />
              <span>Generate a strong password <span style={{ color: '#94a3b8' }}>(recommended)</span></span>
            </label>
            {useCustom && (
              <input
                value={custom}
                onChange={e => setCustom(e.target.value)}
                placeholder="Type a password (min 8 characters)"
                style={{ ...inp, marginBottom: 10 }}
              />
            )}
            <label style={checkRow}>
              <input type="checkbox" checked={emailIt} onChange={e => setEmailIt(e.target.checked)} />
              <span>Email the new password to them</span>
            </label>
            <label style={checkRow}>
              <input type="checkbox" checked={signOutEverywhere} onChange={e => setSignOutEverywhere(e.target.checked)} />
              <span>Sign them out of all devices</span>
            </label>
            <button
              onClick={setPassword}
              disabled={busy || (useCustom && custom.length < 8)}
              style={{ ...primary, marginTop: 6, opacity: (busy || (useCustom && custom.length < 8)) ? 0.5 : 1 }}
            >
              {busy ? 'Setting…' : 'Set new password'}
            </button>
          </>
        )}

        {!result && tab === 'sessions' && (
          <>
            <p style={body}>
              Ends every active session on every device. Their password is unchanged —
              they can sign back in with it. Use this if a device was lost or shared.
            </p>
            <button onClick={revoke} disabled={busy} style={{ ...primary, background: '#b45309' }}>
              {busy ? 'Signing out…' : 'Sign out of all devices'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 26, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const body = { fontSize: 13.5, color: '#334155', lineHeight: 1.7, marginTop: 0, marginBottom: 14 };
const infoBox = { padding: '10px 14px', borderRadius: 8, background: '#f7f9fb', border: '1px solid #e2e8f0', color: '#64748b', fontSize: 12.5, lineHeight: 1.6, marginBottom: 16 };
const errBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 12 };
const okBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#15803d', fontSize: 13, marginBottom: 14, lineHeight: 1.6 };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', boxSizing: 'border-box', outline: 'none' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: 6 };
const checkRow = { display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#334155', marginBottom: 10, cursor: 'pointer' };
const primary = { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' };
const ghost = { padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
function tabBtn(active) {
  return {
    padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
    border: `1.5px solid ${active ? '#0d2840' : '#e2e8f0'}`,
    background: active ? '#0d2840' : 'white',
    color: active ? 'white' : '#64748b',
  };
}