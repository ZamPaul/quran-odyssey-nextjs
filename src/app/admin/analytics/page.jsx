'use client';

// FILE: src/app/admin/analytics/page.jsx  (REPLACE the ComingSoon stub)
//
// Analytics & Reporting — one page, sub-sections: Trends, Funnel, Regional,
// Retention (cohort), Export. Dependency-free SVG/CSS charts (correct data
// now; the visual-polish module reskins later). "Trial-to-enrolled" funnel
// (no payment data until Stripe/Phase 12).

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }
const RANGES = [{ v: '30d', l: 'Last 30 days' }, { v: '90d', l: 'Last 90 days' }, { v: '12m', l: 'Last 12 months' }, { v: 'all', l: 'All time' }];

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const [range, setRange] = useState('90d');
  const [data, setData] = useState(null);
  const [retention, setRetention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/analytics?range=${range}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load analytics');
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  // Retention loads independently (heavier)
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/analytics/retention`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setRetention(await res.json());
      } catch {}
    })();
  }, []);

  const exportCsv = async (dataset) => {
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/analytics/export/${dataset}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { alert('Export failed'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${dataset}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Export failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Analytics &amp; Reporting</h1>
        <select value={range} onChange={e => setRange(e.target.value)} style={sel}>
          {RANGES.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
        </select>
      </div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Trends, conversion funnel, regional spread and cohort retention.</p>

      {error && <div style={errBox}>⚠️ {error}</div>}

      {loading || !data ? (
        <div style={{ ...card, ...empty }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <TrendsSection trends={data.trends} />
          <FunnelSection funnel={data.funnel} />
          <RegionalSection regional={data.regional} />
          <RetentionSection retention={retention} />
          <ExportSection onExport={exportCsv} />
        </div>
      )}
    </div>
  );
}

// ─── Trends (multi-series line) ───────────────────────────
function TrendsSection({ trends }) {
  if (!trends || trends.length === 0) return <Section title="Trends"><Empty>No data in range.</Empty></Section>;
  const W = 900, H = 240, pad = 30;
  const series = [
    { key: 'enrolments', color: '#0d2840', label: 'Enrolments' },
    { key: 'trials', color: '#28b7d9', label: 'Trials' },
    { key: 'leads', color: '#faa71a', label: 'Leads' },
  ];
  const maxV = Math.max(1, ...trends.flatMap(t => series.map(s => t[s.key])));
  const x = i => pad + (i / Math.max(1, trends.length - 1)) * (W - pad * 2);
  const y = v => H - pad - (v / maxV) * (H - pad * 2);
  const path = key => trends.map((t, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(t[key]).toFixed(1)}`).join(' ');
  // thin x labels
  const step = Math.ceil(trends.length / 8);

  return (
    <Section title="Enrolments, trials & leads over time">
      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
          {series.map(s => <span key={s.key} style={{ fontSize: 12, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 3, background: s.color, borderRadius: 2 }} />{s.label}</span>)}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 600, height: 'auto' }}>
          {[0, 0.5, 1].map(f => <line key={f} x1={pad} x2={W - pad} y1={y(maxV * f)} y2={y(maxV * f)} stroke="#f1f5f9" strokeWidth="1" />)}
          {series.map(s => <path key={s.key} d={path(s.key)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />)}
          {trends.map((t, i) => i % step === 0 && (
            <text key={i} x={x(i)} y={H - 8} fontSize="10" fill="#94a3b8" textAnchor="middle">{t.label}</text>
          ))}
          <text x={pad} y={y(maxV) - 4} fontSize="10" fill="#cbd5e1">{maxV}</text>
        </svg>
      </div>
    </Section>
  );
}

// ─── Funnel (horizontal bars) ─────────────────────────────
function FunnelSection({ funnel }) {
  if (!funnel) return null;
  const max = Math.max(1, funnel[0]?.count || 1);
  return (
    <Section title="Trial-to-enrolled funnel" subtitle="Stage counts and conversion. ('Enrolled' is the terminal stage until payments land.)">
      <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {funnel.map((s, i) => (
          <div key={s.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.label}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {s.count}{i > 0 && <span style={{ color: '#94a3b8' }}> · {s.pctOfPrev}% of previous · {s.pctOfFirst}% of leads</span>}
              </span>
            </div>
            <div style={{ height: 26, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(2, (s.count / max) * 100)}%`, height: '100%', background: ['#0d2840', '#0e6e8a', '#28b7d9', '#22c55e'][i] || '#28b7d9', borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Regional ─────────────────────────────────────────────
function RegionalSection({ regional }) {
  if (!regional || regional.length === 0) return null;
  const max = Math.max(1, ...regional.map(r => r.students));
  return (
    <Section title="Regional spread" subtitle="Students by country, with active enrolments.">
      <div style={{ ...card, padding: 16 }}>
        {regional.slice(0, 15).map(r => (
          <div key={r.country} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
            <div style={{ width: 150, fontSize: 13, color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.country}</div>
            <div style={{ flex: 1, height: 18, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(r.students / max) * 100}%`, height: '100%', background: '#28b7d9' }} />
            </div>
            <div style={{ width: 120, fontSize: 12, color: '#64748b', textAlign: 'right' }}>{r.students} student{r.students !== 1 ? 's' : ''} · {r.activeEnrolled} active</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Retention (cohort heatmap) ───────────────────────────
function RetentionSection({ retention }) {
  if (!retention) return <Section title="Cohort retention"><Empty>Loading…</Empty></Section>;
  const { matrix, maxOffset, meaningful, monthsOfData } = retention;
  if (!matrix || matrix.length === 0) return <Section title="Cohort retention"><Empty>No enrolment history yet.</Empty></Section>;

  const cellColor = pct => {
    if (pct == null) return 'transparent';
    // green scale
    const alpha = 0.12 + (pct / 100) * 0.7;
    return `rgba(34,197,94,${alpha.toFixed(2)})`;
  };

  return (
    <Section title="Cohort retention" subtitle={`Of students who started each month, the % still active (a completed session) in later months.`}>
      {!meaningful && (
        <div style={{ ...noteBox }}>
          Only {monthsOfData} month{monthsOfData !== 1 ? 's' : ''} of data so far — this becomes meaningful with 3+ months of history. It will fill in as time passes.
        </div>
      )}
      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12, minWidth: 500 }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left' }}>Cohort</th>
              <th style={th}>Size</th>
              {Array.from({ length: maxOffset + 1 }, (_, k) => <th key={k} style={th}>M{k}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map(row => (
              <tr key={row.cohort}>
                <td style={{ ...td, fontWeight: 700, color: '#0f172a', textAlign: 'left' }}>{row.label}</td>
                <td style={{ ...td, color: '#64748b' }}>{row.size}</td>
                {Array.from({ length: maxOffset + 1 }, (_, k) => {
                  const cell = row.retention[k];
                  return (
                    <td key={k} style={{ ...td, background: cell ? cellColor(cell.pct) : 'transparent', color: cell && cell.pct > 55 ? '#065f46' : '#334155' }}>
                      {cell ? `${cell.pct}%` : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// ─── Export ───────────────────────────────────────────────
function ExportSection({ onExport }) {
  const sets = [
    ['enrollments', 'Enrolments'], ['students', 'Students'],
    ['leads', 'Leads'], ['funnel', 'Funnel summary'],
  ];
  return (
    <Section title="Export" subtitle="Download CSVs for offline reporting.">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {sets.map(([k, l]) => (
          <button key={k} onClick={() => onExport(k)} style={{ ...ghost, display: 'inline-flex', alignItems: 'center', gap: 6 }}>⬇ {l} CSV</button>
        ))}
      </div>
    </Section>
  );
}

// ─── UI helpers ───────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0d2840' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}
function Empty({ children }) { return <div style={{ ...card, ...empty }}>{children}</div>; }

const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14 };
const empty = { padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const errBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 12 };
const noteBox = { padding: '10px 14px', borderRadius: 8, background: 'rgba(250,167,26,0.10)', border: '1px solid rgba(250,167,26,0.3)', color: '#92400e', fontSize: 12.5, marginBottom: 10 };
const sel = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', background: 'white', cursor: 'pointer' };
const ghost = { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const th = { padding: '6px 10px', fontSize: 11, color: '#94a3b8', fontWeight: 700, textAlign: 'center', borderBottom: '1px solid #e2e8f0' };
const td = { padding: '6px 10px', textAlign: 'center', borderBottom: '1px solid #f8fafc', borderRadius: 3 };