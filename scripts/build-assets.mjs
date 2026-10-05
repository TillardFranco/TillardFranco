// Generates the SVGs used by the profile READMEs, in English and Spanish and in
// light and dark variants that follow the portfolio palette.
// Run: node scripts/build-assets.mjs
//
// GitHub renders README images as <img>: no scripts and no web fonts. Animations
// are pure CSS, and mono lines use textLength so characters sit on a fixed grid
// whatever monospace font the viewer has.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets");

// Portfolio tokens (see the PortafolioWeb design tokens).
const THEMES = {
  light: {
    window: "#FCFCFC",
    bar: "#F3F3F1",
    border: "#D5D8DD",
    grid: "rgba(27,34,49,0.05)",
    fg: "#1B2231",
    muted: "#575D6A",
    brand: "#394EEF",
    brandFg: "#FFFFFF",
    brandDeep: "#2A3BC4",
    ink: "#1B2231",
    inkFg: "#F3F3F1",
    inkMuted: "#A7ADBA",
    tile: "#F3F3F1",
    keyBase: "#C9CDD4",
    keyFace: "#FCFCFC",
  },
  dark: {
    window: "#0F1115",
    bar: "#171A21",
    border: "#282C33",
    grid: "rgba(232,233,236,0.04)",
    fg: "#E8E9EC",
    muted: "#9BA0AB",
    brand: "#7484FB",
    brandFg: "#131A2B",
    brandDeep: "#4F5ED6",
    ink: "#171A21",
    inkFg: "#E8E9EC",
    inkMuted: "#9BA0AB",
    tile: "#0F1115",
    keyBase: "#0A0C10",
    keyFace: "#1C2029",
  },
};

const SANS = "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SFMono-Regular', 'Cascadia Code', 'JetBrains Mono', Consolas, 'Liberation Mono', monospace";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const CHAR = 9; // grid width of one mono character at 15px

// Deterministic pseudo-random so regenerating does not churn the diff.
const seededRandom = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const write = (name, svg) => {
  const file = join(OUT, name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg.trim() + "\n");
  console.log(`wrote assets/${name}`);
};

const COPY = {
  en: {
    title: "Franco Tillard, FullStack Developer",
    hero: {
      name: "Franco Tillard",
      tagline: "a fullstack developer, from idea to production",
      cta: "Explore ↗",
    },
    file: "README.md",
    tree: [
      { name: "franco-tillard/", dir: true, open: true, depth: 0 },
      { name: "about/", dir: true, depth: 1 },
      { name: "stack/", dir: true, depth: 1 },
      { name: "projects/", dir: true, depth: 1 },
      { name: "README.md", depth: 1 },
      { name: "README.es.md", depth: 1 },
    ],
    keys: { portfolio: "portfolio ↗", linkedin: "linkedin ↗", email: "email" },
    bento: {
      alt: "About Franco",
      now: {
        label: "NOW",
        title: "Analyst Developer at MetroTec",
        body: ["I turn requirements from about 30 client companies", "into working software. Since Feb 2026."],
      },
      approach: {
        label: "APPROACH",
        steps: ["analyze", "build", "validate"],
        body: ["I validate every spec against", "the real database before", "writing code."],
      },
      studio: { label: "STUDIO", title: "Co-founder of Dev.Bit", body: ["Websites and systems", "for small businesses."] },
      studies: { label: "STUDIES", title: "Software Engineering", body: ["Final year,", "Universidad Siglo 21."] },
    },
  },
  es: {
    title: "Franco Tillard, Desarrollador FullStack",
    hero: {
      name: "Franco Tillard",
      tagline: "desarrollador fullstack, de la idea a producción",
      cta: "Explorar ↗",
    },
    file: "README.es.md",
    tree: [
      { name: "franco-tillard/", dir: true, open: true, depth: 0 },
      { name: "sobre-mi/", dir: true, depth: 1 },
      { name: "stack/", dir: true, depth: 1 },
      { name: "proyectos/", dir: true, depth: 1 },
      { name: "README.md", depth: 1 },
      { name: "README.es.md", depth: 1 },
    ],
    keys: { portfolio: "portafolio ↗", linkedin: "linkedin ↗", email: "email" },
    bento: {
      alt: "Sobre Franco",
      now: {
        label: "AHORA",
        title: "Desarrollador Analista en MetroTec",
        body: ["Convierto requerimientos de unas 30 empresas cliente", "en software funcionando. Desde feb. 2026."],
      },
      approach: {
        label: "ENFOQUE",
        steps: ["analizar", "construir", "validar"],
        body: ["Valido cada especificación", "contra la base de datos real", "antes de escribir código."],
      },
      studio: { label: "ESTUDIO", title: "Cofundador de Dev.Bit", body: ["Sitios web y sistemas", "para pequeñas empresas."] },
      studies: { label: "ESTUDIOS", title: "Ingeniería en Software", body: ["Último año,", "Universidad Siglo 21."] },
    },
  },
};

// Scramble alphabet for the name reveal and glitch, as on digitalmeadow.studio.
const NOISE = "!@#$%&*/\\|<>?";

const scrambled = (text, keep, random) =>
  [...text].map((ch, i) => (ch === " " || i < keep ? ch : NOISE[Math.floor(random() * NOISE.length)])).join("");

// Swaps a few characters, for the short periodic glitch.
const glitched = (text, random) =>
  [...text].map((ch) => (ch !== " " && random() < 0.18 ? NOISE[Math.floor(random() * NOISE.length)] : ch)).join("");

// Landing in the style of digitalmeadow.studio: a Neovim frame around an ASCII
// meadow, with the name decoding from noise in the middle.
const heroSvg = (t, { title, hero, tree, file }) => {
  const W = 1000;
  const BAR = 40;
  const SIDEBAR = 196;
  const GUTTER = 44;
  const STATUS = 30;
  const X0 = SIDEBAR + GUTTER + 14;
  const COLS = 80;
  const ROWS = 21;
  const ROW = 22;
  const TOP = BAR + 28; // baseline of the first row
  const NAME_ROW = 9;
  const random = seededRandom(11);
  const centerX = X0 + (COLS * CHAR) / 2;

  // Cells kept empty so the text reads over the art.
  const isClear = (c, r) => r >= NAME_ROW - 1 && r <= NAME_ROW + 5 && c >= 17 && c <= 62;

  const columns = [];
  for (let c = 0; c < COLS; c++) {
    const cells = new Map();
    for (let r = 0; r < ROWS; r++) {
      if (isClear(c, r)) continue;
      // Denser toward a mound centered low in the window.
      const dx = (c - COLS / 2) / (COLS / 2);
      const dy = (r - 17) / 7;
      const mound = Math.exp(-(dx * dx * 1.5 + dy * dy * 1.2));
      if (random() > 0.95 * mound + 0.015) continue;
      const level = mound > 0.6 ? 3 : mound > 0.32 ? 2 : 1;
      cells.set(r, { ch: ["|", "|", "/", "\\"][Math.floor(random() * 4)], cls: random() < 0.05 ? "b" : `a${level}` });
    }
    // Loose vertical strands in the upper part, as on the reference.
    if (random() < 0.14) {
      const start = Math.floor(random() * 6);
      const length = 2 + Math.floor(random() * 3);
      for (let r = start; r < start + length; r++) {
        if (!isClear(c, r) && !cells.has(r)) cells.set(r, { ch: "|", cls: "a1" });
      }
    }
    if (!cells.size) continue;
    const glyphs = [...cells.entries()]
      .map(([r, cell]) => `<text x="${X0 + c * CHAR}" y="${TOP + r * ROW}" class="${cell.cls}">${escape(cell.ch)}</text>`)
      .join("");
    columns.push(`<g class="blade" style="animation-delay:${(-c * 0.07).toFixed(2)}s">${glyphs}</g>`);
  }

  // Centered text: name and tagline decode from noise, then glitch now and then.
  const nameY = TOP + NAME_ROW * ROW;
  const tagY = nameY + 30;
  const ctaY = tagY + 34;
  const nameText = (text, extra = "") =>
    `<text x="${centerX}" y="${nameY}" text-anchor="middle" font-family="${MONO}" font-size="28" font-weight="700" fill="${t.fg}" ` +
    `textLength="${text.length * 17}" lengthAdjust="spacing"${extra}>${escape(text)}</text>`;
  const tagText = (text, extra = "") =>
    `<text x="${centerX}" y="${tagY}" text-anchor="middle" font-family="${MONO}" font-size="14" fill="${t.muted}" ` +
    `textLength="${text.length * 8.4}" lengthAdjust="spacing"${extra}>${escape(text)}</text>`;

  const decode = (text, render, start) => {
    const steps = 8;
    const frames = Array.from({ length: steps }, (_, k) =>
      render(
        scrambled(text, Math.round((k / steps) * text.length), random),
        ` class="scramble" style="animation-delay:${(start + k * 0.07).toFixed(2)}s"`
      )
    ).join("");
    return { frames, revealAt: start + steps * 0.07 };
  };

  const name = decode(hero.name, nameText, 0.7);
  const tagline = decode(hero.tagline, tagText, 1.0);

  const ctaW = Math.round(hero.cta.length * 8.4 + 48);
  const cta =
    `<g class="show" style="animation-delay:${(tagline.revealAt + 0.15).toFixed(2)}s">` +
    `<rect x="${centerX - ctaW / 2}" y="${ctaY - 19}" width="${ctaW}" height="28" rx="6" fill="none" stroke="${t.brand}"/>` +
    `<text x="${centerX}" y="${ctaY}" text-anchor="middle" font-family="${MONO}" font-size="14" font-weight="600" fill="${t.brand}">${escape(hero.cta)}</text></g>`;

  // Line numbers for the art rows, then tildes past the end of the buffer.
  const gutterX = SIDEBAR + GUTTER - 6;
  const numbers = Array.from({ length: ROWS }, (_, r) =>
    `<text x="${gutterX}" y="${TOP + r * ROW}" text-anchor="end" class="n">${r + 1}</text>`
  ).join("");
  const tildes = Array.from({ length: 3 }, (_, i) =>
    `<text x="${gutterX}" y="${TOP + (ROWS + i) * ROW}" text-anchor="end" class="tilde">~</text>`
  ).join("");

  const statusY = TOP + (ROWS + 2) * ROW + 14;
  const H = statusY + STATUS;

  // File tree in the sidebar; the open file is highlighted.
  const treeRows = tree
    .map((item, i) => {
      const ty = BAR + 30 + i * 24;
      const active = item.name === file;
      const label = `${" ".repeat(item.depth * 2)}${item.dir ? (item.open ? "▾ " : "▸ ") : "  "}${item.name}`;
      return (
        (active ? `<rect x="0.5" y="${ty - 16}" width="${SIDEBAR - 1}" height="23" fill="${t.brand}"/>` : "") +
        `<text x="16" y="${ty}" font-family="${MONO}" font-size="13" font-weight="${item.depth === 0 ? 700 : 400}" ` +
        `fill="${active ? t.brandFg : item.dir ? t.fg : t.muted}">${escape(label)}</text>`
      );
    })
    .join("");

  const dots = [0, 1, 2]
    .map((i) => `<circle cx="${24 + i * 20}" cy="${BAR / 2}" r="6" fill="${t.border}"/>`)
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">${escape(title)}</title>
  <style>
    text { white-space: pre; }
    .field text { font-family: ${MONO}; font-size: 15px; fill: ${t.muted}; }
    .field .a1 { fill-opacity: 0.28; }
    .field .a2 { fill-opacity: 0.45; }
    .field .a3 { fill-opacity: 0.65; }
    .field .b { fill: ${t.brand}; fill-opacity: 0.85; }
    .n { font-family: ${MONO}; font-size: 12px; fill: ${t.muted}; fill-opacity: 0.7; }
    .tilde { font-family: ${MONO}; font-size: 13px; fill: ${t.brand}; fill-opacity: 0.55; }
    .field { animation: show 1.4s ease-out 0.1s both; }
    .blade { animation: sway 5s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
    .show { animation: show 0.18s ease-out both; }
    .scramble { opacity: 0; animation: flash 0.07s linear; }
    .glitch { opacity: 0; animation: glitch 7s linear infinite; }
    .glitch-hide { animation: glitch-hide 7s linear infinite; }
    @keyframes show { from { opacity: 0; } to { opacity: 1; } }
    @keyframes sway { from { transform: skewX(-3deg); } to { transform: skewX(3deg); } }
    @keyframes flash { from, to { opacity: 1; } }
    @keyframes glitch { 0%, 95.9% { opacity: 0; } 96%, 98% { opacity: 1; } 98.1%, 100% { opacity: 0; } }
    @keyframes glitch-hide { 0%, 95.9% { opacity: 1; } 96%, 98% { opacity: 0; } 98.1%, 100% { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) {
      .field, .blade, .show, .scramble, .glitch, .glitch-hide { animation: none; }
    }
  </style>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${t.window}" stroke="${t.border}"/>
  <rect x="0.5" y="${BAR}" width="${SIDEBAR}" height="${statusY - BAR}" fill="${t.bar}"/>
  <line x1="${SIDEBAR + 0.5}" y1="${BAR}" x2="${SIDEBAR + 0.5}" y2="${statusY}" stroke="${t.border}"/>
  ${treeRows}
  <path d="M0.5 12.5 A12 12 0 0 1 12.5 0.5 H${W - 12.5} A12 12 0 0 1 ${W - 0.5} 12.5 V${BAR} H0.5 Z" fill="${t.bar}"/>
  <line x1="0.5" y1="${BAR}" x2="${W - 0.5}" y2="${BAR}" stroke="${t.border}"/>
  ${dots}
  <text x="${W / 2}" y="${BAR / 2 + 5}" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${t.muted}">nvim ~/franco-tillard/${escape(file)}</text>
  ${numbers}
  ${tildes}
  <g class="field">
  ${columns.join("\n  ")}
  </g>
  ${name.frames}
  <g class="glitch-hide" style="animation-delay:6s"><g class="show" style="animation-delay:${name.revealAt.toFixed(2)}s">${nameText(hero.name)}</g></g>
  ${nameText(glitched(hero.name, random), ` class="glitch" style="animation-delay:6s"`)}
  ${tagline.frames}
  <g class="glitch-hide" style="animation-delay:9.5s"><g class="show" style="animation-delay:${tagline.revealAt.toFixed(2)}s">${tagText(hero.tagline)}</g></g>
  ${tagText(glitched(hero.tagline, random), ` class="glitch" style="animation-delay:9.5s"`)}
  ${cta}
  <path d="M0.5 ${statusY} H${W - 0.5} V${H - 12.5} A12 12 0 0 1 ${W - 12.5} ${H - 0.5} H12.5 A12 12 0 0 1 0.5 ${H - 12.5} Z" fill="${t.bar}"/>
  <line x1="0.5" y1="${statusY}" x2="${W - 0.5}" y2="${statusY}" stroke="${t.border}"/>
  <rect x="12" y="${statusY + 6}" width="72" height="${STATUS - 12}" rx="3" fill="${t.brand}"/>
  <text x="48" y="${statusY + 19}" text-anchor="middle" font-family="${MONO}" font-size="11" font-weight="700" fill="${t.brandFg}">NORMAL</text>
  <text x="98" y="${statusY + 19}" font-family="${MONO}" font-size="12" fill="${t.fg}">${escape(file)}</text>
  <text x="${W - 16}" y="${statusY + 19}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.muted}">utf-8   ln 1, col 1</text>
</svg>`;
};

// ASCII meadow footer: blades of | / \ that sway in a wave, a few flowering.
const meadowSvg = (t) => {
  const W = 1000;
  const H = 120;
  const random = seededRandom(21);
  const cols = Math.floor(W / CHAR);
  const blades = [];
  for (let c = 0; c < cols; c++) {
    if (random() < 0.35) continue;
    // Taller blades toward the middle, like a hill.
    const hill = 1 - Math.abs(c / cols - 0.5) * 1.4;
    const height = Math.max(1, Math.round((1 + random() * 4) * hill));
    const chars = Array.from({ length: height }, (_, i) => {
      if (i === height - 1 && random() < 0.08) return "*";
      return ["|", "|", "/", "\\"][Math.floor(random() * 4)];
    });
    const x = c * CHAR;
    const text = chars
      .map((ch, i) => {
        const flower = ch === "*";
        return `<text x="${x}" y="${H - 8 - i * 16}" font-family="${MONO}" font-size="15" fill="${flower ? t.brand : t.muted}" fill-opacity="${flower ? 1 : (0.35 + random() * 0.4).toFixed(2)}">${escape(ch)}</text>`;
      })
      .join("");
    blades.push(`<g class="blade" style="animation-delay:${(-c * 0.06).toFixed(2)}s">${text}</g>`);
  }
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="ASCII meadow">
  <style>
    .blade { animation: sway 4s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
    @keyframes sway { from { transform: skewX(-14deg); } to { transform: skewX(10deg); } }
    @media (prefers-reduced-motion: reduce) { .blade { animation: none; } }
  </style>
  ${blades.join("\n  ")}
</svg>`;
};

// About grid: one wide ink tile, one tall brand tile, two plain tiles.
const bentoSvg = (t, { alt, now, approach, studio, studies }) => {
  const W = 1000;
  const GAP = 12;
  const colW = (W - GAP * 2) / 3;
  const rowH = 150;
  const H = rowH * 2 + GAP;

  const label = (x, y, text, color) =>
    `<text x="${x}" y="${y}" font-family="${MONO}" font-size="12" letter-spacing="1.6" fill="${color}">${escape(text)}</text>`;
  const lines = (x, y, items, color, size = 15, step = 22) =>
    items
      .map((item, i) => `<text x="${x}" y="${y + i * step}" font-family="${SANS}" font-size="${size}" fill="${color}">${escape(item)}</text>`)
      .join("");
  const square = (x, y, color) => `<rect x="${x}" y="${y}" width="10" height="10" fill="${color}"/>`;

  // Tile 1: now (two columns wide, ink).
  const nowTile =
    `<rect x="0" y="0" width="${colW * 2 + GAP}" height="${rowH}" fill="${t.ink}"/>` +
    square(28, 26, t.brand) +
    label(48, 36, now.label, t.inkMuted) +
    `<text x="28" y="84" font-family="${SANS}" font-size="30" font-weight="700" fill="${t.inkFg}">${escape(now.title)}</text>` +
    lines(28, 114, now.body, t.inkMuted);

  // Tile 2: approach (tall, brand). Steps light up one after another.
  const ax = colW * 2 + GAP * 2;
  const approachTile =
    `<rect x="${ax}" y="0" width="${colW}" height="${H}" fill="${t.brand}"/>` +
    label(ax + 28, 36, approach.label, t.brandFg) +
    approach.steps
      .map(
        (step, i) =>
          `<g class="step" style="animation-delay:${i * 2}s">` +
          `<text x="${ax + 28}" y="${92 + i * 50}" font-family="${SANS}" font-size="36" font-weight="700" fill="${t.brandFg}">${escape(step)}</text>` +
          `<text x="${ax + colW - 28}" y="${92 + i * 50}" text-anchor="end" font-family="${MONO}" font-size="13" fill="${t.brandFg}">0${i + 1}</text></g>`
      )
      .join("") +
    `<line x1="${ax + 28}" y1="${H - 98}" x2="${ax + colW - 28}" y2="${H - 98}" stroke="${t.brandFg}" stroke-opacity="0.35"/>` +
    lines(ax + 28, H - 70, approach.body, t.brandFg, 14, 20);

  // Tiles 3 and 4: studio and studies (plain).
  const plain = (x, data) =>
    `<rect x="${x + 0.5}" y="${rowH + GAP + 0.5}" width="${colW - 1}" height="${rowH - 1}" fill="${t.tile}" stroke="${t.border}"/>` +
    square(x + 28, rowH + GAP + 26, t.brand) +
    label(x + 48, rowH + GAP + 36, data.label, t.muted) +
    `<text x="${x + 28}" y="${rowH + GAP + 80}" font-family="${SANS}" font-size="22" font-weight="700" fill="${t.fg}">${escape(data.title)}</text>` +
    lines(x + 28, rowH + GAP + 108, data.body, t.muted, 14, 20);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">${escape(alt)}</title>
  <style>
    .step { opacity: 0.45; animation: step 6s ${EASE} infinite; }
    @keyframes step { 0%, 30% { opacity: 1; } 40%, 100% { opacity: 0.45; } }
    @media (prefers-reduced-motion: reduce) { .step { animation: none; opacity: 1; } }
  </style>
  ${nowTile}
  ${approachTile}
  ${plain(0, studio)}
  ${plain(colW + GAP, studies)}
</svg>`;
};

// Keyboard keycap. The primary key uses the brand face.
const keycap = (t, label, primary = false) => {
  const W = Math.round(label.length * CHAR + 40);
  const H = 46;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escape(label.replace(" ↗", ""))}">
  <rect x="1" y="3" width="${W - 2}" height="${H - 4}" rx="9" fill="${primary ? t.brandDeep : t.keyBase}" stroke="${primary ? t.brandDeep : t.border}"/>
  <rect x="5" y="4" width="${W - 10}" height="${H - 14}" rx="7" fill="${primary ? t.brand : t.keyFace}"/>
  <text x="${W / 2}" y="25" text-anchor="middle" font-family="${MONO}" font-size="14" font-weight="600"
    fill="${primary ? t.brandFg : t.fg}">${escape(label)}</text>
</svg>`;
};

// Two keys side by side; the active language key is pressed down.
const languageKeys = (t, active) => {
  const key = 48;
  const gap = 8;
  const W = key * 2 + gap;
  const H = 46;
  const cap = (code, x) => {
    const on = code === active;
    return (
      `<rect x="${x + 1}" y="3" width="${key - 2}" height="${H - 4}" rx="9" fill="${on ? t.brandDeep : t.keyBase}" stroke="${on ? t.brandDeep : t.border}"/>` +
      `<rect x="${x + 5}" y="${on ? 7 : 4}" width="${key - 10}" height="${H - 14}" rx="7" fill="${on ? t.brand : t.keyFace}"/>` +
      `<text x="${x + key / 2}" y="${on ? 28 : 25}" text-anchor="middle" font-family="${MONO}" font-size="14" font-weight="700" ` +
      `fill="${on ? t.brandFg : t.muted}">${code.toUpperCase()}</text>`
    );
  };
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${active === "en" ? "English. Ver en español" : "Español. View in English"}">
  ${cap("en", 0)}${cap("es", key + gap)}
</svg>`;
};

for (const [mode, theme] of Object.entries(THEMES)) {
  write(`meadow-${mode}.svg`, meadowSvg(theme));
  for (const [lang, copy] of Object.entries(COPY)) {
    write(`terminal-${lang}-${mode}.svg`, heroSvg(theme, copy));
    write(`about-${lang}-${mode}.svg`, bentoSvg(theme, copy.bento));
    write(`lang/${lang}-${mode}.svg`, languageKeys(theme, lang));
    for (const [name, label] of Object.entries(copy.keys)) {
      write(`keys/${name}-${lang}-${mode}.svg`, keycap(theme, label, name === "portfolio"));
    }
  }
}
