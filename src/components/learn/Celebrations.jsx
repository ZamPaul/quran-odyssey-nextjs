'use client';

// ─────────────────────────────────────────────────────────
// Celebrations.jsx — the two moments the client kept.
//
// RewardCascade   → a class was completed / XP went up (five staggered beats).
// StageCelebration→ the child crossed into a new stage (the rare peak).
//
// Both are full-screen overlays driven by the same choreography as the
// signed-off prototypes; the staggering IS the reward. Reduced-motion safe.
// Triggered from the journey page by comparing the last-seen level/XP
// (localStorage) against the fresh gamification payload.
// ─────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import styles from './journey.module.css';

const POSTER = '/char3d/buddy.png';
const CONFETTI = ['#28b7d9', '#faa71a', '#16C098', '#8B5CF6', '#FF7EB6'];

export function RewardCascade({ xpDelta = 0, totalXp = 0, streak = 0, childName, onClose }) {
  const totalRef = useRef(null);

  useEffect(() => {
    const el = totalRef.current;
    if (!el) return;
    const to = totalXp || 0;
    const from = Math.max(0, to - (xpDelta || 0));
    let raf;
    const dur = 900, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      el.textContent = v.toLocaleString();
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const id = setTimeout(() => { raf = requestAnimationFrame(step); }, 700); // beat-3
    return () => { clearTimeout(id); cancelAnimationFrame(raf); };
  }, [totalXp, xpDelta]);

  return (
    <div className={styles.celebOverlay} role="dialog" aria-label="Class complete" onClick={onClose}>
      <div className={`${styles.celebScene} ${styles.celebLight} ${styles.play}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confetti} aria-hidden="true">
          {Array.from({ length: 26 }).map((_, i) => (
            <i key={i} style={{ left: `${(i * 3.85) % 100}%`, background: CONFETTI[i % 5], animationDelay: `${(i % 9) * 0.08}s` }} />
          ))}
        </div>
        <div className={styles.doneLbl}>Class complete</div>
        <div className={styles.celebH}>Wonderful work! ✨</div>
        <div className={styles.celebHs}>You showed up today{childName ? `, ${childName}` : ''}. That&apos;s what counts.</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSTER} alt="" className={styles.celebMascot} draggable={false} />
        <div className={styles.stats2}>
          <div className={styles.scard}>
            {xpDelta > 0 && <span className={styles.xpfloat}>+{xpDelta} XP</span>}
            <div className={styles.lab}>Total stars</div>
            <div className={styles.val} ref={totalRef}>{(totalXp || 0).toLocaleString()}</div>
          </div>
          <div className={styles.scard}>
            <div className={styles.lab}>Day streak</div>
            <div className={styles.val}>🔥 {streak || 0}</div>
          </div>
        </div>
        <button className={styles.celebCta} onClick={onClose}>Continue</button>
      </div>
    </div>
  );
}

export function StageCelebration({ arabic, name, level = 1, childName, onClose }) {
  return (
    <div className={styles.celebOverlay} role="dialog" aria-label="A new stage reached" onClick={onClose}>
      <div className={`${styles.celebScene} ${styles.celebDark} ${styles.play}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.particles} aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => {
            const sz = 6 + (i % 4) * 3;
            return <i key={i} style={{ left: `${(i * 3.6) % 100}%`, width: sz, height: sz, background: CONFETTI[i % 5], animationDelay: `${(i % 10) * 0.09}s` }} />;
          })}
        </div>
        <div className={styles.eyebrow}>A new stage reached</div>
        <div className={styles.ring} aria-hidden="true" />
        <div className={styles.medal}>🏅</div>
        {arabic && <div className={styles.arabicName} dir="rtl">{arabic}</div>}
        <div className={styles.translit}>{name}</div>
        <div className={styles.enline}>Stage {level}</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSTER} alt="" className={styles.celebMascotDark} draggable={false} />
        <div className={styles.celebSubtitle}>Look how far you&apos;ve come{childName ? `, ${childName}` : ''}.</div>
        <button className={styles.celebCtaGold} onClick={onClose}>Continue the journey</button>
      </div>
    </div>
  );
}
