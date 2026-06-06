// app/dashboard/page.jsx
"use client";

import { useUser, useClerk, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ─── Nav items ────────────────────────────────────────────
const NAV = [
  {
    id: "overview", label: "Overview",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/></svg>,
  },
  {
    id: "classes", label: "My Classes",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: "progress", label: "Progress",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: "homework", label: "Homework",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8"/><path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: "profile", label: "Profile & Settings",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
];

// ─── Status badge ─────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    PENDING:   { label: "Pending Zoom Link",  bg: "#fff7e0", color: "#92400e", dot: "#f59e0b" },
    CONFIRMED: { label: "Confirmed",          bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
    COMPLETED: { label: "Completed",          bg: "#f0f4f8", color: "#64748b", dot: "#94a3b8" },
    CANCELLED: { label: "Cancelled",          bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  };
  const c = config[status] || config.PENDING;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ─── Sidebar ──────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, user, onSignOut }) {
  const initials = (user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "U")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const displayName = user?.fullName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Student";

  return (
    <aside style={{ width: 248, background: "#0a2035", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #28b7d9, #0e6e8a)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0 }}>
          QO
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "white", letterSpacing: -0.2 }}>Quran Odyssey</div>
          <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>Student Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", padding: "16px 8px 6px" }}>
          Main Menu
        </div>
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", border: "none", width: "100%", textAlign: "left", background: active ? "rgba(40,183,217,0.14)" : "transparent", boxShadow: active ? "inset 0 0 0 1px rgba(40,183,217,0.2)" : "none", transition: "background 150ms" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "#28b7d9" : "rgba(255,255,255,0.06)", color: active ? "white" : "rgba(255,255,255,0.4)", flexShrink: 0 }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#28b7d9" : "rgba(255,255,255,0.45)", flex: 1 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #faa71a, #e8920a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#0d2840", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {displayName}
            </div>
            <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)" }}>Student</div>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", transition: "color 150ms" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Booking card ─────────────────────────────────────────
function BookingCard({ booking, timezone }) {
  if (!booking) {
    return (
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Next Class</div>
        </div>
        <div style={{ textAlign: "center", padding: "28px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>No classes scheduled yet</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Book your free trial to get started</div>
          <Link href="/booking/trial" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#0d2840", color: "white", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Book Free Trial →
          </Link>
        </div>
      </div>
    );
  }

  const tz      = timezone || "Europe/London";
  const start   = new Date(booking.slotStart);
  const end     = new Date(booking.slotEnd);

  const dateStr = start.toLocaleDateString("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = start.toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" });
  const endStr  = end.toLocaleTimeString("en-GB",   { timeZone: tz, hour: "2-digit", minute: "2-digit" });
  const tzAbbr  = start.toLocaleTimeString("en-GB", { timeZone: tz, timeZoneName: "short" }).split(" ").pop();

  const rows = [
    ["Teacher",  booking.teacher?.name || "—"],
    ["Date",     dateStr],
    ["Time",     `${timeStr} – ${endStr} (${tzAbbr})`],
    ["Duration", "30 minutes"],
  ];

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "#0d2840", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>Upcoming Trial Class</div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details */}
      <div style={{ padding: "20px 24px" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f4f8" }}>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{value}</span>
          </div>
        ))}

        {/* Zoom link / status message */}
        <div style={{ marginTop: 16 }}>
          {booking.status === "CONFIRMED" && booking.zoomLink ? (
            <a
              href={booking.zoomLink}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#22c55e", color: "white", padding: "12px 22px", borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: "none" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
              Join Class Now
            </a>
          ) : booking.status === "PENDING" ? (
            <div style={{ padding: "12px 14px", background: "#fff7e0", borderRadius: 8, border: "1px solid rgba(245,158,11,0.3)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 3 }}>
                ⏳ Zoom Link Pending
              </div>
              <div style={{ fontSize: 12, color: "#b45309", lineHeight: 1.5 }}>
                Your teacher will send the Zoom link to your email at least 1 hour before class.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────
function OverviewTab({ profile, booking, user }) {
  const parentName  = profile?.parentName  || user?.fullName || "there";
  const childName   = profile?.childName   || "your child";
  const courseLabel = profile?.courseInterest
    ?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || null;

  const stats = [
    { label: "Total Classes",  value: "0",           sub: "Trial pending"   },
    { label: "Day Streak",     value: "🔥 0",        sub: "Start learning"  },
    { label: "Attendance",     value: "—",           sub: "No classes yet"  },
    { label: "Course",         value: courseLabel?.split(" ")[0] || "—", sub: courseLabel || "Not enrolled" },
  ];

  return (
    <div>
      {/* Welcome banner */}
      <div style={{ background: "linear-gradient(135deg, #0d2840 0%, #142f4a 100%)", borderRadius: 16, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "radial-gradient(circle, rgba(40,183,217,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
          Welcome back
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: -0.5, marginBottom: 6 }}>
          {childName}&apos;s Learning Hub
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: booking ? 0 : 20 }}>
          {booking
            ? `Trial class booked — check details below`
            : profile
              ? `Enrolled in ${courseLabel || "Quran Learning"} · Book your free trial`
              : "Complete your profile to book your free trial class"}
        </div>
        {!booking && (
          <Link
            href={profile ? "/booking/trial" : "/register/profile"}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#faa71a", color: "#0d2840", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: "none", marginTop: 16 }}
          >
            {profile ? "Book Free Trial →" : "Complete Profile →"}
          </Link>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#94a3b8", marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: -1, marginBottom: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <BookingCard booking={booking} timezone={profile?.timezone} />

        {/* Account details */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Account Details</div>
          {[
            ["Parent Name",  profile?.parentName  || "—"],
            ["Child Name",   profile?.childName   || "—"],
            ["Email",        user?.emailAddresses?.[0]?.emailAddress || "—"],
            ["Country",      profile?.country     || "—"],
            ["Timezone",     profile?.timezone    || "—"],
            ["Course",       courseLabel          || "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f4f8" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700, textAlign: "right", maxWidth: "55%", wordBreak: "break-all" }}>{value}</span>
            </div>
          ))}
          {!profile && (
            <Link href="/register/profile" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, background: "#faa71a", color: "#0d2840", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>
              Complete Profile →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Coming Soon Tab ──────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#94a3b8" }}>This section will be available after your trial class.</div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────
function ProfileTab({ profile, user }) {
  const courseLabel = profile?.courseInterest
    ?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || "Not enrolled";
  const initials = (profile?.childName || profile?.parentName || "S")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>Profile & Settings</div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
        {/* Profile card */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #faa71a, #e8920a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#0d2840", margin: "0 auto 12px" }}>
            {initials}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
            {profile?.childName || "Student"}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
            {user?.emailAddresses?.[0]?.emailAddress}
          </div>
          <div style={{ background: "#e8f8fc", border: "1px solid rgba(40,183,217,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#0e6e8a" }}>
            📖 {courseLabel}
          </div>
        </div>

        {/* Details */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Personal Information</div>
          {profile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                ["Parent Name",  profile.parentName],
                ["Child Name",   profile.childName],
                ["Child Age",    `${profile.childAge} years old`],
                ["Country",      profile.country],
                ["Timezone",     profile.timezone],
                ["Phone",        profile.phone || "Not provided"],
                ["Course",       courseLabel],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 16 }}>
                Complete your profile to get started.
              </div>
              <Link href="/register/profile" style={{ display: "inline-flex", background: "#faa71a", color: "#0d2840", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>
                Complete Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth()
  const { signOut }        = useClerk();
  const router             = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile,   setProfile]   = useState(null);
  const [booking,   setBooking]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !user) router.push("/login");
  }, [isLoaded, user]);

  // Fetch profile + booking in parallel
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const base    = process.env.NEXT_PUBLIC_API_URL;

      const [profileRes, bookingRes] = await Promise.all([
        fetch(`${base}/api/students/profile`, { headers }),
        fetch(`${base}/api/booking/mine`,     { headers }),
      ]);

      if (profileRes.ok) {
        const d = await profileRes.json();
        setProfile(d.profile || null);
      }
      if (bookingRes.ok) {
        const d = await bookingRes.json();
        setBooking(d.booking || null);
      }
    } catch (err) {
      console.error("Dashboard data fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) fetchData();
  }, [isLoaded, user, fetchData]);

  const handleSignOut = () => signOut(() => router.push("/"));

  if (!isLoaded || !user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f7f9fb" }}>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSignOut={handleSignOut}
      />

      <main style={{ marginLeft: 248, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Topbar */}
        <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            <span style={{ color: "#0e6e8a" }}>
              {profile?.parentName || user.fullName || "there"}
            </span>{" "}
            👋
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!booking && (
              <Link
                href="/booking/trial"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#faa71a", color: "#0d2840", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: "none" }}
              >
                Book Free Trial
              </Link>
            )}
            <button
              onClick={handleSignOut}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#64748b" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 28, flex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#94a3b8", fontSize: 14 }}>
              Loading your dashboard…
            </div>
          ) : (
            <>
              {activeTab === "overview"  && <OverviewTab profile={profile} booking={booking} user={user} />}
              {activeTab === "classes"   && <ComingSoon label="My Classes — Coming Soon" />}
              {activeTab === "progress"  && <ComingSoon label="Progress Tracking — Coming Soon" />}
              {activeTab === "homework"  && <ComingSoon label="Homework — Coming Soon" />}
              {activeTab === "profile"   && <ProfileTab profile={profile} user={user} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}