// src/hooks/useProfileGate.js  (REPLACE the whole file)
//
// CLIENT UX GATE (layer 2) — NOT the security boundary. Its job is the
// friendly "finish your profile" redirect for PARENT/STUDENT accounts.
//
// Key fix: this is now ROLE-AWARE. "Profile completeness" is a
// PARENT/STUDENT-only concept (only they have Student records). A TEACHER
// or ADMIN has no learners, so accountComplete would be false and the OLD
// hook wrongly bounced them to /register-profile. Now non-family roles
// early-return as "allowed" and this hook does nothing to them.
//
// The middleware already stops wrong-role users at the edge; this belt-and-
// braces guard means that even if a teacher/admin somehow reaches a family
// page, they are NOT redirected into the onboarding flow.

'use client';
import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

const FAMILY_ROLES = ['PARENT', 'STUDENT'];

export function useProfileGate({ redirectTo = '/register-profile' } = {}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace('/login'); return; }

    const role = user?.publicMetadata?.role || 'PARENT';

    // Non-family roles are never subject to profile completion.
    // (Middleware should have already prevented them from being here, but
    // we fail safe: allow render, do NOT redirect into onboarding.)
    if (!FAMILY_ROLES.includes(role)) {
      setComplete(true);
      setChecking(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (!res.ok) { setChecking(false); return; } // fail open to page's own handling
        const data = await res.json();
        if (data.accountComplete) {
          setComplete(true);
          setChecking(false);
        } else {
          const next = encodeURIComponent(pathname || '/dashboard');
          router.replace(`${redirectTo}?next=${next}`);
        }
      } catch {
        if (!cancelled) setChecking(false); // network error → let the page load
      }
    })();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, user?.id]);

  return { checking, complete };
}