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
function UserDropdown({ user, isTeacher, isAdmin, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

  // ── Per-role visual config ─────────────────────────────

  const roleCfg = isAdmin
  ? {
      borderColor: "rgba(13,40,64,0.35)",
      avatarBg:    "linear-gradient(135deg, #0d2840, #142f4a)",
      badgeBg:     "rgba(13,40,64,0.10)",
      badgeColor:  "#0d2840",
      badgeLabel:  "🛡️ Administrator",
    }
  : isTeacher
  ? {
      borderColor: "rgba(40,183,217,0.35)",
      // avatarBg:    "linear-gradient(135deg, #28b7d9, #0e6e8a)",
      avatarBg:    "linear-gradient(135deg, #28b7d9, #0e6e8a)",
      badgeBg:     "rgba(40,183,217,0.10)",
      badgeColor:  "#0e6e8a",
      badgeLabel:  "👩‍🏫 Teacher",
    }
  : {
      borderColor: "rgba(250,167,26,0.40)",
      avatarBg:    "linear-gradient(135deg, #faa71a, #e8920a)",
      badgeBg:     "rgba(250,167,26,0.12)",
      badgeColor:  "#92400e",
      badgeLabel:  "👤 My Account",
    };

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
          border: `1.5px solid ${roleCfg.borderColor}`,
          // background: roleCfg.avatarBg,
          cursor: "pointer",
          transition: "all 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = roleCfg.borderHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = roleCfg.borderColor;
        }}
      >
        {/* Initials circle */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: roleCfg.avatarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            // color: isParent ? "#0d2840" : "white",
            // color: "#0d2840",
            color: "white",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        {/* Name */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#0f172a",
            maxWidth: 100,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {firstName || user.emailAddresses?.[0]?.emailAddress?.split("@")[0]}
        </span>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{
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
            {/* Role badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                marginTop: 6,
                padding: "2px 8px",
                borderRadius: 20,
                background: roleCfg.badgeBg,
                fontSize: 11,
                fontWeight: 700,
                color: roleCfg.badgeColor,
              }}
            >
              {roleCfg.badgeLabel}
            </div>
          </div>

          {/* Menu items — role-specific */}
          <div style={{ padding: "6px 0" }}>
            {isAdmin ? (
              <DropdownLink href="/admin" onClick={() => setOpen(false)} icon={<DashboardIcon />}>
                Admin Panel
              </DropdownLink>
            ) : isTeacher ? (
              <DropdownLink href="/teacher/dashboard" onClick={() => setOpen(false)} icon={<DashboardIcon />}>
                Teacher Portal
              </DropdownLink>
            ) : (
              <>
                <DropdownLink href="/dashboard" onClick={() => setOpen(false)} icon={<HomeIcon />}>
                  Dashboard
                </DropdownLink>
                <DropdownLink href="/booking/trial" onClick={() => setOpen(false)} icon={<CalendarIcon />}>
                  Book a Trial
                </DropdownLink>
                <DropdownLink href="/enroll" onClick={() => setOpen(false)} icon={<div>👤</div>}>
                  Enroll a Child
                </DropdownLink>
              </>
            )}
          </div>

          {/* Divider + sign out */}
          <div style={{ borderTop: "1px solid #f0f4f8", padding: "6px 0" }}>
            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
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
                color: "#ef4444",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fff5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: "#ef4444", flexShrink: 0 }}
              >
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

// ─── Reusable dropdown link ───────────────────────────────
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

// ─── Inline SVG icons ─────────────────────────────────────
function DashboardIcon() {
  return (
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
  );
}

function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 22V12h6v10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
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
        d="M3 10h18M8 2v4M16 2v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 20V10M12 20V4M6 20v-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Loading skeleton ─────────────────────────────────────
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

// ─── Hamburger / close icons ──────────────────────────────
function BurgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Main Navbar ──────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role       = user?.publicMetadata?.role || "PARENT";
  const isTeacher  = isLoaded && !!user && role === "TEACHER";
  const isAdmin    = isLoaded && !!user && role === "ADMIN";
  const isLoggedIn = isLoaded && !!user;
  // No more isParent branch — parents and students share one dashboard.

  // Hide navbar entirely on portal routes
  const hideNavbar =
    pathname?.startsWith("/teacher") ||
    pathname === "/landing-page" ||
    // pathname?.startsWith("/booking") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/learn") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login");

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  // GSAP scroll effect
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!navRef.current || hideNavbar) return;

    ScrollTrigger.create({
      start: "top+=80 top",
      onEnter: () => navRef.current?.classList.add(...NAV_SCROLL_CLASSES),
      onLeaveBack: () =>
        navRef.current?.classList.remove(...NAV_SCROLL_CLASSES),
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [hideNavbar]);

  const handleSignOut = () => {
    setMobileOpen(false);
    signOut(() => router.push("/"));
  };

  if (hideNavbar) return null;

  const dashHref = isAdmin ? "/admin" : isTeacher ? "/teacher/dashboard" : "/dashboard";
  const dashLabel = isAdmin ? "Admin Panel" : isTeacher ? "Teacher Portal" : "Dashboard";

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 shadow-sm border-line-light bg-white transition-all duration-300"
        style={{ height: 68 }}
      >
        <div
          className="mx-auto flex h-full items-center justify-between gap-3"
          style={{ maxWidth: 1240, paddingInline: "clamp(1rem, 4vw, 100px)" }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
            <Image
              src="/logo2.png"
              alt="Quran Odyssey"
              width={130}
              height={36}
              className="h-8 w-auto sm:h-9"
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>

          {/* ── Desktop nav links (lg and up) ── */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={[
                    "rounded-md px-4 py-2 text-[13px] transition",
                    pathname === link.href
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
              {!isLoaded && <AuthSkeleton />}

              {isLoaded && isLoggedIn && (
                <>
                  <UserDropdown
                    user={user}
                    isTeacher={isTeacher}
                    isAdmin={isAdmin}
                    onSignOut={handleSignOut}
                  />
                  <Link
                    href={dashHref}
                    className={[
                      "inline-flex items-center gap-[6px] rounded-[6px] px-5 py-2 text-[13px] font-[700] text-white transition hover:-translate-y-[1px] hover:opacity-90",
                      isTeacher ? "bg-brand-cyan" : "bg-brand-navy",
                    ].join(" ")}
                  >
                    {isTeacher ? <DashboardIcon /> : isAdmin ? <DashboardIcon /> : <HomeIcon />}
                    {dashLabel}
                  </Link>
                </>
              )}

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

          {/* ── Mobile / tablet controls (below lg) ── */}
          <div className="flex items-center gap-2 lg:hidden">
            {isLoaded && !isLoggedIn && (
              <Link
                href="/booking/trial"
                className="hidden sm:inline-flex rounded-[6px] bg-brand-amber px-4 py-2 text-[13px] font-[700] tracking-[0.01em] text-brand-navy transition active:translate-y-[1px]"
              >
                Book Trial
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-neutral-200 bg-white text-brand-navy transition active:scale-95"
            >
              {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu overlay + panel (below lg) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            style={{ top: 68 }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div
            className="absolute left-0 right-0 max-h-[calc(100vh-68px)] overflow-y-auto border-b border-line-light bg-white shadow-lg"
            style={{ top: 68 }}
          >
            <div className="flex flex-col gap-1 px-5 py-4 sm:px-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "rounded-lg px-4 py-3 text-[15px] font-[600] transition",
                    pathname === link.href
                      ? "bg-brand-cyan/10 text-brand-cyan-dark"
                      : "text-content-primary hover:bg-neutral-100",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 h-px bg-line-light" />

              {!isLoaded && (
                <div className="h-11 w-full animate-pulse rounded-lg bg-neutral-100" />
              )}

              {isLoaded && isLoggedIn && (
                <>
                  <div className="mb-1 px-4 py-2">
                    <div className="text-[14px] font-[700] text-content-primary">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-[12px] text-content-muted">
                      {user.emailAddresses?.[0]?.emailAddress}
                    </div>
                  </div>
                  <Link
                    href={dashHref}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-[14px] font-[700] text-white transition",
                      isTeacher ? "bg-brand-cyan" : "bg-brand-navy",
                    ].join(" ")}
                  >
                    {dashLabel}
                  </Link>
                  {!isTeacher && !isAdmin && (
                    <Link
                      href="/booking/trial"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-line-default px-4 py-3 text-[14px] font-[600] text-content-primary transition hover:bg-neutral-50"
                    >
                      Book a Trial
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-[14px] font-[600] text-danger transition hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </>
              )}

              {isLoaded && !isLoggedIn && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg border-[1.5px] border-neutral-200 bg-neutral-100 px-4 py-3 text-[14px] font-[700] text-brand-navy transition"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/booking/trial"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-amber px-4 py-3 text-[14px] font-[700] text-brand-navy transition"
                  >
                    Book Free Trial
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
