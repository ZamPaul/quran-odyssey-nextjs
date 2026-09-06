'use client';

// ═══════════════════════════════════════════════════════════
// /learn/[studentId] — the child "Journey" home (Module 5 v2, kid mode)
//
// Reached per-learner from the dashboard switcher. The account holder is
// the same login; this is the gamified, candy-bright surface for ONE child:
// their journey map with the current stage, XP/streak, and the 3D Book
// companion standing on the current node.
//
// Data:
//   GET /api/students                          → account + learners (name)
//   GET /api/students/:id/gamification         → derived XP/level/journey…
// ═══════════════════════════════════════════════════════════

import { useAuth } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import styles from '../../../components/learn/journey.module.css';
import JourneyHud from '../../../components/learn/JourneyHud';
import JourneyMap from '../../../components/learn/JourneyMap';
import { RewardCascade, StageCelebration } from '../../../components/learn/Celebrations';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LearnJourneyPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params?.studentId;

  const [status, setStatus] = useState('loading'); // loading | ready | error | notfound
  const [student, setStudent] = useState(null);
  const [gam, setGam] = useState(null);
  const [trigger, setTrigger] = useState(null);
  const [celeb, setCeleb] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace('/login'); return; }
    let cancelled = false;

    (async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [sRes, gRes] = await Promise.all([
          fetch(`${API}/api/students`, { headers }),
          fetch(`${API}/api/students/${studentId}/gamification`, { headers }),
        ]);

        if (cancelled) return;

        if (gRes.status === 404) { setStatus('notfound'); return; }
        if (!gRes.ok) { setStatus('error'); return; }

        const gData = await gRes.json();
        let sData = null;
        if (sRes.ok) {
          const acc = await sRes.json();
          sData = (acc.students || []).find((x) => x.id === studentId) || null;
        }
        if (cancelled) return;
        setGam(gData);
        setStudent(sData);
        setStatus('ready');

        // Decide a celebration by comparing the last-seen snapshot with the
        // fresh payload. First visit sets the baseline and celebrates nothing.
        try {
          const KEY = `qo_gam_seen_${studentId}`;
          const seen = JSON.parse(localStorage.getItem(KEY) || 'null');
          const curLevel = gData?.level?.level || 1;
          const curXp = gData?.xp?.total || 0;
          if (seen) {
            if (curLevel > seen.level) setCeleb({ type: 'stage' });
            else if (curXp > seen.xp) setCeleb({ type: 'reward', xpDelta: curXp - seen.xp });
          }
          localStorage.setItem(KEY, JSON.stringify({ level: curLevel, xp: curXp }));
        } catch { /* localStorage unavailable — skip celebration */ }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, studentId, getToken, router]);

  const onContinue = useCallback(() => {
    setTrigger({ name: 'Cheer', n: Date.now() });
  }, []);

  if (status === 'loading') {
    return (
      <div className={styles.center}>
        <div>
          <div className={styles.spinner} />
          Loading your journey…
        </div>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className={styles.center}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 16 }}>We couldn&apos;t find that learner.</p>
          <button className={styles.continueBtn} style={{ position: 'static', transform: 'none' }} onClick={() => router.replace('/dashboard')}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.center}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 16 }}>Something went wrong loading the journey.</p>
          <button className={styles.continueBtn} style={{ position: 'static', transform: 'none' }} onClick={() => router.refresh()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const milestone = gam?.journey?.nextMilestone;

  return (
    <>
    <div className={styles.world}>
      <button className={styles.backBtn} aria-label="Back to dashboard" onClick={() => router.push('/dashboard')}>
        ‹
      </button>

      <JourneyHud student={student} gamification={gam} />

      <JourneyMap
        journey={gam?.journey}
        characterTrigger={trigger}
      />

      {milestone && (
        <div className={styles.milestone} aria-live="polite">
          {milestone.remaining > 0
            ? `${milestone.remaining} more ${milestone.unit} to ${milestone.arabic || milestone.label}`
            : `${milestone.arabic || milestone.label} is within reach!`}
        </div>
      )}

      <button className={styles.continueBtn} onClick={onContinue}>
        ▶ Continue
      </button>
    </div>

    {celeb?.type === 'reward' && (
      <RewardCascade
        xpDelta={celeb.xpDelta}
        totalXp={gam?.xp?.total || 0}
        streak={gam?.streak?.current || 0}
        childName={student?.name}
        onClose={() => { setCeleb(null); setTrigger({ name: 'Cheer', n: Date.now() }); }}
      />
    )}
    {celeb?.type === 'stage' && (
      <StageCelebration
        arabic={gam?.level?.arabic}
        name={gam?.level?.name}
        level={gam?.level?.level}
        childName={student?.name}
        onClose={() => { setCeleb(null); setTrigger({ name: 'Cheer', n: Date.now() }); }}
      />
    )}
    </>
  );
}
