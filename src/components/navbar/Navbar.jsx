"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const NAV_SCROLL_CLASSES = ["scrolled", "backdrop-blur-xl", "bg-white/75"];

// ─── User avatar + dropdown ───────────────────────────────
function UserDropdown({ user, isTeacher, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const initials =
    ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() ||
    user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
    "?";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="Account menu"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px 6px 6px",
          borderRadius: 8,
          border: `1.5px solid ${isTeacher ? "rgba(40,183,217,0.35)" : "#e2e8f0"}`,
          background: isTeacher ? "rgba(40,183,217,0.08)" : "#f7f9fb",
          cursor: "pointer",
          transition: "all 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isTeacher ? "#28b7d9" : "#cbd5e1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isTeacher
            ? "rgba(40,183,217,0.35)"
            : "#e2e8f0";
        }}
      >
        {/* Initials circle */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: isTeacher
              ? "linear-gradient(135deg, #28b7d9, #0e6e8a)"
              : "linear-gradient(135deg, #0d2840, #1a3d5c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            color: "white",
            flexShrink: 0,
            letterSpacing: "0.04em",
          }}
        >
          {initials}
        </div>

        {/* Name + role pill */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {firstName || "Account"}
          </span>
          {isTeacher && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#0e6e8a",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Teacher
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            color: "#94a3b8",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
            flexShrink: 0,
          }}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 220,
            background: "white",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)",
            overflow: "hidden",
            zIndex: 200,
          }}
        >
          {/* Header */}
          <div
            style={{ padding: "14px 16px", borderBottom: "1px solid #f0f4f8" }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              {firstName} {lastName}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              {user.emailAddresses?.[0]?.emailAddress}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                marginTop: 6,
                padding: "2px 8px",
                borderRadius: 20,
                background: isTeacher
                  ? "rgba(40,183,217,0.10)"
                  : "rgba(13,40,64,0.08)",
                fontSize: 11,
                fontWeight: 700,
                color: isTeacher ? "#0e6e8a" : "#0d2840",
              }}
            >
              {isTeacher ? "👩‍🏫 Teacher" : "🎓 Student"}
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px 0" }}>
            {isTeacher ? (
              <DropdownLink
                href="/teacher/dashboard"
                onClick={() => setOpen(false)}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="7"
                      height="7"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <rect
                      x="14"
                      y="3"
                      width="7"
                      height="7"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <rect
                      x="3"
                      y="14"
                      width="7"
                      height="7"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <rect
                      x="14"
                      y="14"
                      width="7"
                      height="7"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                }
              >
                Teacher Portal
              </DropdownLink>
            ) : (
              <>
                <DropdownLink
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <rect
                        x="14"
                        y="14"
                        width="7"
                        height="7"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  }
                >
                  My Dashboard
                </DropdownLink>
                <DropdownLink
                  href="/booking/trial"
                  onClick={() => setOpen(false)}
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M16 2v4M8 2v4M3 10h18"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                >
                  Book a Trial
                </DropdownLink>
              </>
            )}
          </div>

          {/* Sign out */}
          <div style={{ borderTop: "1px solid #f0f4f8", padding: "6px 0" }}>
            <button
              onClick={() => {
                onSignOut();
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "#94a3b8",
                textAlign: "left",
                transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f7f9fb";
                e.currentTarget.style.color = "#0f172a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownLink({ href, onClick, icon, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 600,
        color: "#0f172a",
        textDecoration: "none",
        transition: "background 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#f7f9fb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ color: "#94a3b8", flexShrink: 0 }}>{icon}</span>
      {children}
    </Link>
  );
}

// ─── Skeleton for auth buttons while Clerk loads ──────────
function AuthSkeleton() {
  return (
    <div
      style={{
        width: 80,
        height: 34,
        borderRadius: 8,
        background: "#f0f4f8",
        animation: "pulse 1.5s ease infinite",
      }}
    />
  );
}

// ─── Main Navbar ──────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navRef = useRef(null);

  // Role from Clerk publicMetadata — no API call needed
  const role = user?.publicMetadata?.role || "STUDENT";
  const isTeacher = isLoaded && !!user && role === "TEACHER";
  const isLoggedIn = isLoaded && !!user;

  // Active link detection
  const activeHref =
    pathname === "/about"
      ? "/about"
      : pathname === "/courses"
        ? "/courses"
        : pathname === "/contact"
          ? "/contact"
          : "/";

  // ── Scroll-to-top on route change ─────────────────────────
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ── GSAP scroll shadow ────────────────────────────────────
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const nav = navRef.current;
    if (!nav) return;

    const ctx = gsap.context(() => {
      const applyForScrollY = (y) => {
        NAV_SCROLL_CLASSES.forEach((cls) => nav.classList.toggle(cls, y > 1));
      };

      ScrollTrigger.create({
        trigger: "main",
        start: "top top",
        end: "bottom bottom",
        scrub: 2,
        onUpdate: (self) => applyForScrollY(self.scroll()),
      });

      applyForScrollY(window.scrollY || document.documentElement.scrollTop);
      ScrollTrigger.refresh();
    }, nav);

    return () => ctx.revert();
  }, []);

  const handleSignOut = () => signOut(() => router.push("/"));

  // ── Hide on landing page + all teacher panel routes ───────
  // Teacher panel has its own sidebar — main navbar would overlap
  if (pathname?.startsWith("/landing-page")) return null;
  if (pathname?.startsWith("/teacher")) return null;
  if (pathname?.startsWith("/booking")) return null;
  if (pathname?.startsWith("/login")) return null;
  if (pathname?.startsWith("/register")) return null;
  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      <nav
        ref={navRef}
        id="navbar"
        className={`fixed inset-x-0 top-0 z-[100] h-[68px] border-b-[0.1px] border-neutral-300 transition-[box-shadow,backdrop-filter,background-color] duration-200`}
      >
        <div className="mx-auto flex h-full w-full max-w-[1240px] items-center justify-between px-6 md:px-[60px]">
          {/* Logo */}
          <Link
            href="/"
            className="logo flex items-center gap-[10px] no-underline"
          >
            <Image
              src="/logo2.png"
              width={100}
              height={100}
              alt="Quran Odyssey"
              className=""
            />
          </Link>

          {/* Desktop navigation */}
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

            {/* Auth controls */}
            <li className="ml-2 flex items-center gap-2">
              {/* Loading skeleton */}
              {!isLoaded && <AuthSkeleton />}

              {/* ── Logged in ── */}
              {isLoaded && isLoggedIn && (
                <>
                  <UserDropdown
                    user={user}
                    isTeacher={isTeacher}
                    onSignOut={handleSignOut}
                  />

                  {/* Primary CTA — role-specific */}
                  {isTeacher ? (
                    <Link
                      href="/teacher/dashboard"
                      className="inline-flex items-center gap-[6px] rounded-[6px] bg-brand-cyan px-5 py-2 text-[13px] font-[700] text-white transition hover:-translate-y-[1px] hover:bg-brand-cyan-dark"
                    >
                      <svg
                        width="13"
                        height="13"
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
                      Teacher Portal
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-[6px] rounded-[6px] bg-brand-navy px-5 py-2 text-[13px] font-[700] text-white transition hover:-translate-y-[1px] hover:opacity-90"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 22V12h6v10"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Dashboard
                    </Link>
                  )}
                </>
              )}

              {/* ── Logged out ── */}
              {isLoaded && !isLoggedIn && (
                <>
                  <Link
                    href="/login"
                    className="rounded-[6px] border-[1.5px] border-neutral-200 bg-neutral-100 px-5 py-2 text-[13px] font-[700] tracking-[0.02em] text-brand-navy transition hover:-translate-y-[1px] hover:bg-neutral-100/50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/booking/trial"
                    className="rounded-[6px] bg-brand-amber px-5 py-2 text-[13px] font-[700] tracking-[0.02em] text-brand-navy transition hover:-translate-y-[1px] hover:bg-brand-amber-dark"
                  >
                    Book Free Trial
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
