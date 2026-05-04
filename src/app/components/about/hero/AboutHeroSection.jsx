import Image from "next/image";
import Link from "next/link";

const META = [
  { num: "2022", label: "Founded" },
  { num: "3", label: "Countries (primary)" },
  { num: "40+", label: "Qualified teachers" },
];

export default function AboutHeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface-white pt-[68px]">
      {/* <div className="hero-grid-bg absolute inset-0 pointer-events-none" /> */}
      {/* <div className="hero-glow hero-glow-a absolute right-0 top-0 pointer-events-none" /> */}

      <Image
        src={`/Frame.png`}
        className="absolute top-0 left-0 w-full h-full object-cover"
        width={1000}
        height={1000}
        alt="zmdjic"
      />

      <div className="relative z-[2] mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-[60px] px-6 pb-[60px] pt-[80px] md:grid-cols-2 md:px-[60px]">
        <div>
          <div className="hero-eyebrow flex items-center gap-3">
            <span className="h-[2px] w-8 rounded bg-brand-cyan" />
            <span className="text-[12px] font-[700] uppercase tracking-[0.10em] text-brand-cyan-dark">
              Our Story
            </span>
          </div>

          <h1 className="mt-6 text-[44px] font-[plus-eb] leading-[1.06] tracking-[-0.03em] text-content-primary md:text-[52px]">
            Most children in the West grow up
            <br />
            from the Quran.
            <br />
            <span className="text-brand-cyan">
              We&apos;re fixing that.
            </span>
          </h1>

          <p className="mt-4 max-w-[520px] text-[16px] font-[400] leading-[1.75] text-content-muted">
            Quran Odyssey was built for families in the UK, USA, and Canada who
            wanted a better answer than inconsistent local classes and
            unreliable tutors. We built the platform we wished had existed.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            {META.map((m, idx) => (
              <div key={m.label} className="flex items-center gap-4">
                <div className="flex flex-col gap-[3px]">
                  <span className="text-[22px] font-[800] tracking-[-0.04em] text-content-primary">
                    {m.num}
                  </span>
                  <span className="text-[12px] font-[500] text-content-muted">
                    {m.label}
                  </span>
                </div>
                {idx !== META.length - 1 ? (
                  <div className="h-9 w-px bg-line-light" />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="relative hero-visual">
          <div className="float-card float-card-1">
            <span className="fc-dot fc-green" />
            <div>
              <div className="fc-label">Status</div>
              <div className="fc-value">Platform live · 2,000+ students</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line-light bg-white shadow-[0_32px_80px_rgba(0,0,0,0.10),0_0_0_1px_rgba(255,255,255,0.5)]">
            <div className="flex items-center gap-4 border-b border-line-light bg-surface-off-white px-6 py-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-line-light bg-surface-cyan-tint text-brand-cyan">
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
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
              <div>
                <div className="text-[16px] font-[800] tracking-[-0.02em] text-content-primary">
                  Quran Odyssey
                </div>
                <div className="text-[12px] font-[600] text-content-muted">
                  Online Quran Learning Institute
                </div>
              </div>
            </div>

            <div className="p-6">
              <FactRow
                title="Primary Markets"
                value="🇬🇧 UK · 🇺🇸 USA · 🇨🇦 Canada"
                accent
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle
                      cx="12"
                      cy="10"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                }
              />

              <FactRow
                title="Class Format"
                value="1-to-1 · Live · Teacher-led"
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <line
                      x1="16"
                      y1="2"
                      x2="16"
                      y2="6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8"
                      y1="2"
                      x2="8"
                      y2="6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <line
                      x1="3"
                      y1="10"
                      x2="21"
                      y2="10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                }
              />

              <FactRow
                title="Courses Offered"
                value="Qaida · Tajweed · Hifz · Ist. Studies"
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <FactRow
                title="Avg. Teacher Rating"
                value="4.97 / 5.0 ★★★★★"
                valueClassName="text-brand-amber-dark"
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 2L12.4 7.4L18 8.2L14 12.1L15 17.6L10 15L5 17.6L6 12.1L2 8.2L7.6 7.4L10 2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <div className="mt-6 flex gap-3">
                <Link
                  href="#"
                  className="inline-flex items-center justify-center rounded-[var(--radius)] bg-brand-amber px-6 py-[12px] text-[14px] font-[800] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark"
                >
                  Book Free Trial
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center justify-center rounded-[var(--radius)] border-2 border-line-default bg-transparent px-6 py-[12px] text-[14px] font-[700] text-content-primary transition hover:bg-surface-light"
                >
                  View Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FactRow({ icon, title, value, accent, valueClassName = "" }) {
  return (
    <div className="flex items-start gap-4 border-b border-line-light py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="mt-[2px] flex h-9 w-9 items-center justify-center rounded-[12px] border border-line-light bg-surface-cyan-tint text-brand-cyan">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[11px] font-[700] uppercase tracking-[0.10em] text-content-muted">
          {title}
        </div>
        <div
          className={[
            "mt-1 text-[14px] font-[800] tracking-[-0.01em] text-content-primary",
            accent ? "text-brand-cyan-dark" : "",
            valueClassName,
          ].join(" ")}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
