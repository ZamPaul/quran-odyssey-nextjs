import SectionHeader from "../shared/SectionHeader";

const COURSES = [
  {
    num: "01",
    title: "Noorani Qaida",
    text: "The foundation every young reader needs. Arabic letter recognition, pronunciation, and the building blocks of Quran recitation — done properly from day one.",
    tag: "Ages 5–10 · Beginner",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Quran Recitation",
    text: "Fluent, confident recitation with proper Makharij. Students move through Juz at their own pace with weekly checkpoints and teacher feedback built in.",
    tag: "All Ages · Intermediate",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Tajweed",
    text: "The science of beautiful recitation. Rules of Tajweed taught in the context of actual Quranic verses — not just memorised theory, but applied practice every lesson.",
    tag: "Ages 8+ · Intermediate",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 8v4l3 3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Hifz Programme",
    text: "Full Quran memorisation with a structured Juz-by-Juz approach. Dedicated Hifz teachers, revision timetables, and parent progress reports every two weeks.",
    tag: "Ages 7+ · Advanced",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 11l3 3L22 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    num: "05",
    title: "Islamic Studies",
    text: "Stories of the Prophets, the five pillars, Islamic manners and character — age-appropriate lessons that build identity alongside Quranic education.",
    tag: "Ages 6–14 · All Levels",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    num: "06",
    title: "One-to-One Classes",
    text: "Private lessons for students who need undivided attention. Choose your teacher, your schedule, and your focus area. Completely flexible around your family.",
    tag: "All Ages · Flexible",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function CoursesSection() {
  return (
    <section className="bg-surface-off-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <SectionHeader
              chip="What we teach"
              chipClassName="border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] text-brand-cyan-dark"
              title={
                <>
                  Courses built for
                  <br />
                  <span className="text-brand-cyan">real progress.</span>
                </>
              }
            />
          </div>
          <p className="section-sub reveal-right max-w-[520px] text-[16px] font-[400] leading-[1.75] text-content-muted">
            Every course is structured, teacher-led, and tracked. No generic
            YouTube videos. No inconsistent one-off tutors. Curriculum that
            actually moves your child forward.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {COURSES.map((c, idx) => (
            <div
              key={c.num}
              className={[
                "reveal rounded-[var(--radius-lg)] border-[1px] border-neutral-300 bg-white p-7",
                "hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)] transition-all ease-in-out duration-200",
                // `reveal-delay-${(idx % 3) + 1}`,
              ].join(" ")}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="text-[12px] font-[800] tracking-[0.16em] text-content-subtle">
                  {c.num}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-line-light bg-surface-cyan-tint text-brand-cyan">
                  {c.icon}
                </div>
              </div>

              <div className="text-[21px] font-[plus-eb] tracking-[-0.02em] text-content-primary">
                {c.title}
              </div>
              <p className="mt-2 text-[14px] leading-[1.75] text-content-muted">
                {c.text}
              </p>
              <div className="mt-5 inline-flex rounded-full border border-line-light bg-surface-light px-4 py-2 text-[12px] font-[600] text-content-muted">
                {c.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
