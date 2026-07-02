// src/middleware.js  (REPLACE the whole file)
//
// PRIMARY AUTHORIZATION GATE — role-based, enforced at the edge before
// any page renders. One declarative map is the single source of truth
// for "which role can be on which route".
//
// Layers of defense (this is layer 1):
//   1. THIS FILE  — edge role gate (no page render for wrong role)
//   2. useProfileGate — client UX gate (completion redirect for parents)
//   3. backend requireAuth/requireTeacher/requireAdmin — API lock (real security)
//
// Requires the Clerk session token to expose metadata.role (see az_01).

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// ── Route groups ──────────────────────────────────────────
// PARENT/STUDENT space (the family portal + intake flows)
const isFamilyRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/booking(.*)',
  '/enroll(.*)',
  '/register-profile(.*)',   // NOTE: hyphen — the REAL route (old matcher had a typo)
]);

// TEACHER space
const isTeacherRoute = createRouteMatcher([
  '/teacher(.*)',
]);

// ADMIN space
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Any route that requires *some* auth (union of the above + misc protected)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/booking(.*)',
  '/enroll(.*)',
  '/register-profile(.*)',
  '/teacher(.*)',
  '/admin(.*)',
  '/auth/callback(.*)',
]);

// Public — never gated
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',       // Clerk sign-up (NOT register-profile)
  '/courses(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/teachers(.*)',
  '/pricing(.*)',
]);

// Where each role belongs when it lands somewhere it shouldn't.
const HOME_BY_ROLE = {
  TEACHER: '/teacher/dashboard',
  ADMIN:   '/admin',
  PARENT:  '/dashboard',
  STUDENT: '/dashboard',
};

function homeFor(role) {
  return HOME_BY_ROLE[role] || '/dashboard';
}

export default clerkMiddleware(async (auth, req) => {
  // Let public routes through untouched.
  if (isPublicRoute(req) && !isProtectedRoute(req)) return NextResponse.next();

  // Everything below requires authentication.
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth();

    // Not signed in → Clerk handles the redirect to sign-in.
    if (!userId) {
      await auth.protect();
      return;
    }

    // Read role from the session token (see az_01). Default to the
    // lowest-privilege role if the claim is missing (brand-new user).
    const role = sessionClaims?.metadata?.role || 'PARENT';

    // ── ROLE GATES ────────────────────────────────────────
    // A wrong-role user is bounced to THEIR home, never shown the page.

    // Family space: PARENT/STUDENT only.
    if (isFamilyRoute(req) && !(role === 'PARENT' || role === 'STUDENT')) {
      return NextResponse.redirect(new URL(homeFor(role), req.url));
    }

    // Teacher space: TEACHER only.
    if (isTeacherRoute(req) && role !== 'TEACHER') {
      return NextResponse.redirect(new URL(homeFor(role), req.url));
    }

    // Admin space: ADMIN only.
    if (isAdminRoute(req) && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(homeFor(role), req.url));
    }

    // Same-role but still needs to be signed in for anything else protected.
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};