import Link from "next/link";
import CourseCard from "./CourseCard";

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
    gradient: "linear-gradient(140deg, #daf4fb 0%, #c2eaf9 45%, #a8e0f6 100%)",
    price: 20,
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
    gradient: "linear-gradient(140deg, #fff7e0 0%, #feeec4 45%, #fde5a6 100%)",
    price: 39,
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
    gradient: "linear-gradient(140deg, #eaeffe 0%, #d8e4fb 45%, #c6d8f8 100%)",
    price: 45,
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
    gradient: "linear-gradient(140deg, #daf8f1 0%, #c2f2e8 45%, #a8ecde 100%)",
    price: 34,
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
    gradient: "linear-gradient(140deg, #e6ecfc 0%, #d0dafa 45%, #b8c8f8 100%)",
    price: 18,
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
    gradient: "linear-gradient(140deg, #e0f8eb 0%, #c8f0d8 45%, #b0e8c4 100%)",
    price: 35,
  },
];

export default function CourseCatalogSection() {
  return (
    <section className="bg-surface-off-white px-6 py-[70px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="flex items-center justify-between w-full gap-6 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] px-4 py-[6px] text-[11px] font-[700] tracking-[0.06em] text-brand-cyan-dark">
              Our courses
            </div>
            <h2 className="section-h2 text-[40px] font-[plus-eb] leading-[1.1] tracking-[-0.03em] text-content-primary md:text-[44px]">
              Choose the <span className="text-brand-cyan">right path</span> for
              your child.
            </h2>
          </div>
          <p className="section-sub text-secondary-styling reveal-right max-w-[520px] text-[16px]">
            Every course is teacher-led and tracked. If you&apos;re unsure where
            to start, the free trial class exists for exactly that — your
            teacher will recommend the right entry point.
          </p>
        </div>

        <div
          className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2"
          id="courseGrid"
        >
          {COURSES.map((c, idx) => (
            <CourseCard c={c} idx={idx} key={`${idx}_course_card`} />
          ))}
        </div>
      </div>
    </section>
  );
}
