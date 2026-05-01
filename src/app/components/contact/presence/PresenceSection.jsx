export default function PresenceSection() {
  return (
    <section className="bg-surface-off-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="presence-header grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-amber)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-amber)_12%,transparent)] px-4 py-[6px] text-[11px] font-[700] tracking-[0.06em] text-brand-amber-dark">
              Global presence
            </div>
            <h2 className="section-h2 text-[40px] font-[800] leading-[1.1] tracking-[-0.03em] text-content-primary md:text-[44px]">
              Built for the diaspora —
              <br />
              <span className="text-brand-cyan">timezones covered.</span>
            </h2>
          </div>
          <p className="section-sub reveal-right max-w-[520px] text-[16px] leading-[1.75] text-content-muted">
            We primarily serve families in the UK, USA, and Canada — with support hours and scheduling designed around real family routines.
          </p>
        </div>

        <div className="presence-markets reveal mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          <MarketCard
            flag="🇬🇧"
            country="United Kingdom"
            tz="GMT / BST"
            hours={"Morning, afternoon & evening slots\navailable 7 days a week"}
            pip="var(--brand-amber)"
            label="Primary market"
          />
          <MarketCard
            flag="🇺🇸"
            country="United States"
            tz="EST / CST / PST"
            hours={"All US timezones covered\nafternoon & evening slots"}
            pip="var(--brand-cyan)"
            label="Primary market"
          />
          <MarketCard
            flag="🇨🇦"
            country="Canada"
            tz="EST / CST / MST / PST"
            hours={"Eastern to Pacific covered\nflexible scheduling available"}
            pip="var(--brand-amber)"
            label="Primary market"
          />
        </div>
      </div>
    </section>
  );
}

function MarketCard({ flag, country, tz, hours, pip, label }) {
  return (
    <div className="market-card rounded-[var(--radius-lg)] border border-line-light bg-white p-7 transition hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]">
      <div className="market-flag text-[28px]">{flag}</div>
      <div className="market-country mt-3 text-[18px] font-[900] tracking-[-0.02em] text-content-primary">
        {country}
      </div>
      <div className="market-tz mt-1 text-[12px] font-[800] uppercase tracking-[0.12em] text-content-muted">
        {tz}
      </div>
      <div className="market-hours mt-4 whitespace-pre-line text-[14px] leading-[1.7] text-content-muted">
        {hours}
      </div>
      <div className="market-dot mt-5 inline-flex items-center gap-2 rounded-full border border-line-light bg-surface-off-white px-4 py-2 text-[12px] font-[800] text-content-muted">
        <span className="market-dot-pip h-2 w-2 rounded-full" style={{ background: pip }} />
        {label}
      </div>
    </div>
  );
}

