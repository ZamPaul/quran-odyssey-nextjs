"use client";

import { useRef, useState } from "react";
import OptInHero from "./OptInHero";
import { OptInMainForm, OptInStickyForm } from "./OptInForms";

const STICKY_COUNT = 7;

export default function OptInPage() {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    // Dark navy background matching the StudySmart dark-bg pattern — uses brand-navy
    <div className="flex min-h-screen flex-col items-center bg-brand-navy">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <OptInHero />

      {/* ── Bridge text ─────────────────────────────────────────── */}
      <div className="flex w-full max-w-[760px] flex-col items-center gap-[10px] px-6 pb-9 text-center">
        <p className="font-[plus-r] text-[15px] leading-[1.6] text-white/50">
          Ready to see how Quran Odyssey can give your child a real, structured
          Quran education with a dedicated teacher?
        </p>
        <button
          type="button"
          onClick={scrollToForm}
          className="font-[plus-b] text-[17px] font-[700] text-white underline decoration-brand-cyan/40 underline-offset-[3px] transition hover:text-brand-cyan"
        >
          Book your free discovery call below 👇
        </button>
      </div>

      {/* ── Main form card ───────────────────────────────────────── */}
      <div
        id="mainForm"
        ref={formRef}
        className="w-full max-w-[540px] px-6 pb-12"
      >
        <div className="rounded-2xl border border-brand-cyan/10 bg-white p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)] max-[480px]:p-5">
          {submitted ? (
            /* ── Success state ───────────────────────────────────── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_12%,white)] text-[28px] font-[800] text-success">
                ✓
              </div>
              <h2 className="font-[plus-eb] text-[24px] font-[800] tracking-[-0.03em] text-content-primary">
                You&apos;re booked in!
              </h2>
              <p className="max-w-[340px] font-[plus-r] text-[14px] leading-[1.7] text-content-muted">
                We&apos;ll be in touch within 2 hours to confirm your free
                discovery call. Check your WhatsApp and email.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-[6px] rounded-full border border-[color-mix(in_srgb,var(--success)_25%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,white)] px-4 py-[5px] font-[plus-sb] text-[12px] font-[700] text-[color-mix(in_srgb,var(--success)_70%,black)]">
                  <span className="h-[7px] w-[7px] rounded-full bg-success" />
                  WhatsApp confirmation on its way
                </span>
                <span className="inline-flex items-center gap-[6px] rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-surface-cyan-tint px-4 py-[5px] font-[plus-sb] text-[12px] font-[700] text-brand-cyan-dark">
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

      {/* ── Sticky repeating CTAs (only if not yet submitted) ────── */}
      {!submitted &&
        Array.from({ length: STICKY_COUNT }).map((_, i) => (
          <div key={i} className="w-full max-w-[540px] px-6 pb-7">
            {/* Divider line between cards — mirrors StudySmart's visual separator */}
            <div className="mb-7 flex justify-center">
              <div className="h-[2px] w-10 rounded-full bg-brand-cyan/20" />
            </div>
            <div className="rounded-[14px] border border-brand-cyan/8 bg-white p-7 shadow-[0_16px_48px_rgba(0,0,0,0.35)] max-[480px]:p-5">
              <OptInStickyForm index={i} onYes={scrollToForm} />
            </div>
          </div>
        ))}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="w-full max-w-[760px] px-6 pb-12 pt-8 text-center">
        <p className="font-[plus-r] text-[12px] text-white/20">
          © 2026 Quran Odyssey · All rights reserved · Built by VISAITECH
        </p>
        <p className="mt-1 font-[plus-r] text-[12px] text-white/20">
          <a
            href="/privacy"
            className="underline underline-offset-2 transition hover:text-brand-cyan"
          >
            Privacy Policy
          </a>
          {" · "}
          <a
            href="/terms"
            className="underline underline-offset-2 transition hover:text-brand-cyan"
          >
            Terms of Service
          </a>
        </p>
      </footer>
    </div>
  );
}
