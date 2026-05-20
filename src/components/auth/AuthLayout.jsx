import Link from "next/link";
import Image from "next/image";

const TRUST_STATS = [
  { num: "2,000+", label: "Families enrolled" },
  { num: "97%", label: "Parent satisfaction" },
  { num: "40+", label: "Qualified teachers" },
];

const TESTIMONIAL = {
  text: "We tried four tutors before Quran Odyssey. My daughter now asks for her next class herself. That says everything.",
  author: "Ibrahim A.",
  meta: "Canada · Parent of 11-year-old",
};

/**
 * AuthLayout — split-screen wrapper for all auth pages.
 *
 * Left: branded navy panel with trust signals.
 * Right: white panel that renders the form (children).
 *
 * @param {{ children: React.ReactNode, title: string, subtitle: string }} props
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      {/* ── Left brand panel ───────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-navy px-10 py-10 md:flex md:w-[44%] lg:px-14 lg:py-14">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Cyan glow */}
        <div
          className="absolute -left-20 top-0 h-[420px] w-[420px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top left, color-mix(in srgb, var(--brand-cyan) 14%, transparent) 0%, transparent 65%)",
          }}
        />

        {/* Amber glow bottom */}
        <div
          className="absolute bottom-0 right-0 h-[300px] w-[300px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom right, color-mix(in srgb, var(--brand-amber) 10%, transparent) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-[2]">
          {/* Logo */}
          <Link href="/" className="inline-block">
            <Image
              src="/logo2.png"
              width={160}
              height={40}
              alt="Quran Odyssey"
              className="object-contain"
            />
          </Link>
        </div>

        <div className="relative z-[2] flex flex-col gap-8">
          {/* Headline */}
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-[5px] text-[11px] font-[700] uppercase tracking-[0.10em] text-white/60">
              <span className="h-[6px] w-[6px] rounded-full bg-brand-cyan" />
              Trusted by 2,000+ families
            </div>
            <h2 className="text-[32px] font-[800] leading-[1.12] tracking-[-0.03em] text-white lg:text-[36px]">
              Begin your child&apos;s
              <br />
              <span className="text-brand-cyan">Quran journey.</span>
            </h2>
            <p className="mt-3 text-[14px] leading-[1.75] text-white/55">
              Verified teachers. Live 1-on-1 classes. Real progress —
              every single week.
            </p>
          </div>

          {/* Trust stats */}
          <div className="grid grid-cols-3 gap-3">
            {TRUST_STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="text-[20px] font-[800] tracking-[-0.03em] text-white">
                  {s.num}
                </div>
                <div className="mt-[2px] text-[11px] font-[600] leading-[1.4] text-white/50">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-brand-amber text-[13px]">★</span>
              ))}
            </div>
            <p className="text-[14px] leading-[1.7] text-white/75 italic">
              &ldquo;{TESTIMONIAL.text}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-amber text-[11px] font-[800] text-brand-navy">
                {TESTIMONIAL.author.charAt(0)}A
              </div>
              <div>
                <div className="text-[13px] font-[800] text-white">
                  {TESTIMONIAL.author}
                </div>
                <div className="text-[11px] font-[600] text-white/40">
                  {TESTIMONIAL.meta}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-[2] text-[12px] font-[500] text-white/25">
          © 2026 Quran Odyssey · Built by VISAITECH
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-10 md:px-12 lg:px-16">
        {/* Mobile logo */}
        <div className="mb-8 block md:hidden">
          <Link href="/">
            <Image
              src="/logo2.png"
              width={140}
              height={35}
              alt="Quran Odyssey"
              className="object-contain"
            />
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Form header */}
          <div className="mb-7">
            <h1 className="text-[26px] font-[800] tracking-[-0.03em] text-content-primary lg:text-[28px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-[14px] leading-[1.65] text-content-muted">
                {subtitle}
              </p>
            )}
          </div>

          {/* Injected form */}
          {children}
        </div>
      </div>
    </div>
  );
}