// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useApi } from "@/lib/api";

// const COURSES = [
//   { value: "NOORANI_QAIDA", label: "Noorani Qaida" },
//   { value: "QURAN_RECITATION", label: "Quran Recitation" },
//   { value: "TAJWEED", label: "Tajweed Rules" },
//   { value: "HIFZ", label: "Hifz Programme" },
//   { value: "ISLAMIC_STUDIES", label: "Islamic Studies" },
//   { value: "ONE_TO_ONE", label: "One-to-One Private" },
// ];

// function courseLabel(value) {
//   const c = COURSES.find((x) => x.value === value);
//   return c?.label ?? value;
// }

// function formatSlotTime(iso, timezone) {
//   const d = new Date(iso);
//   const time = d.toLocaleTimeString("en-GB", {
//     timeZone: timezone,
//     hour: "2-digit",
//     minute: "2-digit",
//   });
//   const parts = d.toLocaleTimeString("en-GB", {
//     timeZone: timezone,
//     timeZoneName: "shortOffset",
//   });
//   const offset = parts.split(" ").pop();
//   return { time, offset };
// }

// function formatSlotDate(iso, timezone) {
//   return new Date(iso).toLocaleDateString("en-GB", {
//     timeZone: timezone,
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
// }

// function groupSlotsByDate(slots, timezone) {
//   const groups = new Map();
//   for (const slot of slots) {
//     const key = new Date(slot.start).toLocaleDateString("en-GB", {
//       timeZone: timezone,
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//     if (!groups.has(key)) groups.set(key, []);
//     groups.get(key).push(slot);
//   }
//   return Array.from(groups.entries());
// }

// function SlotSkeleton() {
//   return (
//     <div className="flex flex-col gap-3 animate-pulse">
//       {[1, 2, 3].map((i) => (
//         <div key={i} className="h-12 rounded-[var(--radius-sm)] bg-line-light" />
//       ))}
//     </div>
//   );
// }

// export default function TrialBookingPage() {
//   const router = useRouter();
//   const { apiFetch } = useApi();

//   const [step, setStep] = useState(1);
//   const [loadingProfile, setLoadingProfile] = useState(true);
//   const [profile, setProfile] = useState(null);
//   const [error, setError] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [confirmed, setConfirmed] = useState(null);

//   const [form, setForm] = useState({
//     courseInterest: "",
//     childName: "",
//     childAge: "",
//     timezone: "",
//   });

//   const [teachers, setTeachers] = useState([]);
//   const [loadingTeachers, setLoadingTeachers] = useState(false);
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [slots, setSlots] = useState([]);
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);

//   const set = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//     setError("");
//   };

//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         const data = await apiFetch("/api/students/profile");
//         if (cancelled) return;

//         if (!data.profile) {
//           router.replace("/register/profile");
//           return;
//         }

//         setProfile(data.profile);
//         setForm({
//           courseInterest: data.profile.courseInterest,
//           childName: data.profile.childName,
//           childAge: String(data.profile.childAge),
//           timezone: data.profile.timezone,
//         });
//       } catch (err) {
//         if (!cancelled) setError(err.message);
//       } finally {
//         if (!cancelled) setLoadingProfile(false);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const loadTeachers = useCallback(async () => {
//     setLoadingTeachers(true);
//     setTeachers([]);
//     setSelectedTeacher(null);
//     setSlots([]);
//     setSelectedSlot(null);
//     try {
//       const data = await apiFetch(
//         `/api/booking/teachers?courseInterest=${encodeURIComponent(form.courseInterest)}`,
//       );
//       setTeachers(data.teachers);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoadingTeachers(false);
//     }
//   }, [form.courseInterest]);

//   const loadSlots = useCallback(
//     async (teacherId) => {
//       setLoadingSlots(true);
//       setSlots([]);
//       setSelectedSlot(null);
//       try {
//         const data = await apiFetch(
//           `/api/booking/availability?teacherId=${encodeURIComponent(teacherId)}`,
//         );
//         setSlots(data.slots);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoadingSlots(false);
//       }
//     },
//     [],
//   );

//   useEffect(() => {
//     if (step === 2 && form.courseInterest) {
//       loadTeachers();
//     }
//   }, [step, form.courseInterest, loadTeachers]);

//   const validateStep1 = () => {
//     if (!form.courseInterest) return "Please select a course.";
//     if (!form.childName.trim()) return "Please enter your child's name.";
//     if (!form.childAge) return "Please select your child's age.";
//     if (!form.timezone.trim()) return "Timezone is required.";
//     return null;
//   };

//   const validateStep2 = () => {
//     if (!selectedTeacher) return "Please select a teacher.";
//     if (!selectedSlot) return "Please select a time slot.";
//     return null;
//   };

//   const next = () => {
//     if (step === 1) {
//       const err = validateStep1();
//       if (err) {
//         setError(err);
//         return;
//       }
//       setStep(2);
//       return;
//     }
//     if (step === 2) {
//       const err = validateStep2();
//       if (err) {
//         setError(err);
//         return;
//       }
//       setStep(3);
//     }
//   };

//   const confirmBooking = async () => {
//     setSubmitting(true);
//     setError("");

//     try {
//       const result = await apiFetch("/api/booking/trial", {
//         method: "POST",
//         body: JSON.stringify({
//           teacherId: selectedTeacher.id,
//           slotStart: selectedSlot.start,
//           slotEnd: selectedSlot.end,
//           courseInterest: form.courseInterest,
//           childName: form.childName.trim(),
//           childAge: parseInt(form.childAge, 10),
//           studentTimezone: form.timezone.trim(),
//         }),
//       });
//       setConfirmed(result);
//       setStep(4);
//     } catch (err) {
//       if (err.code === "SLOT_TAKEN") {
//         setError("This slot was just taken — please pick another.");
//         setStep(2);
//         if (selectedTeacher) loadSlots(selectedTeacher.id);
//       } else if (err.code === "TRIAL_EXISTS") {
//         setError("You already have a trial class booked.");
//       } else {
//         setError(err.message);
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loadingProfile) {
//     return (
//       <div className="min-h-screen bg-surface-off-white flex items-center justify-center">
//         <p className="text-[14px] font-[600] text-content-muted">Loading…</p>
//       </div>
//     );
//   }

//   if (!profile) {
//     return null;
//   }

//   const slotGroups =
//     step === 2 && slots.length > 0
//       ? groupSlotsByDate(slots, form.timezone)
//       : [];

//   return (
//     <div className="min-h-screen bg-surface-off-white flex flex-col">
//       <div className="flex items-center justify-center py-8">
//         <Link href="/dashboard">
//           <img src="/logo2.png" alt="Quran Odyssey" className="h-10 w-auto" />
//         </Link>
//       </div>

//       <div className="flex-1 flex items-start justify-center px-6 pb-12 pt-4">
//         <div className="w-full max-w-[560px]">
//           {step < 4 && (
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-3">
//                 <span className="text-[13px] font-[700] text-content-muted">
//                   Step {Math.min(step, 3)} of 3
//                 </span>
//                 <span className="text-[13px] font-[700] text-brand-cyan-dark">
//                   {step === 1
//                     ? "Course & child"
//                     : step === 2
//                       ? "Teacher & time"
//                       : "Confirm"}
//                 </span>
//               </div>
//               <div className="h-[3px] w-full rounded bg-line-light overflow-hidden">
//                 <div
//                   className="h-full rounded bg-brand-cyan transition-all duration-500"
//                   style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
//                 />
//               </div>
//             </div>
//           )}

//           <div className="bg-white rounded-[var(--radius-lg)] border border-line-light p-8">
//             {step === 1 && (
//               <div>
//                 <h2 className="text-[22px] font-[800] tracking-[-0.03em] text-content-primary mb-1">
//                   Book your free trial
//                 </h2>
//                 <p className="text-[14px] text-content-muted mb-6">
//                   Confirm your child&apos;s details before choosing a time.
//                 </p>

//                 <div className="flex flex-col gap-5">
//                   <div className="flex flex-col gap-2">
//                     <label className="text-[12px] font-[700] text-content-primary">
//                       Course interest *
//                     </label>
//                     <select
//                       className={selectClass}
//                       value={form.courseInterest}
//                       onChange={(e) => set("courseInterest", e.target.value)}
//                     >
//                       <option value="">Select course</option>
//                       {COURSES.map((c) => (
//                         <option key={c.value} value={c.value}>
//                           {c.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <Field
//                     label="Child's name *"
//                     id="childName"
//                     value={form.childName}
//                     onChange={(v) => set("childName", v)}
//                   />

//                   <div className="flex flex-col gap-2">
//                     <label className="text-[12px] font-[700] text-content-primary">
//                       Child&apos;s age *
//                     </label>
//                     <select
//                       className={selectClass}
//                       value={form.childAge}
//                       onChange={(e) => set("childAge", e.target.value)}
//                     >
//                       <option value="">Select age</option>
//                       {Array.from({ length: 15 }, (_, i) => i + 4).map(
//                         (age) => (
//                           <option key={age} value={age}>
//                             {age} years old
//                           </option>
//                         ),
//                       )}
//                     </select>
//                   </div>

//                   <Field
//                     label="Your timezone *"
//                     id="timezone"
//                     value={form.timezone}
//                     onChange={(v) => set("timezone", v)}
//                     hint="Times in the next step are shown in this timezone."
//                   />
//                 </div>
//               </div>
//             )}

//             {step === 2 && (
//               <div>
//                 <h2 className="text-[22px] font-[800] tracking-[-0.03em] text-content-primary mb-1">
//                   Choose teacher & time
//                 </h2>
//                 <p className="text-[14px] text-content-muted mb-6">
//                   All times shown in{" "}
//                   <strong className="text-content-primary">
//                     {form.timezone}
//                   </strong>
//                   .
//                 </p>

//                 {loadingTeachers ? (
//                   <SlotSkeleton />
//                 ) : teachers.length === 0 ? (
//                   <EmptySlotsFallback />
//                 ) : (
//                   <>
//                     <div className="flex flex-col gap-2 mb-6">
//                       <label className="text-[12px] font-[700] text-content-primary">
//                         Teacher *
//                       </label>
//                       <div className="flex flex-col gap-2">
//                         {teachers.map((t) => (
//                           <button
//                             key={t.id}
//                             type="button"
//                             onClick={() => {
//                               setSelectedTeacher(t);
//                               loadSlots(t.id);
//                             }}
//                             className={[
//                               "w-full text-left rounded-[var(--radius)] border-2 p-4 transition-all",
//                               selectedTeacher?.id === t.id
//                                 ? "border-brand-cyan bg-[color-mix(in_srgb,var(--brand-cyan)_8%,transparent)]"
//                                 : "border-line-light hover:border-line-default",
//                             ].join(" ")}
//                           >
//                             <div className="text-[14px] font-[800] text-content-primary">
//                               {t.name}
//                             </div>
//                             <div className="text-[12px] text-content-muted mt-1">
//                               {t.specialty?.join(" · ")} · ★ {t.rating}
//                             </div>
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     {selectedTeacher && (
//                       <div>
//                         <label className="text-[12px] font-[700] text-content-primary block mb-3">
//                           Available slots *
//                         </label>
//                         {loadingSlots ? (
//                           <SlotSkeleton />
//                         ) : slots.length === 0 ? (
//                           <EmptySlotsFallback />
//                         ) : (
//                           <div className="flex flex-col gap-6 max-h-[320px] overflow-y-auto pr-1">
//                             {slotGroups.map(([dateLabel, daySlots]) => (
//                               <div key={dateLabel}>
//                                 <div className="text-[12px] font-[800] text-content-muted uppercase tracking-wide mb-2">
//                                   {dateLabel}
//                                 </div>
//                                 <div className="grid grid-cols-2 gap-2">
//                                   {daySlots.map((slot) => {
//                                     const { time, offset } = formatSlotTime(
//                                       slot.start,
//                                       form.timezone,
//                                     );
//                                     const selected =
//                                       selectedSlot?.start === slot.start;
//                                     return (
//                                       <button
//                                         key={slot.start}
//                                         type="button"
//                                         onClick={() => setSelectedSlot(slot)}
//                                         className={[
//                                           "rounded-[var(--radius-sm)] border-2 px-3 py-2 text-left text-[13px] transition",
//                                           selected
//                                             ? "border-brand-cyan bg-[color-mix(in_srgb,var(--brand-cyan)_8%,transparent)] font-[800]"
//                                             : "border-line-light hover:border-line-default font-[600]",
//                                         ].join(" ")}
//                                       >
//                                         <div className="text-content-primary">
//                                           {time}
//                                         </div>
//                                         <div className="text-[11px] text-content-muted">
//                                           {offset}
//                                         </div>
//                                       </button>
//                                     );
//                                   })}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             )}

//             {step === 3 && selectedTeacher && selectedSlot && (
//               <div>
//                 <h2 className="text-[22px] font-[800] tracking-[-0.03em] text-content-primary mb-1">
//                   Confirm your trial
//                 </h2>
//                 <p className="text-[14px] text-content-muted mb-6">
//                   Review the details below, then confirm your booking.
//                 </p>

//                 <dl className="flex flex-col gap-4 text-[14px]">
//                   <SummaryRow label="Child" value={form.childName} />
//                   <SummaryRow
//                     label="Course"
//                     value={courseLabel(form.courseInterest)}
//                   />
//                   <SummaryRow label="Teacher" value={selectedTeacher.name} />
//                   <SummaryRow
//                     label="Date"
//                     value={formatSlotDate(
//                       selectedSlot.start,
//                       form.timezone,
//                     )}
//                   />
//                   <SummaryRow
//                     label="Time"
//                     value={(() => {
//                       const { time, offset } = formatSlotTime(
//                         selectedSlot.start,
//                         form.timezone,
//                       );
//                       return `${time} (${offset})`;
//                     })()}
//                   />
//                 </dl>
//               </div>
//             )}

//             {step === 4 && confirmed && (
//               <div className="text-center py-4">
//                 <div className="text-[48px] mb-4">✓</div>
//                 <h2 className="text-[22px] font-[800] text-content-primary mb-2">
//                   Trial booked!
//                 </h2>
//                 <p className="text-[14px] text-content-muted mb-6">
//                   Confirmation sent to your email
//                   {profile.phone ? " and WhatsApp" : ""}.
//                 </p>
//                 <p className="text-[13px] font-[700] text-content-primary mb-1">
//                   Booking reference
//                 </p>
//                 <p className="text-[20px] font-[900] text-brand-cyan-dark tracking-widest mb-8">
//                   {confirmed.bookingRef}
//                 </p>
//                 <Link
//                   href="/dashboard"
//                   className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-6 py-[11px] text-[14px] font-[800] text-brand-navy"
//                 >
//                   Back to dashboard →
//                 </Link>
//               </div>
//             )}

//             {error && (
//               <div className="mt-5 rounded-[var(--radius-sm)] border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-[13px] font-[600] text-[#dc2626]">
//                 {error}
//               </div>
//             )}

//             {step < 4 && (
//               <div className="mt-8 flex items-center justify-between">
//                 {step > 1 ? (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setError("");
//                       setStep((s) => s - 1);
//                     }}
//                     className="text-[14px] font-[700] text-content-muted hover:text-content-primary transition"
//                   >
//                     ← Back
//                   </button>
//                 ) : (
//                   <Link
//                     href="/dashboard"
//                     className="text-[14px] font-[700] text-content-muted hover:text-content-primary"
//                   >
//                     ← Dashboard
//                   </Link>
//                 )}

//                 {step < 3 ? (
//                   <button
//                     type="button"
//                     onClick={next}
//                     className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-6 py-[11px] text-[14px] font-[800] text-brand-navy transition hover:-translate-y-[1px]"
//                   >
//                     Continue →
//                   </button>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={confirmBooking}
//                     disabled={submitting}
//                     className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-6 py-[11px] text-[14px] font-[800] text-brand-navy transition hover:-translate-y-[1px] disabled:opacity-60"
//                   >
//                     {submitting ? "Booking…" : "Confirm booking"}
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EmptySlotsFallback() {
//   return (
//     <div className="text-center py-8 px-4 rounded-[var(--radius)] border border-dashed border-line-default">
//       <p className="text-[14px] font-[700] text-content-primary mb-2">
//         No slots available right now
//       </p>
//       <p className="text-[13px] text-content-muted mb-5">
//         Our team can help you find a time that works.
//       </p>
//       <Link
//         href="/contact"
//         className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--teal)_45%,white)] px-5 py-3 text-[14px] font-[900] text-brand-navy"
//       >
//         Contact us →
//       </Link>
//     </div>
//   );
// }

// function SummaryRow({ label, value }) {
//   return (
//     <div className="flex justify-between gap-4 border-b border-line-light pb-3">
//       <dt className="font-[700] text-content-muted">{label}</dt>
//       <dd className="font-[600] text-content-primary text-right">{value}</dd>
//     </div>
//   );
// }

// const selectClass = [
//   "w-full rounded-[var(--radius-sm)] border border-line-light bg-white",
//   "px-4 py-[11px] text-[14px] font-[600] text-content-primary outline-none transition cursor-pointer",
//   "focus:border-brand-cyan focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
// ].join(" ");

// const inputClass = [
//   "w-full rounded-[var(--radius-sm)] border border-line-light bg-white",
//   "px-4 py-[11px] text-[14px] font-[500] text-content-primary outline-none transition",
//   "focus:border-brand-cyan focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-cyan)_12%,transparent)]",
// ].join(" ");

// function Field({ label, id, value, onChange, hint }) {
//   return (
//     <div className="flex flex-col gap-2">
//       <label htmlFor={id} className="text-[12px] font-[700] text-content-primary">
//         {label}
//       </label>
//       <input
//         id={id}
//         type="text"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className={inputClass}
//       />
//       {hint && <p className="text-[11px] text-content-muted">{hint}</p>}
//     </div>
//   );
// }
