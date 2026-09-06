'use client';

// ─────────────────────────────────────────────────────────
// JourneyMap.jsx — the candy path with the 3D Book on the current stage.
//
// The SVG is generated from the engine's journey.stages (real progress),
// and the character is positioned over the current node by percentages so
// it scales with any width. On mount the view scrolls to the current stage.
// ─────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import styles from './journey.module.css';
import BookCharacter from './BookCharacter';
import { buildCandyMap, characterSlot, NODE_YS, MAP_H } from './journeyMapSvg';

export default function JourneyMap({ journey, characterTrigger, onCharacterGesture }) {
  const scrollerRef = useRef(null);
  const stages = journey?.stages || [];
  const currentLevel = journey?.currentStage?.level || 1;

  const svg = buildCandyMap(stages);
  const slot = characterSlot(currentLevel);

  // Open on the current stage.
  useEffect(() => {
    const sc = scrollerRef.current;
    if (!sc) return;
    const id = requestAnimationFrame(() => {
      const nodeY = NODE_YS[Math.min(Math.max(currentLevel - 1, 0), 7)];
      const target = (nodeY / MAP_H) * sc.scrollHeight - sc.clientHeight * 0.55;
      sc.scrollTo({ top: Math.max(target, 0), behavior: 'auto' });
    });
    return () => cancelAnimationFrame(id);
  }, [currentLevel]);

  return (
    <div className={styles.scroller} ref={scrollerRef}>
      <div className={styles.maproot}>
        <div
          className={styles.mapsvg}
          // SVG is generated from trusted engine data — no user input.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <BookCharacter
          className={styles.buddy}
          style={{
            left: `${slot.leftPct}%`,
            top: `${slot.topPct}%`,
            width: `${slot.widthPct}%`,
          }}
          trigger={characterTrigger}
          onGesture={onCharacterGesture}
        />
      </div>
    </div>
  );
}
