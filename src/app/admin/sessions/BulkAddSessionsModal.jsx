'use client';

// src/app/admin/sessions/BulkAddSessionsModal.jsx  (NEW)
//
// Bulk session generator. Steps:
//   1. Pick student → enrollment (auto-selected if only one)
//   2. Choose weekdays (Mon–Fri), each with its own time + duration
//   3. Start/end date + blackout dates
//   4. Preview (clash + blackout flagged) → Commit
//   5. Optional: sync created sessions to Google Calendar
//
// Import into sessions/page.jsx and render when `showBulk` is true.
// Times are entered in the ADMIN'S local timezone. The preview shows both the
// admin time and the student's local time for every occurrence.

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getAdminTimezone, zoneAbbr, formatInZone } from '@/lib/clientTime';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const WEEKDAYS = [
  { wd: 1, label: 'Mon' }, { wd: 2, label: 'Tue' }, { wd: 3, label: 'Wed' },
  { wd: 4, label: 'Thu' }, { wd: 5, label: 'Fri' },
];
const COURSE_LABELS = { NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation', TAJWEED: 'Tajweed', HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1' };

export default function BulkAddSessionsModal({ onClose, onDone }) {
  const { getToken } = useAuth();
  const [step, setStep] = useState(1);

  const adminTz = getAdminTimezone();

  // Step 1
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentId, setEnrollmentId] = useState('');

  // Step 2 — per-day config: { [wd]: { on, startTime, durationMins } }
  const [dayCfg, setDayCfg] = useState({});

  // Step 3
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [blackout, setBlackout] = useState([]);
  const [blackoutInput, setBlackoutInput] = useState('');

  // Preview / commit
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [committed, setCommitted] = useState(null); // { createdIds, ... }
  const [syncResult, setSyncResult] = useState(null);

  const studentTz = student?.timezone || null;

  // ── Student search ──
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) { setStudents([]); return; }
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/sessions/meta/students?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setStudents(d.students || []); }
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const pickStudent = async (s) => {
    setStudent(s); setStudents([]); setQuery('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/sessions/meta/enrollments?studentId=${s.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setEnrollments(d.enrollments || []);
        if ((d.enrollments || []).length === 1) setEnrollmentId(d.enrollments[0].id); // auto-select
      }
    } catch {}
  };

  const chosenEnrollment = enrollments.find(e => e.id === enrollmentId);

  // ── Day config helpers ──
  const toggleDay = (wd) => setDayCfg(p => ({
    ...p,
    [wd]: p[wd]?.on ? { ...p[wd], on: false } : { on: true, startTime: p[wd]?.startTime || '16:00', durationMins: p[wd]?.durationMins || 30 },
  }));

  const setDayField = (wd, k, v) => setDayCfg(p => ({ ...p, [wd]: { ...p[wd], [k]: v } }));

  const activeDays = WEEKDAYS.filter(d => dayCfg[d.wd]?.on);

  const daysPayload = () => activeDays.map(d => ({
    weekday: d.wd,
    startTime: dayCfg[d.wd].startTime,
    durationMins: parseInt(dayCfg[d.wd].durationMins, 10),
  }));

  const addBlackout = () => {
    if (blackoutInput && !blackout.includes(blackoutInput)) setBlackout(p => [...p, blackoutInput].sort());
    setBlackoutInput('');
  };

  // ── Preview ──
  const runPreview = async () => {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/sessions/bulk/preview`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        // body: JSON.stringify({ enrollmentId, days: daysPayload(), startDate, endDate, blackout }),
        body: JSON.stringify({ enrollmentId, days: daysPayload(), startDate, endDate, blackout, timeZone: adminTz }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Preview failed');
      setPreview(d); setStep(4);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  // ── Commit ──
  const runCommit = async () => {
    setBusy(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/sessions/bulk/commit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        // body: JSON.stringify({ enrollmentId, days: daysPayload(), startDate, endDate, blackout }),
        body: JSON.stringify({ enrollmentId, days: daysPayload(), startDate, endDate, blackout, timeZone: adminTz }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Create failed');
      setCommitted(d); setStep(5);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  // ── Sync ──
  const runSync = async () => {
    if (!committed?.createdIds?.length) return;
    setBusy(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/sessions/sync-calendar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionIds: committed.createdIds }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Sync failed');
      setSyncResult(d);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const fmt = (iso, tz) => new Date(iso).toLocaleString('en-GB', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  // ── Step gating ──
  const canStep2 = !!enrollmentId;
  const canStep3 = activeDays.length > 0 && activeDays.every(d => dayCfg[d.wd].startTime && dayCfg[d.wd].durationMins);
  const canPreview = canStep3 && startDate && endDate;

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 640, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Bulk add sessions</div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 18 }}>Step {step} of 5</div>

        {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}

        {/* STEP 1 — student + enrollment */}
        {step === 1 && (
          <div>
            <label style={lbl}>Student</label>
            {student ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: '1px solid #28b7d9', background: 'rgba(40,183,217,0.06)', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{student.name} <span style={{ color: '#94a3b8' }}>· {student.account?.email}</span></span>
                <button onClick={() => { setStudent(null); setEnrollments([]); setEnrollmentId(''); }} style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>change</button>
              </div>
            ) : (
              <>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search student by name…" style={inp} />
                {students.length > 0 && (
                  <div style={{ marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 8, maxHeight: 160, overflowY: 'auto', marginBottom: 16 }}>
                    {students.map(s => (
                      <div key={s.id} onClick={() => pickStudent(s)} style={{ padding: '9px 12px', fontSize: 13, cursor: 'pointer', color: '#0f172a', borderBottom: '1px solid #f4f8fb' }}>
                        {s.name} <span style={{ color: '#94a3b8' }}>· {s.account?.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {student && (
              <div style={{ marginTop: 4 }}>
                <label style={lbl}>Enrolment</label>
                {enrollments.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#b45309', padding: '10px 0' }}>No active enrolments for this student. Create an enrolment first.</div>
                ) : (
                  <select value={enrollmentId} onChange={e => setEnrollmentId(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">Select enrolment…</option>
                    {enrollments.map(e => (
                      <option key={e.id} value={e.id}>
                        {COURSE_LABELS[e.courseType] || e.courseType} · {e.teacher?.name} · {e.sessionsPerWeek}×/week
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
              <button onClick={() => setStep(2)} disabled={!canStep2} style={{ ...primaryBtn, opacity: canStep2 ? 1 : 0.5, cursor: canStep2 ? 'pointer' : 'not-allowed' }}>Next</button>
              <button onClick={onClose} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* STEP 2 — weekdays + per-day time */}
        {step === 2 && (
          <div>
            {/* <label style={lbl}>Which days, and what time each? (student's local time) - {student?.timezone}</label> */}
            <label style={lbl}>Which days, and what time each?</label>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
              Times are in <strong style={{ color: '#0f172a' }}>your local time</strong> — {adminTz} ({zoneAbbr(adminTz)})
              {studentTz && studentTz !== adminTz && <> · student is in {studentTz}</>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              {WEEKDAYS.map(d => {
                const on = dayCfg[d.wd]?.on;
                return (
                  <div key={d.wd} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${on ? '#28b7d9' : '#e2e8f0'}`, background: on ? 'rgba(40,183,217,0.05)' : 'white' }}>
                    <button onClick={() => toggleDay(d.wd)} style={{ width: 54, padding: '6px 0', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: on ? '#0d2840' : '#f0f4f8', color: on ? 'white' : '#64748b' }}>{d.label}</button>
                    {on && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>at</span>
                          <input type="time" value={dayCfg[d.wd].startTime} onChange={e => setDayField(d.wd, 'startTime', e.target.value)} style={{ ...inp, width: 120, padding: '7px 10px' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>for</span>
                          <input type="number" min="15" step="15" value={dayCfg[d.wd].durationMins} onChange={e => setDayField(d.wd, 'durationMins', e.target.value)} style={{ ...inp, width: 72, padding: '7px 10px' }} />
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>min</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {chosenEnrollment && activeDays.length > 0 && activeDays.length !== chosenEnrollment.sessionsPerWeek && (
              <div style={{ fontSize: 12, color: '#92400e', background: 'rgba(250,167,26,0.12)', border: '1px solid rgba(250,167,26,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 4 }}>
                Heads up: this enrolment is {chosenEnrollment.sessionsPerWeek}×/week, but you picked {activeDays.length} day(s).
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setStep(3)} disabled={!canStep3} style={{ ...primaryBtn, opacity: canStep3 ? 1 : 0.5, cursor: canStep3 ? 'pointer' : 'not-allowed' }}>Next</button>
              <button onClick={() => setStep(1)} style={ghostBtn}>Back</button>
            </div>
          </div>
        )}

        {/* STEP 3 — date range + blackouts */}
        {step === 3 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><label style={lbl}>Start date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>End date</label><input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} style={inp} /></div>
            </div>
            <label style={lbl}>Blackout dates (skipped — e.g. Eid, holidays)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="date" value={blackoutInput} onChange={e => setBlackoutInput(e.target.value)} style={inp} />
              <button onClick={addBlackout} disabled={!blackoutInput} style={ghostBtn}>Add</button>
            </div>
            {blackout.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {blackout.map(b => (
                  <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#f0f4f8', borderRadius: 6, padding: '4px 8px', color: '#334155' }}>
                    {b}
                    <button onClick={() => setBlackout(p => p.filter(x => x !== b))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={runPreview} disabled={!canPreview || busy} style={{ ...primaryBtn, opacity: (canPreview && !busy) ? 1 : 0.5, cursor: (canPreview && !busy) ? 'pointer' : 'not-allowed' }}>{busy ? 'Generating…' : 'Preview'}</button>
              <button onClick={() => setStep(2)} style={ghostBtn}>Back</button>
            </div>
          </div>
        )}

        {/* STEP 4 — preview */}
        {step === 4 && preview && (
          <div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <Stat label="Will create" value={preview.summary.willCreate} color="#15803d" />
              <Stat label="Conflicts (skip)" value={preview.summary.conflict} color="#dc2626" />
              <Stat label="Blackout (skip)" value={preview.summary.blackout} color="#b45309" />
            </div>
            {preview.warning && (
              <div style={{ fontSize: 12, color: '#92400e', background: 'rgba(250,167,26,0.12)', border: '1px solid rgba(250,167,26,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>{preview.warning}</div>
            )}
            {/* <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
              {preview.student.name} · {preview.teacher.name} · times shown in {preview.timeZone}
            </div> */}
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
              {preview.student.name} · {preview.teacher.name} · times in {preview.timeZone} (your time)
              {preview.studentTimeZone && preview.studentTimeZone !== preview.timeZone
                && <> · student column in {preview.studentTimeZone}</>}
            </div>
            {preview.dstWarning && (
              <div style={{ fontSize: 12, color: '#92400e', background: 'rgba(250,167,26,0.12)', border: '1px solid rgba(250,167,26,0.35)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                ⚠️ {preview.dstWarning}
              </div>
            )}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, maxHeight: 260, overflowY: 'auto' }}>
              {preview.plan.map((p, i) => {
                const cfg = p.status === 'ok' ? ['#15803d', 'rgba(34,197,94,0.08)', '✓'] : p.status === 'conflict' ? ['#dc2626', 'rgba(239,68,68,0.06)', '✕'] : ['#b45309', 'rgba(250,167,26,0.10)', '—'];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: '1px solid #f4f8fb', fontSize: 13 }}>
                    <span style={{ color: cfg[0], fontWeight: 800, width: 16 }}>{cfg[2]}</span>
                    {/* <span style={{ flex: 1, color: '#0f172a' }}>{fmt(p.startUtc, preview.timeZone)}</span> */}
                    <span style={{ flex: 1, color: '#0f172a' }}>{fmt(p.startUtc, preview.timeZone)}</span>
                    {preview.studentTimeZone && preview.studentTimeZone !== preview.timeZone && (
                      <span style={{ flex: 1, color: '#0e6e8a', fontSize: 12 }}>
                        student: {fmt(p.startUtc, preview.studentTimeZone)}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{p.durationMins}m</span>
                    {p.reason && <span style={{ fontSize: 11, color: cfg[0], background: cfg[1], borderRadius: 5, padding: '2px 7px' }}>{p.reason}</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={runCommit} disabled={busy || preview.summary.willCreate === 0} style={{ ...primaryBtn, opacity: (busy || preview.summary.willCreate === 0) ? 0.5 : 1, cursor: (busy || preview.summary.willCreate === 0) ? 'not-allowed' : 'pointer' }}>
                {busy ? 'Creating…' : `Create ${preview.summary.willCreate} sessions`}
              </button>
              <button onClick={() => setStep(3)} style={ghostBtn}>Back</button>
            </div>
          </div>
        )}

        {/* STEP 5 — result + sync */}
        {step === 5 && committed && (
          <div>
            <div style={{ textAlign: 'center', padding: '10px 0 18px' }}>
              <div style={{ fontSize: 34 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>{committed.createdCount} sessions created</div>
              {(committed.skipped.conflict > 0 || committed.skipped.blackout > 0) && (
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                  Skipped {committed.skipped.conflict} conflict(s), {committed.skipped.blackout} blackout(s).
                </div>
              )}
            </div>

            {/* {!syncResult ? (
              <div style={{ background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#334155', marginBottom: 12 }}>Add these to the teacher's Google Calendar now?</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button onClick={runSync} disabled={busy} style={{ ...primaryBtn, background: '#28b7d9' }}>{busy ? 'Syncing…' : '📅 Sync to Google Calendar'}</button>
                  <button onClick={() => { onDone?.(); onClose(); }} style={ghostBtn}>Skip</button>
                </div>
              </div>
            ) : (
              <div style={{ background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>Synced {syncResult.synced} · {syncResult.failed > 0 ? `${syncResult.failed} failed` : 'all good'}</div>
                {syncResult.failed > 0 && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>Some events failed — you can retry from the session list.</div>}
                <button onClick={() => { onDone?.(); onClose(); }} style={{ ...primaryBtn, marginTop: 12 }}>Done</button>
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ flex: 1, minWidth: 110, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primaryBtn = { padding: '10px 18px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer' };
const ghostBtn = { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' };