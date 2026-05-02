"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Teachers", href: "#" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "#" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const activeHref =
    pathname === "/about"
      ? "/about"
      : pathname === "/courses"
        ? "/courses"
        : pathname === "/contact"
          ? "/contact"
          : "/";

  return (
    <nav
      id="navbar"
      className="fixed inset-x-0 top-0 z-[100] h-[68px] border-b border-line-lightbackdrop-blur-xl transition-shadow"
    >
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-center justify-between px-6 md:px-[60px]">
        <Link href="/" className="logo flex items-center gap-[10px] no-underline">
          <Image src={`${"/logo2.png"}`} width={100} height={100} alt="logo" className="" />
        </Link>

        <ul className="hidden list-none items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={[
                  "rounded-[6px] px-[14px] py-[6px] text-[14px] font-[500] text-content-muted transition-all",
                  "hover:bg-surface-light hover:text-content-primary",
                  link.href === activeHref ? "text-content-primary font-[600]" : "",
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
