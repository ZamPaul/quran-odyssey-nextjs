// app/booking/trial/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser }  from '@clerk/nextjs';
import { useRouter }         from 'next/navigation';
import Link                  from 'next/link';

const COURSE_OPTIONS = [
  { value: 'NOORANI_QAIDA',    label: 'Noorani Qaida',         desc: 'Arabic alphabet & basic reading · Ages 5–10' },
  { value: 'QURAN_RECITATION', label: 'Quran Recitation',       desc: 'Fluent recitation with Tajweed · All ages' },
  { value: 'TAJWEED',          label: 'Tajweed Rules',          desc: 'Science of correct recitation · Ages 8+' },
  { value: 'HIFZ',             label: 'Hifz Programme',         desc: 'Full Quran memorisation · Ages 7+' },
  { value: 'ISLAMIC_STUDIES',  label: 'Islamic Studies',        desc: 'Stories, pillars, character · Ages 6–14' },
  { value: 'ONE_TO_ONE',       label: 'One-to-One Private',     desc: 'Fully custom · All ages & levels' },
];

const GENDER_OPTIONS = [
  { value: 'NO_PREFERENCE', label: 'No Preference' },
  { value: 'FEMALE',        label: 'Female Teacher' },
  { value: 'MALE',          label: 'Male Teacher'   },
];

// ── Helpers ───────────────────────────────────────────────
function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function toLocalDateKey(isoString, tz) {
  return new Date(isoString).toLocaleDateString('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

function toLocalDateLabel(isoString, tz) {
  const d = new Date(isoString);
  const isToday    = toLocalDateKey(isoString, tz) === toLocalDateKey(new Date().toISOString(), tz);
  const isTomorrow = toLocalDateKey(isoString, tz) === toLocalDateKey(
    new Date(Date.now() + 86400000).toISOString(), tz
  );
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
  const steps = ['Your Details', 'Choose a Time', 'Confirm'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((label, i) => {
        const n       = i + 1;
        const active  = step === n;
        const done    = step > n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? '#22c55e' : active ? '#0d2840' : '#e2e8f0',
                color: done || active ? 'white' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
              }}>
                {done ? '✓' : n}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: active ? '#0d2840' : '#94a3b8', whiteSpace: 'nowrap' }}>
                {label}
              </div>
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

// ── Page ──────────────────────────────────────────────────
export default function BookTrialPage() {
  const { getToken }       = useAuth();
  const { user, isLoaded } = useUser();
  const router             = useRouter();

  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(null);

  // Step 1 state
  const [form, setForm] = useState({
    childName:        '',
    childAge:         '',
    courseInterest:   '',
    genderPreference: 'NO_PREFERENCE',
  });

  // Step 2 state
  const [timezone,       setTimezone]       = useState('UTC');
  const [slots,          setSlots]          = useState([]);
  const [slotsLoading,   setSlotsLoading]   = useState(false);
  const [slotsError,     setSlotsError]     = useState('');
  const [selectedSlot,   setSelectedSlot]   = useState(null);
  const [activeDateIdx,  setActiveDateIdx]  = useState(0);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Detect timezone on mount
  useEffect(() => {
    setTimezone(getUserTimezone());
  }, []);

  // Pre-fill from student profile
  useEffect(() => {
    if (!isLoaded || !user) return;
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            set('childName',  data.profile.childName  || '');
            set('childAge',   data.profile.childAge   || '');
            set('courseInterest', data.profile.courseInterest || '');
          }
        }
      } catch { /* non-critical */ }
    };
    fetchProfile();
  }, [isLoaded, user]);

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

  const goToStep2 = () => {
    setError('');
    if (!form.childName.trim())  { setError('Please enter your child\'s name');  return; }
    if (!form.courseInterest)    { setError('Please select a course');            return; }
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
      const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/booking/trial`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          slotStart:        selectedSlot,
          courseInterest:   form.courseInterest,
          childName:        form.childName.trim(),
          childAge:         form.childAge ? parseInt(form.childAge) : undefined,
          timezone,
          genderPreference: form.genderPreference,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        if (data.error?.includes('already have a trial')) {
          setError('You already have a trial class booked. Check your dashboard for details.');
        } else {
          // Slot taken — refresh slots and go back to step 2
          setError('That slot was just taken. Please choose another time.');
          setSelectedSlot(null);
          setStep(2);
          fetchSlots();
        }
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Booking failed');

      setSuccess({
        dateDisplay: data.dateDisplay,
        timeDisplay: data.timeDisplay,
        timezone,
      });
      setStep(4);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Slot groups ─────────────────────────────────────────
  const slotGroups = groupSlotsByDate(slots, timezone);

  // ── Render ──────────────────────────────────────────────
  return (
    <div style={{
      minHeight:      '100vh',
      background:     '#f7f9fb',
      paddingTop:     100,
      paddingBottom:  60,
      fontFamily:     "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 14px', borderRadius: 20,
            background: 'rgba(40,183,217,0.10)', border: '1px solid rgba(40,183,217,0.25)',
            fontSize: 12, fontWeight: 700, color: '#0e6e8a', marginBottom: 12,
          }}>
            Free 30-minute trial · No commitment
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
            Book Your Free Trial Class
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
            Pick a time that works for your family. We'll assign the right teacher and confirm within 24 hours.
          </p>
        </div>

        {/* Step bar */}
        <StepBar step={Math.min(step, 3)} />

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #28b7d9, #faa71a)' }} />
          <div style={{ padding: 32 }}>

            {/* ── Error banner ───────────────────────────── */}
            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 20,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                fontSize: 13, fontWeight: 600, color: '#dc2626',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 1 — Details + course + gender pref
            ════════════════════════════════════════════ */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                  Tell us about yourself
                </div>

                {/* Child name */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>
                    Your Full Name *
                  </label>
                  <input
                    value={form.childName}
                    onChange={e => set('childName', e.target.value)}
                    placeholder="e.g. Ahmed"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
                  />
                </div>

                {/* Child age */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>
                    Your age
                  </label>
                  <select
                    value={form.childAge}
                    onChange={e => set('childAge', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#0f172a', background: 'white' }}
                  >
                    <option value="">Select age</option>
                    {Array.from({ length: 15 }, (_, i) => i + 4).map(age => (
                      <option key={age} value={age}>{age} years old</option>
                    ))}
                  </select>
                </div>

                {/* Course interest */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>
                    What would you like to learn? *
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {COURSE_OPTIONS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => set('courseInterest', c.value)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                          border: `1.5px solid ${form.courseInterest === c.value ? '#28b7d9' : '#e2e8f0'}`,
                          background: form.courseInterest === c.value ? 'rgba(40,183,217,0.07)' : 'white',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{c.label}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{c.desc}</div>
                        </div>
                        {form.courseInterest === c.value && (
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#28b7d9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: 'white', fontSize: 11, fontWeight: 900 }}>✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender preference */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>
                    Teacher gender preference
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {GENDER_OPTIONS.map(g => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => set('genderPreference', g.value)}
                        style={{
                          flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
                          border: `1.5px solid ${form.genderPreference === g.value ? '#0d2840' : '#e2e8f0'}`,
                          background: form.genderPreference === g.value ? '#0d2840' : 'white',
                          color: form.genderPreference === g.value ? 'white' : '#64748b',
                          fontSize: 13, fontWeight: 700, transition: 'all 150ms ease',
                        }}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={goToStep2}
                  style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#faa71a', color: '#0d2840', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginTop: 4 }}
                >
                  Choose a Time Slot →
                </button>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 2 — Slot selection
            ════════════════════════════════════════════ */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                    Choose a time slot
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    Times shown in your local timezone: <strong style={{ color: '#64748b' }}>{timezone}</strong>
                  </div>
                </div>

                {/* Slots loading */}
                {slotsLoading && (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#28b7d9', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>Loading available times…</div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {/* Slots error */}
                {slotsError && !slotsLoading && (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{slotsError}</div>
                    <button onClick={fetchSlots} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
                      Try again
                    </button>
                  </div>
                )}

                {/* Slots display */}
                {!slotsLoading && !slotsError && slotGroups.length > 0 && (
                  <>
                    {/* Date tabs */}
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                      {slotGroups.map((group, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setActiveDateIdx(idx); setError(''); }}
                          style={{
                            flexShrink: 0, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
                            border: `1.5px solid ${activeDateIdx === idx ? '#0d2840' : '#e2e8f0'}`,
                            background: activeDateIdx === idx ? '#0d2840' : 'white',
                            color: activeDateIdx === idx ? 'white' : '#64748b',
                            fontSize: 12, fontWeight: 700,
                          }}
                        >
                          {group.label}
                          <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                            ({group.slots.length})
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Time grid for active date */}
                    {slotGroups[activeDateIdx] && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                        {slotGroups[activeDateIdx].slots.map(iso => {
                          const isSelected = selectedSlot === iso;
                          return (
                            <button
                              key={iso}
                              onClick={() => { setSelectedSlot(iso); setError(''); }}
                              style={{
                                padding: '10px 6px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                                border: `1.5px solid ${isSelected ? '#28b7d9' : '#e2e8f0'}`,
                                background: isSelected ? 'rgba(40,183,217,0.10)' : 'white',
                                color: isSelected ? '#0e6e8a' : '#0f172a',
                                fontSize: 14, fontWeight: isSelected ? 800 : 600,
                                transition: 'all 150ms ease',
                              }}
                            >
                              {toLocalTime(iso, timezone)}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Selected slot summary */}
                    {selectedSlot && (
                      <div style={{
                        padding: '12px 16px', borderRadius: 8,
                        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                        fontSize: 13, fontWeight: 700, color: '#15803d',
                      }}>
                        ✓ Selected: {slotGroups[activeDateIdx]?.label} at {toLocalTime(selectedSlot, timezone)}
                      </div>
                    )}
                  </>
                )}

                {/* No slots available */}
                {!slotsLoading && !slotsError && slotGroups.length === 0 && (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No slots available</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>Please contact us on WhatsApp to arrange your trial class.</div>
                  </div>
                )}

                {/* Nav */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={() => { setStep(1); setError(''); }} style={{ padding: '11px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    ← Back
                  </button>
                  <button
                    onClick={goToStep3}
                    disabled={!selectedSlot}
                    style={{ flex: 1, padding: '11px 18px', borderRadius: 8, border: 'none', background: !selectedSlot ? '#e2e8f0' : '#faa71a', color: !selectedSlot ? '#94a3b8' : '#0d2840', fontSize: 14, fontWeight: 800, cursor: !selectedSlot ? 'not-allowed' : 'pointer' }}
                  >
                    Confirm Selection →
                  </button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 3 — Confirm & submit
            ════════════════════════════════════════════ */}
            {step === 3 && selectedSlot && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                  Confirm your booking
                </div>

                {/* Summary card */}
                <div style={{ background: '#f7f9fb', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  {[
                    ['Student',     form.childName + (form.childAge ? ` (${form.childAge} yrs)` : '')],
                    ['Course',      COURSE_OPTIONS.find(c => c.value === form.courseInterest)?.label || form.courseInterest],
                    ['Teacher',     GENDER_OPTIONS.find(g => g.value === form.genderPreference)?.label + ' preferred'],
                    ['Date',        toLocalDateLabel(selectedSlot, timezone)],
                    ['Time',        toLocalTime(selectedSlot, timezone) + ` (${timezone})`],
                    ['Duration',    '30 minutes — free trial'],
                  ].map(([label, value], i) => (
                    <div key={label} style={{ display: 'flex', padding: '12px 16px', borderBottom: i < 5 ? '1px solid #e2e8f0' : 'none', background: i % 2 === 0 ? '#f7f9fb' : 'white' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8', width: 90, flexShrink: 0 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* What happens next */}
                <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(40,183,217,0.08)', border: '1px solid rgba(40,183,217,0.2)', fontSize: 13, color: '#0e6e8a', fontWeight: 600, lineHeight: 1.6 }}>
                  ℹ️ Your trial is confirmed. A teacher will be assigned and you'll receive class details within 24 hours.
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setStep(2); setError(''); }} style={{ padding: '11px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ flex: 1, padding: '11px 18px', borderRadius: 8, border: 'none', background: loading ? '#e2e8f0' : '#faa71a', color: loading ? '#94a3b8' : '#0d2840', fontSize: 14, fontWeight: 800, cursor: loading ? 'wait' : 'pointer' }}
                  >
                    {loading ? 'Booking…' : 'Confirm Booking →'}
                  </button>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 4 — Success
            ════════════════════════════════════════════ */}
            {step === 4 && success && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, padding: '12px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Trial Class Booked!
                  </div>
                  <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
                    {success.dateDisplay} at {success.timeDisplay}
                  </div>
                </div>
                <div style={{ padding: '14px 20px', borderRadius: 10, background: 'rgba(40,183,217,0.08)', border: '1px solid rgba(40,183,217,0.2)', fontSize: 14, color: '#0e6e8a', fontWeight: 600, lineHeight: 1.7, maxWidth: 380 }}>
                  Your trial is confirmed. A teacher will be assigned and you'll receive class details within 24 hours.
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <Link href="/dashboard" style={{ padding: '10px 20px', borderRadius: 8, background: '#0d2840', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Go to Dashboard
                  </Link>
                  <Link href="/" style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust signal */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
          🔒 No credit card required · Cancel anytime · 30-minute free trial
        </p>
      </div>
    </div>
  );
}