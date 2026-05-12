"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  // { label: "Teachers", href: "#" },
  { label: "About", href: "/about" },
  // { label: "Pricing", href: "#" },
  { label: "Contact", href: "/contact" },
];

/** Matches `#navbar.scrolled` in globals.css (shadow) plus glass bar treatment */
const NAV_SCROLL_CLASSES = ["scrolled", "backdrop-blur-xl", "bg-white/75"];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);

  const isLandingPage = pathname == "/landing-page";

  const activeHref =
    pathname === "/about"
      ? "/about"
      : pathname === "/courses"
        ? "/courses"
        : pathname === "/contact"
          ? "/contact"
          : "/";

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const nav = navRef.current;
    if (!nav) return;

    const ctx = gsap.context(() => {
      const applyForScrollY = (y) => {
        const scrolled = y > 1;
        NAV_SCROLL_CLASSES.forEach((cls) =>
          nav.classList.toggle(cls, scrolled),
        );
      };

      ScrollTrigger.create({
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        // animation: anim,
        scrub: 2,
        // markers: true,
        onUpdate: (self) => applyForScrollY(self.scroll()),
      });

      applyForScrollY(window.scrollY || document.documentElement.scrollTop);
      ScrollTrigger.refresh();
    }, nav);

    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      id="navbar"
      className={`${isLandingPage ? "hidden" : "fixed"} inset-x-0 top-0 z-[100] h-[68px] border-b-[0.1px] border-neutral-300 transition-[box-shadow,backdrop-filter,background-color] duration-200`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-center justify-between px-6 md:px-[60px]">
        <Link
          href="/"
          className="logo flex items-center gap-[10px] no-underline"
        >
          <Image
            src={`${"/logo2.png"}`}
            width={100}
            height={100}
            alt="logo"
            className=""
          />
        </Link>

        <ul className="hidden list-none items-center gap-2 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={[
                  "rounded-[6px] px-[14px] py-[6px] text-[14px] font-[500] text-content-muted transition-all",
                  "hover:bg-surface-light hover:text-content-primary",
                  link.href === activeHref
                    ? "text-content-primary font-[600] bg-neutral-300/50"
                    : "hover:bg-neutral-200",
                ].join(" ")}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className={[
                "ml-2 rounded-[6px] border-[1.5px] border-neutral-200 bg-neutral-100 px-5 py-2",
                "text-[13px] font-[700] tracking-[0.02em] text-brand-navy transition",
                "hover:-translate-y-[1px] hover:bg-neutral-100/50",
              ].join(" ")}
              // className="rounded-[6px] border border-line-light px-4 py-[11px] text-center text-[14px] font-[700] text-content-primary transition hover:bg-surface-light"
            >
              Sign in
            </Link>
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
