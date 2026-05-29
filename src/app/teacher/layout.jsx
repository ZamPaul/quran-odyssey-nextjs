'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// ─── Icons ───────────────────────────────────────────────
function IconDashboard({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconCalendar({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconStudents({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconAssignment({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconReports({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron({ direction = 'right', size = 16 }) {
  const d = direction === 'right' ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMenu({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconX({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Nav config ───────────────────────────────────────────
const NAV = [
  { label: 'Dashboard',        href: '/teacher/dashboard',   Icon: IconDashboard },
  { label: 'Class Schedule',   href: '/teacher/schedule',    Icon: IconCalendar },
  { label: 'My Students',      href: '/teacher/students',    Icon: IconStudents },
  { label: 'Assignments',      href: '/teacher/assignments', Icon: IconAssignment },
  { label: 'Progress Reports', href: '/teacher/reports',     Icon: IconReports },
];

// ─── Sidebar content ──────────────────────────────────────
function SidebarContent({ teacher, pathname, onSignOut, onClose }) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      height:         '100%',
      background:     '#0d2840',
    }}>
      {/* Logo */}
      <div style={{
        padding:      '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'block' }}>
          <Image src="/logo2.png" width={120} height={32} alt="Quran Odyssey" style={{ objectFit: 'contain' }} />
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          style={{
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width:      32,
            height:     32,
            borderRadius: 8,
            border:     'none',
            background: 'rgba(255,255,255,0.08)',
            color:      'rgba(255,255,255,0.6)',
            cursor:     'pointer',
          }}
          className="sidebar-close-btn"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Teacher badge */}
      {teacher && (
        <div style={{
          margin:       '16px 12px',
          padding:      '12px 14px',
          borderRadius: 10,
          background:   'rgba(40,183,217,0.12)',
          border:       '1px solid rgba(40,183,217,0.2)',
          display:      'flex',
          alignItems:   'center',
          gap:          10,
        }}>
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   '50%',
            background:     'linear-gradient(135deg, #28b7d9, #0e6e8a)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       12,
            fontWeight:     800,
            color:          'white',
            flexShrink:     0,
          }}>
            {teacher.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize:     13,
              fontWeight:   700,
              color:        'white',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
            }}>
              {teacher.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
              Teacher
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
        <div style={{
          fontSize:       10,
          fontWeight:     700,
          textTransform:  'uppercase',
          letterSpacing:  '0.08em',
          color:          'rgba(255,255,255,0.3)',
          padding:        '8px 8px 6px',
          marginBottom:   4,
        }}>
          Menu
        </div>
        {NAV.map(({ label, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            10,
                padding:        '10px 12px',
                borderRadius:   8,
                marginBottom:   2,
                fontSize:       13,
                fontWeight:     isActive ? 700 : 500,
                color:          isActive ? 'white' : 'rgba(255,255,255,0.55)',
                background:     isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                textDecoration: 'none',
                transition:     'all 150ms ease',
                borderLeft:     isActive ? '3px solid #28b7d9' : '3px solid transparent',
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{
        padding:      '12px',
        borderTop:    '1px solid rgba(255,255,255,0.08)',
      }}>
        <button
          onClick={onSignOut}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            10,
            width:          '100%',
            padding:        '10px 12px',
            borderRadius:   8,
            border:         'none',
            background:     'transparent',
            color:          'rgba(255,255,255,0.45)',
            fontSize:       13,
            fontWeight:     500,
            cursor:         'pointer',
            textAlign:      'left',
            transition:     'all 150ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f9fb' }}>
      <div style={{ width: 240, background: '#0d2840', flexShrink: 0 }} />
      <div style={{ flex: 1, padding: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid #e2e8f0', borderTopColor: '#28b7d9',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'system-ui' }}>
            Loading teacher portal…
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main layout ──────────────────────────────────────────
export default function TeacherLayout({ children }) {
  const { user, isLoaded }   = useUser();
  const { getToken }         = useAuth();
  const { signOut }          = useClerk();
  const router               = useRouter();
  const pathname             = usePathname();
  const [teacher, setTeacher]       = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }

    const verify = async () => {
      try {
        const token = await getToken();
        const res   = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/teacher/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) { router.push('/dashboard'); return; }
        const data = await res.json();
        setTeacher(data.teacher);
        setAuthChecked(true);
      } catch {
        router.push('/dashboard');
      }
    };

    verify();
  }, [isLoaded, user]);

  const handleSignOut = () => signOut(() => router.push('/'));

  if (!authChecked) return <LoadingSkeleton />;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .sidebar-close-btn { display: none !important; }

        @media (max-width: 768px) {
          .teacher-sidebar {
            transform: translateX(-100%);
            transition: transform 250ms ease;
            z-index: 200;
          }
          .teacher-sidebar.open {
            transform: translateX(0);
          }
          .teacher-main {
            margin-left: 0 !important;
          }
          .teacher-mobile-header {
            display: flex !important;
          }
          .sidebar-close-btn {
            display: flex !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>

      {/* Sidebar overlay — mobile */}
      <div
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
        style={{
          display:  'none',
          position: 'fixed',
          inset:    0,
          background: 'rgba(0,0,0,0.5)',
          zIndex:   199,
          opacity:  sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? 'auto' : 'none',
          transition: 'opacity 250ms ease',
        }}
      />

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f9fb', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

        {/* Sidebar */}
        <div
          className={`teacher-sidebar${sidebarOpen ? ' open' : ''}`}
          style={{
            width:      240,
            flexShrink: 0,
            position:   'fixed',
            top:        0,
            left:       0,
            height:     '100vh',
            overflowY:  'auto',
            zIndex:     100,
          }}
        >
          <SidebarContent
            teacher={teacher}
            pathname={pathname}
            onSignOut={handleSignOut}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main */}
        <div
          className="teacher-main"
          style={{ flex: 1, marginLeft: 240, minWidth: 0 }}
        >
          {/* Mobile header */}
          <div
            className="teacher-mobile-header"
            style={{
              display:        'none',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '0 20px',
              height:         60,
              background:     'white',
              borderBottom:   '1px solid #e2e8f0',
              position:       'sticky',
              top:            0,
              zIndex:         50,
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                width:          36,
                height:         36,
                borderRadius:   8,
                border:         '1px solid #e2e8f0',
                background:     'white',
                color:          '#64748b',
                cursor:         'pointer',
              }}
            >
              <IconMenu />
            </button>
            <Image src="/logo2.png" width={100} height={28} alt="Quran Odyssey" style={{ objectFit: 'contain' }} />
            <div style={{ width: 36 }} />
          </div>

          {/* Page content */}
          <main style={{ padding: '32px', maxWidth: 1200 }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}