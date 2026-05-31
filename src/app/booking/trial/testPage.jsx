// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth, useUser } from '@clerk/nextjs';
// import Link from 'next/link';

// // ─── API hook ─────────────────────────────────────────────
// function useApi() {
//   const { getToken } = useAuth();

//   const apiFetch = useCallback(async (path, options = {}) => {
//     const token = await getToken();
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
//       ...options,
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//         ...options.headers,
//       },
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
//     return data;
//   }, [getToken]);

//   return { apiFetch };
// }

// // ─── Helpers ──────────────────────────────────────────────
// const COURSE_LABELS = {
//   NOORANI_QAIDA:    'Noorani Qaida',
//   QURAN_RECITATION: 'Quran Recitation',
//   TAJWEED:          'Tajweed Rules',
//   HIFZ:             'Hifz Programme',
//   ISLAMIC_STUDIES:  'Islamic Studies',
//   ONE_TO_ONE:       'One-to-One Private',
// };

// function formatSlotTime(isoString, timezone) {
//   return new Date(isoString).toLocaleTimeString('en-GB', {
//     timeZone: timezone,
//     hour:     '2-digit',
//     minute:   '2-digit',
//   });
// }

// function formatSlotDate(isoString, timezone) {
//   return new Date(isoString).toLocaleDateString('en-GB', {
//     timeZone: timezone,
//     weekday:  'long',
//     day:      'numeric',
//     month:    'long',
//     year:     'numeric',
//   });
// }

// function formatDateKey(isoString, timezone) {
//   return new Date(isoString).toLocaleDateString('en-GB', {
//     timeZone: timezone,
//     weekday:  'short',
//     day:      'numeric',
//     month:    'short',
//   });
// }

// function getTzAbbr(isoString, timezone) {
//   return new Date(isoString)
//     .toLocaleTimeString('en-GB', { timeZone: timezone, timeZoneName: 'short' })
//     .split(' ').pop();
// }

// function groupSlotsByDate(slots, timezone) {
//   const grouped = {};
//   slots.forEach(slot => {
//     const key = formatDateKey(slot.start, timezone);
//     if (!grouped[key]) grouped[key] = [];
//     grouped[key].push(slot);
//   });
//   return grouped;
// }

// // ─── Step indicator ───────────────────────────────────────
// function StepBar({ step }) {
//   const steps = ['Your Details', 'Choose Teacher & Time', 'Confirm'];
//   return (
//     <div style={{ marginBottom: 32 }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
//         {steps.map((label, i) => {
//           const num     = i + 1;
//           const active  = step === num;
//           const done    = step > num;
//           return (
//             <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
//               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
//                 <div style={{
//                   width: 32, height: 32, borderRadius: '50%',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   fontSize: 13, fontWeight: 800, flexShrink: 0,
//                   background: done ? '#22c55e' : active ? '#0d2840' : '#e2e8f0',
//                   color: done || active ? 'white' : '#94a3b8',
//                 }}>
//                   {done ? '✓' : num}
//                 </div>
//                 <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#0d2840' : '#94a3b8', whiteSpace: 'nowrap' }}>
//                   {label}
//                 </span>
//               </div>
//               {i < steps.length - 1 && (
//                 <div style={{ flex: 1, height: 2, background: done ? '#22c55e' : '#e2e8f0', margin: '0 8px', marginBottom: 22 }} />
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ─── STEP 1 — Your Details ────────────────────────────────
// function Step1({ form, setForm, onNext, loadingProfile }) {
//   const [error, setError] = useState('');

//   const COURSES = Object.entries(COURSE_LABELS).map(([value, label]) => ({ value, label }));
//   const GENDERS = [
//     { value: 'female', label: 'Female teacher', emoji: '👩‍🏫' },
//     { value: 'male',   label: 'Male teacher',   emoji: '👨‍🏫' },
//     { value: 'any',    label: 'No preference',  emoji: '🤝' },
//   ];

//   const handleNext = () => {
//     if (!form.childName.trim()) { setError("Please enter your child's name."); return; }
//     if (!form.courseInterest)   { setError('Please select a course.'); return; }
//     if (!form.genderPreference) { setError('Please select a teacher preference.'); return; }
//     setError('');
//     onNext();
//   };

//   if (loadingProfile) {
//     return (
//       <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 14 }}>
//         Loading your details…
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: -0.5 }}>
//         Tell us about your child
//       </h2>
//       <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
//         We&apos;ll use this to match you with the right teacher.
//       </p>

//       <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

//         {/* Child name */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//           <label style={labelStyle}>Child&apos;s name *</label>
//           <input
//             style={inputStyle}
//             type="text"
//             placeholder="e.g. Ahmed"
//             value={form.childName}
//             onChange={e => setForm(f => ({ ...f, childName: e.target.value }))}
//           />
//         </div>

//         {/* Course interest */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//           <label style={labelStyle}>Course interest *</label>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//             {COURSES.map(c => (
//               <button
//                 key={c.value}
//                 type="button"
//                 onClick={() => setForm(f => ({ ...f, courseInterest: c.value }))}
//                 style={{
//                   padding: '12px 14px', borderRadius: 10, textAlign: 'left',
//                   border: `2px solid ${form.courseInterest === c.value ? '#28b7d9' : '#e2e8f0'}`,
//                   background: form.courseInterest === c.value ? 'rgba(40,183,217,0.07)' : 'white',
//                   cursor: 'pointer', fontSize: 13, fontWeight: 700,
//                   color: form.courseInterest === c.value ? '#0e6e8a' : '#0f172a',
//                   transition: 'all 150ms',
//                 }}
//               >
//                 {c.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Teacher gender preference */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//           <label style={labelStyle}>Teacher preference *</label>
//           <div style={{ display: 'flex', gap: 10 }}>
//             {GENDERS.map(g => (
//               <button
//                 key={g.value}
//                 type="button"
//                 onClick={() => setForm(f => ({ ...f, genderPreference: g.value }))}
//                 style={{
//                   flex: 1, padding: '12px 10px', borderRadius: 10,
//                   border: `2px solid ${form.genderPreference === g.value ? '#0d2840' : '#e2e8f0'}`,
//                   background: form.genderPreference === g.value ? '#0d2840' : 'white',
//                   cursor: 'pointer', fontSize: 12, fontWeight: 700,
//                   color: form.genderPreference === g.value ? 'white' : '#64748b',
//                   transition: 'all 150ms', textAlign: 'center',
//                 }}
//               >
//                 <div style={{ fontSize: 20, marginBottom: 4 }}>{g.emoji}</div>
//                 {g.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Timezone */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//           <label style={labelStyle}>Your timezone</label>
//           <input
//             style={{ ...inputStyle, color: '#64748b' }}
//             type="text"
//             value={form.timezone}
//             onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
//           />
//           <p style={{ fontSize: 11, color: '#94a3b8' }}>
//             Auto-detected. Edit only if incorrect.
//           </p>
//         </div>

//       </div>

//       {error && <ErrorBox message={error} />}

//       <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
//         <ActionButton onClick={handleNext}>
//           Continue → Choose Teacher
//         </ActionButton>
//       </div>
//     </div>
//   );
// }

// // ─── STEP 2 — Teacher & Slot ──────────────────────────────
// function Step2({ form, setForm, onNext, onBack }) {
//   const { apiFetch }        = useApi();
//   const [teachers,     setTeachers]     = useState([]);
//   const [slots,        setSlots]        = useState([]);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [loadingTeachers, setLoadingTeachers] = useState(true);
//   const [loadingSlots,    setLoadingSlots]    = useState(false);
//   const [error,           setError]           = useState('');

//   // Fetch teachers filtered by course and gender
//   useEffect(() => {
//     setLoadingTeachers(true);
//     apiFetch(`/api/booking/teachers?courseInterest=${form.courseInterest}`)
//       .then(data => {
//         const filtered = form.genderPreference === 'any'
//           ? data.teachers
//           : data.teachers.filter(t => t.gender === form.genderPreference);
//         setTeachers(filtered);
//       })
//       .catch(err => setError(err.message))
//       .finally(() => setLoadingTeachers(false));
//   }, [form.courseInterest, form.genderPreference]);

//   // Fetch slots when teacher is selected
//   useEffect(() => {
//     if (!form.selectedTeacher) return;
//     setLoadingSlots(true);
//     setSlots([]);
//     setSelectedDate(null);
//     setForm(f => ({ ...f, selectedSlot: null }));

//     apiFetch(`/api/booking/availability?teacherId=${form.selectedTeacher.id}`)
//       .then(data => {
//         setSlots(data.slots || []);
//         if (data.slots?.length > 0) {
//           const firstDate = formatDateKey(data.slots[0].start, form.timezone);
//           setSelectedDate(firstDate);
//         }
//       })
//       .catch(err => setError(err.message))
//       .finally(() => setLoadingSlots(false));
//   }, [form.selectedTeacher]);

//   const groupedSlots = groupSlotsByDate(slots, form.timezone);
//   const dateKeys     = Object.keys(groupedSlots);
//   const visibleSlots = selectedDate ? groupedSlots[selectedDate] || [] : [];

//   const handleNext = () => {
//     if (!form.selectedTeacher) { setError('Please select a teacher.'); return; }
//     if (!form.selectedSlot)    { setError('Please select a time slot.'); return; }
//     setError('');
//     onNext();
//   };

//   return (
//     <div>
//       <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: -0.5 }}>
//         Choose your teacher & time
//       </h2>
//       <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
//         All slots shown in your local time ({form.timezone}).
//       </p>

//       {/* Teachers */}
//       <div style={{ marginBottom: 28 }}>
//         <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 12 }}>
//           Available Teachers
//         </div>

//         {loadingTeachers ? (
//           <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>
//             Loading teachers…
//           </div>
//         ) : teachers.length === 0 ? (
//           <div style={{ background: '#f7f9fb', borderRadius: 10, border: '1px solid #e2e8f0', padding: 24, textAlign: 'center' }}>
//             <div style={{ fontSize: 24, marginBottom: 8 }}>😔</div>
//             <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
//               No teachers available for this preference
//             </div>
//             <button
//               onClick={onBack}
//               style={{ fontSize: 13, color: '#28b7d9', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
//             >
//               ← Go back and change preference
//             </button>
//           </div>
//         ) : (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//             {teachers.map(t => {
//               const selected = form.selectedTeacher?.id === t.id;
//               return (
//                 <button
//                   key={t.id}
//                   type="button"
//                   onClick={() => setForm(f => ({ ...f, selectedTeacher: t, selectedSlot: null }))}
//                   style={{
//                     display: 'flex', alignItems: 'center', gap: 14,
//                     padding: 16, borderRadius: 12, textAlign: 'left', width: '100%',
//                     border: `2px solid ${selected ? '#28b7d9' : '#e2e8f0'}`,
//                     background: selected ? 'rgba(40,183,217,0.06)' : 'white',
//                     cursor: 'pointer', transition: 'all 150ms',
//                   }}
//                 >
//                   {/* Avatar */}
//                   <div style={{
//                     width: 48, height: 48, borderRadius: 12, flexShrink: 0,
//                     background: 'linear-gradient(135deg, #28b7d9, #0e6e8a)',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     fontSize: 15, fontWeight: 800, color: 'white',
//                   }}>
//                     {t.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
//                   </div>

//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
//                       {t.name}
//                     </div>
//                     <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
//                       {t.specialty?.join(' · ')}
//                     </div>
//                     <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                       <span style={{ fontSize: 12, color: '#e8920a', fontWeight: 700 }}>
//                         ★ {t.rating?.toFixed(2)}
//                       </span>
//                       <span style={{ fontSize: 11, color: '#94a3b8' }}>·</span>
//                       <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
//                         {t.timezone}
//                       </span>
//                     </div>
//                   </div>

//                   {selected && (
//                     <div style={{
//                       width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
//                       background: '#28b7d9', display: 'flex', alignItems: 'center',
//                       justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'white',
//                     }}>
//                       ✓
//                     </div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* // In Step2, update the error display for no slots */}
//       {slots.length === 0 && !loadingSlots && form.selectedTeacher && (
//         <div style={{ background: '#fff7e0', border: '1px solid rgba(250,167,26,0.3)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>
//             No available slots in the next 14 days
//           </div>
//           <div style={{ fontSize: 12, color: '#b45309', marginBottom: 16 }}>
//             This teacher may be fully booked. Try a different teacher or contact us directly.
//           </div>
//           <a
//             href="https://wa.me/YOUR_WHATSAPP_NUMBER"
//             target="_blank"
//             rel="noreferrer"
//             style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25d366', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
//           >
//             Contact us on WhatsApp
//           </a>
//         </div>
//       )}

//       {/* Slots — shown after teacher is selected */}
//       {form.selectedTeacher && (
//         <div style={{ marginBottom: 28 }}>
//           <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 12 }}>
//             Available Times
//           </div>
//           {loadingSlots ? (
//             <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>
//               Checking availability…
//             </div>
//           ) : slots.length === 0 ? (
//             <div style={{ background: '#fff7e0', border: '1px solid rgba(250,167,26,0.3)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
//               <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
//                 No available slots in the next 14 days.
//               </div>
//               <div style={{ fontSize: 12, color: '#b45309', marginTop: 4 }}>
//                 Please select a different teacher or contact us on WhatsApp.
//               </div>
//             </div>
//           ) : (
//             <>
//               {/* Date tabs */}
//               <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
//                 {dateKeys.slice(0, 14).map(dateKey => (
//                   <button
//                     key={dateKey}
//                     type="button"
//                     onClick={() => setSelectedDate(dateKey)}
//                     style={{
//                       padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
//                       border: `2px solid ${selectedDate === dateKey ? '#0d2840' : '#e2e8f0'}`,
//                       background: selectedDate === dateKey ? '#0d2840' : 'white',
//                       color: selectedDate === dateKey ? 'white' : '#64748b',
//                       cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap',
//                       flexShrink: 0,
//                     }}
//                   >
//                     {dateKey}
//                   </button>
//                 ))}
//               </div>

//               {/* Time slot grid */}
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
//                 {visibleSlots.map(slot => {
//                   const selected = form.selectedSlot?.start === slot.start;
//                   const time     = formatSlotTime(slot.start, form.timezone);
//                   return (
//                     <button
//                       key={slot.start}
//                       type="button"
//                       onClick={() => setForm(f => ({ ...f, selectedSlot: slot }))}
//                       style={{
//                         padding: '10px 6px', borderRadius: 8, fontSize: 13, fontWeight: 700,
//                         border: `2px solid ${selected ? '#28b7d9' : '#e2e8f0'}`,
//                         background: selected ? '#28b7d9' : 'white',
//                         color: selected ? 'white' : '#0f172a',
//                         cursor: 'pointer', transition: 'all 150ms', textAlign: 'center',
//                       }}
//                     >
//                       {time}
//                     </button>
//                   );
//                 })}
//               </div>

//               {form.selectedSlot && (
//                 <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(40,183,217,0.08)', borderRadius: 8, border: '1px solid rgba(40,183,217,0.2)' }}>
//                   <span style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a' }}>
//                     Selected: {formatSlotDate(form.selectedSlot.start, form.timezone)} at {formatSlotTime(form.selectedSlot.start, form.timezone)} ({getTzAbbr(form.selectedSlot.start, form.timezone)})
//                   </span>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       )}

//       {error && <ErrorBox message={error} />}

//       <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
//         <BackButton onClick={onBack} />
//         <ActionButton onClick={handleNext}>
//           Continue → Confirm
//         </ActionButton>
//       </div>
//     </div>
//   );
// }

// // ─── STEP 3 — Confirm ─────────────────────────────────────
// function Step3({ form, onBack, onSuccess }) {
//   const { apiFetch }   = useApi();
//   const [loading,  setLoading]  = useState(false);
//   const [error,    setError]    = useState('');

//   const handleConfirm = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       const data = await apiFetch('/api/booking/trial', {
//         method: 'POST',
//         body:   JSON.stringify({
//           teacherId:       form.selectedTeacher.id,
//           slotStart:       form.selectedSlot.start,
//           studentTimezone: form.timezone,
//         }),
//       });

//       onSuccess(data.booking);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   const dateDisplay = formatSlotDate(form.selectedSlot.start, form.timezone);
//   const timeStart   = formatSlotTime(form.selectedSlot.start, form.timezone);
//   const timeEnd     = formatSlotTime(form.selectedSlot.end,   form.timezone);
//   const tzAbbr      = getTzAbbr(form.selectedSlot.start,     form.timezone);
//   const courseLabel = COURSE_LABELS[form.courseInterest] || form.courseInterest;

//   const rows = [
//     ['👤 Child',    form.childName],
//     ['📖 Course',   courseLabel],
//     ['👩‍🏫 Teacher',  form.selectedTeacher.name],
//     ['📅 Date',     dateDisplay],
//     ['⏰ Time',     `${timeStart} – ${timeEnd} (${tzAbbr})`],
//     ['🌍 Timezone', form.timezone],
//   ];

//   return (
//     <div>
//       <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: -0.5 }}>
//         Confirm your booking
//       </h2>
//       <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
//         Please review the details below before confirming your free trial.
//       </p>

//       {/* Summary card */}
//       <div style={{ background: '#f7f9fb', borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 24, overflow: 'hidden' }}>
//         <div style={{ background: '#0d2840', padding: '16px 22px' }}>
//           <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'rgba(255,255,255,0.5)' }}>
//             Booking Summary
//           </div>
//         </div>
//         <div style={{ padding: '8px 0' }}>
//           {rows.map(([label, value]) => (
//             <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px', borderBottom: '1px solid #f0f4f8' }}>
//               <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
//               <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* What happens next */}
//       <div style={{ background: '#e8f8fc', border: '1px solid rgba(40,183,217,0.25)', borderRadius: 10, padding: '16px 18px', marginBottom: 24 }}>
//         <div style={{ fontSize: 13, fontWeight: 700, color: '#0e6e8a', marginBottom: 8 }}>What happens next:</div>
//         <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#0e6e8a', lineHeight: 2 }}>
//           <li>You&apos;ll receive an email confirmation immediately</li>
//           <li>Your teacher will send the Zoom link 1 hour before class</li>
//           <li>The class is 30 minutes and completely free</li>
//         </ul>
//       </div>

//       {error && <ErrorBox message={error} />}

//       <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
//         <BackButton onClick={onBack} disabled={loading} />
//         <ActionButton onClick={handleConfirm} loading={loading}>
//           {loading ? 'Booking…' : 'Confirm Free Trial →'}
//         </ActionButton>
//       </div>
//     </div>
//   );
// }

// // ─── Success State ────────────────────────────────────────
// function SuccessState({ booking }) {
//   return (
//     <div style={{ textAlign: 'center', padding: '20px 0' }}>
//       <div style={{
//         width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
//         background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         fontSize: 30,
//       }}>
//         ✓
//       </div>

//       <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: -0.5 }}>
//         Trial class booked!
//       </h2>
//       <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.7 }}>
//         Check your email for a full confirmation.<br />
//         Your teacher will send the Zoom link before class.
//       </p>

//       {/* Booking card */}
//       <div style={{ background: '#0d2840', borderRadius: 14, padding: '24px 28px', marginBottom: 28, textAlign: 'left' }}>
//         <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
//           Your Booking
//         </div>
//         {[
//           ['Teacher',  booking.teacherName],
//           ['Date',     booking.dateDisplay],
//           ['Time',     booking.timeDisplay],
//           ['Status',   'Confirmed — Zoom link coming soon'],
//           ['Ref',      booking.id.toUpperCase().slice(-8)],
//         ].map(([label, value]) => (
//           <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
//             <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</span>
//             <span style={{ fontSize: 13, color: 'white', fontWeight: 700, textAlign: 'right', maxWidth: '65%' }}>{value}</span>
//           </div>
//         ))}
//       </div>

//       <Link
//         href="/dashboard"
//         style={{
//           display: 'inline-flex', alignItems: 'center', gap: 8,
//           background: '#faa71a', color: '#0d2840',
//           padding: '13px 28px', borderRadius: 10,
//           fontSize: 14, fontWeight: 800, textDecoration: 'none',
//         }}
//       >
//         Go to Dashboard →
//       </Link>
//     </div>
//   );
// }

// // ─── Shared sub-components ────────────────────────────────
// const labelStyle = {
//   fontSize: 12, fontWeight: 700, color: '#0f172a',
// };

// const inputStyle = {
//   width: '100%', padding: '11px 14px', borderRadius: 8,
//   border: '1.5px solid #e2e8f0', fontSize: 14, fontWeight: 500,
//   color: '#0f172a', outline: 'none', boxSizing: 'border-box',
//   fontFamily: 'inherit',
// };

// function ActionButton({ onClick, children, loading, disabled }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={loading || disabled}
//       style={{
//         display: 'inline-flex', alignItems: 'center', gap: 6,
//         background: loading || disabled ? '#cbd5e1' : '#faa71a',
//         color: '#0d2840', padding: '12px 24px', borderRadius: 10,
//         fontSize: 14, fontWeight: 800, border: 'none',
//         cursor: loading || disabled ? 'not-allowed' : 'pointer',
//         transition: 'all 150ms',
//       }}
//     >
//       {children}
//     </button>
//   );
// }

// function BackButton({ onClick, disabled }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       style={{
//         fontSize: 14, fontWeight: 700, color: '#64748b',
//         background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
//         padding: '12px 0',
//       }}
//     >
//       ← Back
//     </button>
//   );
// }

// function ErrorBox({ message }) {
//   return (
//     <div style={{
//       marginTop: 16, padding: '12px 16px', borderRadius: 8,
//       background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
//       fontSize: 13, fontWeight: 600, color: '#dc2626',
//     }}>
//       {message}
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────
// export default function BookTrialPage() {
//   const router           = useRouter();
//   const { isLoaded, isSignedIn } = useAuth();
//   const { apiFetch }     = useApi();

//   const [step,           setStep]    = useState(1);
//   const [booking,        setBooking] = useState(null);
//   const [loadingProfile, setLoadingProfile] = useState(true);
//   const [alreadyBooked, setAlreadyBooked] = useState(false);

//   const [form, setForm] = useState({
//     childName:         '',
//     courseInterest:    '',
//     genderPreference:  '',
//     timezone:          Intl.DateTimeFormat().resolvedOptions().timeZone,
//     selectedTeacher:   null,
//     selectedSlot:      null,
//   });

//   // Redirect if not signed in
//   useEffect(() => {
//     if (isLoaded && !isSignedIn) router.push('/login');
//   }, [isLoaded, isSignedIn]);

//   // Pre-fill from profile
//   useEffect(() => {
//     if (!isLoaded || !isSignedIn) return;
//     apiFetch('/api/students/profile')
//       .then(data => {
//         if (data.profile) {
//           setForm(f => ({
//             ...f,
//             childName:      data.profile.childName      || '',
//             courseInterest: data.profile.courseInterest || '',
//             timezone:       data.profile.timezone       || f.timezone,
//           }));
//         }
//       })
//       .catch(() => {}) // fail silently
//       .finally(() => setLoadingProfile(false));
//   }, [isLoaded, isSignedIn]);

//   // Add to your existing data fetch useEffect
//   useEffect(() => {
//     if (!isLoaded || !isSignedIn) return;
//     apiFetch('/api/booking/mine')
//       .then(data => {
//         if (data.booking) setAlreadyBooked(true);
//       })
//       .catch(() => {});
//   }, [isLoaded, isSignedIn]);

//   if (!isLoaded || !isSignedIn) return null;

//   // Add before the return statement
//   if (alreadyBooked) {
//     return (
//       <div style={{ minHeight: '100vh', background: '#f7f9fb', padding: '40px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <div style={{ maxWidth: 480, width: '100%', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '48px 40px', textAlign: 'center' }}>
//           <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
//           <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
//             You already have a trial booked
//           </h2>
//           <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.7 }}>
//             Check your dashboard for the class details and Zoom link. If you need to reschedule, contact us on WhatsApp.
//           </p>
//           <Link
//             href="/dashboard"
//             style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0d2840', color: 'white', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}
//           >
//             Go to Dashboard →
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ minHeight: '100vh', background: '#f7f9fb', padding: '40px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
//       <div style={{ maxWidth: 680, margin: '0 auto' }}>

//         {/* Header */}
//         <div style={{ textAlign: 'center', marginBottom: 36 }}>
//           {/* <Link href="/" style={{ display: 'inline-block', marginBottom: 20 }}>
//             <img src="/logo2.png" alt="Quran Odyssey" style={{ height: 36, objectFit: 'contain' }} />
//           </Link> */}
//           {!booking && (
//             <>
//               <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(40,183,217,0.1)', border: '1px solid rgba(40,183,217,0.25)', borderRadius: 999, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#0e6e8a', marginBottom: 12 }}>
//                 Free · No credit card · 30 minutes
//               </div>
//               <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: -0.8, margin: 0 }}>
//                 Book your free trial class
//               </h1>
//             </>
//           )}
//         </div>

//         {/* Card */}
//         <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '36px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
//           {booking ? (
//             <SuccessState booking={booking} />
//           ) : (
//             <>
//               <StepBar step={step} />
//               {step === 1 && (
//                 <Step1
//                   form={form}
//                   setForm={setForm}
//                   onNext={() => setStep(2)}
//                   loadingProfile={loadingProfile}
//                 />
//               )}
//               {step === 2 && (
//                 <Step2
//                   form={form}
//                   setForm={setForm}
//                   onNext={() => setStep(3)}
//                   onBack={() => setStep(1)}
//                 />
//               )}
//               {step === 3 && (
//                 <Step3
//                   form={form}
//                   onBack={() => setStep(2)}
//                   onSuccess={b => setBooking(b)}
//                 />
//               )}
//             </>
//           )}
//         </div>

//         {/* Trust signals */}
//         {!booking && (
//           <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
//             {['🔒 No payment needed', '⭐ 4.97 avg rating', '✓ Qualified teachers'].map(t => (
//               <span key={t} style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{t}</span>
//             ))}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }