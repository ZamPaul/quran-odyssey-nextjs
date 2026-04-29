import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-surface-off-white px-6 py-[90px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="cta-card reveal overflow-hidden rounded-[var(--radius-lg)] bg-brand-navy px-7 py-10 md:px-12 md:py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div className="cta-left">
              <div className="section-chip mb-5 inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_15%,transparent)] px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em] text-[color-mix(in_srgb,var(--brand-cyan)_90%,white)]">
                Ready to begin
              </div>
              <h2 className="cta-h2 text-[40px] font-[800] leading-[1.08] tracking-[-0.03em] text-white md:text-[44px]">
                Give your child the start
                <br />
                they <span className="text-brand-cyan">deserve.</span>
              </h2>
              <p className="cta-text mt-4 max-w-[520px] text-[16px] leading-[1.75] text-white/50">
                Book a free 30-minute trial class — no commitment, no pressure.
                If it&apos;s not the right fit for your family, we&apos;ll tell
                you honestly. That&apos;s the kind of academy we are.
              </p>
            </div>

            <div className="cta-right flex flex-col gap-3 md:items-end">
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-white px-7 py-[13px] text-[14px] font-[800] text-brand-navy transition hover:-translate-y-[2px] hover:bg-white/90"
              >
                Book a Free Trial
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border border-white/15 bg-white/5 px-7 py-[13px] text-[14px] font-[800] text-white transition hover:-translate-y-[1px] hover:bg-white/10"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M13.5 10.5c-.8-.1-1.6-.3-2.3-.5-.3-.1-.6 0-.8.2l-1 1.3c-2-1-3.6-2.5-4.5-4.5l1.3-1c.2-.2.3-.5.2-.8-.2-.7-.4-1.5-.5-2.3C5.8 2.4 5.2 2 4.5 2H2.8C2 2 1.5 2.6 1.5 3.4 1.8 9.5 6.5 14.2 12.6 14.5c.8 0 1.4-.5 1.4-1.3v-1.7c0-.7-.4-1.3-1-1.5z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                Chat on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
