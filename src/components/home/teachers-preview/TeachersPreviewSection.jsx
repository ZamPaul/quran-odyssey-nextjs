import Link from "next/link";
import SectionHeader from "../shared/SectionHeader";

const TEACHERS = [
  {
    initials: "UH",
    specialty: "Tajweed · Hifz",
    name: "Ustadh Hassan",
    bio: '"I\'ve seen students go from struggling with the alphabet to reciting complete Juz. That transformation is why I teach."',
    timezone: "GMT timezone",
    rating: "4.96 rating",
    bg: "linear-gradient(135deg, var(--bg-dark-blue), var(--brand-navy))",
  },
  {
    initials: "SA",
    specialty: "Quran Recitation · Kids",
    name: "Sister Aisha",
    bio: '"Children learn best when they\'re comfortable. My classes are structured but never stressful — progress happens naturally here."',
    timezone: "BST timezone",
    rating: "4.99 rating",
    bg: "linear-gradient(135deg, var(--brand-cyan), color-mix(in_srgb,var(--brand-cyan)_70%,white))",
  },
  {
    initials: "SF",
    specialty: "Islamic Studies · Quran",
    name: "Sister Fatima",
    bio: '"I specialise in young learners. Making Quran feel joyful — not like homework — is my entire focus."',
    timezone: "CST timezone",
    rating: "4.98 rating",
    bg: "linear-gradient(135deg, var(--brand-cyan-dark), color-mix(in_srgb,var(--brand-cyan)_70%,white))",
  },
];

export default function TeachersPreviewSection() {
  return (
    <section className="bg-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="reveal-left">
            <SectionHeader
              chip="Meet our teachers"
              chipClassName="border-[color-mix(in_srgb,var(--brand-amber)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-amber)_12%,transparent)] text-brand-amber-dark"
              title={
                <>
                  Verified, qualified,
                  <br />
                  <span className="text-brand-amber-dark">and consistent.</span>
                </>
              }
            />
          </div>

          <Link
            href="#"
            className="reveal-right inline-flex items-center gap-2 text-[14px] font-[700] text-brand-cyan-dark transition hover:text-brand-cyan"
          >
            View all teachers
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TEACHERS.map((t, idx) => (
            <div
              key={t.name}
              className={[
                "teacher-card reveal rounded-[var(--radius-lg)] border border-line-light bg-white p-7 transition",
                "hover:-translate-y-[3px] hover:border-line-default hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]",
                `reveal-delay-${idx + 1}`,
              ].join(" ")}
            >
              <div
                className="teacher-photo mb-5 flex h-[64px] w-[64px] items-center justify-center rounded-[18px]"
                style={{ background: t.bg }}
              >
                <div className="text-[16px] font-[800] tracking-[0.06em] text-white">
                  {t.initials}
                </div>
              </div>

              <div className="text-[11px] font-[700] uppercase tracking-[0.12em] text-brand-cyan-dark">
                {t.specialty}
              </div>
              <div className="mt-2 text-[18px] font-[800] tracking-[-0.02em] text-content-primary">
                {t.name}
              </div>
              <p className="mt-3 text-[14px] leading-[1.75] text-content-muted">
                {t.bio}
              </p>

              <div className="mt-5 flex flex-col gap-2 text-[13px] text-content-muted">
                <div className="inline-flex items-center gap-2">
                  <span>🌍</span> <strong className="text-content-primary">{t.timezone}</strong>
                </div>
                <div className="inline-flex items-center gap-2">
                  <span>⭐</span> <strong className="text-content-primary">{t.rating}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}