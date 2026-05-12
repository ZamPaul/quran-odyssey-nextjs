"use client";

import { useState } from "react";

export default function OptInHero() {
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <section className="flex w-full max-w-[760px] flex-col items-center px-6 pb-10 pt-14 text-center">
      {/* Star rating */}
      <div className="mb-5 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-[18px] leading-none text-brand-amber">
            ★
          </span>
        ))}
        <span className="ml-2 text-[13px] font-[600] text-white/50">
          Rated 4.97 by 2,000+ Parents
        </span>
      </div>

      {/* Headline */}
      <h1 className="mb-4 text-[clamp(26px,5vw,46px)] font-[plus-eb] font-[800] leading-[1.15] tracking-[-0.03em] text-white">
        Discover the{" "}
        <span className="text-brand-cyan">Secret Quran Odyssey System</span>{" "}
        That&apos;s Helped{" "}
        <span className="text-brand-amber">2,000+ Children</span> Build a
        Lifelong Connection With the Quran
      </h1>

      {/* Subheadline */}
      <p className="mb-9 text-[clamp(17px,3vw,24px)] font-[700] leading-tight tracking-[-0.02em] text-white/70">
        (With a{" "}
        <span className="font-[plus-eb] font-[800] text-brand-cyan">
          97% Parent Satisfaction Rate
        </span>
        )
      </p>

      {/* Video */}
      <div className="mb-7 w-full max-w-[600px]">
        <div className="relative w-full overflow-hidden rounded-2xl border border-brand-cyan/30 shadow-[0_24px_64px_rgba(0,0,0,0.5)] aspect-video">
          {!videoPlaying ? (
            <button
              type="button"
              aria-label="Play video"
              onClick={() => setVideoPlaying(true)}
              className="group absolute inset-0 flex w-full cursor-pointer items-center justify-center border-none bg-[linear-gradient(135deg,#0a1f35_0%,#1a3d5c_60%,#0e4a5e_100%)] p-0 transition-opacity hover:opacity-90"
            >
              {/* subtle glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(40,183,217,0.08)_0%,transparent_60%)]" />

              <div className="relative z-[1] flex flex-col items-center gap-4">
                {/* Play button */}
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-brand-amber shadow-[0_0_0_12px_rgba(250,167,26,0.15),0_8px_24px_rgba(250,167,26,0.4)] transition-transform group-hover:scale-[1.08] group-hover:shadow-[0_0_0_20px_rgba(250,167,26,0.1),0_12px_32px_rgba(250,167,26,0.4)]">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <polygon points="6 4 20 12 6 20 6 4" fill="white" />
                  </svg>
                </div>
                {/* CTA text */}
                <div className="text-center">
                  <p className="font-[plus-b] text-[16px] font-[700] text-white">
                    Watch How Quran Odyssey Works
                  </p>
                  <p className="mt-1 font-[plus-r] text-[13px] text-white/45">
                    ▼ Click To Play
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#071625]">
              <div className="flex flex-col items-center gap-2 text-center text-white">
                <span className="text-[40px]">🎬</span>
                <p className="font-[plus-b] text-[14px] font-[700]">
                  Video Playing
                </p>
                <p className="font-[plus-r] text-[11px] text-white/35">
                  Replace with your actual video embed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trust strip */}
      <div className="flex flex-wrap items-center justify-center gap-4 font-[plus-sb] text-[12px] font-[600] text-white/45">
        <div className="flex items-center gap-[6px]">
          <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-success" />
          <span>2,000+ Students Enrolled</span>
        </div>
        <div className="h-[14px] w-px bg-white/12" />
        <div className="flex items-center gap-[6px]">
          <span className="h-[7px] w-[7px] rounded-full bg-brand-amber" />
          <span>40+ Qualified Teachers</span>
        </div>
        <div className="h-[14px] w-px bg-white/12" />
        <div className="flex items-center gap-[6px]">
          <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-success" />
          <span>UK · USA · Canada</span>
        </div>
      </div>
    </section>
  );
}
