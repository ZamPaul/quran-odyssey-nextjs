// src/components/navbar/Navbar.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef(null);

  // const isLandingPage = pathname === "/landing-page";

  const isLandingPage =
    pathname == "/landing-page" ||
    pathname == "/booking/trial" ||
    pathname == "/dashboard" ||
    pathname == "/register" ||
    pathname == "/login";

  const activeHref = pathname.startsWith("/about")
    ? "/about"
    : pathname.startsWith("/courses")
      ? "/courses"
      : pathname.startsWith("/contact")
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
      ScrollTrigger.create({
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const scrolled = self.scroll() > 1;
          nav.classList.toggle("scrolled", scrolled);
          nav.classList.toggle("backdrop-blur-xl", scrolled);
          nav.classList.toggle("bg-white/75", scrolled);
        },
      });
      ScrollTrigger.refresh();
    }, nav);

    return () => ctx.revert();
  }, []);

  const handleSignOut = () => {
    signOut(() => router.push("/"));
    setUserMenuOpen(false);
  };

  const initials = user
    ? (user.fullName || user.emailAddresses?.[0]?.emailAddress || "U")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <nav
      ref={navRef}
      id="navbar"
      className={`${isLandingPage ? "hidden" : "fixed"} inset-x-0 top-0 z-[100] h-[68px] border-b-[0.1px] border-neutral-300 transition-[box-shadow,backdrop-filter,background-color] duration-200`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-center justify-between px-6 md:px-[60px]">
        {/* Logo */}
        <Link href="/" className="flex items-center no-underline">
          <Image
            src="/logo2.png"
            width={100}
            height={100}
            alt="Quran Odyssey logo"
          />
        </Link>

        {/* Desktop nav links */}
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
        </ul>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          {!isLoaded ? (
            // Skeleton while Clerk loads — prevents layout shift
            <div className="h-9 w-32 rounded-[6px] bg-neutral-100 animate-pulse" />
          ) : user ? (
            // ── Signed in ──────────────────────────────────
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-[6px] px-4 py-2 text-[13px] font-[700] text-content-muted transition hover:bg-neutral-200 hover:text-content-primary"
              >
                Dashboard
              </Link>

              {/* User avatar dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-[8px] border border-neutral-200 bg-white px-3 py-[6px] transition hover:bg-neutral-50"
                >
                  {/* Avatar */}
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-[800] text-white flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #faa71a, #e8920a)",
                    }}
                  >
                    {initials}
                  </div>
                  <span className="text-[13px] font-[700] text-content-primary max-w-[120px] truncate">
                    {user.fullName ||
                      user.emailAddresses?.[0]?.emailAddress?.split("@")[0]}
                  </span>
                  {/* Chevron */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M2 4l4 4 4-4"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-[90]"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-[calc(100%+8px)] z-[100] w-[200px] rounded-[10px] border border-neutral-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <div className="text-[12px] font-[700] text-content-primary truncate">
                          {user.fullName || "Student"}
                        </div>
                        <div className="text-[11px] text-content-muted truncate">
                          {user.emailAddresses?.[0]?.emailAddress}
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-[9px] text-[13px] font-[600] text-content-primary hover:bg-neutral-50 transition"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="7"
                              height="7"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <rect
                              x="14"
                              y="3"
                              width="7"
                              height="7"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <rect
                              x="3"
                              y="14"
                              width="7"
                              height="7"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <rect
                              x="14"
                              y="14"
                              width="7"
                              height="7"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </svg>
                          Dashboard
                        </Link>
                        <Link
                          href="/booking/trial"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-[9px] text-[13px] font-[600] text-content-primary hover:bg-neutral-50 transition"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
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
                            <path
                              d="M3 10h18M8 2v4M16 2v4"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                          Book Trial Class
                        </Link>
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-neutral-100 py-1">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-3 px-4 py-[9px] text-[13px] font-[600] text-red-500 hover:bg-red-50 transition"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            // ── Signed out ─────────────────────────────────
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-[6px] border border-neutral-200 bg-neutral-100 px-5 py-2 text-[13px] font-[700] text-brand-navy transition hover:-translate-y-[1px]"
              >
                Sign in
              </Link>
              <Link
                href="/booking/trial"
                className="rounded-[6px] bg-brand-amber px-5 py-2 text-[13px] font-[700] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark"
              >
                Book Free Trial
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
