'use client';

// ─────────────────────────────────────────────────────────
// JourneyHud.jsx — the sticky top bar on the child journey home.
// Shows who's playing, their current stage, XP and streak — the three
// numbers a child checks first. Copy says "you" (child is the audience).
// ─────────────────────────────────────────────────────────

import styles from './journey.module.css';

export default function JourneyHud({ student, gamification }) {
  const name = student?.name || 'Explorer';
  const level = gamification?.level || {};
  const xp = gamification?.xp || {};
  const streak = gamification?.streak || {};
  const initial = name.trim().charAt(0).toUpperCase() || '🙂';

  return (
    <div className={styles.hud}>
      <div className={styles.who}>
        <div className={styles.avatar} aria-hidden="true">{initial}</div>
        <div>
          <div className={styles.name}>{name}</div>
          <div className={styles.stage}>
            Stage {level.level || 1} · {level.arabic || level.name || '—'}
          </div>
        </div>
      </div>
      <div className={styles.pills}>
        <span className={`${styles.pill} ${styles.pillGold}`} title="Total stars">
          ⭐ {xp.total ?? 0}
        </span>
        <span className={`${styles.pill} ${styles.pillBlue}`} title="Day streak">
          🔥 {streak.current ?? 0}
        </span>
      </div>
    </div>
  );
}
