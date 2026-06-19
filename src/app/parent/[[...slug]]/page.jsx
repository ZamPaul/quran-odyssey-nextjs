'use client';

// ═══════════════════════════════════════════════════════════
// FILE: src/app/parent/dashboard/page.jsx   (and any /parent/* page)
//
// The parent dashboard is retired — everything is now the unified
// /dashboard. This redirect keeps old links/bookmarks working for
// one release. Remove the /parent folder entirely in a later cleanup
// (tracked for Phase 7 follow-up).
//
// If you have multiple pages under /parent (e.g. /parent/dashboard,
// /parent/schedule, etc.), the simplest approach is to replace the
// whole /parent folder with a single catch-all that redirects.
// See the catch-all option below.
// ═══════════════════════════════════════════════════════════

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ParentRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f9fb', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#28b7d9', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>Taking you to your dashboard…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// CATCH-ALL OPTION (recommended) — covers every /parent/* path
//
// Create: src/app/parent/[[...slug]]/page.jsx  with the SAME content
// as above, and DELETE the individual /parent/dashboard, /parent/
// schedule, etc. pages. The optional catch-all [[...slug]] matches
// /parent and everything beneath it, redirecting all of it to
// /dashboard with one file.
// ═══════════════════════════════════════════════════════════