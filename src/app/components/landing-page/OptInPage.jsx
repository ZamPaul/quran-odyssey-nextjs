"use client";

import { useRef, useState } from "react";
import OptInHero from "./OptInHero";
import { OptInMainForm, OptInStickyForm } from "./OptInForms";
import Link from "next/link";
import Image from "next/image";

const STICKY_COUNT = 7;

// ─── Social proof items used between sticky forms ─────────────
const SOCIAL_PROOF = [
  {
    quote:
      "My son refused to learn Quran with anyone. Three weeks in with Sister Aisha and he's asking me when his next class is.",
    author: "Fatimah K.",
    meta: "UK · Parent of 9-year-old",
    initials: "FK",
    bg: "linear-gradient(135deg, var(--brand-cyan), var(--brand-cyan-dark))",
  },
  {
    quote:
      "We tried four different online tutors before Quran Odyssey. The difference is the structure. My daughter actually progresses.",
    author: "Ibrahim A.",
    meta: "Canada · Parent of 11-year-old",
    initials: "IA",
    bg: "linear-gradient(135deg, var(--brand-amber), var(--brand-amber-dark))",
  },
  {
    quote:
      "The booking system alone is worth it — no chasing anyone. Ustadh Hassan is incredible with my kids.",
    author: "Mariam R.",
    meta: "USA · Parent of two students",
    initials: "MR",
    bg: "linear-gradient(135deg, var(--brand-navy), var(--bg-dark-blue))",
  },
];

function SocialProofCard({ proof }) {
  return (
    <div className="w-full rounded-[var(--radius-lg)] border border-line-light bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex gap-[3px] text-[15px] text-brand-amber">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
      <p className="text-[14px] leading-[1.75] text-content-muted">
        &ldquo;{proof.quote}&rdquo;
      </p>
      <div className="mt-4 h-px w-full bg-line-light" />
      <div className="mt-4 flex items-center gap-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-[800] text-white"
          style={{ background: proof.bg }}
        >
          {proof.initials}
        </div>
        <div>
          <div className="text-[13px] font-[800] text-content-primary">
            {proof.author}
          </div>
          <div className="text-[11px] font-[600] text-content-muted">
            {proof.meta}
          </div>
        </div>
      </div>
    </div>
  );
}

function Divider({ withLabel }) {
  return (
    <div className="flex w-full items-center justify-center gap-4 py-2">
      <div className="h-px flex-1 bg-line-light" />
      {withLabel && (
        <span className="text-[11px] font-[700] uppercase tracking-[0.08em] text-content-subtle">
          Still reading?
        </span>
      )}
      <div className="h-px flex-1 bg-line-light" />
    </div>
  );
}

export default function OptInPage() {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-surface-off-white">
      {/* ── Minimal top bar ──────────────────────────────────────── */}
      <div className="w-full border-b border-line-light bg-white">
        <div className="mx-auto flex h-[60px] max-w-[800px] items-center justify-center px-6">
          {/* <span className="text-[18px] font-[800] tracking-[-0.03em] text-content-primary">
            Quran <span className="text-brand-cyan">Odyssey</span>
          </span> */}

          <Link
            href="/"
            className="logo flex items-center gap-[10px] no-underline"
          >
            <Image
              src={`${"/logo2.png"}`}
              width={100}
              height={100}
              alt="logo"
              className=""
            />
          </Link>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <OptInHero />

      {/* ── Bridge text ──────────────────────────────────────────────── */}
      <div className="flex w-full max-w-[640px] flex-col items-center gap-3 px-6 pb-9 text-center">
        <p className="text-[15px] leading-[1.6] text-content-muted">
          Ready to see how Quran Odyssey can give your child a real, structured
          Quran education with a dedicated teacher?
        </p>
        <button
          type="button"
          onClick={scrollToForm}
          className="text-[17px] font-[700] text-brand-cyan-dark underline decoration-brand-cyan/40 underline-offset-[3px] transition hover:text-brand-cyan"
        >
          Book your free discovery call below 👇
        </button>
      </div>

      {/* ── Main form card ────────────────────────────────────────────── */}
      <div
        id="mainForm"
        ref={formRef}
        className="w-full max-w-[560px] px-6 pb-10"
      >
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line-light bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] max-[480px]:px-5">
          {/* Card header accent bar */}
          <div
            className="h-[4px] w-full"
            style={{
              background:
                "linear-gradient(90deg, var(--brand-cyan), var(--brand-amber))",
            }}
          />
          <div className="p-8 max-[480px]:p-6">
            {submitted ? (
              /* ── Success state ────────────────────────────────────── */
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_12%,white)] border border-[color-mix(in_srgb,var(--success)_25%,transparent)] text-[28px] font-[800] text-success">
                  ✓
                </div>
                <h2 className="text-[24px] font-[800] tracking-[-0.03em] text-content-primary">
                  You&apos;re booked in!
                </h2>
                <p className="max-w-[340px] text-[14px] leading-[1.7] text-content-muted">
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

      {/* ── Sticky repeating CTAs ─────────────────────────────────────── */}
      {!submitted &&
        Array.from({ length: STICKY_COUNT }).map((_, i) => (
          <div key={i} className="w-full max-w-[560px] px-6 pb-6">
            <Divider withLabel={i > 0} />

            {/* Optional social proof between every 2 sticky forms */}
            {i % 2 === 0 && i < SOCIAL_PROOF.length * 2 && (
              <div className="mb-5">
                <SocialProofCard
                  proof={SOCIAL_PROOF[Math.floor(i / 2) % SOCIAL_PROOF.length]}
                />
              </div>
            )}

            <div className="rounded-[var(--radius-lg)] border border-line-light bg-white p-7 shadow-[0_4px_16px_rgba(0,0,0,0.06)] max-[480px]:p-5">
              <OptInStickyForm index={i} onYes={scrollToForm} />
            </div>
          </div>
        ))}

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-line-light bg-white px-6 py-8 text-center">
        <p className="text-[13px] font-[500] text-content-muted">
          © 2026 Quran Odyssey · All rights reserved · Built by VISAITECH
        </p>
        <p className="mt-1 text-[12px] text-content-subtle">
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
