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

// Portfolio hero: the same canvas as the portfolio site (selection frame,
// pixel surname, collaborator cursor), in its own light and dark tokens.
const HERO_THEMES = {
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

const HERO_COPY = {
  en: {
    title: "Franco Tillard, FullStack Developer",
    available: "Available for work",
    bio: [
      "FullStack developer and final-year",
      "Software Engineering student. I build",
      "web products with React, Java and",
      "Spring Boot, from idea to production.",
    ],
    selection: "Text",
    cta: "VIEW PORTFOLIO ↗",
    pixelMode: "Pixel mode",
  },
  es: {
    title: "Franco Tillard, Desarrollador FullStack",
    available: "Disponible para trabajar",
    bio: [
      "Desarrollador FullStack y estudiante",
      "de último año de Ingeniería en Software.",
      "Construyo productos web con React, Java",
      "y Spring Boot, de la idea a producción.",
    ],
    selection: "Texto",
    cta: "VER PORTAFOLIO ↗",
    pixelMode: "Modo píxel",
  },
};

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
  const random = seededRandom(20260211);
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

const portfolioHeroSvg = (t, c) => {
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

  const bio = c.bio
    .map((line, i) => `<tspan x="720" dy="${i === 0 ? 0 : 30}">${line}</tspan>`)
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">${c.title}</title>
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
    <rect x="40" y="36" width="${Math.round(c.available.length * 7.2 + 48)}" height="32" rx="16" fill="${t.card}" stroke="${t.border}"/>
    <circle class="ring" cx="60" cy="52" r="4" fill="${t.success}"/>
    <circle cx="60" cy="52" r="4" fill="${t.success}"/>
    <text x="74" y="57" font-family="${SANS}" font-size="13" font-weight="600" fill="${t.fg}">${c.available}</text>
  </g>

  <text class="fade" x="${first.x + padX}" y="${first.y + padY + wordH}" font-family="${SANS}" font-size="134" font-weight="700"
    textLength="${wordW}" lengthAdjust="spacingAndGlyphs" fill="${t.fg}">FRANCO</text>

  <text class="fade" style="animation-delay:0.2s" y="134" font-family="${SANS}" font-size="20" fill="${t.muted}">${bio}</text>

  ${pixelWord("TILLARD", last.x + padX, last.y + padY, cell, t)}

  <g class="frame">
    <g transform="translate(${first.x} ${first.y})">
      <rect width="${frameW}" height="${frameH}" fill="none" stroke="${t.brand}" stroke-width="1.5"/>
      ${handles}
      <rect x="0" y="-22" width="${c.selection.length * 6 + 10}" height="17" rx="3" fill="${t.brand}"/>
      <text x="${(c.selection.length * 6 + 10) / 2}" y="-10" text-anchor="middle" font-family="${SANS}" font-size="10" font-weight="600" fill="${t.brandFg}">${c.selection}</text>
    </g>
  </g>

  <g class="fade" style="animation-delay:0.35s">
    <rect x="${last.x}" y="380" width="196" height="42" rx="21" fill="${t.fg}"/>
    <text x="${last.x + 98}" y="406" text-anchor="middle" font-family="${SANS}" font-size="13" font-weight="600"
      letter-spacing="1.2" fill="${t.bg}">${c.cta}</text>
    <rect x="${last.x + 228}" y="390" width="40" height="22" rx="11" fill="${t.brand}"/>
    <circle cx="${last.x + 257}" cy="401" r="8" fill="${t.bg}"/>
    <text x="${last.x + 280}" y="406" font-family="${SANS}" font-size="14" fill="${t.muted}">${c.pixelMode}</text>
  </g>

  <g class="cursor" transform="translate(640 196)">
    ${cursorShape(t.fg, t.bg)}
    <rect x="14" y="20" width="56" height="20" rx="10" fill="${t.fg}"/>
    <text x="42" y="34" text-anchor="middle" font-family="${SANS}" font-size="11" font-weight="600" fill="${t.bg}">Franco</text>
  </g>
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
    write(`hero-${lang}-${mode}.svg`, portfolioHeroSvg(HERO_THEMES[mode], HERO_COPY[lang]));
    write(`about-${lang}-${mode}.svg`, bentoSvg(theme, copy.bento));
    write(`lang/${lang}-${mode}.svg`, languageKeys(theme, lang));
    for (const [name, label] of Object.entries(copy.keys)) {
      write(`keys/${name}-${lang}-${mode}.svg`, keycap(theme, label, name === "portfolio"));
    }
  }
}
