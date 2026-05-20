const STATS = [
  {
    target: 2000,
    suffix: "+",
    label: "Students enrolled globally",
    featured: false,
  },
  {
    target: 97,
    suffix: "%",
    label: "Parent satisfaction rate — students who start, stay",
    featured: true,
  },
  {
    target: 40,
    suffix: "+",
    label: "Qualified, vetted teachers",
    featured: false,
  },
  {
    target: 18,
    suffix: "+",
    label: "Countries · families everywhere",
    featured: false,
  },
];

export default function NumbersSection() {
  return (
    <section className="relative overflow-hidden px-6 py-[30px] md:px-[60px]">
      {/* <div className="absolute inset-0 pointer-events-none opacity-60 numbers-bg" /> */}

      <div className="relative z-[2] mx-auto w-full max-w-[1240px]">
        <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <div className="section-chip inline-flex items-center rounded-full border-[0.1px] apply-cyan-chip px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em]">
              By the numbers
            </div>
            <h2 className="mt-4 text-[40px] font-[plus-eb] leading-[1.08] tracking-[-0.03em] md:text-[44px]">
              A platform parents{" "}
              <span className="text-brand-cyan">actually trust.</span>
            </h2>
          </div>

          <p className="numbers-sub max-w-[520px] text-secondary-styling">
            Real numbers from real families who chose Quran Odyssey. No inflated
            metrics. No borrowed testimonials. These are our students.
          </p>
        </div>

        <div className="stat-grid reveal grid grid-cols-1 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className={[
                "stat-item rounded-[var(--radius-lg)] px-6 py-6 transition",
                s.featured
                  ? "border-transparent bg-brand-amber hover:bg-brand-amber-dark"
                  : "bg-brand-navy hover:bg-brand-navy-dark/90",
              ].join(" ")}
              data-target={s.target}
            >
              <div
                className={[
                  "stat-num mb-1 text-[36px] font-[plus-b] tracking-[-0.03em]",
                  s.featured ? "text-brand-navy" : "text-white",
                ].join(" ")}
              >
                <span className={`counter ${s.featured ? "" : "text-white"}`}>
                  {s.target}
                </span>
                <span
                  className={[
                    "stat-suffix",
                    s.featured ? "text-brand-navy/60" : "text-white/70",
                  ].join(" ")}
                >
                  {s.suffix}
                </span>
              </div>
              <div
                className={[
                  "stat-label text-[13px] font-[plus-b] leading-[1.5em]",
                  s.featured ? "text-brand-navy/70" : "text-white/80",
                ].join(" ")}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* <div className="country-row mt-8 rounded-[var(--radius-lg)] border-[1.5px] border-brand-cyan/50 bg-brand-cyan/2 px-6 py-5">
          <div className="country-label text-[11px] font-[plus-b] uppercase tracking-[0.10em] text-text-primary">
            Primary markets
          </div>
          <div className="country-flags mt-3 flex flex-wrap gap-3">
            <CountryItem dotColor="var(--brand-amber)">
              <span className="text-text-secondary"> 🇬🇧 United Kingdom</span>
            </CountryItem>
            <CountryItem dotColor="var(--brand-amber)">
              <span className="text-text-secondary"> 🇺🇸 United States</span>
            </CountryItem>
            <CountryItem dotColor="var(--brand-cyan)" delay="1.5s">
              <span className="text-text-secondary"> 🇨🇦 Canada </span>
            </CountryItem>
          </div>
        </div> */}

        <div className="country-row reveal mt-8 rounded-[var(--radius-lg)] border border-white/10 bg-brand-navy px-6 py-5">
          <div className="country-label text-[11px] font-[700] uppercase tracking-[0.10em] text-white/35">
            Primary markets
          </div>
          <div className="country-flags mt-3 flex flex-wrap gap-3">
            <CountryItem dotColor="var(--brand-amber)">🇬🇧 United Kingdom</CountryItem>
            <CountryItem dotColor="var(--brand-amber)">🇺🇸 United States</CountryItem>
            <CountryItem dotColor="var(--brand-cyan)">🇨🇦 Canada</CountryItem>
          </div>
        </div>
      </div>
    </section>
  );
}

function CountryItem({ children, dotColor, delay }) {
  return (
    <div className="country-item inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-[600] text-white/80">
      <span
        className="country-dot h-[8px] w-[8px] rounded-full"
        style={{ background: dotColor, animationDelay: delay }}
      />
      {children}
    </div>
  );
}
