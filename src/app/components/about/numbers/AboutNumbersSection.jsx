const STATS = [
  { target: 1400, suffix: "+", label: "Trial classes booked", featured: false },
  {
    target: 97,
    suffix: "%",
    label: "Parent satisfaction rating — students who start, stay",
    featured: true,
  },
  { target: 6, suffix: " yrs", label: "Avg. teacher tenure on platform", featured: false },
  { target: 18, suffix: "+", label: "Countries students connect from", featured: false },
  { target: 40, suffix: "+", label: "Qualified teachers on the platform", featured: false },
];

export default function AboutNumbersSection() {
  return (
    <section className="relative overflow-hidden bg-brand-navy px-6 py-[110px] md:px-[60px]">
      <div className="absolute inset-0 pointer-events-none opacity-60 numbers-bg" />

      <div className="relative z-[2] mx-auto w-full max-w-[1240px]">
        <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <div className="section-chip inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em] text-white/70">
              The odyssey so far
            </div>
            <h2 className="mt-4 text-[40px] font-[800] leading-[1.08] tracking-[-0.03em] text-white md:text-[44px]">
              Numbers that mean <span className="text-brand-cyan">something.</span>
            </h2>
          </div>
          <p className="numbers-sub reveal-right max-w-[520px] text-[16px] font-[400] leading-[1.75] text-white/60">
            We don&apos;t inflate these. Every number here is real — earned through
            consistent teaching, genuine relationships, and families that came back
            and told their friends.
          </p>
        </div>

        <div className="stat-grid reveal grid grid-cols-1 gap-4 md:grid-cols-5">
          {STATS.map((s) => (
            <div
              key={s.label}
              className={[
                "stat-item rounded-[var(--radius-lg)] border px-6 py-6 transition",
                s.featured
                  ? "border-transparent bg-brand-amber hover:bg-brand-amber-dark"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
              ].join(" ")}
              data-target={s.target}
            >
              <div
                className={[
                  "stat-num mb-1 text-[34px] font-[800] tracking-[-0.03em]",
                  s.featured ? "text-brand-navy" : "text-white",
                ].join(" ")}
              >
                <span className="counter">{s.target}</span>
                <span className={s.featured ? "text-brand-navy/50" : "text-white/50"}>
                  {s.suffix}
                </span>
              </div>
              <div
                className={[
                  "stat-label text-[13px] font-[600] leading-[1.5]",
                  s.featured ? "text-brand-navy/60" : "text-white/60",
                ].join(" ")}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="country-row reveal mt-8 rounded-[var(--radius-lg)] border border-white/10 bg-white/5 px-6 py-5">
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

function CountryItem({ children, dotColor }) {
  return (
    <div className="country-item inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-[600] text-white/80">
      <span className="country-dot h-[8px] w-[8px] rounded-full" style={{ background: dotColor }} />
      {children}
    </div>
  );
}

