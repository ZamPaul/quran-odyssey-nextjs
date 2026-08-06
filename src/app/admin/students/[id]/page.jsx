'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/students/[id]/page.jsx   (NEW)
//
// The 360° learner profile. Header + actions (Edit, Move, Enrol, Delete),
// info + attendance summary, and tabbed sections: Enrolments, Sessions,
// Assignments, Reports, Trials, Requests.
// Consumes GET /api/admin/students/:id.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CountrySelect from '@/components/form/CountrySelect';
import TimezoneSelect from '@/components/form/TimezoneSelect';
import DeleteImpactModal from '@/components/admin/DeleteImpactModal';

function apiBase() { return process.env.NEXT_PUBLIC_API_URL; }

const COURSE_LABELS = { NOORANI_QAIDA: 'Noorani Qaida', QURAN_RECITATION: 'Quran Recitation', TAJWEED: 'Tajweed', HIFZ: 'Hifz', ISLAMIC_STUDIES: 'Islamic Studies', ONE_TO_ONE: '1-on-1' };
const COURSES = Object.entries(COURSE_LABELS).map(([value, label]) => ({ value, label }));

function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }
function fmtDateTime(iso) { return iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'; }
function ageFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob), now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

const TABS = ['Enrolments', 'Sessions', 'Assignments', 'Reports', 'Trials', 'Requests'];

export default function StudentProfilePage() {
  const { getToken } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Enrolments');
  const [modal, setModal] = useState(null); // 'edit' | 'move' | 'enroll' | 'delete'
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 404) throw new Error('Student not found');
      if (!res.ok) throw new Error('Failed to load student');
      setData(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (error) return (
    <div><Link href="/admin/students" style={backLink}>← Back to students</Link><div style={errBox}>⚠️ {error}</div></div>
  );

  const { student, attendance } = data;
  const displayAge = ageFromDob(student.dateOfBirth) ?? student.age;

  return (
    <div>
      <Link href="/admin/students" style={backLink}>← Back to students</Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #faa71a, #e8920a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#0d2840', flexShrink: 0 }}>
            {(student.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              {student.name}{student.isSelf && <span style={soloBadge}>SOLO ADULT</span>}
            </h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Age {displayAge} · {student.country} · {COURSE_LABELS[student.courseInterest] || student.courseInterest}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setModal('enroll')} style={{ ...ghostBtn, color: '#0e6e8a', borderColor: 'rgba(40,183,217,0.4)' }}>Enrol</button>
          <button onClick={() => setModal('edit')} style={ghostBtn}>Edit</button>
          <button onClick={() => setModal('move')} style={ghostBtn}>Move</button>
          <button onClick={() => setModal('delete')} style={{ ...ghostBtn, color: '#dc2626', borderColor: '#fecaca' }}>Delete</button>
        </div>
      </div>

      {msg && <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#15803d' }}>✓ {msg}</div>}

      {/* Info + attendance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
        <div style={card}>
          <div style={cardTitle}>Learner & Account</div>
          <InfoRow k="Account" v={<Link href={`/admin/accounts/${student.account.id}`} style={{ color: '#0e6e8a', fontWeight: 700, textDecoration: 'none' }}>{student.account.name || student.account.email}</Link>} />
          <InfoRow k="Account email" v={student.account.email} />
          <InfoRow k="Phone" v={student.account.phone || '—'} />
          <InfoRow k="Timezone" v={student.timezone} />
          <InfoRow k="Date of birth" v={fmtDate(student.dateOfBirth)} />
          <InfoRow k="Joined" v={fmtDate(student.createdAt)} />
        </div>
        <div style={card}>
          <div style={cardTitle}>Attendance</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
              <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="48" cy="48" r="40" fill="none" stroke="#f0f4f8" strokeWidth="10" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="#28b7d9" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - attendance.percentage / 100)}`} />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{attendance.percentage}%</div>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Present', attendance.present, '#22c55e'], ['Late', attendance.late, '#f97316'], ['Absent', attendance.absent, '#ef4444'], ['Excused', attendance.excused, '#8b5cf6']].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{l}</span>
                  <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, marginLeft: 'auto' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>{attendance.total} sessions tracked</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const counts = {
            Enrolments: student.enrollments.length, Sessions: student.classSessions.length,
            Assignments: student.assignments.length, Reports: student.progressReports.length,
            Trials: student.trialBookings.length, Requests: student.enrollmentRequests.length,
          };
          return (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 800 : 600, color: tab === t ? '#0d2840' : '#94a3b8', borderBottom: `2px solid ${tab === t ? '#28b7d9' : 'transparent'}`, marginBottom: -1 }}>
              {t} <span style={{ color: '#cbd5e1' }}>{counts[t]}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'Enrolments' && <EnrolmentsTab items={student.enrollments} />}
        {tab === 'Sessions' && <SessionsTab items={student.classSessions} />}
        {tab === 'Assignments' && <AssignmentsTab items={student.assignments} />}
        {tab === 'Reports' && <ReportsTab items={student.progressReports} />}
        {tab === 'Trials' && <TrialsTab items={student.trialBookings} />}
        {tab === 'Requests' && <RequestsTab items={student.enrollmentRequests} />}
      </div>

      {modal === 'edit' && <EditModal student={student} onClose={() => setModal(null)} onSaved={() => { setModal(null); setMsg('Student updated'); load(); }} />}
      {modal === 'move' && <MoveModal student={student} onClose={() => setModal(null)} onMoved={() => { setModal(null); setMsg('Student moved'); load(); }} />}
      {modal === 'enroll' && <EnrollModal student={student} onClose={() => setModal(null)} onEnrolled={() => { setModal(null); setMsg('Student enrolled — confirmation email sent'); load(); }} />}
      {/* {modal === 'delete' && <DeleteModal student={student} onClose={() => setModal(null)} onDeleted={() => router.push('/admin/students')} />} */}
      {modal === 'delete' && (
        <DeleteImpactModal
          kind="student"
          id={student.id}
          label={student.name}
          onClose={() => setModal(null)}
          onDeleted={() => router.push('/admin/students')}
        />
      )}
    </div>
  );
}

// ─── Tab components ───────────────────────────────────────
function EmptyTab({ label }) { return <div style={{ ...card, textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 30 }}>No {label} yet.</div>; }

function EnrolmentsTab({ items }) {
  if (!items.length) return <EmptyTab label="enrolments" />;
  return <div style={listWrap}>{items.map(e => (
    <div key={e.id} style={rowCard}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{COURSE_LABELS[e.courseType] || e.courseType}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Teacher: {e.teacher?.name || '—'} · {e.sessionsPerWeek}/wk · from {fmtDate(e.startDate)}</div>
      </div>
      <span style={statusPill(e.status)}>{e.status}</span>
    </div>
  ))}</div>;
}

function SessionsTab({ items }) {
  if (!items.length) return <EmptyTab label="sessions" />;
  return <div style={listWrap}>{items.map(s => (
    <div key={s.id} style={rowCard}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{COURSE_LABELS[s.courseType] || s.courseType}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{fmtDateTime(s.scheduledAt)} · {s.teacher?.name || '—'}</div>
      </div>
      <span style={statusPill(s.status)}>{s.status}</span>
    </div>
  ))}</div>;
}

function AssignmentsTab({ items }) {
  if (!items.length) return <EmptyTab label="assignments" />;
  return <div style={listWrap}>{items.map(a => (
    <div key={a.id} style={rowCard}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{a.title}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{a.teacher?.name || '—'} · due {fmtDate(a.dueDate)}{a.submission?.grade ? ` · Grade: ${a.submission.grade}` : ''}</div>
      </div>
      <span style={statusPill(a.status)}>{a.status}</span>
    </div>
  ))}</div>;
}

function ReportsTab({ items }) {
  if (!items.length) return <EmptyTab label="reports" />;
  return <div style={listWrap}>{items.map(r => (
    <div key={r.id} style={rowCard}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{r.period || 'Report'} · {COURSE_LABELS[r.courseType] || r.courseType}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{r.teacher?.name || '—'} · {fmtDate(r.createdAt)}</div>
      </div>
      <span style={statusPill(r.status)}>{r.status}</span>
    </div>
  ))}</div>;
}

function TrialsTab({ items }) {
  if (!items.length) return <EmptyTab label="trials" />;
  return <div style={listWrap}>{items.map(t => (
    <div key={t.id} style={rowCard}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{COURSE_LABELS[t.courseInterest] || t.courseInterest}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{fmtDateTime(t.slotStart)} · {t.teacher?.name || 'Unassigned'}</div>
      </div>
      <span style={statusPill(t.status)}>{t.status}</span>
    </div>
  ))}</div>;
}

function RequestsTab({ items }) {
  if (!items.length) return <EmptyTab label="requests" />;
  return <div style={listWrap}>{items.map(r => (
    <div key={r.id} style={rowCard}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{COURSE_LABELS[r.courseType] || r.courseType}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{fmtDate(r.createdAt)}{r.preferredTime ? ` · ${r.preferredTime}` : ''}</div>
      </div>
      <span style={statusPill(r.status)}>{r.status}</span>
    </div>
  ))}</div>;
}

// ─── Action modals ────────────────────────────────────────
function EditModal({ student, onClose, onSaved }) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    name: student.name || '', age: student.age || '', country: student.country || '',
    timezone: student.timezone || '', gender: student.gender || '',
    courseInterest: student.courseInterest || '',
    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0, 10) : '',
  });
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const body = { ...form };
      if (form.dateOfBirth) delete body.age; // DOB drives age
      const res = await fetch(`${apiBase()}/api/admin/students/${student.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onSaved();
    } catch (err) { setError(err.message); setSaving(false); }
  };
  return (
    <Modal title="Edit student" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Name</label><input value={form.name} onChange={e => set('name', e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Date of birth</label><input type="date" value={form.dateOfBirth} max={new Date().toISOString().slice(0,10)} onChange={e => set('dateOfBirth', e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Age {form.dateOfBirth && <span style={{ textTransform: 'none', color: '#cbd5e1' }}>(from DOB)</span>}</label><input type="number" value={form.dateOfBirth ? (ageFromDob(form.dateOfBirth) ?? '') : form.age} disabled={!!form.dateOfBirth} onChange={e => set('age', e.target.value)} style={{ ...inp, background: form.dateOfBirth ? '#f7f9fb' : 'white' }} /></div>
        <div><label style={lbl}>Gender</label><select value={form.gender} onChange={e => set('gender', e.target.value)} style={{ ...inp, cursor: 'pointer' }}><option value="">—</option><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
        {/* <div><label style={lbl}>Country</label><input value={form.country} onChange={e => set('country', e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Timezone</label><input value={form.timezone} onChange={e => set('timezone', e.target.value)} style={inp} /></div> */}
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
        {/* <div className="flex flex-col gap-0">
            <label style={lbl}>Country *</label>
            <CountrySelect value={form.country} onChange={(c) => set("country", c)} />
          </div> */}
        <div><label style={lbl}>Course</label><select value={form.courseInterest} onChange={e => set('courseInterest', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{COURSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
      </div>
      {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
      <ModalActions saving={saving} onSave={save} onClose={onClose} saveLabel="Save" />
    </Modal>
  );
}

function MoveModal({ student, onClose, onMoved }) {
  const { getToken } = useAuth();
  const [query, setQuery] = useState(''); const [accounts, setAccounts] = useState([]);
  const [target, setTarget] = useState(null); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    const t = setTimeout(async () => {
      try { const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/students/meta/accounts?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setAccounts((d.accounts || []).filter(a => a.id !== student.account.id)); }
      } catch {}
    }, 300); return () => clearTimeout(t);
  }, [query]);
  const move = async () => {
    setSaving(true); setError('');
    try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/students/${student.id}/move`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ accountId: target.id }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onMoved();
    } catch (err) { setError(err.message); setSaving(false); }
  };
  return (
    <Modal title="Move student to another account" onClose={onClose}>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>Currently under <strong>{student.account.email}</strong>.</div>
      {target ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: '1px solid #28b7d9', background: 'rgba(40,183,217,0.06)' }}>
          <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{target.name || target.email}</span>
          <button onClick={() => setTarget(null)} style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>change</button>
        </div>
      ) : (
        <>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search target account…" style={inp} />
          {accounts.length > 0 && (
            <div style={{ marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 8, maxHeight: 160, overflowY: 'auto' }}>
              {accounts.map(a => (
                <div key={a.id} onClick={() => setTarget(a)} style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #f4f8fb', color: '#0f172a' }}>
                  {a.name || a.email.split('@')[0]} <span style={{ color: '#94a3b8' }}>· {a.email}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
      <ModalActions saving={saving} disabled={!target} onSave={move} onClose={onClose} saveLabel="Move student" />
    </Modal>
  );
}

function EnrollModal({ student, onClose, onEnrolled }) {
  const { getToken } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ teacherId: '', courseType: student.courseInterest || '', sessionsPerWeek: '2', startDate: new Date().toISOString().slice(0, 10), notes: '' });
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  useEffect(() => {
    (async () => { try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/students/meta/teachers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setTeachers(d.teachers || []); }
    } catch {} })();
  }, []);
  const valid = form.teacherId && form.courseType;
  const enroll = async () => {
    setSaving(true); setError('');
    try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/students/${student.id}/enroll`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onEnrolled();
    } catch (err) { setError(err.message); setSaving(false); }
  };
  return (
    <Modal title={`Enrol ${student.name}`} onClose={onClose}>
      <div style={{ fontSize: 12, color: '#92400e', background: '#fff7e0', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
        This creates an active enrolment and emails the family a confirmation. (Recurring class sessions are scheduled separately under Sessions.)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Teacher *</label>
          <select value={form.teacherId} onChange={e => set('teacherId', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">Select a teacher…</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}{t.specialty?.length ? ` · ${t.specialty.join(', ')}` : ''}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Course *</label><select value={form.courseType} onChange={e => set('courseType', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{COURSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
        <div><label style={lbl}>Sessions / week</label><input type="number" min="1" max="7" value={form.sessionsPerWeek} onChange={e => set('sessionsPerWeek', e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Start date</label><input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={inp} /></div>
        <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Notes</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} /></div>
      </div>
      {error && <div style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>⚠️ {error}</div>}
      <ModalActions saving={saving} disabled={!valid} onSave={enroll} onClose={onClose} saveLabel="Enrol & notify" />
    </Modal>
  );
}

function DeleteModal({ student, onClose, onDeleted }) {
  const { getToken } = useAuth();
  const [typed, setTyped] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const del = async () => {
    setBusy(true); setError('');
    try { const token = await getToken();
      const res = await fetch(`${apiBase()}/api/admin/students/${student.id}?confirm=true`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || 'Failed'); onDeleted();
    } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <Modal title="Delete this student?" onClose={onClose} titleColor="#dc2626">
      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>
        Permanently deletes <strong>{student.name}</strong> and all their enrolments, sessions, assignments, attendance, and reports. This cannot be undone.
      </div>
      <label style={lbl}>Type the learner's name to confirm</label>
      <input value={typed} onChange={e => setTyped(e.target.value)} placeholder={student.name} style={{ ...inp, marginBottom: 18, borderColor: typed && typed !== student.name ? '#fecaca' : '#e2e8f0' }} />
      {error && <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>⚠️ {error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={del} disabled={busy || typed !== student.name} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: (busy || typed !== student.name) ? '#e2e8f0' : '#dc2626', color: (busy || typed !== student.name) ? '#94a3b8' : 'white', fontSize: 14, fontWeight: 800, cursor: (busy || typed !== student.name) ? 'not-allowed' : 'pointer' }}>{busy ? 'Deleting…' : 'Permanently delete'}</button>
        <button onClick={onClose} style={ghostBtn}>Cancel</button>
      </div>
    </Modal>
  );
}

// ─── shared bits ──────────────────────────────────────────
function Modal({ title, titleColor = '#0f172a', children, onClose }) {
  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={e => e.stopPropagation()} style={{ ...modalCard, maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: titleColor, marginBottom: 18 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ saving, disabled, onSave, onClose, saveLabel }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
      <button onClick={onSave} disabled={saving || disabled} style={{ ...primaryBtn, opacity: (saving || disabled) ? 0.5 : 1, cursor: (saving || disabled) ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving…' : saveLabel}</button>
      <button onClick={onClose} style={ghostBtn}>Cancel</button>
    </div>
  );
}

function InfoRow({ k, v }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f4f8fb', gap: 12 }}>
    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{k}</span>
    <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, textAlign: 'right' }}>{v}</span>
  </div>;
}

const STATUS_COLORS = { ACTIVE: ['#15803d', 'rgba(34,197,94,0.10)'], SCHEDULED: ['#0e6e8a', 'rgba(40,183,217,0.10)'], COMPLETED: ['#15803d', 'rgba(34,197,94,0.10)'], CANCELLED: ['#dc2626', 'rgba(239,68,68,0.08)'], MISSED: ['#b45309', 'rgba(250,167,26,0.14)'], PENDING: ['#64748b', '#f0f4f8'], SUBMITTED: ['#0e6e8a', 'rgba(40,183,217,0.10)'], GRADED: ['#15803d', 'rgba(34,197,94,0.10)'], OVERDUE: ['#dc2626', 'rgba(239,68,68,0.08)'], DRAFT: ['#64748b', '#f0f4f8'], SENT: ['#15803d', 'rgba(34,197,94,0.10)'], CONFIRMED: ['#0e6e8a', 'rgba(40,183,217,0.10)'], PAUSED: ['#b45309', 'rgba(250,167,26,0.14)'], UNDER_REVIEW: ['#0e6e8a', 'rgba(40,183,217,0.10)'], APPROVED: ['#15803d', 'rgba(34,197,94,0.10)'], REJECTED: ['#dc2626', 'rgba(239,68,68,0.08)'], AWAITING_PAYMENT: ['#b45309', 'rgba(250,167,26,0.14)'] };
function statusPill(s) { const [color, bg] = STATUS_COLORS[s] || ['#64748b', '#f0f4f8']; return { fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 5, padding: '3px 9px', flexShrink: 0 }; }

const backLink = { display: 'inline-block', fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 600, marginBottom: 16 };
const card = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 };
const cardTitle = { fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', marginBottom: 14 };
const listWrap = { display: 'flex', flexDirection: 'column', gap: 10 };
const rowCard = { display: 'flex', alignItems: 'center', gap: 12, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px' };
const soloBadge = { marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#0e6e8a', background: 'rgba(40,183,217,0.10)', padding: '2px 7px', borderRadius: 4, verticalAlign: 'middle' };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
const lbl = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', display: 'block', marginBottom: 6 };
const errBox = { padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(13,40,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 };
const modalCard = { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const primaryBtn = { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#0d2840', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' };
const ghostBtn = { padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' };