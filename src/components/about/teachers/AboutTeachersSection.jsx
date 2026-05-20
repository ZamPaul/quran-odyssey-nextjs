import Link from "next/link";

const TEACHERS = [
  {
    initials: "SA",
    specialty: "Tajweed · Hifz",
    name: "Sister Aisha",
    bio: '"I teach because I want every child to feel the same connection to the words that changed my life."',
    timezone: "UK timezone",
    rating: "4.97 rating",
    bg: "linear-gradient(135deg, color-mix(in_srgb,var(--brand-cyan)_65%,white), var(--brand-cyan))",
  },
  {
    initials: "UH",
    specialty: "Noorani Qaida · Tarteel",
    name: "Ustadh Hassan",
    bio: "\"Patience isn't just a virtue in Quran teaching — it's the entire methodology. Every student moves at their pace.\"",
    timezone: "EST timezone",
    rating: "4.95 rating",
    bg: "linear-gradient(135deg, var(--brand-amber-dark), var(--brand-amber))",
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

export default function AboutTeachersSection() {
  return (
    <section className="bg-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="reveal-left">
            <div className="section-chip inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--brand-amber)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-amber)_12%,transparent)] px-4 py-[6px] text-[12px] font-[700] tracking-[0.06em] text-brand-amber-dark">
              Who teaches your child
            </div>
            <h2 className="mt-4 text-[40px] font-[800] leading-[1.08] tracking-[-0.03em] text-content-primary md:text-[44px]">
              Meet <span className="text-brand-amber-dark">some of our team.</span>
            </h2>
          </div>

          <Link
            href="#"
            className="teachers-link reveal-right inline-flex items-center gap-2 text-[14px] font-[700] text-brand-cyan-dark transition hover:text-brand-cyan"
          >
            See all teachers
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

        <div className="teacher-cards grid grid-cols-1 gap-5 md:grid-cols-3">
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
                <div className="teacher-initials text-[16px] font-[800] tracking-[0.06em] text-white">
                  {t.initials}
                </div>
              </div>

              <div className="teacher-specialty text-[11px] font-[700] uppercase tracking-[0.12em] text-brand-cyan-dark">
                {t.specialty}
              </div>
              <div className="teacher-name mt-2 text-[18px] font-[800] tracking-[-0.02em] text-content-primary">
                {t.name}
              </div>
              <p className="teacher-bio mt-3 text-[14px] leading-[1.75] text-content-muted">
                {t.bio}
              </p>

              <div className="teacher-meta mt-5 flex flex-col gap-2 text-[13px] text-content-muted">
                <div className="teacher-meta-item inline-flex items-center gap-2">
                  <span>🌍</span>{" "}
                  <strong className="text-content-primary">{t.timezone}</strong>
                </div>
                <div className="teacher-meta-item inline-flex items-center gap-2">
                  <span>⭐</span>{" "}
                  <strong className="text-content-primary">{t.rating}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

