export default function LearningPathwaySection() {
  return (
    <section className="relative overflow-hidden bg-brand-navy px-6 py-[100px] md:px-[60px]">
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-[2] mx-auto w-full max-w-[1240px]">
        <div className="pathway-header reveal">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
            <div>
              <div className="section-chip inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-[6px] text-[11px] font-[700] tracking-[0.06em] text-white/80">
                The journey
              </div>
              <h2 className="mt-4 text-[40px] font-[800] leading-[1.1] tracking-[-0.03em] text-white md:text-[44px]">
                How our <span className="text-brand-cyan">courses connect.</span>
              </h2>
            </div>
            <p className="pathway-sub max-w-[520px] text-[16px] leading-[1.75] text-white/60">
              Most students follow the core pathway — Qaida → Recitation → Tajweed → Hifz. Islamic Studies and private
              classes run alongside any stage. Your teacher helps you decide where to start.
            </p>
          </div>
        </div>

        <div className="pathway-track reveal mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Node n="1" tone="cyan" badge="Start here" title="Noorani Qaida" sub="Arabic alphabet & basic reading" primary />
          <Node n="2" tone="navy" badge="Core stage" title="Quran Recitation" sub="Fluency · Juz progression" />
          <Node n="3" tone="cyan2" badge="Refinement" title="Tajweed Rules" sub="Precision & beautiful recitation" />
          <Node n="4" tone="amber" badge="Pinnacle" title="Hifz Programme" sub="Full Quran memorisation" highlight />
        </div>

        <div className="reveal mt-6">
          <div className="parallel-label text-[12px] font-[800] uppercase tracking-[0.12em] text-white/35">
            Runs in parallel with any stage above
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ParallelCard
              tone="cyan"
              title="Islamic Studies"
              sub="Stories, pillars, character · Ages 6–14"
            />
            <ParallelCard
              tone="amber"
              title="One-to-One Private Classes"
              sub="Any subject · Fully custom · All ages"
              orangeTint
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Node({ n, tone, badge, title, sub, highlight, primary }) {
  const circleBg =
    tone === "amber"
      ? "linear-gradient(135deg, var(--brand-amber), var(--brand-amber-dark))"
      : tone === "navy"
        ? "linear-gradient(135deg, var(--bg-dark-blue), var(--brand-navy))"
        : tone === "cyan2"
          ? "linear-gradient(135deg, var(--brand-cyan), color-mix(in_srgb,var(--brand-cyan)_70%,white))"
          : "linear-gradient(135deg, var(--brand-cyan), var(--brand-cyan-dark))";

  return (
    <div className="pathway-node flex flex-col items-start gap-3">
      <div
        className="pn-circle flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-[900] text-white"
        style={{ background: circleBg }}
      >
        {n}
      </div>
      <div
        className={[
          "pn-card w-full rounded-[var(--radius-lg)] border px-5 py-4",
          highlight ? "border-[color-mix(in_srgb,var(--brand-amber)_35%,transparent)] bg-white/10" : "border-white/10 bg-white/5",
          primary ? "ring-1 ring-[color-mix(in_srgb,var(--brand-cyan)_35%,transparent)]" : "",
        ].join(" ")}
      >
        <div className="pn-num text-[11px] font-[800] uppercase tracking-[0.12em] text-white/50">
          {badge}
        </div>
        <div className="pn-title mt-1 text-[16px] font-[900] tracking-[-0.02em] text-white">
          {title}
        </div>
        <div className="pn-sub mt-1 text-[12px] font-[600] text-white/60">
          {sub}
        </div>
      </div>
    </div>
  );
}

function ParallelCard({ tone, title, sub, orangeTint }) {
  const iconStroke = tone === "amber" ? "var(--brand-amber)" : "var(--brand-cyan)";
  const iconBg =
    tone === "amber"
      ? "color-mix(in_srgb,var(--brand-amber)_10%,transparent)"
      : "color-mix(in_srgb,var(--brand-cyan)_10%,transparent)";
  const iconBorder =
    tone === "amber"
      ? "color-mix(in_srgb,var(--brand-amber)_20%,transparent)"
      : "color-mix(in_srgb,var(--brand-cyan)_20%,transparent)";

  return (
    <div
      className={[
        "parallel-card flex items-center gap-4 rounded-[var(--radius-lg)] border border-white/10 bg-white/5 px-5 py-4",
        orangeTint ? "bg-[color-mix(in_srgb,var(--brand-amber)_10%,transparent)]" : "",
      ].join(" ")}
    >
      <div
        className="pc-icon flex h-10 w-10 items-center justify-center rounded-[12px] border"
        style={{ background: iconBg, borderColor: iconBorder }}
      >
        {tone === "amber" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="4" stroke={iconStroke} strokeWidth="1.6" />
            <path
              d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
              stroke={iconStroke}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke={iconStroke}
              strokeWidth="1.6"
            />
          </svg>
        )}
      </div>
      <div>
        <div className="pc-title text-[14px] font-[900] tracking-[-0.01em] text-white">
          {title}
        </div>
        <div className="pc-sub mt-1 text-[12px] font-[600] text-white/60">
          {sub}
        </div>
      </div>
    </div>
  );
}

