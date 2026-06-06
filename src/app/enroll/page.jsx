'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const COURSE_OPTIONS = [
  { value: 'NOORANI_QAIDA',    label: 'Noorani Qaida',       desc: 'Arabic alphabet & basic reading · Ages 5–10' },
  { value: 'QURAN_RECITATION', label: 'Quran Recitation',     desc: 'Fluent recitation with Tajweed · All ages'   },
  { value: 'TAJWEED',          label: 'Tajweed Rules',        desc: 'Science of correct recitation · Ages 8+'     },
  { value: 'HIFZ',             label: 'Hifz Programme',       desc: 'Full Quran memorisation · Ages 7+'           },
  { value: 'ISLAMIC_STUDIES',  label: 'Islamic Studies',      desc: 'Stories, pillars, character · Ages 6–14'     },
  { value: 'ONE_TO_ONE',       label: 'One-to-One Private',   desc: 'Fully custom · All ages & levels'            },
];

const DAY_OPTIONS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAY_LABELS  = { MONDAY:'Mon', TUESDAY:'Tue', WEDNESDAY:'Wed', THURSDAY:'Thu', FRIDAY:'Fri', SATURDAY:'Sat', SUNDAY:'Sun' };

const TIME_OPTIONS = [
  { value: 'MORNING',   label: 'Morning',   desc: '9am – 12pm' },
  { value: 'AFTERNOON', label: 'Afternoon', desc: '12pm – 5pm' },
  { value: 'EVENING',   label: 'Evening',   desc: '5pm – 9pm'  },
];

const GENDER_OPTIONS = [
  { value: 'NO_PREFERENCE', label: 'No Preference', emoji: '🤝' },
  { value: 'FEMALE',        label: 'Female Teacher', emoji: '👩‍🏫' },
  { value: 'MALE',          label: 'Male Teacher',   emoji: '👨‍🏫' },
];

// ─── Step bar ─────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Select Course', 'Schedule', 'Teacher & Notes'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {steps.map((label, i) => {
        const n      = i + 1;
        const active = step === n;
        const done   = step > n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0, background: done ? '#22c55e' : active ? '#0d2840' : '#e2e8f0', color: done || active ? 'white' : '#94a3b8' }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#0d2840' : '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
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

// ─── Step 1 — Select Course ───────────────────────────────
function Step1({ form, setForm, onNext, prefillCourse }) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (prefillCourse) setForm(f => ({ ...f, courseType: prefillCourse }));
  }, [prefillCourse]);

  const handleNext = () => {
    if (!form.courseType) { setError('Please select a course to continue.'); return; }
    setError('');
    onNext();
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: -0.5 }}>
        Which course would you like to enroll in?
      </h2>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
        Not sure? Your teacher will assess your child and confirm the right starting point.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {COURSE_OPTIONS.map(c => {
          const selected = form.courseType === c.value;
          return (
            <button key={c.value} type="button" onClick={() => { setForm(f => ({ ...f, courseType: c.value })); setError(''); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, border: `2px solid ${selected ? '#28b7d9' : '#e2e8f0'}`, background: selected ? 'rgba(40,183,217,0.06)' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms ease' }}>
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

      {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}

      <button type="button" onClick={handleNext}
        style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: '#faa71a', color: '#0d2840', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2 — Schedule Preferences ───────────────────────
function Step2({ form, setForm, onNext, onBack }) {
  const [error, setError] = useState('');

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      preferredDays: f.preferredDays.includes(day)
        ? f.preferredDays.filter(d => d !== day)
        : [...f.preferredDays, day],
    }));
    setError('');
  };

  const handleNext = () => {
    if (form.preferredDays.length === 0) { setError('Please select at least one preferred day.'); return; }
    if (!form.preferredTime)             { setError('Please select a preferred time of day.'); return; }
    setError('');
    onNext();
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: -0.5 }}>
        When would you like to learn?
      </h2>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
        Select all days that work for your schedule. We'll do our best to match you.
      </p>

      {/* Days */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 12 }}>Preferred Days</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DAY_OPTIONS.map(day => {
            const selected = form.preferredDays.includes(day);
            return (
              <button key={day} type="button" onClick={() => toggleDay(day)}
                style={{ padding: '9px 16px', borderRadius: 8, border: `2px solid ${selected ? '#0d2840' : '#e2e8f0'}`, background: selected ? '#0d2840' : 'white', color: selected ? 'white' : '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 150ms ease' }}>
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time of day */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 12 }}>Preferred Time of Day</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {TIME_OPTIONS.map(t => {
            const selected = form.preferredTime === t.value;
            return (
              <button key={t.value} type="button" onClick={() => { setForm(f => ({ ...f, preferredTime: t.value })); setError(''); }}
                style={{ flex: 1, padding: '14px 10px', borderRadius: 10, border: `2px solid ${selected ? '#0d2840' : '#e2e8f0'}`, background: selected ? '#0d2840' : 'white', color: selected ? 'white' : '#64748b', cursor: 'pointer', textAlign: 'center', transition: 'all 150ms ease' }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{t.value === 'MORNING' ? '🌅' : t.value === 'AFTERNOON' ? '☀️' : '🌙'}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: selected ? 'rgba(255,255,255,0.6)' : '#94a3b8', marginTop: 2 }}>{t.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onBack} style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>← Back</button>
        <button type="button" onClick={handleNext} style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: '#faa71a', color: '#0d2840', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Continue →</button>
      </div>
    </div>
  );
}

// ─── Step 3 — Teacher Preference + Message ────────────────
function Step3({ form, setForm, onBack, onSubmit, submitting, error }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: -0.5 }}>
        Almost done — a few final details.
      </h2>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
        These help us match your child with the right teacher.
      </p>

      {/* Gender preference */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 12 }}>Teacher Preference</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {GENDER_OPTIONS.map(g => {
            const selected = form.genderPreference === g.value;
            return (
              <button key={g.value} type="button" onClick={() => setForm(f => ({ ...f, genderPreference: g.value }))}
                style={{ flex: 1, padding: '14px 10px', borderRadius: 10, border: `2px solid ${selected ? '#0d2840' : '#e2e8f0'}`, background: selected ? '#0d2840' : 'white', color: selected ? 'white' : '#64748b', cursor: 'pointer', textAlign: 'center', transition: 'all 150ms ease' }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{g.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{g.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional message */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 8 }}>
          Message to Admin <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'none', color: '#cbd5e1' }}>(optional)</span>
        </div>
        <textarea
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value.slice(0, 500) }))}
          placeholder="Any additional information — child's current level, special requirements, preferred teacher name, etc."
          rows={4}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', color: '#0f172a' }}
        />
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 4 }}>{form.message.length}/500</div>
      </div>

      {/* Summary */}
      <div style={{ background: '#f7f9fb', borderRadius: 10, border: '1px solid #e2e8f0', padding: '18px 20px', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 12 }}>Application Summary</div>
        {[
          ['Course',        COURSE_OPTIONS.find(c => c.value === form.courseType)?.label || '—'],
          ['Preferred Days', form.preferredDays.map(d => DAY_LABELS[d]).join(', ') || '—'],
          ['Preferred Time', TIME_OPTIONS.find(t => t.value === form.preferredTime)?.label || '—'],
          ['Teacher Pref',   GENDER_OPTIONS.find(g => g.value === form.genderPreference)?.label || '—'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f4f8' }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{value}</span>
          </div>
        ))}
      </div>

      {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onBack} disabled={submitting} style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>← Back</button>
        <button type="button" onClick={onSubmit} disabled={submitting}
          style={{ flex: 1, padding: '12px 28px', borderRadius: 8, border: 'none', background: submitting ? '#e2e8f0' : '#faa71a', color: submitting ? '#94a3b8' : '#0d2840', fontSize: 14, fontWeight: 800, cursor: submitting ? 'wait' : 'pointer' }}>
          {submitting ? 'Submitting…' : 'Submit Application →'}
        </button>
      </div>
    </div>
  );
}

// ─── Success State ────────────────────────────────────────
function SuccessState({ courseLabel }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>✓</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: -0.5 }}>Application Submitted!</h2>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.7 }}>
        Your enrollment application for <strong style={{ color: '#0f172a' }}>{courseLabel}</strong> has been received. We will review it and contact you within <strong>24 hours</strong>.
      </p>
      <div style={{ background: '#e8f8fc', border: '1px solid rgba(40,183,217,0.25)', borderRadius: 10, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a', marginBottom: 8 }}>What happens next?</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#0e6e8a', lineHeight: 2 }}>
          <li>We review your application (within 24 hours)</li>
          <li>You receive an approval email with payment details</li>
          <li>We assign a teacher and set up your schedule</li>
          <li>Classes begin!</li>
        </ul>
      </div>
      <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d2840', color: 'white', padding: '13px 28px', borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
        View Application Status →
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function EnrollPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user }                 = useUser();
  const router                   = useRouter();
  const searchParams             = useSearchParams();
  const prefillCourse            = searchParams.get('course')?.toUpperCase() || '';

  const [step,       setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState('');

  const [form, setForm] = useState({
    courseType:       prefillCourse || '',
    preferredDays:    [],
    preferredTime:    '',
    genderPreference: 'NO_PREFERENCE',
    message:          '',
  });

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push('/login?redirect=/enroll');
  }, [isLoaded, isSignedIn]);

  const { getToken } = useAuth();

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enrollment/apply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          courseType:       form.courseType,
          genderPreference: form.genderPreference,
          preferredDays:    form.preferredDays,
          preferredTime:    form.preferredTime,
          message:          form.message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded || !isSignedIn) return null;

  const courseLabel = COURSE_OPTIONS.find(c => c.value === form.courseType)?.label || 'your chosen course';

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fb', paddingTop: 88, paddingBottom: 60, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        {!submitted && (
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, background: 'rgba(40,183,217,0.10)', border: '1px solid rgba(40,183,217,0.25)', fontSize: 12, fontWeight: 700, color: '#0e6e8a', marginBottom: 12 }}>
              Enrollment Application
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: -0.8, margin: 0 }}>
              Enroll in a Course
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
              Takes 2 minutes. We review every application within 24 hours.
            </p>
          </div>
        )}

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #28b7d9, #faa71a)' }} />
          <div style={{ padding: 32 }}>
            {submitted ? (
              <SuccessState courseLabel={courseLabel} />
            ) : (
              <>
                <StepBar step={step} />
                {step === 1 && <Step1 form={form} setForm={setForm} onNext={() => setStep(2)} prefillCourse={prefillCourse} />}
                {step === 2 && <Step2 form={form} setForm={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                {step === 3 && <Step3 form={form} setForm={setForm} onBack={() => setStep(2)} onSubmit={handleSubmit} submitting={submitting} error={error} />}
              </>
            )}
          </div>
        </div>

        {/* Trust signals */}
        {!submitted && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
            {['📋 Reviewed within 24 hours', '✓ No payment now', '🔒 Your details are private'].map(t => (
              <span key={t} style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}