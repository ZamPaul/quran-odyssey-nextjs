import Image from "next/image";
import Link from "next/link";

const METHODS = [
  {
    tone: "wa",
    label: "WhatsApp",
    value: "Fastest reply · 2 hours",
    desc: "Send a message and we’ll respond quickly during support hours.",
    button: "Chat on WhatsApp",
  },
  {
    tone: "email",
    label: "Email",
    value: "Detailed reply · 24 hours",
    desc: "Use the form below for enquiries, pricing, or technical issues.",
    button: "Send a message",
  },
  {
    tone: "trial",
    label: "Free Trial",
    value: "Best option · speak to a teacher",
    desc: "Book a free 30-minute trial and ask everything live.",
    button: "Book Free Trial",
  },
];

export default function ContactHeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface-white pt-[68px]">
      {/* <div className="hero-grid-bg absolute inset-0 pointer-events-none" />
      <div className="hero-glow hero-glow-a absolute right-0 top-0 pointer-events-none" />
      <div className="hero-glow hero-glow-b absolute bottom-0 left-[180px] pointer-events-none" /> */}

      <Image
        src={`/Frame.png`}
        className="absolute top-0 left-0 w-full h-full object-cover"
        width={1000}
        height={1000}
        alt="zmdjic"
      />

      <div className="relative z-[2] mx-auto w-full max-w-[1240px] px-6 pb-10 pt-[72px] md:px-[60px]">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <div className="hero-eyebrow flex items-center gap-3">
              <span className="h-[2px] w-8 rounded bg-brand-cyan" />
              <span className="text-[12px] font-[700] uppercase tracking-[0.10em] text-brand-cyan-dark">
                Contact Us
              </span>
            </div>
            <h1 className="mt-5 text-[44px] font-[plus-eb] leading-[1.06] tracking-[-0.03em] text-content-primary md:text-[52px]">
              Questions? Let&apos;s get you{" "}
              <span className="text-brand-cyan">answers</span>.
            </h1>
            <p className="mt-4 max-w-[520px] text-[16px] leading-[1.75] text-content-muted">
              Whether you&apos;re ready to book a trial, need help choosing the
              right course, or have a platform question — we&apos;ll reply fast
              and clearly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {METHODS.map((m, idx) => (
              <Link
                key={m.label}
                href="#"
                className={[
                  "method-card reveal flex items-center gap-4 rounded-[var(--radius-lg)] border p-5 transition",
                  "hover:-translate-y-[3px] hover:shadow-[0_12px_36px_rgba(0,0,0,0.09)]",
                  idx === 0
                    ? "primary border-transparent bg-[color-mix(in_srgb,var(--success)_90%,white)] text-white hover:bg-[color-mix(in_srgb,var(--teal)_55%,black)]"
                    : idx === 2
                      ? "navy border-transparent bg-brand-navy text-white hover:bg-surface-dark-blue"
                      : "border-line-light bg-white",
                  `reveal-delay-${(idx % 3) + 1}`,
                ].join(" ")}
              >
                <div
                  className={[
                    "mc-icon flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)]",
                    idx === 0
                      ? "bg-white/20"
                      : idx === 2
                        ? "bg-[color-mix(in_srgb,var(--brand-cyan)_15%,transparent)]"
                        : "border border-[color-mix(in_srgb,var(--brand-cyan)_20%,transparent)] bg-surface-cyan-tint",
                  ].join(" ")}
                >
                  <span className="text-[16px] font-[900]">
                    {idx === 0 ? "WA" : idx === 1 ? "@" : "★"}
                  </span>
                </div>
                <div className="flex-1">
                  <div
                    className={[
                      "mc-label text-[11px] font-[700] uppercase tracking-[0.08em]",
                      idx === 0
                        ? "text-white/70"
                        : idx === 2
                          ? "text-white/50"
                          : "text-content-muted",
                    ].join(" ")}
                  >
                    {m.label}
                  </div>
                  <div
                    className={[
                      "mc-value text-[15px] font-[700] tracking-[-0.01em]",
                      idx === 0 || idx === 2
                        ? "text-white"
                        : "text-content-primary",
                    ].join(" ")}
                  >
                    {m.value}
                  </div>
                  <div
                    className={[
                      "mt-1 text-[13px] font-[500]",
                      idx === 0 || idx === 2
                        ? "text-white/70"
                        : "text-content-muted",
                    ].join(" ")}
                  >
                    {m.desc}
                  </div>
                </div>
                <div className="mc-arrow text-white/60 transition group-hover:translate-x-1">
                  →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
