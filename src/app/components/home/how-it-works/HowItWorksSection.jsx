import SectionHeader from "../shared/SectionHeader";

const STEPS = [
  {
    num: "1",
    title: "Choose your teacher",
    text: "Browse verified teachers filtered by gender, timezone, speciality, and availability. Every profile includes real student ratings and a short intro video.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    num: "2",
    title: "Book a free trial",
    text: "Pick a time slot that works for your family. A 30-minute trial class is booked automatically — email confirmation and WhatsApp reminder included, no back-and-forth.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Join and start learning",
    text: "Your child joins the class directly from their dashboard — one click, no downloads. Track progress, review homework, and see improvement week by week.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="reveal-left mb-14">
          <SectionHeader
            chip="The process"
            chipClassName="border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] text-brand-cyan-dark"
            title={
              <>
                From signup to <span className="text-brand-cyan">first class</span>{" "}
                in 3 steps.
              </>
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((s, idx) => (
            <div
              key={s.num}
              className={[
                "reveal rounded-[var(--radius-lg)] border border-line-light bg-surface-off-white p-8",
                "transition hover:-translate-y-[3px] hover:border-line-default hover:bg-white hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]",
                `reveal-delay-${idx + 1}`,
              ].join(" ")}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line-light bg-white text-[14px] font-[800] text-brand-navy">
                  {s.num}
                </div>
              </div>

              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[12px] border border-line-light bg-surface-cyan-tint text-brand-cyan">
                {s.icon}
              </div>

              <div className="text-[18px] font-[800] tracking-[-0.02em] text-content-primary">
                {s.title}
              </div>
              <p className="mt-2 text-[14px] leading-[1.75] text-content-muted">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
