import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="relative bg-brand-navy-dark px-6 pt-12 pb-8 md:px-[60px]">
      <div className="mx-auto w-full max-w-[1240px]">
        {/* Top row: brand + nav */}
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Link href="/" className="inline-flex">
              <Image
                src="/logo2-trimmed.png"
                width={1110}
                height={539}
                alt="Quran Odyssey"
                className="h-11 w-auto select-none"
              />
            </Link>
            <p className="max-w-[320px] text-[13px] leading-[1.6] text-white/40">
              Live Quran classes with verified teachers for children across the
              UK, USA, Canada and beyond.
            </p>
          </div>

          {/* Nav */}
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-end"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-[500] text-white/60 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-white/10" />

        {/* Bottom row: copyright */}
        <div className="flex flex-col items-center gap-2 text-center text-[13px] font-[500] text-white/35 md:flex-row md:justify-between md:text-left">
          <div>© 2026 Quran Odyssey. All rights reserved.</div>
          <div>Built by VISAITECH.</div>
        </div>
      </div>
    </footer>
  );
}
