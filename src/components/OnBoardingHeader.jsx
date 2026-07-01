// src/components/onboarding/OnboardingHeader.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
/**
 * Minimal header for the onboarding / register-profile flow.
 * - Top bar: brand logo (left) + "Back to home" escape hatch (right)
 * - Intro block: <h1> page title + subtitle
 *
 * The global <Navbar /> is already hidden on /register* routes,
 * so this is the only header on the page — no double-nav.
 */
export default function OnboardingHeader({
  chip = "Account setup",
  title = "Set up your learning profile",
  subtitle = "A few quick details and you're ready to book your first class.",
}) {
  const { signOut } = useClerk();

  return (
    <header className="w-full">
      {/* ── Top bar ── */}
      <div className="w-full border-b-none shadow-sm border-line-light bg-white">
        <div className="mx-auto flex h-[64px] max-w-[1240px] items-center justify-between px-6 md:px-10">
          <Link
            href="/"
            aria-label="Quran Odyssey — home"
            className="flex shrink-0 items-center"
          >
            <Image
              src="/logo2.png"
              alt="Quran Odyssey"
              width={132}
              height={36}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>

          <div className="flex items-center justify-center gap-[10px]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-line-light bg-white px-4 py-2 text-[13px] font-[700] text-content-muted transition hover:bg-surface-off-white hover:text-content-primary"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to home
            </Link>
            {/* <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-line-light bg-brand-amber-dark px-4 py-2 text-[13px] font-[700] text-content-muted transition hover:bg-surface-off-white hover:text-content-primary font-bold"
            >
              Sign Out
            </button> */}
            <div style={{ borderTop: "1px solid #f0f4f8", padding: "6px 0"}}>
              <button
                onClick={signOut}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "8px",
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
        </div>
      </div>

      {/* ── Intro block (heading + subtitle) ── */}
      <div className="px-6 pt-10 pb-1">
        <div className="mx-auto w-full max-w-[560px] text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(40,183,217,0.10)] px-3 py-1 text-[12px] font-[700] tracking-[0.02em] text-brand-cyan-dark">
            <span className="h-[6px] w-[6px] rounded-full bg-brand-cyan" />
            {chip}
          </span>

          <h1 className="mt-4 text-[27px] leading-[1.15] font-[800] tracking-[-0.03em] text-content-primary">
            {title}
          </h1>

          <p className="mt-2 text-[14px] text-content-muted">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
