import SectionHeader from "../../home/shared/SectionHeader";

const PILLARS = [
  {
    num: "1",
    counter: "01 / 03",
    title: "Consistency over intensity",
    text: "One dedicated teacher per student, not a rotation. Learning Quran is a relationship — between the student, the text, and the teacher. We protect that relationship. Your child will not be passed around.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    num: "2",
    counter: "02 / 03",
    title: "Parents in the loop, always",
    text: "Weekly progress updates, not vague reassurances. You'll know exactly what Tajweed rule your child worked on this week, what they've mastered, and what needs more attention. Transparency is not optional here.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    num: "3",
    counter: "03 / 03",
    title: "Learning that fits your life",
    text: "Timezone-matched scheduling means no more choosing between bedtime and class time. Slots available across UK, North American, and Australian hours. Your schedule is real — we work around it.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
];

export default function PhilosophySection() {
  return (
    <section className="bg-surface-off-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <SectionHeader
              chip="How we think"
              chipClassName="border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] text-brand-cyan-dark"
              title={
                <>
                  Three principles that
                  <br />
                  <span className="text-brand-cyan">guide everything</span> we do.
                </>
              }
            />
          </div>
          <p className="section-sub reveal-right max-w-[520px] text-[16px] font-[400] leading-[1.75] text-content-muted">
            These aren&apos;t values we wrote for a website. They&apos;re the actual
            decisions we make every day — about teacher hiring, scheduling policies,
            and how we build this platform.
          </p>
        </div>

        <div className="pillar-grid grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map((p, idx) => (
            <div
              key={p.num}
              className={[
                "pillar-card reveal rounded-[var(--radius-lg)] border border-line-light bg-white p-7 transition",
                "hover:-translate-y-[3px] hover:border-line-default hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]",
                `reveal-delay-${idx + 1}`,
              ].join(" ")}
            >
              <div className="pillar-badge mb-5 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line-light bg-surface-light text-[13px] font-[900] text-brand-navy">
                  {p.num}
                </div>
                <span className="text-[12px] font-[800] tracking-[0.16em] text-content-subtle">
                  {p.counter}
                </span>
              </div>

              <div className="pillar-icon-wrap mb-5 flex h-11 w-11 items-center justify-center rounded-[12px] border border-line-light bg-surface-cyan-tint text-brand-cyan">
                {p.icon}
              </div>

              <div className="pillar-accent-line mb-5 h-[2px] w-10 rounded bg-brand-cyan" />

              <div className="pillar-title text-[18px] font-[900] tracking-[-0.02em] text-content-primary">
                {p.title}
              </div>
              <p className="pillar-text mt-2 text-[14px] leading-[1.75] text-content-muted">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

