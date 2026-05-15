"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import OptInHero from "./OptInHero";
import { OptInMainForm, OptInStickyForm, RatingRow } from "./OptInForms";

const STICKY_COUNT = 7;

// ─── SECTION 1: Trust logos (Countries) ──────────────────────
// Equivalent to StudySmart's "Dental Schools our students are accepted into"
const TRUST_COUNTRIES = [
  { flag: "🇬🇧", name: "United Kingdom" },
  { flag: "🇺🇸", name: "United States" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇮🇪", name: "Ireland" },
  { flag: "🇳🇿", name: "New Zealand" },
];

function TrustCountriesSection() {
  return (
    <div className="w-full border-t border-line-light bg-white px-5 py-10 text-center">
      <p className="text-[11px] font-[800] uppercase tracking-[0.14em] text-content-subtle">
        Families we serve
      </p>
      <p className="mt-1 text-[15px] font-[700] text-content-primary">
        Students joining from:
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {TRUST_COUNTRIES.map((c) => (
          <div
            key={c.name}
            className="inline-flex items-center gap-2 rounded-full border border-line-light bg-surface-off-white px-4 py-[9px] text-[13px] font-[600] text-content-primary"
          >
            <span className="text-[18px]">{c.flag}</span>
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 2: Video Testimonials ───────────────────────────
// Equivalent to StudySmart's "HOW STUDYSMARTUK HAS TRANSFORMED OUR STUDENT'S LIVES!"
const TESTIMONIALS = [
  {
    stars: 5,
    name: "Fatimah K.",
    location: "UK — Parent of 9-year-old",
    quote:
      "My son went from refusing any Quran learning to asking when his next class is. Sister Aisha changed everything.",
    initials: "FK",
    bg: "linear-gradient(135deg, var(--brand-cyan), var(--brand-cyan-dark))",
  },
  {
    stars: 5,
    name: "Ibrahim A.",
    location: "Canada — Parent of 11-year-old",
    quote:
      "We tried four other tutors. Quran Odyssey is the only one with real structure. My daughter actually progresses — week by week.",
    initials: "IA",
    bg: "linear-gradient(135deg, var(--brand-amber), var(--brand-amber-dark))",
  },
  {
    stars: 5,
    name: "Mariam R.",
    location: "USA — Parent of two students",
    quote:
      "Ustadh Hassan is incredible. Both kids have gone from basic letters to reciting full Surahs in four months. The booking system alone is worth it.",
    initials: "MR",
    bg: "linear-gradient(135deg, var(--brand-navy), var(--bg-dark-blue))",
  },
];

function VideoTestimonialCard({ t }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Stars */}
      <div className="flex gap-[3px] text-[14px] text-brand-amber">
        {Array.from({ length: t.stars }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>

      {/* Video thumbnail */}
      <div
        className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-line-light"
        style={{ aspectRatio: "16/9" }}
      >
        {!playing ? (
          <button
            type="button"
            aria-label={`Play ${t.name} testimonial`}
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex w-full cursor-pointer items-center justify-center border-none p-0"
            style={{
              background: "linear-gradient(135deg, #0a1f35 0%, #0d2840 100%)",
            }}
          >
            {/* Initials avatar in bg */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-10"
              style={{ background: t.bg }}
            />
            <div
              className="relative z-[1] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-brand-amber transition-transform group-hover:scale-[1.08]"
              style={{ boxShadow: "0 0 0 10px rgba(250,167,26,0.15)" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <polygon points="6 4 20 12 6 20 6 4" fill="white" />
              </svg>
            </div>
          </button>
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "#0d2840" }}
          >
            <p className="text-[11px] font-[600] text-white/40">
              Replace with video embed
            </p>
          </div>
        )}
      </div>

      {/* Attribution */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-[800] text-white"
          style={{ background: t.bg }}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-[13px] font-[800] text-content-primary">
            {t.name}
          </div>
          <div className="text-[11px] font-[600] text-content-muted">
            {t.location}
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  return (
    <div className="w-full border-t border-line-light bg-surface-off-white px-5 py-14 text-center">
      <h2 className="mb-10 text-[clamp(18px,3.5vw,26px)] font-[800] uppercase tracking-[-0.01em] text-content-primary">
        How Quran Odyssey Has Transformed
        <br />
        Our Students&apos; Lives!
      </h2>
      <div className="mx-auto grid max-w-[680px] grid-cols-1 gap-8 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <VideoTestimonialCard key={t.name} t={t} />
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 3: Mid-page CTA ─────────────────────────────────
// Equivalent to StudySmart's "PICK A TIME TO TALK TO US"
function MidCTASection({ onBookClick }) {
  return (
    <div className="w-full border-t border-line-light bg-white px-5 py-14 text-center">
      <h2 className="mb-2 text-[clamp(18px,3.5vw,26px)] font-[800] uppercase tracking-[-0.01em] text-content-primary">
        Book a Free Discovery Call
      </h2>
      <p className="mb-7 text-[15px] font-[500] text-content-muted">
        You will speak directly with one of our lead teachers
      </p>
      <button
        type="button"
        onClick={onBookClick}
        className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-8 py-[14px] text-[15px] font-[800] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark"
        style={{ boxShadow: "0 6px 20px rgba(250,167,26,0.30)" }}
      >
        Book Your Call →
      </button>
      <div className="mt-5 flex flex-col items-center gap-1">
        <p className="text-[12px] font-[600] text-content-muted">
          Rated 4.97/5 by 2,000+ Parents and Students
        </p>
        <div className="flex gap-[3px] text-[14px] text-brand-amber">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>★</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 4: How We Deliver Results ───────────────────────
// Equivalent to StudySmart's "HOW DOES STUDYSMARTUK GUARANTEE RESULTS?"
const FEATURES = [
  {
    title: "Dedicated 1-on-1 Teacher",
    desc: "One teacher per student — not a rotation. Your child builds real rapport with a single verified teacher who knows exactly where they are and where they need to go.",
    icon: (
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="18" cy="12" r="6" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Structured Tajweed & Hifz Programme",
    desc: "Expert-led guidance through a full curriculum — Noorani Qaida, Tajweed rules, Quran Recitation, and full Hifz memorisation — progressed at your child's pace with weekly milestones.",
    icon: (
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 27.5A3.5 3.5 0 0 1 9.5 24H30"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M9.5 3H30v30H9.5A3.5 3.5 0 0 1 6 29.5v-23A3.5 3.5 0 0 1 9.5 3z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M13 10h10M13 15h7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Weekly Parent Progress Reports",
    desc: "University-specific... just kidding — parent-specific weekly written reports detailing exactly what Tajweed rule your child worked on, what they mastered, and what needs more focus. No guessing.",
    icon: (
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 18s5-10 15-10 15 10 15 10-5 10-15 10S3 18 3 18z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="18" cy="18" r="4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
];

function FeaturesSection() {
  return (
    <div className="w-full border-t border-line-light bg-surface-off-white px-5 py-14 text-center">
      <h2 className="mb-10 text-[clamp(18px,3.5vw,26px)] font-[800] uppercase tracking-[-0.01em] text-content-primary">
        How Does Quran Odyssey
        <br />
        Deliver Results?
      </h2>
      <div className="mx-auto grid max-w-[680px] grid-cols-1 gap-8 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex flex-col items-center gap-3 text-center"
          >
            {/* Icon circle */}
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-line-light bg-white text-brand-cyan shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              {f.icon}
            </div>
            <div className="text-[14px] font-[800] text-content-primary">
              {f.title}
            </div>
            <p className="text-[13px] leading-[1.7] text-content-muted">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 5: FAQ ───────────────────────────────────────────
// Equivalent to StudySmart's "FREQUENTLY ASKED QUESTIONS"
const FAQ_ITEMS = [
  {
    q: "What kind of results can I expect from the programme?",
    a: "Our students progress faster than any other tutoring setup because they have the same dedicated teacher every class. Most students move from zero Arabic reading to fluent Quran recitation within 6–12 months of consistent classes. However, every child's ability is different — what we can guarantee is that if you follow the guidance of your teacher, your child will make real, measurable progress every single month.",
  },
  {
    q: "How long do you work with each student for?",
    a: "We typically work with families for a minimum of 3 months, and most families stay with us for 1 year or more. Quran learning is a journey — not a quick fix. We're built for families who are serious about giving their child a lifelong connection with the Quran.",
  },
  {
    q: "What type of student is this for?",
    a: "Quran Odyssey is designed for children aged 5–18 at any level — from complete beginners who don't know the Arabic alphabet yet, all the way to students pursuing full Hifz (memorisation of the entire Quran). If you're unsure where your child should start, the free discovery call is exactly for that.",
  },
  {
    q: "What background do your teachers have?",
    a: "All teachers on Quran Odyssey are verified, qualified, and selected through a rigorous vetting process. They hold Ijazah (chain of transmission) in Quran recitation, have formal Islamic education backgrounds, and are experienced in teaching children online across UK, USA and Canada timezones. Each teacher is rated by parents after every class.",
  },
];

function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <div className="w-full border-t border-line-light bg-white px-5 py-14 text-center">
      <h2 className="mb-2 text-[clamp(18px,3.5vw,26px)] font-[800] uppercase tracking-[-0.01em] text-content-primary">
        Frequently Asked Questions
      </h2>
      <p className="mb-8 text-[14px] font-[500] text-content-muted">
        What do our parents and students ask the most...
      </p>

      <div className="mx-auto max-w-[640px] text-left">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <div
              key={item.q}
              className="border-b border-line-light last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex w-full items-start justify-between gap-4 py-5 text-left"
              >
                <span className="text-[14px] font-[700] leading-[1.5] text-content-primary">
                  {item.q}
                </span>
                <span
                  className={[
                    "mt-[2px] flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-line-light text-[14px] text-content-muted transition-transform duration-200",
                    isOpen ? "rotate-45" : "",
                  ].join(" ")}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="pb-5 text-[14px] leading-[1.75] text-content-muted">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Divider between sticky forms ────────────────────────────
function SectionDivider({ label }) {
  return (
    <div className="flex w-full items-center gap-3 py-1">
      <div className="h-px flex-1 bg-line-light" />
      {label && (
        <span className="text-[10px] font-[700] uppercase tracking-[0.10em] text-content-subtle">
          {label}
        </span>
      )}
      <div className="h-px flex-1 bg-line-light" />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function OptInPage() {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-surface-off-white">
      {/* ── Logo bar ─────────────────────────────────────────── */}
      <div className="w-full border-b border-line-light bg-white">
        <div className="mx-auto flex h-[60px] max-w-[720px] items-center justify-center px-5">
          <Link href="/" className="flex items-center no-underline">
            <Image
              src="/logo2.png"
              width={120}
              height={48}
              alt="Quran Odyssey"
              className="object-contain"
            />
          </Link>
        </div>
      </div>

      {/* ── Hero (headline + subheadline + video) ───────────── */}
      <div className="w-full max-w-[720px] bg-white">
        <OptInHero />
      </div>

      {/* ── Bridge text ─────────────────────────────────────── */}
      <div className="flex w-full max-w-[720px] flex-col items-center gap-2 bg-white px-5 pb-6 text-center">
        <p className="text-[14px] font-[500] leading-[1.6] text-content-muted">
          Ready to see how Quran Odyssey can give your child a real, structured
          Quran education with a dedicated teacher?
        </p>
        <button
          type="button"
          onClick={scrollToForm}
          className="text-[15px] font-[700] text-brand-cyan-dark underline decoration-brand-cyan/40 underline-offset-[3px] transition hover:text-brand-cyan"
        >
          Book your free discovery call below 👇
        </button>
      </div>

      {/* ── Main form ───────────────────────────────────────── */}
      <div
        id="mainForm"
        ref={formRef}
        className="w-full max-w-[480px] bg-white px-5 pb-8"
      >
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line-light bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div
            className="h-[4px] w-full"
            style={{
              background:
                "linear-gradient(90deg, var(--brand-cyan), var(--brand-amber))",
            }}
          />
          <div className="p-6">
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--success)_25%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,white)] text-[26px] font-[800] text-success">
                  ✓
                </div>
                <h2 className="text-[22px] font-[800] tracking-[-0.03em] text-content-primary">
                  You&apos;re booked in!
                </h2>
                <p className="max-w-[320px] text-[14px] leading-[1.7] text-content-muted">
                  We&apos;ll be in touch within 2 hours to confirm your free
                  discovery call. Check your WhatsApp and email.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-[6px] rounded-full border border-[color-mix(in_srgb,var(--success)_25%,transparent)] bg-[color-mix(in_srgb,var(--success)_8%,white)] px-4 py-[5px] text-[12px] font-[700] text-[color-mix(in_srgb,var(--success)_70%,black)]">
                    <span className="h-[7px] w-[7px] rounded-full bg-success" />
                    WhatsApp confirmation on its way
                  </span>
                  <span className="inline-flex items-center gap-[6px] rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-surface-cyan-tint px-4 py-[5px] text-[12px] font-[700] text-brand-cyan-dark">
                    <span className="h-[7px] w-[7px] rounded-full bg-brand-cyan" />
                    Email confirmation sent
                  </span>
                </div>
              </div>
            ) : (
              <OptInMainForm onSuccess={() => setSubmitted(true)} />
            )}
          </div>
        </div>
      </div>

      {/* ── [1] Trust countries logos ────────────────────────── */}
      <div className="w-full max-w-[720px]">
        <TrustCountriesSection />
      </div>

      {/* ── [2] Video testimonials ───────────────────────────── */}
      <div className="w-full max-w-[720px]">
        <TestimonialsSection />
      </div>

      {/* ── [3] Mid-page CTA ─────────────────────────────────── */}
      <div className="w-full max-w-[720px]">
        <MidCTASection onBookClick={scrollToForm} />
      </div>

      {/* ── [4] How we deliver results ───────────────────────── */}
      <div className="w-full max-w-[720px]">
        <FeaturesSection />
      </div>

      {/* ── [5] FAQ ──────────────────────────────────────────── */}
      <div className="w-full max-w-[720px]">
        <FAQSection />
      </div>

      {/* ── Sticky repeating forms (only if not submitted) ───── */}
      {/* {!submitted &&
        Array.from({ length: STICKY_COUNT }).map((_, i) => (
          <div key={i} className="w-full max-w-[480px] px-5 pb-5">
            <SectionDivider
              label={i === 0 ? "Still interested?" : "Still reading?"}
            />
            <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line-light bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              <div
                className="h-[3px] w-full"
                style={{
                  background:
                    "linear-gradient(90deg, var(--brand-cyan), var(--brand-amber))",
                }}
              />
              <div className="p-6">
                <OptInStickyForm index={i} onYes={scrollToForm} />
              </div>
            </div>
          </div>
        ))} */}

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="mt-4 w-full border-t border-line-light bg-white px-5 py-8 text-center">
        <p className="text-[12px] font-[500] text-content-muted">
          © 2026 Quran Odyssey · All rights reserved · Built by VISAITECH
        </p>
        <p className="mt-1 text-[11px] text-content-subtle">
          <a
            href="/privacy"
            className="underline underline-offset-2 transition hover:text-brand-cyan-dark"
          >
            Privacy Policy
          </a>
          {" · "}
          <a
            href="/terms"
            className="underline underline-offset-2 transition hover:text-brand-cyan-dark"
          >
            Terms of Service
          </a>
        </p>
      </footer>
    </div>
  );
}