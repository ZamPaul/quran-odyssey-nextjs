import Link from "next/link";

const COURSES = [
  {
    num: "01",
    level: "beginner",
    age: "young mid",
    title: "Noorani Qaida",
    desc: "The foundation every young reader needs. Arabic letter recognition, correct pronunciation, and the building blocks of Quran recitation — done properly from day one. No skipping steps.",
    outcomes: [
      "Recognise all Arabic letters in isolation and joined forms",
      "Apply basic Tajweed rules — vowels, tanween, sukoon",
      "Read short Surahs confidently and independently",
    ],
    info: ["3–6 months", "2–3 classes/week", "1-on-1 only"],
    tags: ["Ages 5–10", "Beginner", "🔥 Most popular start"],
    featured: false,
  },
  {
    num: "02",
    level: "intermediate",
    age: "mid teen",
    title: "Quran Recitation",
    desc: "Fluent, confident recitation with proper Makharij. Students move through Juz at their own pace — weekly checkpoints and teacher feedback keep progress measurable and consistent.",
    outcomes: [
      "Read the Quran fluently with correct Makharij (letter exits)",
      "Complete multiple Juz with weekly teacher assessment",
      "Build confidence to recite in Salah and family settings",
    ],
    info: ["6–18 months", "3 classes/week", "1-on-1 or group"],
    tags: ["All Ages", "Intermediate"],
    featured: false,
  },
  {
    num: "03",
    level: "intermediate",
    age: "mid teen",
    title: "Tajweed Rules",
    desc: "The science of beautiful, correct recitation. Tajweed rules taught in the context of actual Quranic verses — not memorised theory divorced from practice. Every rule is applied live, every class.",
    outcomes: [
      "Master all core Tajweed rules — Noon, Meem, Madd, Qalqalah",
      "Apply rules naturally while reciting — not just on paper",
      "Recite with the beauty and precision the Quran deserves",
    ],
    info: ["4–8 months", "2 classes/week", "1-on-1 or group"],
    tags: ["Ages 8+", "Intermediate"],
    featured: false,
  },
  {
    num: "04",
    level: "advanced",
    age: "mid teen",
    title: "Hifz Programme",
    desc: "Full Quran memorisation with a structured, Juz-by-Juz approach. Dedicated Hifz teachers, revision timetables, and parent progress reports every two weeks. The most committed course we offer — and the most rewarding.",
    outcomes: [
      "Memorise the full Quran — Juz by Juz — with strong revision",
      "Follow a structured daily revision timetable built by your teacher",
      "Parents receive fortnightly written progress reports",
    ],
    info: ["3–5 years", "5 classes/week", "1-on-1 only"],
    tags: ["Ages 7+", "Advanced", "⭐ Most prestigious"],
    featured: true,
  },
  {
    num: "05",
    level: "flexible",
    age: "young mid",
    title: "Islamic Studies",
    desc: "Stories of the Prophets, the five pillars, Islamic manners and character — age-appropriate lessons that build identity alongside Quranic education. This course runs parallel to recitation or Tajweed.",
    outcomes: [
      "Know the stories of the major Prophets and their lessons",
      "Understand and practise the five pillars of Islam",
      "Develop Islamic character — adab, honesty, respect for parents",
    ],
    info: ["Ongoing", "1–2 classes/week", "Group classes"],
    tags: ["Ages 6–14", "All Levels"],
    featured: false,
  },
  {
    num: "06",
    level: "flexible",
    age: "young mid teen",
    title: "One-to-One Private Classes",
    desc: "Private lessons for students who need undivided attention. Choose your teacher, your schedule, and your focus area. The teacher designs the lesson plan entirely around your child. Completely flexible.",
    outcomes: [
      "Accelerated progress through full teacher attention every class",
      "Curriculum tailored to specific strengths and weak areas",
      "Complete scheduling flexibility — fits around school and family life",
    ],
    info: ["Your choice", "Flexible schedule", "1-on-1 only"],
    tags: ["All Ages", "All Levels"],
    featured: false,
  },
];

export default function CourseCatalogSection() {
  return (
    <section className="bg-surface-off-white px-6 py-[70px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] px-4 py-[6px] text-[11px] font-[700] tracking-[0.06em] text-brand-cyan-dark">
              Our courses
            </div>
            <h2 className="section-h2 text-[40px] font-[800] leading-[1.1] tracking-[-0.03em] text-content-primary md:text-[44px]">
              Choose the <span className="text-brand-cyan">right path</span> for your child.
            </h2>
          </div>
          <p className="section-sub reveal-right max-w-[520px] text-[16px] leading-[1.75] text-content-muted">
            Every course is teacher-led and tracked. If you&apos;re unsure where to start, the free trial class exists
            for exactly that — your teacher will recommend the right entry point.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2" id="courseGrid">
          {COURSES.map((c, idx) => (
            <div
              key={c.num}
              className={[
                "course-card reveal flex flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-white transition",
                c.featured ? "border-brand-amber" : "border-line-light",
                c.featured
                  ? "hover:border-brand-amber-dark hover:shadow-[0_20px_56px_rgba(250,167,26,0.12)]"
                  : "hover:border-brand-cyan hover:shadow-[0_20px_56px_rgba(40,183,217,0.10)]",
                "hover:-translate-y-1",
                `reveal-delay-${(idx % 3) + 1}`,
              ].join(" ")}
              data-level={c.level}
              data-age={c.age}
            >
              <div className="flex items-center justify-between p-6 pb-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-line-light bg-surface-cyan-tint text-brand-cyan">
                  <span className="text-[14px] font-[900]">{c.num}</span>
                </div>
                <div className={["text-[12px] font-[900] tracking-[0.16em]", c.featured ? "text-brand-amber-dark" : "text-content-subtle"].join(" ")}>
                  {c.featured ? "FEATURED" : ""}
                </div>
              </div>

              <div className="p-6 pt-5">
                <div className="text-[18px] font-[900] tracking-[-0.02em] text-content-primary">
                  {c.title}
                </div>
                <p className="mt-2 text-[14px] leading-[1.75] text-content-muted">
                  {c.desc}
                </p>

                <div className="mt-5 text-[12px] font-[800] uppercase tracking-[0.10em] text-content-subtle">
                  What your child will achieve
                </div>
                <ul className="mt-3 space-y-2 text-[14px] text-content-muted">
                  {c.outcomes.map((o) => (
                    <li key={o} className="flex gap-2">
                      <span className="mt-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-cyan-tint text-brand-cyan-dark">
                        ✓
                      </span>
                      <span className="leading-[1.6]">{o}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2 text-[13px] font-[600] text-content-muted">
                  {c.info.map((i) => (
                    <span key={i} className="rounded-full border border-line-light bg-surface-light px-3 py-2">
                      {i}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <span key={t} className="rounded-full border border-line-light bg-white px-3 py-2 text-[12px] font-[800] text-content-muted">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href="#"
                    className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-brand-amber px-5 py-[11px] text-[14px] font-[900] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark"
                  >
                    Enrol Now
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="#"
                    className="rounded-[var(--radius)] border-2 border-line-default bg-transparent px-4 py-[11px] text-[14px] font-[800] text-content-primary transition hover:bg-surface-light"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

