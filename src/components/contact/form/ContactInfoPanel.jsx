import Link from "next/link";

const HOURS = [
  { flag: "🇬🇧", name: "United Kingdom", time: "9am – 9pm", tz: "GMT / BST" },
  { flag: "🇺🇸", name: "United States", time: "9am – 9pm", tz: "EST / CST" },
  { flag: "🇨🇦", name: "Canada", time: "9am – 8pm", tz: "EST / PST" },
  { flag: "📧", name: "Email response", time: "Within 24hrs", tz: "Any timezone" },
];

const TEAM = [
  {
    initials: "ZJ",
    name: "Zeeshan Javed",
    role: "Founder · Platform & Enquiries",
    bg: "linear-gradient(135deg, var(--brand-navy), var(--bg-dark-blue))",
  },
  {
    initials: "SA",
    name: "Sister Aisha",
    role: "Lead Teacher · Course Guidance",
    bg: "linear-gradient(135deg, var(--brand-cyan), var(--brand-cyan-dark))",
  },
  {
    initials: "UH",
    name: "Ustadh Hassan",
    role: "Head of Hifz · Curriculum",
    bg: "linear-gradient(135deg, var(--brand-amber), var(--brand-amber-dark))",
  },
];

export default function ContactInfoPanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="info-card rounded-[var(--radius-lg)] border border-line-light bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[color-mix(in_srgb,var(--teal)_25%,transparent)] bg-[color-mix(in_srgb,var(--teal)_12%,transparent)] text-[color-mix(in_srgb,var(--teal)_70%,black)]">
            WA
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-[900] text-content-primary">
              WhatsApp (fastest)
            </div>
            <div className="mt-1 text-[13px] font-[600] text-content-muted">
              Message us directly for the quickest reply.
            </div>
            <Link
              href="#"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--teal)_45%,white)] px-5 py-3 text-[14px] font-[900] text-brand-navy transition hover:-translate-y-[1px]"
            >
              Open WhatsApp Chat →
            </Link>
            <div className="mt-3 flex items-center gap-2 text-[12px] font-[700] text-content-muted">
              <span className="h-2 w-2 rounded-full bg-success" />
              Typically replies within 2 hours
            </div>
          </div>
        </div>
      </div>

      <div className="info-card rounded-[var(--radius-lg)] border border-line-light bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[color-mix(in_srgb,var(--brand-cyan)_20%,transparent)] bg-surface-cyan-tint text-brand-cyan-dark">
            ⏱
          </div>
          <div className="text-[14px] font-[900] text-content-primary">
            Support hours by timezone
          </div>
        </div>
        <div className="space-y-2">
          {HOURS.map((h) => (
            <div
              key={h.name}
              className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-line-light bg-surface-off-white px-4 py-3"
            >
              <div className="text-[13px] font-[700] text-content-primary">
                <span className="mr-2">{h.flag}</span>
                {h.name}
              </div>
              <div className="text-right">
                <div className="text-[13px] font-[900] text-content-primary">
                  {h.time}
                </div>
                <div className="text-[11px] font-[700] text-content-muted">
                  {h.tz}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-card rounded-[var(--radius-lg)] border border-line-light bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-line-light bg-surface-light text-content-muted">
            👥
          </div>
          <div className="text-[14px] font-[900] text-content-primary">
            You&apos;re talking to real people
          </div>
        </div>
        <div className="space-y-3">
          {TEAM.map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-[900] text-white"
                style={{ background: t.bg }}
              >
                {t.initials}
              </div>
              <div>
                <div className="text-[13px] font-[900] text-content-primary">
                  {t.name}
                </div>
                <div className="text-[12px] font-[600] text-content-muted">
                  {t.role}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--success)_20%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,white)] px-4 py-3 text-[12px] font-[800] text-[color-mix(in_srgb,var(--success)_70%,black)]">
          <span className="h-2 w-2 rounded-full bg-success" />
          Team is online now — WhatsApp for fastest reply
        </div>
      </div>
    </div>
  );
}

