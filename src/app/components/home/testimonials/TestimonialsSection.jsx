const TESTIMONIALS = [
  {
    featured: false,
    text: "My son refused to learn Quran with anyone. Three weeks in with Sister Aisha and he's asking me when his next class is. Whatever she's doing, it's working.",
    author: "Fatimah K.",
    meta: "UK · Parent of 9-year-old",
  },
  {
    featured: true,
    text: "We tried four different online tutors before Quran Odyssey. The difference is the structure. My daughter actually progresses — there's a plan, not just weekly sessions that go nowhere.",
    author: "Ibrahim A.",
    meta: "Canada · Parent of 11-year-old",
  },
  {
    featured: false,
    text: "Ustadh Hassan is incredible with my kids. They've gone from struggling with basic letters to reciting Surah Al-Mulk in four months. The booking system alone is worth it — no chasing anyone.",
    author: "Mariam R.",
    meta: "USA · Parent of two students",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="testimonials-header reveal-left mb-14">
          <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em] text-brand-cyan-dark">
            Parent voices
          </div>
          <h2 className="mt-4 text-[40px] font-[800] leading-[1.08] tracking-[-0.03em] text-content-primary md:text-[44px]">
            What families <span className="text-brand-cyan">actually say.</span>
          </h2>
        </div>

        <div className="testimonial-grid grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={t.author}
              className={[
                "testimonial-card reveal rounded-[var(--radius-lg)] border p-7 transition",
                t.featured
                  ? "border-transparent bg-brand-navy text-white"
                  : "border-line-light bg-white hover:-translate-y-[3px] hover:border-line-default hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]",
                `reveal-delay-${idx + 1}`,
              ].join(" ")}
            >
              {!t.featured ? (
                <svg
                  className="quote-icon mb-4 text-content-subtle"
                  width="40"
                  height="32"
                  viewBox="0 0 40 32"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 20V32h12V20H4C4 13.4 6.7 8.7 12 6L10 2C4 4.7 0 11.3 0 20zm20 0V32h12V20h-8c0-6.6 2.7-11.3 8-14l-2-4c-6 2.7-10 9.3-10 18z"
                    fill="currentColor"
                  />
                </svg>
              ) : null}

              <div className="stars mb-4 flex gap-1 text-brand-amber">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="star">
                    ★
                  </span>
                ))}
              </div>

              <p
                className={[
                  "testimonial-text text-[14px] leading-[1.75]",
                  t.featured ? "text-white/85" : "text-content-muted",
                ].join(" ")}
              >
                {t.text}
              </p>

              <div
                className={[
                  "t-divider my-6 h-px w-full",
                  t.featured ? "bg-white/10" : "bg-line-light",
                ].join(" ")}
              />

              <div
                className={[
                  "t-author text-[14px] font-[800]",
                  t.featured ? "text-white" : "text-content-primary",
                ].join(" ")}
              >
                {t.author}
              </div>
              <div
                className={[
                  "t-meta mt-1 text-[12px] font-[600]",
                  t.featured ? "text-white/40" : "text-content-subtle",
                ].join(" ")}
              >
                {t.meta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
