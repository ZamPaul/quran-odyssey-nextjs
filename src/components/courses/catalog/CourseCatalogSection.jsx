import Link from "next/link";
import CourseCard from "./CourseCard";

const COURSES = [
  {
    num: "01",
    value: "NOORANI_QAIDA",
    level: "beginner",
    age: "young mid",
    title: "Noorani Qaida",
    desc: "A beginner-friendly foundation course for children starting their Quran journey. Students learn Arabic letters, pronunciation, joining sounds, and basic reading rules step by step — making Quran reading easy, clear, and confident.",
    outcomes: [
      "Recognise Arabic letters and sounds correctly",
      "Read joined letters, words, and short Quranic phrases",
      "Build a strong foundation before Quran recitation",
    ],
    info: ["3–4 months", "3 classes/week", "1-on-1 session"],
    tags: ["Ages 4+", "Beginner"],
    featured: false,
    gradient: "linear-gradient(140deg, #daf4fb 0%, #c2eaf9 45%, #a8e0f6 100%)",
    price: 20,
  },
  {
    num: "02",
    value: "QURAN_RECITATION",
    level: "intermediate",
    age: "mid teen",
    title: "Salah Course",
    desc: "A practical course that helps children learn how to pray correctly with understanding. From Wudu to Salah positions, duas, and daily prayer habits — every lesson is taught in a simple and engaging way.",
    outcomes: [
      "Learn Wudu and Salah step by step",
      "Memorise essential duas and prayer words",
      "Build confidence to pray independently at home",
    ],
    info: ["2-3 months", "3 classes/week", "1-on-1 sessions"],
    tags: ["Ages 4+", "Beginner"],
    featured: false,
    gradient: "linear-gradient(140deg, #fff7e0 0%, #feeec4 45%, #fde5a6 100%)",
    price: 39,
  },
  {
    num: "03",
    value: "QURAN_RECITATION",
    level: "intermediate",
    age: "mid teen",
    title: "Quran Recitation with Tajweed",
    desc: "Fluent Quran reading with correct pronunciation and Tajweed application. Students improve their Makharij, fluency, pauses, and confidence while reciting the Quran beautifully and correctly.",
    outcomes: [
      "Recite Quran fluently with correct Makharij",
      "Apply basic Tajweed rules during live recitation",
      "Build confidence to recite in Salah and family settings",
    ],
    info: ["6-12 months", "3 classes/week", "1-on-1 sessions"],
    tags: ["Ages 6+", "Intermediate"],
    featured: false,
    gradient: "linear-gradient(140deg, #eaeffe 0%, #d8e4fb 45%, #c6d8f8 100%)",
    price: 45,
  },
  {
    num: "04",
    value: "NOORANI_QAIDA",
    level: "advanced",
    age: "mid teen",
    value: 'HIFZ',  
    title: "Hifz Programme",
    desc: "A structured Quran memorisation programme with dedicated Hifz teachers, revision planning, and regular progress tracking. Students memorise at their own pace with consistency and teacher guidance.",
    outcomes: [
      " Memorise Quran step by step with daily revision",
      "Follow a personalised Hifz and revision plan",
      "Parents receive regular progress updates",
    ],
    info: ["3–5 years", "5 classes/week", "1-on-1 only"],
    tags: ["Ages 8+", "Advanced"],
    featured: true,
    gradient: "linear-gradient(140deg, #daf8f1 0%, #c2f2e8 45%, #a8ecde 100%)",
    price: 34,
  },
  // {
  //   num: "05",
  //   level: "flexible",
  //   age: "young mid",
  //   title: "Islamic Studies",
  //   desc: "Stories of the Prophets, the five pillars, Islamic manners and character — age-appropriate lessons that build identity alongside Quranic education. This course runs parallel to recitation or Tajweed.",
  //   outcomes: [
  //     "Know the stories of the major Prophets and their lessons",
  //     "Understand and practise the five pillars of Islam",
  //     "Develop Islamic character — adab, honesty, respect for parents",
  //   ],
  //   info: ["Ongoing", "1–2 classes/week", "Group classes"],
  //   tags: ["Ages 6–14", "All Levels"],
  //   featured: false,
  //   gradient: "linear-gradient(140deg, #e6ecfc 0%, #d0dafa 45%, #b8c8f8 100%)",
  //   price: 18,
  // },
  // {
  //   num: "06",
  //   level: "flexible",
  //   age: "young mid teen",
  //   title: "One-to-One Private Classes",
  //   desc: "Private lessons for students who need undivided attention. Choose your teacher, your schedule, and your focus area. The teacher designs the lesson plan entirely around your child. Completely flexible.",
  //   outcomes: [
  //     "Accelerated progress through full teacher attention every class",
  //     "Curriculum tailored to specific strengths and weak areas",
  //     "Complete scheduling flexibility — fits around school and family life",
  //   ],
  //   info: ["Your choice", "Flexible schedule", "1-on-1 only"],
  //   tags: ["All Ages", "All Levels"],
  //   featured: false,
  //   gradient: "linear-gradient(140deg, #e0f8eb 0%, #c8f0d8 45%, #b0e8c4 100%)",
  //   price: 35,
  // },
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
