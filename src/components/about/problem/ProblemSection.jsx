import SectionHeader from "../../home/shared/SectionHeader";

const PROBLEMS = [
  {
    num: "1",
    title: "Changing teachers, changing progress",
    text: "Many students were assigned different teachers every few weeks. Each change disrupted learning, reduced confidence, and made it difficult to build a meaningful teacher-student relationship.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M18 4C10.268 4 4 10.268 4 18s6.268 14 14 14 14-6.268 14-14S25.732 4 18 4z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M18 12v8M18 24v2"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    num: "2",
    title: "Schedules that didn't fit real life",
    text: "Fixed class times often forced families to choose between school, work, activities, and Quran learning. Parents needed flexibility that worked around their routines, not against them.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="4"
          y="6"
          width="28"
          height="24"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M4 12h28M12 6v6M24 6v6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M10 20h6M20 20h6M10 26h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Parents had little visibility",
    text: "Many families had no clear way to track progress. They didn't know what their child had learned, where improvement was needed, or whether goals were being achieved consistently.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="14" cy="12" r="6" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M4 30c0-5.523 4.477-10 10-10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M26 20l-6 6 3 3 9-9-6-6-3 3 3 3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function ProblemSection() {
  return (
    <section className="bg-surface-off-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="problem-header reveal mb-14">
          <SectionHeader
            chip="What we kept seeing"
            chipClassName="border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] text-brand-cyan-dark"
            title={
              <>
                The challenges families
                <br />
                <span className="text-brand-cyan">were facing.</span>
              </>
            }
            // subtitle="Thousands of families in the diaspora wanted structured, reliable Quran education for their children. What they found instead was this."
          />
        </div>

        <div className="problem-grid grid grid-cols-1 gap-5 md:grid-cols-3">
          {PROBLEMS.map((p, idx) => (
            <div
              key={p.num}
              className={[
                "problem-card reveal rounded-[var(--radius-lg)] border border-line-light bg-white p-7 transition",
                "hover:-translate-y-[3px] hover:border-line-default hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]",
                `reveal-delay-${idx + 1}`,
              ].join(" ")}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="problem-num-chip flex h-8 w-8 items-center justify-center rounded-full border border-line-light bg-surface-light text-[13px] font-[800] text-brand-navy">
                  {p.num}
                </div>
                <div className="problem-icon-wrap flex h-11 w-11 items-center justify-center rounded-[12px] border border-line-light bg-surface-cyan-tint text-brand-cyan">
                  {p.icon}
                </div>
              </div>
              <div className="problem-title text-[18px] font-[800] tracking-[-0.02em] text-content-primary">
                {p.title}
              </div>
              <p className="problem-text mt-2 text-[14px] leading-[1.75] text-content-muted">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
