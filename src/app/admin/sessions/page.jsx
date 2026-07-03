'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/sessions/page.jsx   (REPLACE the Phase 1 stub)
//
// Cross-teacher schedule. Date-range + teacher/status filters, a
// grouped-by-day list, "+ New session" (with calendar event), and per-
// session actions: reschedule, set link, cancel, reassign.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import BulkAddSessionsModal from './BulkAddSessionsModal';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const COURSE_LABELS = { NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation', TAJWEED: 'Tajweed', HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1' };
const COURSES = Object.entries(COURSE_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_CFG = { SCHEDULED: ['#0e6e8a', 'rgba(40,183,217,0.10)'], COMPLETED: ['#15803d', 'rgba(34,197,94,0.10)'], CANCELLED: ['#64748b', '#f0f4f8'], MISSED: ['#dc2626', 'rgba(239,68,68,0.08)'] };
function pill(s) { const [c, b] = STATUS_CFG[s] || ['#64748b', '#f0f4f8']; return { fontSize: 11, fontWeight: 700, color: c, background: b, borderRadius: 5, padding: '3px 9px' }; }

function isoDate(d) { return new Date(d).toISOString().slice(0, 10); }
function fmtTime(iso) { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
function dayLabel(iso) {
  const d = new Date(iso); const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((new Date(isoDate(d)) - today) / 86400000);
  const base = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  if (diff === 0) return `Today · ${base}`;
  if (diff === 1) return `Tomorrow · ${base}`;
  if (diff === -1) return `Yesterday · ${base}`;
  return base;
}

export default function SessionsPage() {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [showBulk, setShowBulk] = useState(false);

  const today = new Date();
  const weekAhead = new Date(); weekAhead.setDate(today.getDate() + 7);
  const [from, setFrom] = useState(isoDate(today));
  const [to, setTo] = useState(isoDate(weekAhead));
  const [teacherId, setTeacherId] = useState('');
  const [status, setStatus] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const params = new URLSearchParams({ from, to });
      if (teacherId) params.set('teacherId', teacherId);
      if (status) params.set('status', status);
      if (studentId) params.set('studentId', studentId);
      const res = await fetch(`${apiBase()}/api/admin/sessions?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load sessions');
      const d = await res.json();
      setSessions(d.sessions || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [from, to, teacherId, status, studentId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    (async () => { try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/sessions/meta/teachers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setTeachers(d.teachers || []); }
    } catch {} })();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!studentQuery.trim()) { setStudentOptions([]); return; }
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/sessions/meta/students?q=${encodeURIComponent(studentQuery)}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setStudentOptions(d.students || []); }
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [studentQuery]);

  // group by day
  const groups = {};
  for (const s of sessions) { const k = isoDate(s.scheduledAt); (groups[k] ||= []).push(s); }
  const dayKeys = Object.keys(groups).sort();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: "10px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Class Sessions</h1>
        <div className='flex items-center justify-center gap-3'>
          <button onClick={() => setShowCreate(true)} style={primaryBtn}>+ New session</button>
          <button onClick={() => setShowBulk(true)} style={ghostBtn}>Bulk add</button>
        </div>
      </div>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Platform-wide schedule across all teachers.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>From</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={selStyle} />
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={selStyle} />
        </div>
        <select value={teacherId} onChange={e => setTeacherId(e.target.value)} style={selStyle}>
          <option value="">All teachers</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {/* Student filter */}
        {studentId ? (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:8, border:'1px solid #28b7d9', background:'rgba(40,183,217,0.06)' }}>
            <span style={{ fontSize:13, color:'#0f172a', fontWeight:600 }}>
              {studentOptions.find(s => s.id === studentId)?.name || 'Student'}
            </span>
            <button onClick={() => { setStudentId(''); setStudentQuery(''); }} style={{ border:'none', background:'none', cursor:'pointer', color:'#64748b', fontSize:14 }}>✕</button>
          </div>
        ) : (
          <div style={{ position:'relative' }}>
            <input
              value={studentQuery}
              onChange={e => setStudentQuery(e.target.value)}
              placeholder="Filter by student…"
              style={selStyle}
            />
            {studentOptions.length > 0 && (
              <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:40, background:'white', border:'1px solid #e2e8f0', borderRadius:8, maxHeight:180, overflowY:'auto', boxShadow:'0 8px 24px rgba(13,40,64,0.12)' }}>
                {studentOptions.map(s => (
                  <div key={s.id} onClick={() => { setStudentId(s.id); setStudentOptions([]); }} style={{ padding:'8px 12px', fontSize:13, cursor:'pointer', color:'#0f172a' }}>
                    {s.name} <span style={{ color:'#94a3b8' }}>· {s.account?.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <select value={status} onChange={e => setStatus(e.target.value)} style={selStyle}>
          <option value="">All statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="MISSED">Missed</option>
        </select>
      </div>

      {error && <div style={errBox}>⚠️ {error}</div>}

      {loading ? <div style={emptyStyle}>Loading…</div>
        : dayKeys.length === 0 ? <div style={{ ...card, ...emptyStyle }}>No sessions in this range.</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {dayKeys.map(day => (
              <div key={day}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0d2840', marginBottom: 10 }}>{dayLabel(day)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {groups[day].map(s => (
                    <div key={s.id} onClick={() => setSelected(s)} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '14px 18px' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#28b7d9'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', width: 56, flexShrink: 0 }}>{fmtTime(s.scheduledAt)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.student?.name} <span style={{ fontWeight: 500, color: '#94a3b8' }}>· {COURSE_LABELS[s.courseType] || s.courseType}</span></div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>👩‍🏫 {s.teacher?.name}{s.zoomLink ? ' · 📹 link' : ''}{s.attendance ? ` · ✓ ${s.attendance.status}` : ''}</div>
                      </div>
                      <span style={pill(s.status)}>{s.status}</span>
                      <span style={{ color: '#cbd5e1', fontSize: 16 }}>›</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      {showBulk && <BulkAddSessionsModal onClose={() => setShowBulk(false)} onDone={load} />}
      {showCreate && <CreateSessionModal teachers={teachers} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
      {selected && <SessionPanel session={selected} teachers={teachers} onClose={() => setSelected(null)} onChanged={() => { setSelected(null); load(); }} />}
    </div>
  );
}

// ─── Create session modal ─────────────────────────────────
function CreateSessionModal({ teachers, onClose, onCreated }) {
  const { getToken } = useAuth();
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({ teacherId: '', courseType: '', scheduledAt: '', durationMins: '30', zoomLink: '', enrollmentId: '' });
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const t = setTimeout(async () => {
      try { const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/sessions/meta/students?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setStudents(d.students || []); }
      } catch {}
    }, 300); return () => clearTimeout(t);
  }, [query]);

  // When a student is picked, default course + teacher from an active enrollment
  const pickStudent = (s) => {
    setStudent(s);
    const activeEnr = s.enrollments?.[0];
    setForm(p => ({ ...p, courseType: activeEnr?.courseType || s.courseInterest || '', teacherId: activeEnr?.teacherId || '', enrollmentId: activeEnr?.id || '' }));
  };

  const valid = student && form.teacherId && form.courseType && form.scheduledAt;
  const submit = async () => {
    setSaving(true); setError('');
    try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, studentId: student.id, scheduledAt: new Date(form.scheduledAt).toISOString() }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onCreated();
    } catch (err) { setError(err.message); setSaving(false); }
  };

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>New session</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 18 }}>Creates a class session and an event on the teacher's calendar.</div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Student *</label>
          {student ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: '1px solid #28b7d9', background: 'rgba(40,183,217,0.06)' }}>
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{student.name} <span style={{ color: '#94a3b8' }}>· {student.account?.email}</span></span>
              <button onClick={() => { setStudent(null); set('enrollmentId', ''); }} style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>change</button>
            </div>
          ) : (
            <>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search student by name…" style={inp} />
              {students.length > 0 && (
                <div style={{ marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 8, maxHeight: 140, overflowY: 'auto' }}>
                  {students.map(s => (
                    <div key={s.id} onClick={() => pickStudent(s)} style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #f4f8fb', color: '#0f172a' }}>
                      {s.name} <span style={{ color: '#94a3b8' }}>· {s.account?.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Teacher *</label>
            <select value={form.teacherId} onChange={e => set('teacherId', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">Select…</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Course *</label>
            <select value={form.courseType} onChange={e => set('courseType', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">Select…</option>{COURSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Duration (min)</label><input type="number" value={form.durationMins} onChange={e => set('durationMins', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Date & time *</label><input type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Zoom link</label><input value={form.zoomLink} onChange={e => set('zoomLink', e.target.value)} placeholder="optional" style={inp} /></div>
        </div>
        {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={submit} disabled={saving || !valid} style={{ ...primaryBtn, opacity: (saving || !valid) ? 0.5 : 1, cursor: (saving || !valid) ? 'not-allowed' : 'pointer' }}>{saving ? 'Creating…' : 'Create session'}</button>
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Session panel (edit / reschedule / cancel / reassign) ──
function SessionPanel({ session, teachers, onClose, onChanged }) {
  const { getToken } = useAuth();
  const [zoomLink, setZoomLink] = useState(session.zoomLink || '');
  const [slotStart, setSlotStart] = useState(new Date(session.scheduledAt).toISOString().slice(0, 16));
  const [reTeacher, setReTeacher] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');

  const call = async (path, body, method = 'POST') => {
    setBusy(true); setError('');
    try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/sessions/${session.id}${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onChanged();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  const cancelled = session.status === 'CANCELLED';

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{session.student?.name}</div>
          <span style={pill(session.status)}>{session.status}</span>
        </div>
        <div style={{ background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <DRow k="Course" v={COURSE_LABELS[session.courseType] || session.courseType} />
          <DRow k="Teacher" v={session.teacher?.name} />
          <DRow k="When" v={new Date(session.scheduledAt).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} />
          <DRow k="Duration" v={`${session.durationMins} min`} />
          {session.attendance && <DRow k="Attendance" v={session.attendance.status} />}
        </div>

        {!cancelled && (
          <>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Zoom link</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={zoomLink} onChange={e => setZoomLink(e.target.value)} placeholder="https://zoom.us/…" style={inp} />
                <button onClick={() => call('', { zoomLink }, 'PATCH')} disabled={busy} style={ghostBtn}>Save</button>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Reschedule</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="datetime-local" value={slotStart} onChange={e => setSlotStart(e.target.value)} style={inp} />
                <button onClick={() => call('', { scheduledAt: new Date(slotStart).toISOString() }, 'PATCH')} disabled={busy} style={ghostBtn}>Update</button>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}><label style={lbl}>Reassign teacher</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={reTeacher} onChange={e => setReTeacher(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Move to…</option>
                  {teachers.filter(t => t.id !== session.teacher?.id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button onClick={() => { if (!reTeacher) { setError('Pick a teacher'); return; } call('/reassign', { toTeacherId: reTeacher }); }} disabled={busy} style={ghostBtn}>Move</button>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Moves the calendar event to the new teacher's calendar.</div>
            </div>
          </>
        )}

        {error && <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!cancelled && <button onClick={() => call('/cancel', {})} disabled={busy} style={{ ...ghostBtn, color: '#dc2626', borderColor: '#fecaca' }}>Cancel session</button>}
          <button onClick={onClose} style={ghostBtn}>Close</button>
        </div>
      </div>
    </div>
  );
}

function DRow({ k, v }) { return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', gap: 12 }}><span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{k}</span><span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{v}</span></div>; }

const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, transition: 'border-color 150ms' };
const emptyStyle = { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 };
const selStyle = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0f172a', background: 'white', cursor: 'pointer' };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };
const errBox = { padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primaryBtn = { padding: '9px 18px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer' };
const ghostBtn = { padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' };