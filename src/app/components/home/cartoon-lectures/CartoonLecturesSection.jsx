import Link from "next/link";
import SectionHeader from "../shared/SectionHeader";

const CARDS = [
  {
    state: "active",
    badge: "● This Week",
    episode: "Ep. 24",
    topic: "Rules of Noon Sakinah",
    desc: "Professor Hoot explains Izhar, Idgham, Iqlab and Ikhfa with memorable visual examples.",
  },
  {
    state: "past",
    badge: "Week 23",
    episode: "Ep. 23",
    topic: "Surah Al-Fatiha — Deep Dive",
    desc: "Scholar Star breaks down every ayah with meaning and context for young learners.",
  },
  {
    state: "past",
    badge: "Week 22",
    episode: "Ep. 22",
    topic: "The 5 Pillars of Islam",
    desc: "An illustrated journey through the foundations of faith — perfect for ages 6 to 10.",
  },
  {
    state: "past",
    badge: "Week 21",
    episode: "Ep. 21",
    topic: "Story of Prophet Musa ﷺ",
    desc: "Animated storytelling that brings the life of Prophet Musa to life for young hearts.",
  },
];

export default function CartoonLecturesSection() {
  return (
    <section className="bg-surface-off-white px-6 py-[100px] md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div className="reveal-left">
            <SectionHeader
              chip="Weekly AI Lectures"
              chipClassName="border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] text-brand-cyan-dark"
              title={
                <>
                  Learning that speaks
                  <br />
                  <span className="text-brand-cyan">their language.</span>
                </>
              }
            />
          </div>
          <p className="section-sub reveal-right max-w-[520px] text-[16px] font-[400] leading-[1.75] text-content-muted">
            Every week, a new animated AI character walks students through a
            Quran topic — Tajweed rules, Surahs, Islamic stories. Short, visual,
            and designed for the way kids actually learn. A supplement to live
            classes, not a replacement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {CARDS.map((c, idx) => (
            <div
              key={c.episode}
              className={[
                "reveal rounded-[var(--radius-lg)] border border-line-light bg-white p-6 transition",
                "hover:-translate-y-[3px] hover:border-line-default hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]",
                c.state === "active"
                  ? "ring-1 ring-[color-mix(in_srgb,var(--brand-cyan)_40%,transparent)]"
                  : "",
                `reveal-delay-${(idx % 3) + 1}`,
              ].join(" ")}
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={[
                    "rounded-full border px-3 py-[6px] text-[11px] font-[700] tracking-[0.06em]",
                    c.state === "active"
                      ? "border-[color-mix(in_srgb,var(--brand-cyan)_30%,transparent)] bg-[color-mix(in_srgb,var(--brand-cyan)_12%,transparent)] text-brand-cyan-dark"
                      : "border-line-light bg-surface-light text-content-muted",
                  ].join(" ")}
                >
                  {c.badge}
                </div>
                <div className="text-[12px] font-[800] tracking-[0.16em] text-content-subtle">
                  {c.episode}
                </div>
              </div>

              <div className="cartoon-character mb-5 flex h-[90px] w-[90px] items-center justify-center rounded-[18px] border border-line-light bg-surface-off-white">
                <div className="h-10 w-10 rounded-full bg-[color-mix(in_srgb,var(--brand-cyan)_20%,transparent)]" />
              </div>

              <div className="text-[16px] font-[800] tracking-[-0.02em] text-content-primary">
                {c.topic}
              </div>
              <p className="mt-2 text-[13px] leading-[1.7] text-content-muted">
                {c.desc}
              </p>

              <Link
                href="#"
                className="mt-5 inline-flex items-center gap-2 text-[13px] font-[700] text-brand-cyan-dark transition hover:text-brand-cyan"
              >
                Watch episode
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
          ))}
        </div>
      </div>
    </section>
  );
}
