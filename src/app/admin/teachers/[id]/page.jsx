'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/teachers/[id]/page.jsx
//
// Teacher profile: details, workload (active vs history), active students,
// recent sessions, and actions — edit, activate/deactivate, reassign a
// single enrolment, reassign all active work (offboarding), and delete.
//
// Deletion is guarded: a teacher who holds ANY record cannot be deleted,
// because those records are the history of who actually taught each child.
// Reassignment hands over active work; history stays put. In practice a
// teacher who has taught is deactivated, never deleted.
//
// Consumes GET /api/admin/teachers/:id and GET /api/admin/teachers/:id/workload.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CountrySelect from '@/components/form/CountrySelect';
import TimezoneSelect from '@/components/form/TimezoneSelect';
import CredentialsModal from '@/components/admin/CredentialsModal';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const SPECIALTY_LABELS = { NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation', TAJWEED: 'Tajweed', HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1' };
const COURSE_LABELS = SPECIALTY_LABELS;
const SPECIALTIES = Object.entries(SPECIALTY_LABELS).map(([value, label]) => ({ value, label }));

const ACTIVE_LABELS = { enrollments: 'Enrolments', sessions: 'Upcoming sessions', assignments: 'Open assignments', reports: 'Draft reports' };
const HISTORY_LABELS = { sessions: 'Past sessions', assignments: 'Graded assignments', reports: 'Sent reports', attendance: 'Attendance records' };

function fmtDateTime(iso) { return iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'; }

export default function TeacherProfilePage() {
  const { getToken } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  const [teacher, setTeacher] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // 'edit' | 'reassign' | 'reassignAll' | 'delete'
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/teachers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 404) throw new Error('Teacher not found');
      if (!res.ok) throw new Error('Failed to load teacher');
      const d = await res.json();
      setTeacher(d.teacher);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [id]);

  const loadWorkload = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/teachers/${id}/workload`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setWorkload(await res.json());
    } catch { /* workload is supplementary — never block the page */ }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadWorkload(); }, [loadWorkload]);

  const refreshAll = () => { load(); loadWorkload(); };

  const toggleActive = async () => {
    setBusy(true); setMsg('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/teachers/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !teacher.isActive }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      setMsg(teacher.isActive
        ? `Teacher deactivated${d.activeEnrollments ? ` — they had ${d.activeEnrollments} active enrolment(s). Consider reassigning.` : '.'}`
        : 'Teacher reactivated — portal access restored.');
      refreshAll();
    } catch (err) { setMsg('⚠️ ' + err.message); }
    finally { setBusy(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error) return <div><Link href="/admin/teachers" style={backLink}>← Back to teachers</Link><div style={errBox}>⚠️ {error}</div></div>;

  const canDelete = workload?.canDelete === true;

  return (
    <div>
      <Link href="/admin/teachers" style={backLink}>← Back to teachers</Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #28b7d9, #0e6e8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white', flexShrink: 0 }}>
            {(teacher.name || 'T').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{teacher.name}</h1>
              <span style={{ fontSize: 11, fontWeight: 700, color: teacher.isActive ? '#15803d' : '#b45309', background: teacher.isActive ? 'rgba(34,197,94,0.10)' : 'rgba(250,167,26,0.14)', borderRadius: 5, padding: '3px 9px' }}>
                {teacher.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              {teacher.email} · {teacher.timezone}{teacher.country ? ` · ${teacher.country}` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setModal('reassign')} style={{ ...ghostBtn, color: '#0e6e8a', borderColor: 'rgba(40,183,217,0.4)' }}>Reassign student</button>
          <button onClick={() => setModal('edit')} style={ghostBtn}>Edit</button>
          <button onClick={toggleActive} disabled={busy} style={{ ...ghostBtn, color: teacher.isActive ? '#b45309' : '#15803d', borderColor: teacher.isActive ? 'rgba(250,167,26,0.5)' : 'rgba(34,197,94,0.4)' }}>
            {teacher.isActive ? 'Deactivate' : 'Reactivate'}
          </button>
          <button onClick={() => setModal('credentials')} style={ghostBtn}>Sign-in help</button>
          <button
            onClick={() => canDelete && setModal('delete')}
            disabled={!canDelete}
            title={canDelete ? 'Delete this teacher' : (workload?.reason || 'Checking records…')}
            style={{ ...ghostBtn,
              color: canDelete ? '#dc2626' : '#cbd5e1',
              borderColor: canDelete ? '#fecaca' : '#e2e8f0',
              cursor: canDelete ? 'pointer' : 'not-allowed' }}
          >
            Delete
          </button>
        </div>
      </div>

      {msg && <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: msg.startsWith('⚠️') ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${msg.startsWith('⚠️') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, color: msg.startsWith('⚠️') ? '#dc2626' : '#15803d' }}>{msg}</div>}

      {!teacher.userId && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(250,167,26,0.10)', border: '1px solid rgba(250,167,26,0.3)', color: '#92400e' }}>
          ⚠️ This teacher has no linked sign-in account. They cannot access the teacher portal until linked.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
        <div style={card}>
          <div style={cardTitle}>Profile</div>
          <InfoRow k="Email" v={teacher.email} />
          <InfoRow k="Gender" v={teacher.gender} />
          <InfoRow k="Country" v={teacher.country || '—'} />
          <InfoRow k="Timezone" v={teacher.timezone} />
          {/* <InfoRow k="Rating" v={`${teacher.rating?.toFixed(1) ?? '0.0'} / 5`} /> */}
          {/* <InfoRow k="Calendar ID" v={<span style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>{teacher.calendarId}</span>} /> */}
          <InfoRow k="Specialties" v={(teacher.specialty || []).map(s => SPECIALTY_LABELS[s] || s).join(', ') || '—'} />
          {teacher.bio && <div style={{ marginTop: 12, fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{teacher.bio}</div>}
        </div>

        <div style={card}>
          <div style={cardTitle}>Workload</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[['Active students', teacher.enrollments.length], ['Total sessions', teacher._count.classSessions], ['Reports', teacher._count.progressReports]].map(([l, v]) => (
              <div key={l} style={{ textAlign: 'center', padding: '14px 8px', background: '#f7f9fb', borderRadius: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{v}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Active vs history — what can be handed over, and what never moves */}
          {workload && (
            <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0e6e8a', marginBottom: 6 }}>Active: can be handed over</div>
                  {Object.entries(workload.active).map(([k, v]) => (
                    <div key={k} style={miniRow}>
                      <span style={{ color: '#64748b' }}>{ACTIVE_LABELS[k] || k}</span>
                      <span style={{ fontWeight: 700, color: v > 0 ? '#0f172a' : '#cbd5e1' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', marginBottom: 6 }}>History: never moved</div>
                  {Object.entries(workload.historical).map(([k, v]) => (
                    <div key={k} style={miniRow}>
                      <span style={{ color: '#64748b' }}>{HISTORY_LABELS[k] || k}</span>
                      <span style={{ fontWeight: 700, color: v > 0 ? '#0f172a' : '#cbd5e1' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setModal('reassignAll')}
                  disabled={workload.activeTotal === 0}
                  style={{ ...ghostBtn,
                    color: workload.activeTotal === 0 ? '#cbd5e1' : '#0e6e8a',
                    borderColor: workload.activeTotal === 0 ? '#e2e8f0' : 'rgba(40,183,217,0.4)',
                    cursor: workload.activeTotal === 0 ? 'not-allowed' : 'pointer' }}
                >
                  Hand over all active work
                </button>
                {workload.reason && (
                  <span style={{ fontSize: 11.5, color: '#94a3b8', flex: 1, minWidth: 180, lineHeight: 1.5 }}>{workload.reason}</span>
                )}
              </div>
            </div>
          )}

          {/* Availability is read from Google Calendar — link out rather than embed */}
          {/* <div style={{ marginTop: 16, padding: '12px 14px', background: '#f7f9fb', borderRadius: 10, fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            📅 Availability lives in this teacher&apos;s Google Calendar. Open Google Calendar to view or resolve booking conflicts.
          </div> */}
        </div>
      </div>

      {/* Active students */}
      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Active students ({teacher.enrollments.length})</div>
      {teacher.enrollments.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 24, marginBottom: 22 }}>No active enrolments.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          {teacher.enrollments.map(e => (
            <div key={e.id} style={rowCard}>
              <Link href={`/admin/students/${e.student.id}`} style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textDecoration: 'none', flex: 1 }}>{e.student.name}</Link>
              <span style={{ fontSize: 12, color: '#64748b' }}>{COURSE_LABELS[e.courseType] || e.courseType} · {e.student.country}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent sessions */}
      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Recent sessions</div>
      {teacher.classSessions.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 24 }}>No sessions yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {teacher.classSessions.map(s => (
            <div key={s.id} style={rowCard}>
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, flex: 1 }}>{s.student?.name || '—'}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{fmtDateTime(s.scheduledAt)}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f0f4f8', borderRadius: 5, padding: '2px 8px' }}>{s.status}</span>
            </div>
          ))}
        </div>
      )}

      {modal === 'edit' && <EditModal teacher={teacher} onClose={() => setModal(null)} onSaved={() => { setModal(null); setMsg('Teacher updated'); refreshAll(); }} />}
      {modal === 'reassign' && <ReassignModal teacher={teacher} onClose={() => setModal(null)} onDone={(m) => { setModal(null); setMsg(m); refreshAll(); }} />}
      {modal === 'reassignAll' && <ReassignAllModal teacher={teacher} onClose={() => setModal(null)} onDone={(m) => { setModal(null); setMsg(m); refreshAll(); }} />}
      {modal === 'delete' && <DeleteTeacherModal teacher={teacher} onClose={() => setModal(null)} onDeleted={() => router.push('/admin/teachers')} />}
      {modal === 'credentials' && (
        <CredentialsModal
          base="teachers"
          id={teacher.id}
          label={teacher.email}
          name={teacher.name}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────
function EditModal({ teacher, onClose, onSaved }) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    name: teacher.name || '', timezone: teacher.timezone || '', gender: teacher.gender || '',
    bio: teacher.bio || '', rating: teacher.rating ?? 0, calendarId: teacher.calendarId || '',
    specialty: teacher.specialty || [], country: teacher.country || '',
  });
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleSpec = (val) => setForm(p => ({ ...p, specialty: p.specialty.includes(val) ? p.specialty.filter(s => s !== val) : [...p.specialty, val] }));

  const save = async () => {
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/teachers/${teacher.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onSaved();
    } catch (err) { setError(err.message); setSaving(false); }
  };

  return (
    <Modal title="Edit teacher" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Name</label><input value={form.name} onChange={e => set('name', e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Gender</label><select value={form.gender} onChange={e => set('gender', e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Country</label>
          <CountrySelect value={form.country} onChange={(c) => set('country', c)} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Timezone</label>
          <TimezoneSelect
            country={form.country}
            value={form.timezone}
            onChange={(tz) => set('timezone', tz)}
          />
        </div>
        {/* <div><label style={lbl}>Rating (0–5)</label><input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => set('rating', e.target.value)} style={inp} /></div> */}
        {/* <div><label style={lbl}>Calendar ID</label><input value={form.calendarId} onChange={e => set('calendarId', e.target.value)} style={inp} /></div> */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Specialties</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SPECIALTIES.map(s => (
              <button key={s.value} type="button" onClick={() => toggleSpec(s.value)}
                style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${form.specialty.includes(s.value) ? '#28b7d9' : '#e2e8f0'}`, background: form.specialty.includes(s.value) ? 'rgba(40,183,217,0.10)' : 'white', color: form.specialty.includes(s.value) ? '#0e6e8a' : '#64748b' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Bio</label><textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} /></div>
      </div>
      {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
      <ModalActions saving={saving} onSave={save} onClose={onClose} saveLabel="Save" />
    </Modal>
  );
}

// ─── Reassign ONE enrolment ───────────────────────────────
// POST /:id/reassign   { enrollmentId, toTeacherId, reassignSessions }
function ReassignModal({ teacher, onClose, onDone }) {
  const { getToken } = useAuth();
  const [enrollmentId, setEnrollmentId] = useState('');
  const [toTeacherId, setToTeacherId] = useState('');
  const [reassignSessions, setReassignSessions] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');

  useEffect(() => {
    (async () => { try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/teachers?active=true`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setTeachers((d.teachers || []).filter(t => t.id !== teacher.id)); }
    } catch {} })();
  }, []);

  const valid = enrollmentId && toTeacherId;
  const submit = async () => {
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/teachers/${teacher.id}/reassign`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enrollmentId, toTeacherId, reassignSessions }),
      });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed');
      onDone(`Enrolment reassigned${d.movedSessions ? ` · ${d.movedSessions} future session(s) moved` : ''}.`);
    } catch (err) { setError(err.message); setSaving(false); }
  };

  return (
    <Modal title="Reassign a student's enrolment" onClose={onClose}>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Move one of {teacher.name}&apos;s active enrolments to another teacher.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={lbl}>Enrolment to move *</label>
          <select value={enrollmentId} onChange={e => setEnrollmentId(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">Select an enrolment…</option>
            {teacher.enrollments.map(e => <option key={e.id} value={e.id}>{e.student.name} · {COURSE_LABELS[e.courseType] || e.courseType}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>New teacher *</label>
          <select value={toTeacherId} onChange={e => setToTeacherId(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">Select a teacher…</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#0f172a', cursor: 'pointer' }}>
          <input type="checkbox" checked={reassignSessions} onChange={e => setReassignSessions(e.target.checked)} />
          Also move this enrolment&apos;s future scheduled sessions
        </label>
      </div>
      {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
      <ModalActions saving={saving} disabled={!valid} onSave={submit} onClose={onClose} saveLabel="Reassign" />
    </Modal>
  );
}

// ─── Hand over ALL active work (offboarding) ──────────────
// POST /:id/reassign-all   { toTeacherId, scope }
function ReassignAllModal({ teacher, onClose, onDone }) {
  const { getToken } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [toTeacherId, setToTeacherId] = useState('');
  const [scope, setScope] = useState('future');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => {
    (async () => { try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/teachers?active=true`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setTeachers((d.teachers || []).filter(t => t.id !== teacher.id)); }
    } catch {} })();
  }, []);

  const targetName = teachers.find(t => t.id === toTeacherId)?.name || 'the new teacher';

  const run = async () => {
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/teachers/${teacher.id}/reassign-all`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toTeacherId, scope }),
      });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed');
      setDone(d);
    } catch (err) { setError(err.message); setSaving(false); }
  };

  if (done) {
    return (
      <Modal title={`Handed over to ${done.to}`} onClose={() => onDone(`Active work handed over to ${done.to}.`)}>
        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 14 }}>
          Moved {done.moved.enrollments} enrolment(s), {done.moved.sessions} session(s),
          {' '}{done.moved.assignments} assignment(s), {done.moved.reports} report(s)
          {done.moved.attendance ? `, ${done.moved.attendance} attendance record(s)` : ''}.
        </div>
        {done.calendarResyncNeeded && (
          <div style={warnBox}>
            Moved sessions no longer have calendar events. Run <strong>Sync calendar</strong> from Class Sessions
            so they appear on {done.to}&apos;s calendar.
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button onClick={() => onDone(`Active work handed over to ${done.to}.`)} style={primaryBtn}>Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`Hand over ${teacher.name}'s work`} onClose={onClose}>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
        Moves everything currently in progress to another active teacher, for offboarding or extended absence.
      </div>
      {error && <div style={{ ...errBox, marginBottom: 12 }}>⚠️ {error}</div>}

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>New teacher *</label>
        <select value={toTeacherId} onChange={e => setToTeacherId(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
          <option value="">Select a teacher…</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <label style={lbl}>What to move</label>
      <label style={radioRow}>
        <input type="radio" checked={scope === 'future'} onChange={() => setScope('future')} style={{ marginTop: 3 }} />
        <span><strong>Active work only</strong>: enrolments, upcoming sessions, ungraded assignments and draft reports. Past lessons stay with {teacher.name}.</span>
      </label>
      <label style={radioRow}>
        <input type="radio" checked={scope === 'all'} onChange={() => setScope('all')} style={{ marginTop: 3 }} />
        <span><strong>Everything, including history</strong>:  also rewrites completed lessons, graded work and attendance.</span>
      </label>

      {scope === 'all' && (
        <div style={{ ...errBox, marginTop: 10, lineHeight: 1.6 }}>
          This will make it appear that {targetName} taught lessons they did not. Only use it to correct a
          data entry mistake. It is recorded separately in the audit log.
        </div>
      )}

      <ModalActions saving={saving} disabled={!toTeacherId} onSave={run} onClose={onClose} saveLabel="Hand over" />
    </Modal>
  );
}

// ─── Delete teacher (guarded) ─────────────────────────────
function DeleteTeacherModal({ teacher, onClose, onDeleted }) {
  const { getToken } = useAuth();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(null); // counts returned by a 409

  const matches = typed === teacher.name;

  const del = async () => {
    setBusy(true); setError(''); setBlocked(null);
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/teachers/${teacher.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ confirmName: typed }),
      });
      const d = await res.json();
      if (!res.ok) {
        if (d.counts) { setBlocked(d); setError(d.error); return; }
        throw new Error(d.error || 'Failed');
      }
      onDeleted();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <Modal title="Delete this teacher?" onClose={onClose}>
      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 14 }}>
        Permanently removes <strong>{teacher.name}</strong>. Only possible because they hold no sessions,
        enrolments, assignments, reports or attendance records. <strong>Cannot be undone.</strong>
      </div>

      {error && <div style={{ ...errBox, marginBottom: 12 }}>⚠️ {error}</div>}

      {blocked && (
        <div style={{ ...warnBox, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Still linked to:</div>
          {Object.entries(blocked.counts).filter(([, v]) => v > 0).map(([k, v]) => (
            <div key={k} style={miniRow}><span style={{ textTransform: 'capitalize' }}>{k}</span><span style={{ fontWeight: 700 }}>{v}</span></div>
          ))}
          {blocked.guidance && <div style={{ marginTop: 8 }}>{blocked.guidance}</div>}
        </div>
      )}

      <label style={lbl}>Type the teacher&apos;s name to confirm</label>
      <input value={typed} onChange={e => setTyped(e.target.value)} placeholder={teacher.name}
        style={{ ...inp, marginBottom: 16, borderColor: typed && !matches ? '#fecaca' : '#e2e8f0' }} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={del} disabled={busy || !matches}
          style={{ ...primaryBtn, background: (busy || !matches) ? '#e2e8f0' : '#dc2626', color: (busy || !matches) ? '#94a3b8' : 'white', cursor: (busy || !matches) ? 'not-allowed' : 'pointer' }}>
          {busy ? 'Deleting…' : 'Permanently delete'}
        </button>
        <button onClick={onClose} disabled={busy} style={ghostBtn}>Cancel</button>
      </div>
    </Modal>
  );
}

// ─── shared ───────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  return <div onClick={onClose} style={modalOverlay}><div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 18 }}>{title}</div>{children}
  </div></div>;
}

function ModalActions({ saving, disabled, onSave, onClose, saveLabel }) {
  return <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
    <button onClick={onSave} disabled={saving || disabled} style={{ ...primaryBtn, opacity: (saving || disabled) ? 0.5 : 1, cursor: (saving || disabled) ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving…' : saveLabel}</button>
    <button onClick={onClose} style={ghostBtn}>Cancel</button>
  </div>;
}

function InfoRow({ k, v }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f4f8fb', gap: 12 }}>
    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{k}</span>
    <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, textAlign: 'right' }}>{v}</span>
  </div>;
}

const backLink = { display: 'inline-block', fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 600, marginBottom: 16 };
const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 };
const cardTitle = { fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', marginBottom: 14 };
const rowCard = { display: 'flex', alignItems: 'center', gap: 12, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px' };
const miniRow = { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '2px 0' };
const radioRow = { display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: '#334155', marginBottom: 10, lineHeight: 1.6, cursor: 'pointer' };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };
const errBox = { padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13 };
const warnBox = { padding: '12px 16px', borderRadius: 10, background: 'rgba(250,167,26,0.12)', border: '1px solid rgba(250,167,26,0.3)', color: '#92400e', fontSize: 12.5, lineHeight: 1.6 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primaryBtn = { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' };
const ghostBtn = { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' };