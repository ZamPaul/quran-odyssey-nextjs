// ─────────────────────────────────────────────────────────
// FILE 1: app/auth/callback/page.jsx  (FULL REPLACEMENT)
// Adds PARENT role redirect alongside existing TEACHER/STUDENT
// ─────────────────────────────────────────────────────────

'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthCallbackPage() {
  const { user, isLoaded } = useUser();
  const router             = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!user)     { router.push('/login'); return; }

    const role = user.publicMetadata?.role;

    if (role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else if (role === 'PARENT') {
      router.push('/parent/dashboard');
    } else {
      // STUDENT or no role set
      router.push('/dashboard');
    }
  }, [isLoaded, user]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f9fb', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#28b7d9', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Signing you in…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// FILE 2: middleware.js  — ADD /parent(.*) to protected routes
// Find the isProtectedRoute matcher and add the parent route.
// Only showing the relevant lines to add — do NOT replace the
// whole file, just add the parent route to the existing matcher.
// ─────────────────────────────────────────────────────────

/*
  BEFORE (in your existing middleware.js):
  const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/teacher(.*)',
    '/booking(.*)',
  ]);

  AFTER — add '/parent(.*)':
  const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/teacher(.*)',
    '/parent(.*)',       // ← ADD THIS LINE
    '/booking(.*)',
  ]);
*/


// ─────────────────────────────────────────────────────────
// FILE 3: src/index.js  — ADD parent router registration
// Add these two lines in the router registration block.
// ─────────────────────────────────────────────────────────

/*
  // After existing router imports, add:
  import parentRouter from './routes/parent.js';

  // After existing app.use('/api/enrollment', enrollmentRouter), add:
  app.use('/api/parent', parentRouter);
*/


// ─────────────────────────────────────────────────────────
// FILE 4: app/courses/page.jsx — Enroll button patch
// Find each course card's CTA button/link and replace with:
// ─────────────────────────────────────────────────────────

/*
  BEFORE (typical course card CTA):
  <Link href="/booking/trial">Book Free Trial</Link>

  AFTER — keep trial + add enroll:
  <div style={{ display: 'flex', gap: 8 }}>
    <Link
      href="/booking/trial"
      style={{ ... existing styles ... }}
    >
      Book Free Trial
    </Link>
    <Link
      href={`/enroll?course=${course.value}`}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            6,
        padding:        '10px 18px',
        borderRadius:   8,
        background:     '#0d2840',
        color:          'white',
        fontSize:       13,
        fontWeight:     700,
        textDecoration: 'none',
      }}
    >
      Enroll Now →
    </Link>
  </div>

  The ?course= query param pre-selects the course in Step 1
  of the enrollment form. Map each course to its enum value:
    Noorani Qaida      → ?course=NOORANI_QAIDA
    Quran Recitation   → ?course=QURAN_RECITATION
    Tajweed            → ?course=TAJWEED
    Hifz               → ?course=HIFZ
    Islamic Studies    → ?course=ISLAMIC_STUDIES
    One-to-One         → ?course=ONE_TO_ONE
*/


// ─────────────────────────────────────────────────────────
// FILE 5: .env additions (Render backend)
// ─────────────────────────────────────────────────────────

/*
  # Already present — no change needed:
  CLERK_SECRET_KEY=...
  DATABASE_URL=...

  # Add if not already present (Phase 3):
  ADMIN_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
*/