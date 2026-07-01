// app/booking/trial/page.jsx  — REWORKED for multi-learner
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth, useUser }  from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfileGate } from '@/hooks/useProfileGate';
import Link from 'next/link';

const COURSE_OPTIONS = [
  { value: 'NOORANI_QAIDA',    label: 'Noorani Qaida',      desc: 'Arabic alphabet & basic reading · Ages 5–10' },
  { value: 'QURAN_RECITATION', label: 'Quran Recitation',   desc: 'Fluent recitation with Tajweed · All ages' },
  { value: 'TAJWEED',          label: 'Tajweed Rules',      desc: 'Science of correct recitation · Ages 8+' },
  { value: 'HIFZ',             label: 'Hifz Programme',     desc: 'Full Quran memorisation · Ages 7+' },
  { value: 'ISLAMIC_STUDIES',  label: 'Islamic Studies',    desc: 'Stories, pillars, character · Ages 6–14' },
  { value: 'ONE_TO_ONE',       label: 'One-to-One Private', desc: 'Fully custom · All ages & levels' },
];

const COURSE_LABELS = COURSE_OPTIONS.reduce((acc, c) => { acc[c.value] = c.label; return acc; }, {});

const GENDER_OPTIONS = [
  { value: 'NO_PREFERENCE', label: 'No Preference' },
  { value: 'FEMALE',        label: 'Female Teacher' },
  { value: 'MALE',          label: 'Male Teacher'   },
];

const COUNTRIES = [
  'United Kingdom', 'United States', 'Canada', 'Australia',
  'Ireland', 'South Africa', 'New Zealand', 'Other',
];

// ── Helpers ───────────────────────────────────────────────
function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function toLocalDateKey(isoString, tz) {
  return new Date(isoString).toLocaleDateString('en-US', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

function toLocalDateLabel(isoString, tz) {
  const d = new Date(isoString);
  const isToday    = toLocalDateKey(isoString, tz) === toLocalDateKey(new Date().toISOString(), tz);
  const isTomorrow = toLocalDateKey(isoString, tz) === toLocalDateKey(new Date(Date.now() + 86400000).toISOString(), tz);
  const dateStr = d.toLocaleDateString('en-GB', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' });
  if (isToday)    return `Today — ${dateStr}`;
  if (isTomorrow) return `Tomorrow — ${dateStr}`;
  return dateStr;
}

function toLocalTime(isoString, tz) {
  return new Date(isoString).toLocaleTimeString('en-GB', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function groupSlotsByDate(slots, tz) {
  const groups = {};
  slots.forEach(iso => {
    const key = toLocalDateKey(iso, tz);
    if (!groups[key]) groups[key] = { label: toLocalDateLabel(iso, tz), slots: [] };
    groups[key].slots.push(iso);
  });
  return Object.values(groups);
}

// ── Step indicator ────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Learner & Details', 'Choose a Time', 'Confirm'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((label, i) => {
        const n      = i + 1;
        const active = step === n;
        const done   = step > n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#22c55e' : active ? '#0d2840' : '#e2e8f0', color: done || active ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>
                {done ? '✓' : n}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: active ? '#0d2840' : '#94a3b8', whiteSpace: 'nowrap' }}>{label}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#22c55e' : '#e2e8f0', margin: '0 8px', marginBottom: 18 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#0f172a' };
const labelStyle = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', display: 'block', marginBottom: 8 };

// ── Page (inner — needs Suspense for useSearchParams) ─────
function BookTrialContent() {
  const { checking, complete } = useProfileGate();
  const { getToken }       = useAuth();
  const { user, isLoaded } = useUser();
  const router             = useRouter();
  const searchParams       = useSearchParams();
  const lockedStudentId    = searchParams.get('studentId');

  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(null);

  // Learners
  const [students,        setStudents]        = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentId,       setStudentId]       = useState(lockedStudentId || '');

  // Step 1 form — used for inline-create when the account has no learner,
  // and to carry course/gender preference for the booking.
  const [form, setForm] = useState({
    childName:        '',
    childAge:         '',
    country:          '',
    courseInterest:   '',
    genderPreference: 'NO_PREFERENCE',
  });

  // Step 2 state
  const [timezone,      setTimezone]      = useState('UTC');
  const [slots,         setSlots]         = useState([]);
  const [slotsLoading,  setSlotsLoading]  = useState(false);
  const [slotsError,    setSlotsError]    = useState('');
  const [selectedSlot,  setSelectedSlot]  = useState(null);
  const [activeDateIdx, setActiveDateIdx] = useState(0);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Detect timezone on mount
  useEffect(() => { setTimezone(getUserTimezone()); }, []);

  // Fetch the account's learners (replaces the old /api/students/profile pre-fill)
  useEffect(() => {
    if (!isLoaded || !user) return;
    const load = async () => {
      setStudentsLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.students || [];
          setStudents(list);

          // Decide the active learner: deep-linked id if valid, else the only learner
          let chosen = '';
          if (lockedStudentId && list.some(s => s.id === lockedStudentId)) chosen = lockedStudentId;
          else if (!lockedStudentId && list.length === 1)                  chosen = list[0].id;
          if (chosen) {
            setStudentId(chosen);
            const learner = list.find(s => s.id === chosen);
            if (learner) set('courseInterest', learner.courseInterest || '');
          }
        }
      } catch { /* non-critical */ }
      finally { setStudentsLoading(false); }
    };
    load();
  }, [isLoaded, user]);

  // When the chosen learner changes, pre-fill course interest from them
  const onPickLearner = (id) => {
    setStudentId(id);
    setError('');
    const learner = students.find(s => s.id === id);
    if (learner) set('courseInterest', learner.courseInterest || '');
  };

  // Fetch available slots when entering step 2
  const fetchSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSlotsError('');
    try {
      const token = await getToken();
      const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booking/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load available slots');
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err) {
      setSlotsError(err.message || 'Could not load time slots. Please try again.');
    } finally {
      setSlotsLoading(false);
    }
  }, [getToken]);

  const hasLearners = students.length > 0;

  const goToStep2 = () => {
    setError('');
    // If the account has learners, one must be selected.
    if (hasLearners && !studentId) { setError('Please choose which learner this trial is for.'); return; }
    // If no learners, we inline-create — require child name.
    if (!hasLearners && !form.childName.trim()) { setError("Please enter the learner's name."); return; }
    if (!form.courseInterest) { setError('Please select a course.'); return; }
    setStep(2);
    fetchSlots();
  };

  const goToStep3 = () => {
    if (!selectedSlot) { setError('Please select a time slot'); return; }
    setError('');
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();

      // Build body: either an existing learner (studentId) or inline-create.
      const body = {
        slotStart:        selectedSlot,
        courseInterest:   form.courseInterest,
        timezone,
        genderPreference: form.genderPreference,
      };
      if (hasLearners && studentId) {
        body.studentId = studentId;
      } else {
        body.childName = form.childName.trim();
        body.childAge  = form.childAge ? parseInt(form.childAge, 10) : undefined;
        body.country   = form.country || undefined;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booking/trial`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.status === 409) {
        if (data.error?.includes('already has a trial') || data.error?.includes('already have a trial')) {
          setError('This learner already has a trial class booked. Check your dashboard for details.');
        } else {
          setError('That slot was just taken. Please choose another time.');
          setSelectedSlot(null);
          setStep(2);
          fetchSlots();
        }
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Booking failed');

      const learnerName = (hasLearners && studentId)
        ? (students.find(s => s.id === studentId)?.name || form.childName)
        : form.childName;

      setSuccess({
        childName:   learnerName,
        dateDisplay: toLocalDateLabel(selectedSlot, timezone),
        timeDisplay: toLocalTime(selectedSlot, timezone),
        timezone,
      });
      setStep(4);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const slotGroups = groupSlotsByDate(slots, timezone);
  const activeLearner = students.find(s => s.id === studentId) || null;

  if (!isLoaded) return null;

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9fb",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "4px solid #e2e8f0",
              borderTopColor: "#28b7d9",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>
            Checking your profile...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!complete) return null; // redirect already in flight

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fb', paddingTop: 100, paddingBottom: 60, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, background: 'rgba(40,183,217,0.10)', border: '1px solid rgba(40,183,217,0.25)', fontSize: 12, fontWeight: 700, color: '#0e6e8a', marginBottom: 12 }}>
            Free 30-minute trial · No commitment
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
            Book Your Free Trial Class
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
            Pick a time that works for your family. We'll assign the right teacher and confirm within 24 hours.
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #28b7d9, #faa71a)' }} />
          <div style={{ padding: 32 }}>

            {step < 4 && <StepBar step={step} />}

            {/* ════════ STEP 1 — Learner & Details ════════ */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {studentsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>Loading your learners…</div>
                ) : (
                  <>
                    {/* Learner selection (only when the account has learners) */}
                    {hasLearners && (
                      <div>
                        <label style={labelStyle}>
                          {lockedStudentId ? 'Booking a trial for' : 'Who is this trial for?'}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {students.map(s => {
                            const selected = studentId === s.id;
                            const disabled = lockedStudentId && lockedStudentId !== s.id;
                            return (
                              <button
                                key={s.id} type="button" disabled={disabled}
                                onClick={() => { if (!lockedStudentId) onPickLearner(s.id); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999,
                                  border: `1.5px solid ${selected ? '#0d2840' : '#e2e8f0'}`,
                                  background: selected ? '#0d2840' : 'white',
                                  color: selected ? 'white' : '#0f172a', fontSize: 13, fontWeight: 700,
                                  cursor: lockedStudentId ? 'default' : 'pointer',
                                  opacity: disabled ? 0.4 : 1,
                                }}
                              >
                                {s.name} · age {s.age}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Inline-create fields (only when NO learners exist yet) */}
                    {!hasLearners && (
                      <>
                        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(40,183,217,0.06)', border: '1px solid rgba(40,183,217,0.2)', fontSize: 13, color: '#0e6e8a' }}>
                          We'll create a learner profile from these details so you can track everything afterwards.
                        </div>
                        <div>
                          <label style={labelStyle}>Child's name *</label>
                          <input style={inputStyle} type="text" placeholder="e.g. Ahmed"
                            value={form.childName} onChange={e => set('childName', e.target.value)} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                            <label style={labelStyle}>Age</label>
                            <input style={inputStyle} type="number" placeholder="e.g. 10"
                              value={form.childAge} onChange={e => set('childAge', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Country</label>
                            <select style={inputStyle} value={form.country} onChange={e => set('country', e.target.value)}>
                              <option value="">Select country</option>
                              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Course */}
                    <div>
                      <label style={labelStyle}>Course *</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {COURSE_OPTIONS.map(c => {
                          const selected = form.courseInterest === c.value;
                          return (
                            <button
                              key={c.value} type="button"
                              onClick={() => { set('courseInterest', c.value); setError(''); }}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, border: `2px solid ${selected ? '#28b7d9' : '#e2e8f0'}`, background: selected ? 'rgba(40,183,217,0.06)' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms ease' }}
                            >
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{c.label}</div>
                                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{c.desc}</div>
                              </div>
                              {selected && (
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#28b7d9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <span style={{ color: 'white', fontSize: 12, fontWeight: 900 }}>✓</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Teacher preference */}
                    <div>
                      <label style={labelStyle}>Teacher Preference</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {GENDER_OPTIONS.map(g => (
                          <button
                            key={g.value} type="button"
                            onClick={() => set('genderPreference', g.value)}
                            style={{ flex: 1, padding: '11px 10px', borderRadius: 8, border: `2px solid ${form.genderPreference === g.value ? '#0d2840' : '#e2e8f0'}`, background: form.genderPreference === g.value ? '#0d2840' : 'white', color: form.genderPreference === g.value ? 'white' : '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 150ms ease' }}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13 }}>
                        ⚠️ {error}
                      </div>
                    )}

                    <button onClick={goToStep2} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#faa71a', color: '#0d2840', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginTop: 4, alignSelf: 'flex-start' }}>
                      Choose a Time Slot →
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ════════ STEP 2 — Slot selection ════════ */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Choose a time slot</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    Times shown in your local timezone: <strong style={{ color: '#64748b' }}>{timezone}</strong>
                  </div>
                </div>

                {slotsLoading && (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#28b7d9', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>Loading available times…</div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {slotsError && !slotsLoading && (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>{slotsError}</div>
                    <button onClick={fetchSlots} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Try again</button>
                  </div>
                )}

                {!slotsLoading && !slotsError && slotGroups.length > 0 && (
                  <>
                    {/* Date tabs */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {slotGroups.map((g, i) => {
                        const active = activeDateIdx === i;
                        return (
                          <button key={i} onClick={() => setActiveDateIdx(i)} style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${active ? '#0d2840' : '#e2e8f0'}`, background: active ? '#0d2840' : 'white', color: active ? 'white' : '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {g.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Time buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 }}>
                      {slotGroups[activeDateIdx]?.slots.map(iso => {
                        const isSelected = selectedSlot === iso;
                        return (
                          <button key={iso} onClick={() => setSelectedSlot(iso)} style={{ padding: '11px 8px', borderRadius: 8, border: `1.5px solid ${isSelected ? '#28b7d9' : '#e2e8f0'}`, background: isSelected ? 'rgba(40,183,217,0.10)' : 'white', color: isSelected ? '#0e6e8a' : '#0f172a', fontSize: 14, fontWeight: isSelected ? 800 : 600, cursor: 'pointer', transition: 'all 150ms ease' }}>
                            {toLocalTime(iso, timezone)}
                          </button>
                        );
                      })}
                    </div>

                    {selectedSlot && (
                      <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', fontSize: 13, fontWeight: 700, color: '#15803d' }}>
                        ✓ Selected: {slotGroups[activeDateIdx]?.label} at {toLocalTime(selectedSlot, timezone)}
                      </div>
                    )}
                  </>
                )}

                {!slotsLoading && !slotsError && slotGroups.length === 0 && (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No slots available</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>Please contact us on WhatsApp to arrange your trial class.</div>
                  </div>
                )}

                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13 }}>
                    ⚠️ {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={() => { setStep(1); setError(''); }} style={{ padding: '11px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>← Back</button>
                  <button onClick={goToStep3} disabled={!selectedSlot} style={{ flex: 1, padding: '11px 18px', borderRadius: 8, border: 'none', background: !selectedSlot ? '#e2e8f0' : '#faa71a', color: !selectedSlot ? '#94a3b8' : '#0d2840', fontSize: 14, fontWeight: 800, cursor: !selectedSlot ? 'not-allowed' : 'pointer' }}>Confirm Selection →</button>
                </div>
              </div>
            )}

            {/* ════════ STEP 3 — Confirm ════════ */}
            {step === 3 && selectedSlot && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Confirm your booking</div>

                <div style={{ background: '#f7f9fb', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  {[
                    ['Learner',  activeLearner ? `${activeLearner.name}${activeLearner.age ? ` (${activeLearner.age} yrs)` : ''}` : form.childName + (form.childAge ? ` (${form.childAge} yrs)` : '')],
                    ['Course',   COURSE_LABELS[form.courseInterest] || form.courseInterest],
                    ['Teacher',  (GENDER_OPTIONS.find(g => g.value === form.genderPreference)?.label || 'No Preference') + ' preferred'],
                    ['Date',     toLocalDateLabel(selectedSlot, timezone)],
                    ['Time',     toLocalTime(selectedSlot, timezone) + ` (${timezone})`],
                    ['Duration', '30 minutes — free trial'],
                  ].map(([label, value], i) => (
                    <div key={label} style={{ display: 'flex', padding: '12px 16px', borderBottom: i < 5 ? '1px solid #e2e8f0' : 'none', background: i % 2 === 0 ? '#f7f9fb' : 'white' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', width: 90, flexShrink: 0 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(40,183,217,0.08)', border: '1px solid rgba(40,183,217,0.2)', fontSize: 13, color: '#0e6e8a', fontWeight: 600, lineHeight: 1.6 }}>
                  ℹ️ Your trial is confirmed once submitted. A teacher will be assigned and you'll receive class details within 24 hours.
                </div>

                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13 }}>
                    ⚠️ {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setStep(2); setError(''); }} disabled={loading} style={{ padding: '11px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>← Back</button>
                  <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '11px 18px', borderRadius: 8, border: 'none', background: loading ? '#e2e8f0' : '#faa71a', color: loading ? '#94a3b8' : '#0d2840', fontSize: 14, fontWeight: 800, cursor: loading ? 'wait' : 'pointer' }}>
                    {loading ? 'Booking…' : 'Confirm Booking →'}
                  </button>
                </div>
              </div>
            )}

            {/* ════════ STEP 4 — Success ════════ */}
            {step === 4 && success && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>✓</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: -0.5 }}>Trial Booked!</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.7 }}>
                  {success.childName}'s free trial is set for <strong style={{ color: '#0f172a' }}>{success.dateDisplay}</strong> at{' '}
                  <strong style={{ color: '#0f172a' }}>{success.timeDisplay}</strong> ({success.timezone}). Check your email for confirmation.
                </p>
                <div style={{ background: '#e8f8fc', border: '1px solid rgba(40,183,217,0.25)', borderRadius: 10, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a', marginBottom: 8 }}>What happens next?</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#0e6e8a', lineHeight: 2 }}>
                    <li>We assign a teacher for the trial</li>
                    <li>You receive the class link before the session</li>
                    <li>After the trial, enroll to continue</li>
                  </ul>
                </div>
                <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d2840', color: 'white', padding: '13px 28px', borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
                  Go to Dashboard →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Suspense wrapper (useSearchParams requires it) ────────
function BookTrialFallback() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#28b7d9', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Loading…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default function BookTrialPage() {
  return (
    <Suspense fallback={<BookTrialFallback />}>
      <BookTrialContent />
    </Suspense>
  );
}