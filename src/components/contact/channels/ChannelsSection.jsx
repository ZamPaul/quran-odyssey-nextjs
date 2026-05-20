import Link from "next/link";

const CHANNELS = [
  {
    tone: "wa",
    title: "WhatsApp Chat",
    desc: "Send us a voice note or a message. Tell us about your child and what you want help with — we’ll reply fast.",
    cta: "Chat on WhatsApp",
  },
  {
    tone: "email",
    title: "Email Message",
    desc: "For detailed enquiries and longer questions, use the form. We reply within 24 hours, usually faster.",
    cta: "Send a message",
  },
  {
    tone: "trial",
    title: "Free Trial Class",
    desc: "The easiest way to get answers: meet a teacher, get level assessed, and ask questions live.",
    cta: "Book Free Trial",
  },
];

export default function ChannelsSection() {
  return (
    <section className="bg-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="channels-header grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] px-4 py-[6px] text-[11px] font-[700] tracking-[0.06em] text-brand-cyan-dark">
              How to reach us
            </div>
            <h2 className="section-h2 text-[40px] font-[800] leading-[1.1] tracking-[-0.03em] text-content-primary md:text-[44px]">
              Three ways to
              <br />
              <span className="text-brand-cyan">start the conversation.</span>
            </h2>
          </div>
          <p className="section-sub reveal-right max-w-[520px] text-[16px] leading-[1.75] text-content-muted">
            Whether you want a quick answer, a detailed reply, or to skip the
            conversation entirely and just try a class — we&apos;ve made all three
            easy.
          </p>
        </div>

        <div className="channels-grid mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {CHANNELS.map((c, idx) => (
            <div
              key={c.title}
              className={[
                "channel-card reveal rounded-[var(--radius-lg)] border border-line-light bg-white p-7 transition",
                "hover:-translate-y-[3px] hover:border-line-default hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]",
                `reveal-delay-${idx + 1}`,
              ].join(" ")}
            >
              <div className="ch-icon mb-5 flex h-11 w-11 items-center justify-center rounded-[12px] border border-line-light bg-surface-off-white text-content-muted">
                {c.tone === "wa" ? "WA" : c.tone === "email" ? "@" : "★"}
              </div>
              <div className="ch-title text-[18px] font-[900] tracking-[-0.02em] text-content-primary">
                {c.title}
              </div>
              <p className="ch-desc mt-2 text-[14px] leading-[1.75] text-content-muted">
                {c.desc}
              </p>
              <Link
                href="#"
                className="mt-6 inline-flex items-center gap-2 text-[14px] font-[900] text-brand-cyan-dark transition hover:text-brand-cyan"
              >
                {c.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

