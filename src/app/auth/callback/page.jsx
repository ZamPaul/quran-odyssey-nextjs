'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/auth/callback/page.jsx   (FULL REPLACEMENT)
//
// Multi-learner change: the PARENT/STUDENT split is gone. Everyone
// who isn't a teacher lands on the unified /dashboard. Teachers still
// go to their portal.
// ═══════════════════════════════════════════════════════════

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
    } else {
      // PARENT, STUDENT (legacy), or no role → the unified dashboard
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