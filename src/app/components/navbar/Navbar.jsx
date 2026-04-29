import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/", active: true },
  { label: "Courses", href: "#" },
  { label: "Teachers", href: "#" },
  { label: "About", href: "#" },
  { label: "Pricing", href: "#" },
];

export default function Navbar() {
  return (
    <nav
      id="navbar"
      className="fixed inset-x-0 top-0 z-[100] h-[68px] border-b border-line-light bg-white/95 backdrop-blur-xl transition-shadow"
    >
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-center justify-between px-6 md:px-[60px]">
        <Link href="/" className="logo flex items-center gap-[10px] no-underline">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[8px] bg-brand-navy">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 16C3 12.5 5.5 10 10 10C14.5 10 17 12.5 17 16"
                stroke="var(--brand-cyan)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="10" cy="6" r="3" fill="var(--brand-amber)" />
              <path
                d="M6 10.5 Q10 13 14 10.5"
                stroke="var(--brand-cyan)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <div className="flex flex-col leading-[1.1]">
            <span className="text-[14px] font-[800] tracking-[0.04em] text-brand-navy">
              Quran Odyssey
            </span>
            <span className="text-[11px] font-[500] tracking-[0.06em] text-content-muted">
              Online Quran Learning
            </span>
          </div>
        </Link>

        <ul className="hidden list-none items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={[
                  "rounded-[6px] px-[14px] py-[6px] text-[14px] font-[500] text-content-muted transition-all",
                  "hover:bg-surface-light hover:text-content-primary",
                  link.active ? "text-content-primary font-[600]" : "",
                ].join(" ")}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="#"
              className={[
                "ml-2 rounded-[6px] bg-brand-amber px-5 py-2",
                "text-[13px] font-[700] tracking-[0.02em] text-brand-navy transition",
                "hover:-translate-y-[1px] hover:bg-brand-amber-dark",
              ].join(" ")}
            >
              Book Free Trial
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
