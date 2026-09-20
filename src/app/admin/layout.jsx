"use client";

// ═══════════════════════════════════════════════════════════
// FILE: src/app/admin/layout.jsx   (NEW)
//
// The admin panel shell: a fixed navy sidebar (matching the teacher
// portal), a topbar, and an admin GUARD. On mount it calls
// GET /api/admin/me — a 200 means this user is a valid active ADMIN;
// anything else bounces them to /login. Non-admins never see the panel.
//
// All /admin/* pages render inside this layout.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const NAV = [
  {
    section: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: "⊞" }],
  },
  {
    section: "People",
    items: [
      { label: "Accounts", href: "/admin/accounts", icon: "👤" },
      { label: "Students", href: "/admin/students", icon: "🎓" },
      { label: "Teachers", href: "/admin/teachers", icon: "👩‍🏫" },
    ],
  },
  {
    section: "Operations",
    items: [
      {
        label: "Enrolment Requests",
        href: "/admin/enrollment-requests",
        icon: "📝",
      },
      { label: "Trial Bookings", href: "/admin/trials", icon: "📅" },
      { label: "Class Sessions", href: "/admin/sessions", icon: "🗓️" },
    ],
  },
  {
    section: "Records",
    items: [
      // { label: "Attendance", href: "/admin/attendance", icon: "✓" },
      // { label: "Assignments", href: "/admin/assignments", icon: "📋" },
      // { label: "Progress Reports", href: "/admin/reports", icon: "📊" },
      { label: "Oversight", href: "/admin/oversight", icon: "📊" },
    ],
  },
  { section: 'ACADEMICS', 
    items: [
    { label: 'Progress Reports', href: '/admin/reports',     icon: '📄' },
    { label: 'Assignments',      href: '/admin/assignments', icon: '📚' },
  ] 
  },
  {
    section: "Growth",
    items: [
      { label: "Leads", href: "/admin/leads", icon: "🌱" },
      { label: "Communications", href: "/admin/communications", icon: "✉️" },
      { label: "Analytics", href: "/admin/analytics", icon: "📈" },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Audit Log", href: "/admin/audit", icon: "🛡️" },
      { label: "Settings", href: "/admin/settings", icon: "⚙️" },
    ],
  },
  // {
  //   se
  // }
];

function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL;
}

export default function AdminLayout({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const router = useRouter();

  const [state, setState] = useState("checking"); // checking | allowed | denied
  const [admin, setAdmin] = useState(null);

  const [failedCount, setFailedCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // ── Admin guard ──────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/login?redirect=/admin");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${apiBase()}/api/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setAdmin(data.admin);
          setState("allowed");
        } else {
          setState("denied");
        }
      } catch {
        if (!cancelled) setState("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/communications/failure-count`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok && alive) { const d = await res.json(); setFailedCount(d.failed || 0); }
      } catch {}
    };
    poll();
    const t = setInterval(poll, 60000); // refresh every minute
    return () => { alive = false; clearInterval(t); };
  }, []);

  const handleSignOut = () => signOut(() => router.push("/"));

  // ── Guard states ─────────────────────────────────────────
  if (!isLoaded || state === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9fb",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "4px solid #e2e8f0",
              borderTopColor: "#28b7d9",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>
            Verifying admin access…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9fb",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          padding: 20,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            textAlign: "center",
            background: "white",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            padding: 40,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Access restricted
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#64748b",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            This area is for administrators only. If you believe this is a
            mistake, contact the platform owner.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <Link
              href="/dashboard"
              style={{
                background: "#0d2840",
                color: "white",
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Go to dashboard
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                background: "white",
                color: "#64748b",
                border: "1px solid #e2e8f0",
                padding: "10px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Allowed: render the shell ────────────────────────────
  const displayName = admin?.name || admin?.email?.split("@")[0] || "Admin";
  const initials = (displayName || "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        background: "#f7f9fb",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-burger { display: none; }
        .admin-overlay { display: none; }
        @media (max-width: 1023px) {
          .admin-aside {
            transform: translateX(-100%);
            transition: transform 250ms ease;
          }
          .admin-aside.open { transform: translateX(0); }
          .admin-main { margin-left: 0 !important; }
          .admin-burger { display: inline-flex !important; }
          .admin-overlay { display: block !important; }
          .admin-header { padding: 0 14px !important; }
          .admin-content { padding: 16px !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      <div
        className="admin-overlay"
        onClick={() => setSidebarOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 150,
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
          transition: "opacity 250ms ease",
        }}
      />

      {/* Sidebar */}
      <aside
        className={`admin-aside${sidebarOpen ? " open" : ""}`}
        style={{
          width: 252,
          background: "#0a2035",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          // Inline z-index kept in sync with (and above) the overlay (150),
          // so the open drawer is always clickable on mobile.
          zIndex: 200,
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* sidebar header */}
        <div
          style={{
            padding: "22px 20px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "linear-gradient(135deg, #28b7d9, #0e6e8a)",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "white",
              flexShrink: 0,
            }}
          >
            QO
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "white",
                letterSpacing: -0.2,
              }}
            >
              Quran Odyssey
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}
            >
              Admin Panel
            </div>
          </div>
        </div>

        {/* main nav */}
        <nav
          className="admin-sidebar"
          style={{
            flex: 1,
            padding: "6px 12px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
          }}
        >
          {NAV.map((group) => (
            <div key={group.section}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)",
                  padding: "14px 8px 5px",
                }}
              >
                {group.section}
              </div>
              {group.items.map((item) => {
                // exact match for /admin, prefix match for the rest
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      textDecoration: "none",
                      marginBottom: 1,
                      background: active
                        ? "rgba(40,183,217,0.14)"
                        : "transparent",
                      color: active ? "white" : "rgba(255,255,255,0.6)",
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    <span
                      style={{ fontSize: 14, width: 18, textAlign: "center" }}
                    >
                      {item.icon}
                    </span>
                    {item.label}

                    {item.href === '/admin/communications' && failedCount > 0 && (
                      <span style={{
                        marginLeft: 'auto', background: '#dc2626', color: 'white', fontSize: 11,
                        fontWeight: 800, borderRadius: 999, padding: '1px 7px', minWidth: 18, textAlign: 'center',
                      }}>
                        {failedCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* bottom */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #faa71a, #e8920a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "#0d2840",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "white",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Administrator
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div
        className="admin-main"
        style={{
          marginLeft: 252,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        <header
          className="admin-header"
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 28px",
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {/* Hamburger — mobile/tablet only */}
            <button
              type="button"
              className="admin-burger"
              onClick={() => setSidebarOpen((p) => !p)}
              aria-label="Toggle menu"
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#0f172a",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <div style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>Admin</span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span>{pathTitle(pathname)}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/dashboard"
              style={{
                fontSize: 12,
                color: "#64748b",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Exit to app ↗
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "white",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                color: "#64748b",
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="admin-content" style={{ padding: 28, flex: 1, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}

function pathTitle(pathname) {
  if (pathname === "/admin") return "Dashboard";
  const seg = pathname.split("/")[2] || "";
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
