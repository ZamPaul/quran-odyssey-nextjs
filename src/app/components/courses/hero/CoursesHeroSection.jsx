export default function CoursesHeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface-white pt-[68px]">
      <div
        className="absolute inset-0 pointer-events-none hero-grid-bg"
        style={{
          maskImage:
            "radial-gradient(ellipse 85% 65% at 55% 50%, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 65% at 55% 50%, black 20%, transparent 80%)",
        }}
      />
      <div
        className="absolute right-0 top-0 pointer-events-none"
        style={{
          width: 600,
          height: 500,
          background:
            "radial-gradient(ellipse at top right, color-mix(in srgb, var(--brand-cyan) 10%, transparent) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-0 left-[100px] pointer-events-none"
        style={{
          width: 400,
          height: 300,
          background:
            "radial-gradient(ellipse at bottom left, color-mix(in srgb, var(--brand-amber) 8%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-[2] mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-14 px-6 pb-16 pt-[72px] md:grid-cols-2 md:gap-20 md:px-[60px]">
        <div>
          <div className="hero-eyebrow flex items-center gap-[10px]">
            <span className="h-[2px] w-8 rounded bg-brand-cyan" />
            <span className="text-[12px] font-[700] uppercase tracking-[0.10em] text-brand-cyan-dark">
              Course Catalog
            </span>
          </div>
          <h1 className="mt-5 text-[44px] font-[800] leading-[1.06] tracking-[-0.03em] text-content-primary md:text-[52px]">
            A curriculum built for
            <br />
            <span className="text-brand-cyan">real, lasting</span>
            <br />
            <span className="text-brand-amber-dark">progress.</span>
          </h1>
          <p className="mt-4 max-w-[440px] text-[16px] leading-[1.75] text-content-muted">
            Six structured courses covering the full spectrum of Quranic
            education — from first letters to complete memorisation. Every
            course is teacher-led, tracked, and built to move your child
            forward.
          </p>

          <div className="level-finder mt-7">
            <div className="mb-[10px] text-[13px] font-[700] text-content-primary">
              Find the right course for your child:
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="level-chip" data-level-filter="beginner" type="button">
                🌱 Just starting out
              </button>
              <button className="level-chip" data-level-filter="intermediate" type="button">
                📖 Can read Quran
              </button>
              <button className="level-chip" data-level-filter="advanced" type="button">
                🎯 Ready for Hifz
              </button>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="rounded-[var(--radius-lg)] border border-line-light bg-white p-6 shadow-[0_24px_72px_rgba(0,0,0,0.08)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-[13px] font-[700] tracking-[-0.01em] text-content-primary">
                  Your Learning Journey
                </div>
                <div className="mt-1 text-[11px] font-[600] uppercase tracking-[0.07em] text-content-muted">
                  Typical student progression
                </div>
              </div>
              <div className="rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_20%,transparent)] bg-surface-cyan-tint px-[10px] py-1 text-[11px] font-[700] text-brand-cyan-dark">
                6 Courses
              </div>
            </div>

            <div className="flex flex-col">
              <PathStep kind="done" num="✓" name="Noorani Qaida" desc="Arabic alphabet · Letter recognition" tag="Complete" />
              <PathStep kind="active" num="2" name="Quran Recitation" desc="Fluency · Juz-by-Juz progress" tag="In Progress" />
              <PathStep kind="locked" num="3" name="Tajweed" desc="Rules of beautiful recitation" tag="Next" />
              <PathStep kind="locked" num="4" name="Hifz Programme" desc="Full Quran memorisation" tag="Advanced" lastBeforeParallel />
              <PathStep kind="parallel" num="↕" name="Islamic Studies + 1-on-1" desc="Runs alongside any stage" tag="Parallel" isLast />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-sm)] bg-surface-light px-[14px] py-[10px] text-[12px] font-[600] text-content-muted">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v4M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Trial class → teacher recommends the right starting point
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PathStep({ kind, num, name, desc, tag, isLast }) {
  const numClass =
    kind === "active"
      ? "bg-brand-cyan text-white shadow-[0_0_0_4px_var(--bg-cyan-tint)]"
      : kind === "done"
        ? "bg-success text-white"
        : kind === "parallel"
          ? "bg-brand-amber text-brand-navy"
          : "bg-surface-light text-content-subtle border-2 border-line-light";

  const tagClass =
    kind === "active"
      ? "bg-surface-cyan-tint text-brand-cyan-dark"
      : kind === "done"
        ? "bg-[color-mix(in_srgb,var(--success)_20%,white)] text-[color-mix(in_srgb,var(--success)_70%,black)]"
        : kind === "parallel"
          ? "bg-[color-mix(in_srgb,var(--brand-amber)_20%,white)] text-brand-amber-dark"
          : "bg-surface-light text-content-subtle";

  return (
    <div className="relative flex items-center gap-[14px] border-b border-line-light py-3 last:border-b-0">
      {!isLast ? (
        <div className="absolute left-[15px] top-full h-3 w-[2px] bg-line-light" />
      ) : null}
      <div className={["flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-[800]", numClass].join(" ")}>
        {num}
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-[700] tracking-[-0.01em] text-content-primary">
          {name}
        </div>
        <div className="mt-[1px] text-[11px] font-[500] text-content-muted">
          {desc}
        </div>
      </div>
      <span className={["rounded px-2 py-[2px] text-[10px] font-[700] uppercase tracking-[0.06em]", tagClass].join(" ")}>
        {tag}
      </span>
    </div>
  );
}

