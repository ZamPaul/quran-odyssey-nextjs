import Image from "next/image";
import Link from "next/link";
import HeroCountriesMap from "./HeroCountriesMap";

const DASH_STATS = [
  { num: "24", label: "Classes" },
  { num: "3", label: "Juz Done" },
  { num: "🔥 12", label: "Streak" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-x-hidden bg-surface-white pt-[68px]">
      {/* <div className="hero-grid-bg absolute inset-0 pointer-events-none" /> */}
      {/* <div className="hero-glow hero-glow-a absolute right-0 top-0 pointer-events-none" /> */}
      {/* <div className="hero-glow hero-glow-b absolute bottom-0 left-[200px] pointer-events-none" /> */}
      {/* <div className="w-"> */}
        <Image
          src={`/Frame.png`}
          className="absolute top-0 left-0 w-full h-full object-cover"
          width={1000}
          height={1000}
          alt="zmdjic"
        />
      {/* </div> */}

      <div className="relative w-full flex items-center justify-center py-[10vh]">
        <div className="w-[85%] grid items-center gap-10 md:grid-cols-2">
          <div className="flex flex-col items-start">
          <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)] bg-surface-cyan-tint px-[14px] py-[5px] text-[12px] font-[600] tracking-[0.02em] text-brand-cyan-dark">
            <span className="hero-badge-dot h-[7px] w-[7px] rounded-full bg-brand-cyan" />
            Live classes · UK · USA · Canada
          </div>

          <h1 className="mt-7 text-[44px] font-[plus-eb] leading-[1.06] tracking-[-0.03em] text-content-primary md:text-[52px]">
            Your child deserves
            <br />
            more than <span className="text-brand-cyan">inconsistent</span>
            <br />
            <span className="text-brand-cyan">tutors.</span>
          </h1>

          <p className="mt-4 max-w-[460px] text-[16px] font-[400] leading-[1.75] text-content-muted">
            Quran Odyssey connects families with verified Quran teachers for
            live online classes — structured, consistent, and built around your
            child&apos;s pace.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#"
              className="btn-primary inline-flex items-center gap-2 rounded-[var(--radius)] border-2 border-brand-amber bg-brand-amber px-7 py-[13px] text-[14px] font-[700] tracking-[-0.01em] text-brand-navy transition-all hover:-translate-y-[2px] hover:border-brand-amber-dark hover:bg-brand-amber-dark"
            >
              Book a Free Trial
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-[var(--radius)] border-2 border-line-default bg-transparent px-7 py-[13px] text-[14px] font-[600] tracking-[-0.01em] text-content-primary transition-all hover:-translate-y-[1px] hover:bg-surface-light hover:border-content-primary"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <polygon points="6,5 12,8 6,11" fill="currentColor" />
              </svg>
              See how it works
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex">
              <div className="hero-avatar -ml-2 first:ml-0 bg-[linear-gradient(135deg,var(--brand-cyan),var(--brand-cyan-dark))]">
                FK
              </div>
              <div className="hero-avatar -ml-2 bg-[linear-gradient(135deg,var(--brand-amber),var(--brand-amber-dark))]">
                IA
              </div>
              <div className="hero-avatar -ml-2 bg-[linear-gradient(135deg,var(--brand-navy),var(--bg-dark-blue))]">
                MR
              </div>
              <div className="hero-avatar -ml-2 bg-[linear-gradient(135deg,var(--success),color-mix(in_srgb,var(--success)_70%,black))]">
                SA
              </div>
            </div>
            <div className="text-[13px] font-[500] leading-[1.4] text-content-muted">
              <span className="font-[800] text-content-primary">
                2,000+ families
              </span>{" "}
              across 18+ countries trust Quran Odyssey
            </div>
          </div>
          </div>

          <div className="relative left-[-3vw] md:justify-self-end">
            <div className="reveal-right">
              <HeroCountriesMap />
            </div>
          </div>
        </div>

        {/* <div className="relative hero-visual">
          <div className="float-card float-card-1">
            <span className="fc-dot fc-green" />
            <div>
              <div className="fc-label">Live Now</div>
              <div className="fc-value">Tajweed · Week 7</div>
            </div>
          </div>

          <div className="float-card float-card-2">
            <span className="fc-dot fc-orange" />
            <div>
              <div className="fc-label">Teacher Rating</div>
              <div className="fc-value">4.97 ★</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line-light bg-white shadow-[0_32px_80px_rgba(0,0,0,0.10),0_0_0_1px_rgba(255,255,255,0.5)]">
            <div className="flex items-center gap-2 bg-brand-navy px-5 py-3">
              <span className="h-[10px] w-[10px] rounded-full bg-[#ff5f57]" />
              <span className="h-[10px] w-[10px] rounded-full bg-[#febc2e]" />
              <span className="h-[10px] w-[10px] rounded-full bg-[#28c840]" />
              <span className="ml-auto text-[11px] font-[500] text-white/35">
                Student Dashboard
              </span>
            </div>

            <div className="p-6">
              <div className="text-[11px] font-[600] uppercase tracking-[0.08em] text-content-muted">
                Good evening,
              </div>
              <div className="mb-5 text-[19px] font-[800] tracking-[-0.02em] text-content-primary">
                Ahmed 👋
              </div>

              <div className="relative mb-4 overflow-hidden rounded-[var(--radius)] bg-[linear-gradient(135deg,var(--brand-navy)_0%,var(--bg-dark-blue)_100%)] px-5 py-[18px]">
                <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-[color-mix(in_srgb,var(--brand-cyan)_15%,transparent)]" />
                <div className="text-[10px] font-[600] uppercase tracking-[0.10em] text-white/50">
                  Next Class
                </div>
                <div className="mt-[6px] text-[16px] font-[700] tracking-[-0.02em] text-white">
                  Tajweed — Rules of Madd
                </div>
                <div className="mt-[3px] text-[12px] text-white/55">
                  Today · 6:00 PM GMT · Ustadh Hassan
                </div>
                <Link
                  href="#"
                  className="mt-[14px] inline-flex items-center gap-[6px] rounded-[6px] bg-brand-amber px-4 py-[7px] text-[12px] font-[700] text-brand-navy transition hover:bg-brand-amber-dark"
                >
                  <svg
                    width="10"
                    height="12"
                    viewBox="0 0 10 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <polygon points="0,0 10,6 0,12" fill="currentColor" />
                  </svg>
                  Join Class
                </Link>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-[10px]">
                {DASH_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-[var(--radius-sm)] bg-surface-light px-[14px] py-3"
                  >
                    <div className="text-[20px] font-[800] tracking-[-0.03em] text-content-primary">
                      {s.num}
                    </div>
                    <div className="text-[10px] font-[500] uppercase tracking-[0.06em] text-content-muted">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-2 text-[11px] font-[600] uppercase tracking-[0.06em] text-content-muted">
                  My Progress
                </div>

                <ProgressRow label="Tajweed Rules" pct={78} variant="cyan" />
                <ProgressRow label="Hifz Programme" pct={52} variant="amber" />
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}

function ProgressRow({ label, pct, variant }) {
  const fillStyle =
    variant === "amber"
      ? {
          background:
            "linear-gradient(90deg, var(--brand-amber), var(--brand-amber-dark))",
        }
      : {
          background:
            "linear-gradient(90deg, var(--brand-cyan), color-mix(in_srgb,var(--brand-cyan)_70%,white))",
        };

  return (
    <div className="mb-[10px]">
      <div className="mb-[5px] flex items-center justify-between">
        <span className="text-[13px] font-[600] text-content-primary">
          {label}
        </span>
        <span className="text-[12px] font-[700] text-brand-cyan-dark">
          {pct}%
        </span>
      </div>
      <div className="h-[6px] overflow-hidden rounded bg-surface-light">
        <div
          className="h-full rounded"
          style={{ width: `${pct}%`, ...fillStyle }}
        />
      </div>
    </div>
  );
}
