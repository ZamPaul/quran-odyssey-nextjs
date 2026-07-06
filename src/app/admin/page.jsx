'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/page.jsx   (REPLACE the Phase 1 stub)
//
// The admin dashboard landing. Calls GET /api/admin/dashboard and renders:
//   • Attention KPI cards (what needs action now)
//   • Header totals (accounts / students / teachers / active enrolments)
//   • Charts: enrolment trend, trial→paid conversion, regional breakdown
//   • Recent activity feed (from the audit log)
//
// Uses recharts (available in the project).
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

// const REGION_COLORS = { UK: '#28b7d9', USA: '#0d2840', Canada: '#faa71a', Other: '#cbd5e1' };
const PIE_PALETTE = ['#28b7d9','#0d2840','#faa71a','#0e6e8a','#8b5cf6','#22c55e','#cbd5e1'];

// Human labels for audit actions in the activity feed
const ACTION_LABELS = {
  'account.create': 'created an account',
  'account.suspend': 'suspended an account',
  'account.reactivate': 'reactivated an account',
  'account.delete': 'deleted an account',
  'account.update': 'updated an account',
  'student.create': 'created a student',
  'student.update': 'updated a student',
  'student.delete': 'deleted a student',
  'student.move': 'moved a student',
  'student.enroll': 'enrolled a student',
  'teacher.create': 'onboarded a teacher',
  'teacher.update': 'updated a teacher',
  'teacher.deactivate': 'deactivated a teacher',
  'teacher.reassign': 'reassigned a teacher',
  'enrollmentRequest.approve': 'approved an enrolment request',
  'enrollmentRequest.reject': 'rejected an enrolment request',
  'trial.assign': 'assigned a trial teacher',
  'session.cancel': 'cancelled a session',
  'admin.ping': 'pinged the admin API',
};

function actionLabel(a) { return ACTION_LABELS[a] || a.replace(/[._]/g, ' '); }

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load dashboard');
        setData(await res.json());
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#28b7d9', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: 14, color: '#94a3b8' }}>Loading dashboard…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (error) {
    return <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 14 }}>⚠️ {error}</div>;
  }

  const { kpis, totals, charts, activity } = data;

  const kpiCards = [
    // ...(kpis.failedComms > 0 ? [{
    //   label: 'Failed Emails', value: kpis.failedComms,
    //   href: '/admin/communications', accent: '#dc2626', icon: '⚠️',
    // }] : []),
    { label: 'Pending Requests', value: kpis.pendingEnrollmentRequests, href: '/admin/enrollment-requests', accent: '#faa71a', icon: '📝' },
    { label: 'Unassigned Trials', value: kpis.unassignedTrials, href: '/admin/trials', accent: '#28b7d9', icon: '📅' },
    { label: "Today's Classes", value: kpis.todaySessions, href: '/admin/sessions', accent: '#0e6e8a', icon: '🗓️' },
    { label: 'Draft Reports', value: kpis.draftReports, href: '/admin/reports', accent: '#8b5cf6', icon: '📊' },
    { label: 'New Leads', value: kpis.newLeads, href: '/admin/leads', accent: '#22c55e', icon: '🌱' },
  ];

  const totalCards = [
    { label: 'Accounts', value: totals.accounts },
    { label: 'Students', value: totals.students },
    { label: 'Active Teachers', value: totals.teachers },
    { label: 'Active Enrolments', value: totals.activeEnrollments },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Dashboard</h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>A snapshot of what needs attention and how the platform is doing.</p>

      {/* Failed-comms attention banner — only when there's something wrong */}
      {kpis.failedComms > 0 && (
        <Link href="/admin/communications" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
            padding: '16px 20px', borderRadius: 14,
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)',
            borderLeft: '3px solid #dc2626', cursor: 'pointer',
          }}>
            <div style={{ fontSize: 24, lineHeight: 1 }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#dc2626' }}>
                {kpis.failedComms} failed email{kpis.failedComms !== 1 ? 's' : ''} need attention
              </div>
              <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
                One or more emails didn’t send. Retry or resend them from Communications.
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Review →</span>
          </div>
        </Link>
      )}

      {/* Attention KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {kpiCards.map(c => (
          <Link key={c.label} href={c.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8, borderLeft: `3px solid ${c.accent}`, transition: 'box-shadow 150ms', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</span>
                <span style={{ fontSize: 16 }}>{c.icon}</span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: c.value > 0 ? '#0f172a' : '#cbd5e1', lineHeight: 1 }}>{c.value}</div>
              <span style={{ fontSize: 12, color: c.accent, fontWeight: 700 }}>{c.value > 0 ? 'View →' : 'All clear'}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Totals strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {totalCards.map(c => (
          <div key={c.label} style={{ background: '#0d2840', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'white', lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginTop: 6 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Enrollment trend */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Enrolments Over Time</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>New enrolments, last 3 months</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.enrollmentTrend} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(40,183,217,0.06)' }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey="count" fill="#28b7d9" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Regional breakdown */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Regional Breakdown</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Students by region</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={charts.regional.filter(r => r.count > 0)} dataKey="count" nameKey="region" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {/* {charts.regional.map((r) => <Cell key={r.region} fill={REGION_COLORS[r.region] || '#cbd5e1'} />)} */}
                  {charts.regional.map((r, i) => (
                    <Cell key={r.region} fill={r.isOther ? '#cbd5e1' : PIE_PALETTE[i % PIE_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {charts.regional.map((r, i) => (
                <div key={r.region} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: r.isOther ? '#cbd5e1' : PIE_PALETTE[i % PIE_PALETTE.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, flex: 1 }}>{r.region}</span>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion + Activity row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* Conversion */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Trial → Paid</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Conversion, last 90 days</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="60" fill="none" stroke="#f0f4f8" strokeWidth="14" />
                <circle cx="70" cy="70" r="60" fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - charts.conversion.rate / 100)}`} />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{charts.conversion.rate}%</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 14, textAlign: 'center' }}>
              {charts.conversion.converted} of {charts.conversion.total} requests became active
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Recent Activity</div>
          {activity.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94a3b8', padding: '20px 0', textAlign: 'center' }}>
              No activity yet. Admin actions will appear here as you use the panel.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activity.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f4f8fb' }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>•</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#0f172a' }}>
                      <strong>{a.actorEmail?.split('@')[0] || 'An admin'}</strong> {actionLabel(a.action)}
                      {a.targetLabel ? <span style={{ color: '#64748b' }}> — {a.targetLabel}</span> : null}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{timeAgo(a.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}