// ─────────────────────────────────────────────────────────
// journeyMapSvg.js — data-driven candy journey map (Module 5 v2)
//
// Pure function. Takes the engine's journey.stages (8 entries with
// state: "complete" | "current" | "locked") and returns an SVG string.
// Ported from the signed-off prototype (build_candymap.py) but now the
// node states come from real progress, not a hard-coded CURRENT index —
// this is what fixes the client's "too static" complaint.
//
// Geometry is a 420×1500 viewBox, nodes bottom(start) → top(goal).
// Percentages elsewhere position the 3D character over the current node,
// so DO NOT change these coordinates without updating JourneyMap.jsx.
// ─────────────────────────────────────────────────────────

export const MAP_W = 420;
export const MAP_H = 1500;

// Node centres, bottom → top = level 1 → 8.
export const NODE_XS = [140, 292, 120, 300, 150, 286, 132, 290];
export const NODE_YS = [1380, 1200, 1020, 842, 662, 484, 300, 120];
export const NODE_R = 46;

// Candy palette — one per stage. Deliberately out of the teal/gold/navy
// system (client v2). Mirrors --color-candy-1..8 in theme.css.
const COLORS = [
  '#FF7EB6', '#FF9F45', '#19AEE2', '#16C098',
  '#8B5CF6', '#F6A800', '#FF6B6B', '#0B8FC1',
];

function hx(h) {
  h = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function mix(hex, f, toWhite = true) {
  const [r, g, b] = hx(hex);
  const t = toWhite ? [255, 255, 255] : [0, 0, 0];
  const c = [r, g, b].map((v, i) => Math.round(v + (t[i] - v) * f));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function catmull(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} `;
  const p = points;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = i > 0 ? p[i - 1] : p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = i + 2 < p.length ? p[i + 2] : p[i + 1];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return d;
}

function star(x, y, r, cls = '', delay = 0) {
  let pts = '';
  for (let k = 0; k < 10; k++) {
    const ang = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 === 0 ? r : r * 0.45;
    pts += `${(x + rr * Math.cos(ang)).toFixed(1)},${(y + rr * Math.sin(ang)).toFixed(1)} `;
  }
  return `<polygon class="${cls}" style="animation-delay:${delay}s" points="${pts.trim()}" fill="#FFD23F" stroke="#F6A800" stroke-width="1.5"/>`;
}

function nodeDefs() {
  return COLORS.map(
    (c, i) =>
      `<radialGradient id="nd${i}" cx=".38" cy=".32" r=".85"><stop offset="0" stop-color="${mix(c, 0.45)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${mix(c, 0.32, false)}"/></radialGradient>`,
  ).join('');
}

function cnode(i, name, state) {
  const x = NODE_XS[i];
  const y = NODE_YS[i];
  const c = COLORS[i];
  const r = NODE_R;
  const num = i + 1;
  const bob = `style="animation-delay:${((i % 4) * 0.4).toFixed(1)}s"`;

  if (state === 'complete') {
    const stars =
      star(x - 26, y + r + 16, 10, 'twinkle', 0) +
      star(x, y + r + 22, 12, 'twinkle', 0.3) +
      star(x + 26, y + r + 16, 10, 'twinkle', 0.6);
    const inner = `<path d="M${x - 13} ${y} l9 10 17 -20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `<g class="cnode bob" ${bob}>
      <ellipse cx="${x}" cy="${y + r + 4}" rx="${r * 0.8}" ry="9" fill="#00000022"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#nd${i})" stroke="#fff" stroke-width="5"/>
      <ellipse cx="${x - 12}" cy="${y - 16}" rx="18" ry="11" fill="#ffffff" opacity=".45"/>
      ${inner}</g>${stars}<text x="${x}" y="${y - r - 12}" text-anchor="middle" class="nlab">${name}</text>`;
  }

  if (state === 'current') {
    return `<g class="cnode" id="curnode">
      <circle class="glow" cx="${x}" cy="${y}" r="${r + 18}" fill="${c}" opacity=".22"/>
      <circle class="glow2" cx="${x}" cy="${y}" r="${r + 8}" fill="none" stroke="${c}" stroke-width="3" opacity=".5"/>
      <ellipse cx="${x}" cy="${y + r + 4}" rx="${r * 0.8}" ry="9" fill="#00000022"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#nd${i})" stroke="#fff" stroke-width="6"/>
      <ellipse cx="${x - 12}" cy="${y - 16}" rx="18" ry="11" fill="#ffffff" opacity=".5"/>
      <text x="${x}" y="${y + 9}" text-anchor="middle" fill="#fff" font-weight="900" font-size="30">${num}</text></g>
      <text x="${x}" y="${y + r + 28}" text-anchor="middle" class="nlab cur">${name}</text>`;
  }

  // locked
  return `<g class="cnode bob" ${bob}>
    <ellipse cx="${x}" cy="${y + r + 4}" rx="${r * 0.7}" ry="8" fill="#00000018"/>
    <circle cx="${x}" cy="${y}" r="${r - 4}" fill="url(#ndlock)" stroke="#fff" stroke-width="4"/>
    <ellipse cx="${x - 10}" cy="${y - 14}" rx="15" ry="9" fill="#ffffff" opacity=".4"/>
    <path d="M${x - 11} ${y - 2} v-6 a11 11 0 0 1 22 0 v6" fill="none" stroke="#fff" stroke-width="4"/>
    <rect x="${x - 14}" y="${y - 2}" width="28" height="21" rx="5" fill="#fff"/></g>
    <text x="${x}" y="${y - r - 8}" text-anchor="middle" class="nlab lock">${name}</text>`;
}

function scenery() {
  const candies = ['🍬', '🍭', '🍩', '🧁', '⭐', '🍪', '🌟'];
  const spots = [
    [58, 1300], [360, 1240], [70, 1080], [350, 980], [56, 860], [360, 760],
    [66, 600], [356, 520], [60, 360], [354, 300], [70, 180], [348, 150],
  ];
  let s = '';
  spots.forEach(([cx, cy], k) => {
    const e = candies[k % candies.length];
    s += `<text class="candy" style="animation-delay:${((k % 5) * 0.5).toFixed(1)}s" x="${cx}" y="${cy}" font-size="30" text-anchor="middle">${e}</text>`;
  });
  [[120, 240, 1], [300, 540, 0.8], [90, 900, 1.1], [320, 1180, 0.9]].forEach(
    ([cx, cy, sc], k) => {
      s += `<g class="cloud" style="animation-delay:${(k * 1.3).toFixed(1)}s" transform="translate(${cx},${cy}) scale(${sc})"><ellipse cx="0" cy="0" rx="42" ry="22" fill="#fff" opacity=".85"/><ellipse cx="30" cy="6" rx="30" ry="18" fill="#fff" opacity=".85"/><ellipse cx="-28" cy="6" rx="26" ry="16" fill="#fff" opacity=".85"/></g>`;
    },
  );
  return s;
}

/**
 * Build the candy map SVG string.
 * @param {Array<{name:string, arabic:string, state:string}>} stages engine journey.stages (len 8)
 */
export function buildCandyMap(stages = []) {
  const pts = NODE_XS.map((x, i) => [x, NODE_YS[i]]);
  const path = catmull(pts);
  const nodes = stages
    .slice(0, 8)
    .map((st, i) => cnode(i, st.arabic || st.name || `Stage ${i + 1}`, st.state))
    .join('');

  return `<svg viewBox="0 0 ${MAP_W} ${MAP_H}" width="100%" xmlns="http://www.w3.org/2000/svg" class="cmap" preserveAspectRatio="xMidYMax meet">
 <defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFE29A"/><stop offset=".4" stop-color="#FFC1CF"/>
    <stop offset=".72" stop-color="#F6A8D8"/><stop offset="1" stop-color="#C6A8F6"/></linearGradient>
  ${nodeDefs()}
  <radialGradient id="ndlock" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#e6edf4"/><stop offset="1" stop-color="#aebccc"/></radialGradient>
  <pattern id="candy" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="26" height="26" fill="#ffffff"/><rect width="13" height="26" fill="#ff9ec4"/></pattern>
 </defs>
 <rect width="${MAP_W}" height="${MAP_H}" fill="url(#sky)"/>
 <path d="M0 1500 L0 1360 Q120 1300 240 1350 T${MAP_W} 1330 L${MAP_W} 1500 Z" fill="#7ED957" opacity=".55"/>
 <path d="M0 1500 L0 1420 Q140 1380 300 1420 T${MAP_W} 1410 L${MAP_W} 1500 Z" fill="#5CC93F" opacity=".7"/>
 <ellipse cx="70" cy="700" rx="150" ry="150" fill="#ffffff" opacity=".06"/>
 <ellipse cx="360" cy="1050" rx="130" ry="130" fill="#ffffff" opacity=".06"/>
 ${scenery()}
 <path d="${path}" fill="none" stroke="#ffffff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
 <path class="pathdraw" d="${path}" pathLength="1" fill="none" stroke="url(#candy)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
 <text x="${NODE_XS[0]}" y="${NODE_YS[0] + 92}" text-anchor="middle" font-size="30">🏁</text>
 <g class="goalbob"><text x="${NODE_XS[7]}" y="${NODE_YS[7] - 70}" text-anchor="middle" font-size="40">🏆</text></g>
 ${nodes}
</svg>`;
}

// Character placement over the current node, as percentages of the map
// wrapper (so it scales with any container width). Feet land at the node
// centre — the framing verified against the real model-viewer render.
export function characterSlot(currentLevel) {
  const i = Math.min(Math.max((currentLevel || 1) - 1, 0), 7);
  const nx = NODE_XS[i];
  const ny = NODE_YS[i];
  const WIDTH_PCT = (190 / MAP_W) * 100;        // 45.24%
  const BOX_H_FRAC_OF_WRAP = 232 / MAP_H;       // 0.1547
  const FEET_IN_BOX = 0.92;                      // feet sit ~92% down the box
  const leftPct = (nx / MAP_W) * 100;
  const topPct = (ny / MAP_H) * 100 - FEET_IN_BOX * BOX_H_FRAC_OF_WRAP * 100;
  return { leftPct, topPct, widthPct: WIDTH_PCT };
}
