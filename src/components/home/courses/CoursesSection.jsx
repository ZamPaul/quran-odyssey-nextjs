import SectionHeader from "../shared/SectionHeader";
import CourseCard from "./CourseCard";

const COURSES = [
  {
    num: "01",
    title: "Noorani Qaida (Beginner Quran Reading Course)",
    text: "The essential foundation for Quran reading. Children learn Arabic letters, pronunciation (Makharij), and fluency through structured step-by-step guidance.",
    tag: "Ages 5–10 · Beginner",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Quran Recitation Classes Online",
    text: "Build fluent and confident recitation with correct Tajweed foundations. Students progress through the Quran at their own pace with weekly teacher corrections and feedback.",
    tag: "All Ages · Intermediate",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Salah (Namaz) Course",
    text: "A practical, step-by-step Salah learning program designed to help students master prayer with correct posture, recitation, and understanding of dua meanings, guided by experienced teachers and regular practice tracking.</br> ✔ Daily Salah practice & correction system",
    tag: "Ages 8+ · Intermediate",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 8v4l3 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Hifz Programme",
    text: "A structured Quran memorization journey with revision planning, dedicated Hifz teachers, and bi-weekly parent progress reports to ensure consistency and retention.",
    tag: "Ages 7+ · Advanced",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 11l3 3L22 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    num: "05",
    title: "Islamic Kids Corner",
    text: "Age-appropriate Islamic learning, including Prophets’ stories, Seerah, pillars of Islam, manners, and daily duas — building both knowledge and Islamic identity.",
    tag: "Ages 6–14 · All Levels",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    num: "06",
    title: " Tajweed Classes Online",
    text: "Master the rules of beautiful Quran recitation through practical application. Every Tajweed rule is taught directly from the Quran verses for better understanding and retention.",
    tag: "All Ages · Flexible",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke="currentColor"
          strokeWidth="2"
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
          <p className="section-sub reveal-right text-secondary-styling">
            Unlike YouTube videos or irregular tutors, every course at Quran
            Odyssey follows a clear, teacher-led learning path with progress
            tracking and parent visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {COURSES.map((c, idx) => (
            <CourseCard c={c} key={`course_card_${idx}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
