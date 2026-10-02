// Generates the animated SVGs used by the profile README, in light and dark variants.
// Run: node scripts/build-assets.mjs
//
// GitHub renders README images as <img>, so the SVGs cannot run scripts or load web
// fonts. Everything animates with CSS and uses system fonts; textLength keeps the big
// words at a fixed width whatever font the viewer has.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets");

const THEMES = {
  light: {
    bg: "#F3F3F1",
    card: "#FCFCFC",
    fg: "#1B2231",
    muted: "#575D6A",
    border: "#D5D8DD",
    grid: "rgba(27,34,49,0.07)",
    brand: "#394EEF",
    brandFg: "#FFFFFF",
    ink: "#1B2231",
    inkFg: "#F3F3F1",
    inkMuted: "#A7ADBA",
    inkLine: "rgba(243,243,241,0.08)",
    success: "#2EA06B",
  },
  dark: {
    bg: "#0F1115",
    card: "#171A21",
    fg: "#E8E9EC",
    muted: "#9BA0AB",
    border: "#282C33",
    grid: "rgba(232,233,236,0.06)",
    brand: "#7484FB",
    brandFg: "#131A2B",
    ink: "#161A22",
    inkFg: "#E8E9EC",
    inkMuted: "#9BA0AB",
    inkLine: "rgba(232,233,236,0.07)",
    success: "#3DBA80",
  },
};

const FONT = "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Consolas, monospace";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const write = (name, svg) => {
  const file = join(OUT, name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg.trim() + "\n");
  console.log(`wrote assets/${name}`);
};

// Deterministic pseudo-random so regenerating does not churn the diff.
const random = (() => {
  let seed = 20260211;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
})();

const gridLines = (width, height, color, pad = 40, cols = 6) =>
  Array.from({ length: cols + 1 }, (_, i) => {
    const x = (pad + (i * (width - pad * 2)) / cols).toFixed(1);
    return `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${color}"/>`;
  }).join("");

// 5x7 bitmap glyphs for the pixel surname ("I" is 3 wide).
const GLYPHS = {
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  I: ["###", ".#.", ".#.", ".#.", ".#.", ".#.", "###"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
};

const pixelWord = (word, x0, y0, cell, t) => {
  const pixels = [];
  let col = 0;
  for (const letter of word) {
    const glyph = GLYPHS[letter];
    glyph.forEach((row, r) => {
      [...row].forEach((on, c) => {
        if (on === "#") pixels.push({ c: col + c, r });
      });
    });
    col += glyph[0].length + 1;
  }
  const totalCols = col - 1;

  return pixels
    .map(({ c, r }) => {
      const x = x0 + c * cell;
      const y = y0 + r * cell;
      const fade = 1 - (c / totalCols) * 0.5;
      const tone = [1, 0.82, 0.62, 0.45][Math.floor(random() * 4)];
      const dx = Math.round((random() - 0.5) * 420);
      const dy = Math.round((random() - 0.5) * 260);
      const assemble = (0.35 + random() * 0.6).toFixed(2);
      // The wave sweeps left to right, so its delay follows the column.
      const wave = (1.6 + c * 0.045).toFixed(2);
      return (
        `<g class="px" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${assemble}s">` +
        `<rect class="wave" style="animation-delay:${wave}s" x="${x}" y="${y}" width="${cell - 2}" height="${cell - 2}" ` +
        `fill="${t.brand}" fill-opacity="${Math.max(0.3, tone * fade).toFixed(2)}"/></g>`
      );
    })
    .join("");
};

const cursorShape = (fill, stroke) =>
  `<path d="M0 0 L0 19 L5 14.5 L8.6 22 L11.6 20.6 L8.1 13.4 L14.6 13.4 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round"/>`;

const heroSvg = (t) => {
  const W = 1200;
  const H = 440;
  // Both words share one frame size so the frame can glide between them.
  const cell = 14;
  const wordW = 39 * cell - 2; // TILLARD is 39 columns wide
  const wordH = 7 * cell - 2;
  const padX = 16;
  const padY = 14;
  const frameW = wordW + padX * 2;
  const frameH = wordH + padY * 2;
  const first = { x: 40, y: 108 };
  const last = { x: 404, y: 248 };
  const dx = last.x - first.x;
  const dy = last.y - first.y;

  const handles = [
    [0, 0],
    [frameW, 0],
    [0, frameH],
    [frameW, frameH],
  ]
    .map(([hx, hy]) => `<rect x="${hx - 4}" y="${hy - 4}" width="8" height="8" fill="${t.bg}" stroke="${t.brand}"/>`)
    .join("");

  const bio = [
    "FullStack developer and final-year",
    "Software Engineering student. I build",
    "web products with React, Java and",
    "Spring Boot, from idea to production.",
  ]
    .map((line, i) => `<tspan x="720" dy="${i === 0 ? 0 : 30}">${line}</tspan>`)
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">Franco Tillard, FullStack Developer</title>
  <style>
    .px { animation: assemble 1.4s ${EASE} both; }
    .wave { animation: wave 7s ease-in-out infinite; transform-box: fill-box; }
    .frame { animation: frame 8s ${EASE} infinite; }
    .cursor { animation: cursor 16s ease-in-out infinite; }
    .ring { animation: ring 2.4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
    .fade { animation: fade 0.9s ${EASE} both; }
    @keyframes assemble {
      from { transform: translate(var(--dx), var(--dy)); opacity: 0; }
      to { transform: none; opacity: 1; }
    }
    @keyframes wave {
      0%, 8%, 100% { transform: none; }
      4% { transform: translateY(-9px); }
    }
    @keyframes frame {
      0%, 42% { transform: none; }
      50%, 92% { transform: translate(${dx}px, ${dy}px); }
      100% { transform: none; }
    }
    @keyframes cursor {
      0%, 6% { transform: translate(250px, 70px); }
      22%, 28% { transform: translate(640px, 196px); }
      44%, 50% { transform: translate(1010px, 300px); }
      66%, 72% { transform: translate(560px, 392px); }
      88%, 94% { transform: translate(150px, 250px); }
      100% { transform: translate(250px, 70px); }
    }
    @keyframes ring {
      from { transform: scale(1); opacity: 0.55; }
      to { transform: scale(2.8); opacity: 0; }
    }
    @keyframes fade {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .px, .wave, .frame, .cursor, .ring, .fade { animation: none; }
      .cursor { transform: translate(640px, 196px); }
    }
  </style>

  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  ${gridLines(W, H, t.grid)}
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${t.border}"/>

  <g class="fade">
    <rect x="40" y="36" width="178" height="32" rx="16" fill="${t.card}" stroke="${t.border}"/>
    <circle class="ring" cx="60" cy="52" r="4" fill="${t.success}"/>
    <circle cx="60" cy="52" r="4" fill="${t.success}"/>
    <text x="74" y="57" font-family="${FONT}" font-size="13" font-weight="600" fill="${t.fg}">Available for work</text>
  </g>

  <text class="fade" x="${first.x + padX}" y="${first.y + padY + wordH}" font-family="${FONT}" font-size="134" font-weight="700"
    textLength="${wordW}" lengthAdjust="spacingAndGlyphs" fill="${t.fg}">FRANCO</text>

  <text class="fade" style="animation-delay:0.2s" y="134" font-family="${FONT}" font-size="20" fill="${t.muted}">${bio}</text>

  ${pixelWord("TILLARD", last.x + padX, last.y + padY, cell, t)}

  <g class="frame">
    <g transform="translate(${first.x} ${first.y})">
      <rect width="${frameW}" height="${frameH}" fill="none" stroke="${t.brand}" stroke-width="1.5"/>
      ${handles}
      <rect x="0" y="-22" width="34" height="17" rx="3" fill="${t.brand}"/>
      <text x="17" y="-10" text-anchor="middle" font-family="${FONT}" font-size="10" font-weight="600" fill="${t.brandFg}">Text</text>
    </g>
  </g>

  <g class="fade" style="animation-delay:0.35s">
    <rect x="${last.x}" y="380" width="196" height="42" rx="21" fill="${t.fg}"/>
    <text x="${last.x + 98}" y="406" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="600"
      letter-spacing="1.2" fill="${t.bg}">VIEW PORTFOLIO ↗</text>
    <rect x="${last.x + 228}" y="390" width="40" height="22" rx="11" fill="${t.brand}"/>
    <circle cx="${last.x + 257}" cy="401" r="8" fill="${t.bg}"/>
    <text x="${last.x + 280}" y="406" font-family="${FONT}" font-size="14" fill="${t.muted}">Pixel mode</text>
  </g>

  <g class="cursor" transform="translate(640 196)">
    ${cursorShape(t.fg, t.bg)}
    <rect x="14" y="20" width="56" height="20" rx="10" fill="${t.fg}"/>
    <text x="42" y="34" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="600" fill="${t.bg}">Franco</text>
  </g>
</svg>`;
};

const STACK = [
  "Java",
  "Spring Boot",
  "React",
  "Node.js",
  "TypeScript",
  "MySQL",
  "PostgreSQL",
  "JavaScript",
  "Tailwind CSS",
  "Vite",
  "Maven",
  "Git",
];

const stackSvg = (t) => {
  const W = 1200;
  const H = 96;
  const size = 38;
  const gap = 34;
  const square = 12;
  const charW = size * 0.64;

  let x = 0;
  const items = STACK.map((name) => {
    const label = name.toUpperCase();
    const width = Math.round(label.length * charW);
    const node =
      `<text x="${x}" y="62" font-family="${FONT}" font-size="${size}" font-weight="700" ` +
      `textLength="${width}" lengthAdjust="spacingAndGlyphs" fill="${t.fg}">${label}</text>` +
      `<rect x="${x + width + gap}" y="${62 - size * 0.36 - square / 2}" width="${square}" height="${square}" fill="${t.brand}"/>`;
    x += width + gap * 2 + square;
    return node;
  }).join("");
  const loop = x;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">Stack: ${STACK.join(", ")}</title>
  <defs>
    <linearGradient id="edge" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.08" stop-color="#fff" stop-opacity="1"/>
      <stop offset="0.92" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="fade"><rect width="${W}" height="${H}" fill="url(#edge)"/></mask>
  </defs>
  <style>
    .track { animation: marquee ${Math.round(loop / 40)}s linear infinite; }
    @keyframes marquee { to { transform: translateX(-${loop}px); } }
    @media (prefers-reduced-motion: reduce) { .track { animation: none; } }
  </style>
  <g mask="url(#fade)">
    <g class="track">
      <g>${items}</g>
      <g transform="translate(${loop} 0)">${items}</g>
    </g>
  </g>
</svg>`;
};

const mottoSvg = (t) => {
  const W = 1200;
  const H = 300;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">From idea to production</title>
  <style>
    .line { animation: rise 1s ${EASE} both; }
    @keyframes rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .line { animation: none; } }
  </style>
  <rect width="${W}" height="${H}" fill="${t.ink}"/>
  ${gridLines(W, H, t.inkLine)}
  <g font-family="${FONT}" font-weight="700" font-size="84" fill="${t.inkFg}">
    <text class="line" x="40" y="118" textLength="520" lengthAdjust="spacingAndGlyphs"><tspan fill="${t.brand}">“</tspan>FROM IDEA</text>
    <text class="line" style="animation-delay:0.15s" x="226" y="204" textLength="740" lengthAdjust="spacingAndGlyphs">TO PRODUCTION<tspan fill="${t.brand}">”</tspan></text>
  </g>
  <line x1="40" y1="238" x2="${W - 40}" y2="238" stroke="${t.inkMuted}" stroke-opacity="0.35"/>
  <text x="40" y="272" font-family="${FONT}" font-size="16" font-weight="600" fill="${t.inkFg}">Franco Tillard</text>
  <text x="${W - 40}" y="272" text-anchor="end" font-family="${MONO}" font-size="13" letter-spacing="1.5" fill="${t.inkMuted}">FULLSTACK DEVELOPER</text>
</svg>`;
};

// Pill buttons for the contact row. Arrow marks an external link.
const BUTTONS = [
  { name: "portfolio", label: "PORTFOLIO ↗", primary: true },
  { name: "linkedin", label: "LINKEDIN ↗" },
  { name: "email", label: "EMAIL" },
];

const buttonSvg = (t, { label, primary }) => {
  const width = Math.round(label.length * 9.2 + 44);
  const H = 44;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${H}" viewBox="0 0 ${width} ${H}" role="img" aria-label="${label.replace(" ↗", "")}">
  <rect x="1" y="1" width="${width - 2}" height="${H - 2}" rx="${(H - 2) / 2}" fill="${primary ? t.fg : t.card}" stroke="${primary ? t.fg : t.border}"/>
  <text x="${width / 2}" y="27" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="600" letter-spacing="1.2"
    fill="${primary ? t.bg : t.fg}">${label}</text>
</svg>`;
};

for (const [mode, theme] of Object.entries(THEMES)) {
  write(`hero-${mode}.svg`, heroSvg(theme));
  write(`stack-${mode}.svg`, stackSvg(theme));
  write(`motto-${mode}.svg`, mottoSvg(theme));
  for (const button of BUTTONS) write(`buttons/${button.name}-${mode}.svg`, buttonSvg(theme, button));
}
