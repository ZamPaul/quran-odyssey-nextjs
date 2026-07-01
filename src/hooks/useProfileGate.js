'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

// Checks the single authority (GET /api/students → accountComplete) and
// redirects to /register-profile if the account isn't complete.
// Returns { checking, complete } so a page can render a spinner while checking.
export function useProfileGate({ redirectTo = '/register-profile' } = {}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace('/login'); return; }

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
          // carry where they were headed so we can bounce back after completion
          const next = encodeURIComponent(pathname || '/dashboard');
          router.replace(`${redirectTo}?next=${next}`);
        }
      } catch {
        if (!cancelled) setChecking(false); // network error → let the page load
      }
    })();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn]);

  return { checking, complete };
}