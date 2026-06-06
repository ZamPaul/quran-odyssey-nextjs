"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ─── Nav config ───────────────────────────────────────────
const NAV = [
  { label: "Overview", href: "/parent/dashboard", icon: "⊞" },
  { label: "Schedule", href: "/parent/schedule", icon: "📅" },
  { label: "Progress", href: "/parent/progress", icon: "📊" },
  { label: "Homework", href: "/parent/homework", icon: "📋" },
  { label: "Attendance", href: "/parent/attendance", icon: "✓" },
];

// ─── Loading skeleton ─────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f7f9fb",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ width: 260, background: "#0d2840", flexShrink: 0 }} />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "3px solid #e2e8f0",
              borderTopColor: "#28b7d9",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p
            style={{ fontSize: 14, color: "#94a3b8", fontFamily: "system-ui" }}
          >
            Loading parent portal…
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── No children state ────────────────────────────────────
function NoChildrenState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍👩‍👧</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 8,
        }}
      >
        No children linked yet
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#94a3b8",
          maxWidth: 360,
          lineHeight: 1.7,
        }}
      >
        Your account hasn&apos;t been linked to any student accounts yet. Please
        contact us and we&apos;ll set this up for you.
      </div>
      <a
        href="https://wa.me/"
        style={{
          marginTop: 20,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 8,
          background: "#25d366",
          color: "white",
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Contact Us on WhatsApp
      </a>
    </div>
  );
}

// ─── Child selector tabs ──────────────────────────────────
function ChildSelector({ children, activeChildId, onSelect }) {
  if (children.length <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: "12px 28px",
        background: "white",
        borderBottom: "1px solid #e2e8f0",
        overflowX: "auto",
      }}
    >
      {children.map((child) => {
        const name =
          child.profile?.childName || child.email?.split("@")[0] || "Student";
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        const active = activeChildId === child.id;
        return (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 8,
              border: `1.5px solid ${active ? "#0d2840" : "#e2e8f0"}`,
              background: active ? "#0d2840" : "white",
              color: active ? "white" : "#64748b",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 150ms ease",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: active
                  ? "rgba(255,255,255,0.2)"
                  : "linear-gradient(135deg, #28b7d9, #0e6e8a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
                color: "white",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            {name}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────
function SidebarContent({ parent, pathname, onSignOut, onClose }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0d2840",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "block" }}>
          <Image
            src="/logo2.png"
            width={120}
            height={32}
            alt="Quran Odyssey"
            style={{ objectFit: "contain" }}
          />
        </Link>
        <button
          onClick={onClose}
          className="sidebar-close-btn"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          ✕
        </button>
      </div>

      {/* Parent badge */}
      {parent && (
        <div
          style={{
            margin: "16px 12px",
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(250,167,26,0.12)",
            border: "1px solid rgba(250,167,26,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
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
            {parent.name
              ?.split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "P"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {parent.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                marginTop: 1,
              }}
            >
              Parent Portal
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.3)",
            padding: "8px 8px 6px",
            marginBottom: 4,
          }}
        >
          Menu
        </div>
        {NAV.map(({ label, href, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "white" : "rgba(255,255,255,0.55)",
                background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
                textDecoration: "none",
                transition: "all 150ms ease",
                borderLeft: isActive
                  ? "3px solid #faa71a"
                  : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={onSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.45)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span>⏻</span> Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Main layout ──────────────────────────────────────────
export default function ParentLayout({ children }) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  const [parent, setParent] = useState(null);
  const [childList, setChildList] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [noChildren, setNoChildren] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const verify = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/parent/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 403) {
          router.push("/dashboard");
          return;
        }
        if (!res.ok) {
          router.push("/dashboard");
          return;
        }

        const data = await res.json();
        setParent(data.parent);

        if (!data.children || data.children.length === 0) {
          setNoChildren(true);
        } else {
          setChildList(data.children);
          setActiveChildId(data.children[0].id);
        }

        setAuthChecked(true);
      } catch {
        router.push("/dashboard");
      }
    };

    verify();
  }, [isLoaded, user]);

  const handleSignOut = () => signOut(() => router.push("/"));

  if (!authChecked) return <LoadingSkeleton />;

  // Clone children with activeChildId + setter so pages can use them
  // via a context — for Phase 4 we pass via a simple global on window
  // Phase 5 will use React context properly
  if (typeof window !== "undefined") {
    window.__parentChildIds = childList.map((c) => c.id);
    window.__parentActiveChild = activeChildId;
    window.__parentChildren = childList;
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .sidebar-close-btn { display: none !important; }
        @media (max-width: 768px) {
          .parent-sidebar  { transform: translateX(-100%); transition: transform 250ms ease; z-index: 200; }
          .parent-sidebar.open { transform: translateX(0); }
          .parent-main     { margin-left: 0 !important; }
          .parent-mobile-header { display: flex !important; }
          .sidebar-close-btn { display: flex !important; }
          .sidebar-overlay  { display: block !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      <div
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 199,
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
          transition: "opacity 250ms ease",
        }}
      />

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f7f9fb",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        {/* Sidebar */}
        <div
          className={`parent-sidebar${sidebarOpen ? " open" : ""}`}
          style={{
            width: 260,
            flexShrink: 0,
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            overflowY: "auto",
            zIndex: 100,
          }}
        >
          <SidebarContent
            parent={parent}
            pathname={pathname}
            onSignOut={handleSignOut}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main */}
        <div
          className="parent-main"
          style={{
            flex: 1,
            marginLeft: 260,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Mobile header */}
          <div
            className="parent-mobile-header"
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              height: 60,
              background: "white",
              borderBottom: "1px solid #e2e8f0",
              position: "sticky",
              top: 0,
              zIndex: 50,
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#64748b",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ☰
            </button>
            <Image
              src="/logo2.png"
              width={100}
              height={28}
              alt="Quran Odyssey"
              style={{ objectFit: "contain" }}
            />
            <div style={{ width: 36 }} />
          </div>

          {/* Child selector strip */}
          {childList.length > 1 && (
            <ChildSelector
              children={childList}
              activeChildId={activeChildId}
              onSelect={setActiveChildId}
            />
          )}

          {/* Page content */}
          <main style={{ padding: "32px", flex: 1, maxWidth: 1200 }}>
            {noChildren ? <NoChildrenState /> : children}
          </main>
        </div>
      </div>
    </>
  );
}
