"use client";

import { useState } from "react";

export default function OptInHero() {
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <section className="flex w-full flex-col items-center px-5 pb-8 pt-12 text-center">
      {/* ── Headline ─────────────────────────────────────────── */}
      <h1 className="mb-5 max-w-[680px] text-[clamp(26px,4.5vw,44px)] font-[800] leading-[1.1] tracking-[-0.03em] text-content-primary">
        Discover the <span className="text-brand-cyan">Secret</span>{" "}
        Quran Odyssey System That&apos;s Helped{" "}
        <span className="text-brand-amber-dark">2,000+ Children</span> Build a
        Lifelong Connection With the Quran
      </h1>

      {/* ── Subheadline ──────────────────────────────────────── */}
      <p className="mb-8 text-[clamp(18px,3vw,26px)] font-[700] leading-tight tracking-[-0.02em] text-content-muted">
        (With a{" "}
        <span className="font-[800] text-brand-cyan">
          97% Parent Satisfaction Rate
        </span>
        )
      </p>

      {/* ── Video ─────────────────────────────────────────────── */}
      <div className="w-full max-w-[620px]">
        <div
          className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-line-light shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
          style={{ aspectRatio: "16/9" }}
        >
          {!videoPlaying ? (
            <button
              type="button"
              aria-label="Play video"
              onClick={() => setVideoPlaying(true)}
              className="group absolute inset-0 flex w-full cursor-pointer items-center justify-center border-none p-0"
              style={{
                background:
                  "linear-gradient(135deg, #071625 0%, #0d2840 55%, #0e3d5c 100%)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 30%, rgba(40,183,217,0.10) 0%, transparent 65%)",
                }}
              />
              <div className="relative z-[1] flex flex-col items-center gap-4">
                <div
                  className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-brand-amber transition-transform group-hover:scale-[1.08]"
                  style={{
                    boxShadow:
                      "0 0 0 14px rgba(250,167,26,0.18), 0 8px 24px rgba(250,167,26,0.45)",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <polygon points="6 4 20 12 6 20 6 4" fill="white" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-[700] text-white">
                    Watch How Quran Odyssey Works
                  </p>
                  <p className="mt-1 text-[12px] text-white/45">
                    ▼ Click To Play
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: "#071625" }}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-[40px]">🎬</span>
                <p className="text-[14px] font-[700] text-white">
                  Video Playing
                </p>
                <p className="text-[11px] text-white/35">
                  Replace with your actual video embed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
