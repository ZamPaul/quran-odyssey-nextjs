'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

// ─── Nav items ────────────────────────────────────────────
const NAV = [
  {
    id: 'overview', label: 'Overview',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/></svg>,
  },
  {
    id: 'classes', label: 'My Classes',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: 'progress', label: 'Progress',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: 'homework', label: 'Homework',
    badge: '3',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8"/><path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: 'profile', label: 'Profile',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
];

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);

  // Try to fetch profile — gracefully ignore if backend is down
  useEffect(() => {
    if (!isLoaded || !user) return;
    const fetchProfile = async () => {
      try {
        const token = await user.getToken?.();
        if (!token) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/students/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch {
        // Backend unavailable — dashboard still works with Clerk data
      }
    };
    fetchProfile();
  }, [isLoaded, user]);

  const handleLogout = () => signOut(() => router.push('/'));

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <div className="text-[14px] text-[#64748b]">Loading…</div>
      </div>
    );
  }

  // Get display name — prefer profile, fall back to Clerk, fall back to email
  const parentName  = profile?.parentName  || user?.fullName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'there';
  const childName   = profile?.childName   || 'your child';
  const initials    = parentName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const email       = user?.emailAddresses?.[0]?.emailAddress || '';
  const courseLabel = profile?.courseInterest?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'Quran Learning';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f7f9fb' }}>

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside style={{
        width: 248, background: '#0a2035', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #28b7d9, #0e6e8a)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0 }}>
            QO
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: -0.2 }}>Quran Odyssey</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>Student Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '16px 8px 6px' }}>
            Main Menu
          </div>
          {NAV.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                  border: 'none', width: '100%', textAlign: 'left',
                  background: active ? 'rgba(40,183,217,0.14)' : 'transparent',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(40,183,217,0.2)' : 'none',
                  transition: 'background 150ms',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? '#28b7d9' : 'rgba(255,255,255,0.06)',
                  color: active ? 'white' : 'rgba(255,255,255,0.4)',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? '#28b7d9' : 'rgba(255,255,255,0.45)', flex: 1 }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span style={{ background: '#faa71a', color: '#0d2840', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 20 }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10 }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #faa71a, #e8920a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0d2840', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {parentName}
              </div>
              <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>Student</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <main style={{ marginLeft: 248, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            Good day, <span style={{ color: '#0e6e8a' }}>{parentName}</span> 👋
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#64748b', transition: 'all 150ms' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 28, flex: 1 }}>

          {/* ── OVERVIEW TAB ────────────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              {/* Welcome banner */}
              <div style={{ background: 'linear-gradient(135deg, #0d2840 0%, #142f4a 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(40,183,217,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                  Welcome back
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: -0.5, marginBottom: 6 }}>
                  {childName}&apos;s Learning Hub
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
                  {profile ? `Enrolled in ${courseLabel}` : 'Complete your profile to book your free trial class'}
                </div>
                {!profile && (
                  <a href="/register/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#faa71a', color: '#0d2840', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
                    Complete Profile →
                  </a>
                )}
                {profile && (
                  <a href="/booking/trial" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#faa71a', color: '#0d2840', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
                    Book Free Trial →
                  </a>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Total Classes', value: '0', sub: 'Trial pending', color: '#28b7d9' },
                  { label: 'Day Streak', value: '🔥 0', sub: 'Start learning', color: '#faa71a' },
                  { label: 'Attendance', value: '—', sub: 'No classes yet', color: '#22c55e' },
                  { label: 'Course', value: profile ? courseLabel.split(' ')[0] : '—', sub: profile ? courseLabel : 'Not enrolled', color: '#7c3bee' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', marginBottom: 8 }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: -1, marginBottom: 4 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Two columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Next class */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Next Class</div>
                    <span style={{ background: '#e8f8fc', color: '#0e6e8a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>Upcoming</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No classes scheduled yet</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Book your free trial to get started</div>
                    <a href="/booking/trial" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0d2840', color: 'white', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                      Book Free Trial
                    </a>
                  </div>
                </div>

                {/* Account info */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Account Details</div>
                  {[
                    { label: 'Parent Name', value: parentName },
                    { label: 'Child Name', value: profile?.childName || '—' },
                    { label: 'Email', value: email },
                    { label: 'Country', value: profile?.country || '—' },
                    { label: 'Course Interest', value: profile ? courseLabel : '—' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f4f8' }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{row.label}</span>
                      <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── OTHER TABS — coming soon states ─────────── */}
          {activeTab !== 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                {NAV.find(n => n.id === activeTab)?.label} — Coming Soon
              </div>
              <div style={{ fontSize: 14, color: '#94a3b8' }}>
                This section will be available after your trial class is booked.
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}