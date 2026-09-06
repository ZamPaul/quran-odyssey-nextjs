'use client';

// ─────────────────────────────────────────────────────────
// BookCharacter.jsx — the 3D animated Book companion.
//
// Wraps <model-viewer> (self-hosted at /vendor/model-viewer.min.js, no CDN).
// Framing (camera-orbit 5.2m, fov 30°) is the exact configuration verified
// against a Blender render so the character stands full-body on the node,
// never cropped.
//
// Gestures: tap the character → Wave. A parent can command a gesture by
// bumping the `trigger` prop, e.g. trigger={{ name: 'Cheer', n: 3 }}.
// Clips in the GLB: Idle, Wave, Cheer.
//
// Fallbacks: reduced-motion or no-WebGL → the static 2D poster. model-viewer
// itself also shows the poster until the GLB is ready.
// ─────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';

const GLB = '/char3d/bookworm_anim.glb';
const POSTER = '/char3d/buddy.png';
const MV_SRC = '/vendor/model-viewer.min.js';

let mvLoader = null;
function loadModelViewer() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.customElements && window.customElements.get('model-viewer')) {
    return Promise.resolve();
  }
  if (mvLoader) return mvLoader;
  mvLoader = new Promise((resolve) => {
    const existing = document.querySelector(`script[data-mv]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const s = document.createElement('script');
    s.type = 'module';
    s.src = MV_SRC;
    s.dataset.mv = '1';
    s.onload = () => resolve();
    s.onerror = () => resolve(); // fail soft → poster fallback stays
    document.head.appendChild(s);
  });
  return mvLoader;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function BookCharacter({ trigger, className = '', style, onGesture }) {
  const ref = useRef(null);
  const revertTimer = useRef(null);
  const [ready, setReady] = useState(false);
  const [use3d, setUse3d] = useState(true);

  // Decide 2D vs 3D, then load the library.
  useEffect(() => {
    if (prefersReducedMotion() || !hasWebGL()) {
      setUse3d(false);
      return;
    }
    let cancelled = false;
    loadModelViewer().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Configure the element once it exists (properties, not attributes, so we
  // don't fight JSX over hyphenated custom-element attributes).
  useEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;
    el.src = GLB;
    el.poster = POSTER;
    el.alt = 'Your reading companion, the Book';
    el.cameraOrbit = '0deg 82deg 5.2m';
    el.minFieldOfView = '30deg';
    el.fieldOfView = '30deg';
    el.minCameraOrbit = 'auto auto 5.2m';
    el.maxCameraOrbit = 'auto auto 5.2m';
    el.interpolationDecay = 120;
    el.shadowIntensity = 0.9;
    el.exposure = 1.1;
    el.autoplay = true;
    el.animationName = 'Idle';
    el.setAttribute('disable-zoom', '');
    el.setAttribute('disable-pan', '');
    el.setAttribute('disable-tap', '');
    el.setAttribute('interaction-prompt', 'none');
    el.setAttribute('camera-orbit', '0deg 82deg 5.2m');
  }, [ready]);

  function play(name) {
    const el = ref.current;
    if (!el || !ready) return;
    try {
      el.animationName = name;
      el.play();
      if (onGesture) onGesture(name);
      clearTimeout(revertTimer.current);
      revertTimer.current = setTimeout(() => {
        if (ref.current) {
          ref.current.animationName = 'Idle';
          ref.current.play();
        }
      }, 2200);
    } catch {
      /* no-op */
    }
  }

  // External gesture command.
  useEffect(() => {
    if (trigger && trigger.name) play(trigger.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger && trigger.n]);

  useEffect(() => () => clearTimeout(revertTimer.current), []);

  if (!use3d || !ready) {
    // 2D fallback / pre-load poster.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={POSTER}
        alt="Your reading companion, the Book"
        className={className}
        style={{ objectFit: 'contain', ...style }}
        draggable={false}
      />
    );
  }

  return (
    <model-viewer
      ref={ref}
      class={className}
      style={style}
      role="img"
      onClick={() => play('Wave')}
    />
  );
}
