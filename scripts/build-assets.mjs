// Generates the terminal-style SVGs used by the profile READMEs (English and Spanish).
// Run: node scripts/build-assets.mjs
//
// GitHub renders README images as <img>: no scripts and no web fonts. The typing
// effect is pure CSS, and every mono line uses textLength so characters sit on a
// fixed grid whatever monospace font the viewer has. The terminal is dark in both
// GitHub themes, like a screenshot of a real window.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets");

const C = {
  window: "#0B0E14",
  bar: "#151A23",
  border: "#262C36",
  fg: "#E6EDF3",
  muted: "#7D8590",
  accent: "#F2A93B",
  accentFg: "#1A1206",
  keyBase: "#0E1218",
  keyFace: "#1F252F",
  keyEdge: "#363D49",
};

const MONO = "ui-monospace, 'SFMono-Regular', 'Cascadia Code', 'JetBrains Mono', Consolas, 'Liberation Mono', monospace";
const CHAR = 9; // grid width of one character at 15px
const SIZE = 15;
const LINE = 24;

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const write = (name, svg) => {
  const file = join(OUT, name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg.trim() + "\n");
  console.log(`wrote assets/${name}`);
};

// Terminal session per language. "cmd" lines are typed, "out" lines appear.
const SESSIONS = {
  en: {
    title: "Franco Tillard, FullStack Developer",
    lines: [
      { cmd: "whoami" },
      { out: "Franco Tillard", big: true },
      { out: "FullStack developer · final-year Software Engineering student", muted: true },
      { gap: true },
      { cmd: "cat now.txt" },
      { out: "→ Analyst Developer at MetroTec (since Feb 2026)" },
      { out: "→ Co-founder of Dev.Bit, a software studio" },
      { out: "→ Building Farmaser with Spring Boot + React" },
      { gap: true },
      { cmd: "ls stack/" },
      { out: "java  spring-boot  react  node  typescript  mysql  postgresql  tailwind", accent: true },
      { gap: true },
      { cmd: "echo $MOTTO" },
      { out: "from idea to production" },
      { cmd: "", cursor: true },
    ],
  },
  es: {
    title: "Franco Tillard, Desarrollador FullStack",
    lines: [
      { cmd: "whoami" },
      { out: "Franco Tillard", big: true },
      { out: "Desarrollador FullStack · estudiante de último año de Ingeniería en Software", muted: true },
      { gap: true },
      { cmd: "cat ahora.txt" },
      { out: "→ Desarrollador Analista en MetroTec (desde feb. 2026)" },
      { out: "→ Cofundador de Dev.Bit, un estudio de software" },
      { out: "→ Desarrollando Farmaser con Spring Boot + React" },
      { gap: true },
      { cmd: "ls stack/" },
      { out: "java  spring-boot  react  node  typescript  mysql  postgresql  tailwind", accent: true },
      { gap: true },
      { cmd: "echo $LEMA" },
      { out: "de la idea a producción" },
      { cmd: "", cursor: true },
    ],
  },
};

const PROMPT = [
  { text: "franco@tillard", color: C.accent },
  { text: ":~$", color: C.muted },
];
// Prompt plus the space before the command.
const PROMPT_LEN = PROMPT.reduce((sum, part) => sum + part.text.length, 0) + 1;

const monoText = (x, y, text, color) =>
  `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${SIZE}" fill="${color}" ` +
  `textLength="${text.length * CHAR}" lengthAdjust="spacing">${escape(text)}</text>`;

const terminalSvg = ({ title, lines }) => {
  const W = 1000;
  const PAD_X = 32;
  const BAR = 40;
  const TYPE_SPEED = 0.05;

  let y = BAR + 36;
  let t = 0.5;
  const rows = [];

  for (const line of lines) {
    if (line.gap) {
      y += LINE * 0.6;
      continue;
    }

    if ("cmd" in line) {
      let x = PAD_X;
      let body = "";
      for (const part of PROMPT) {
        body += monoText(x, y, part.text, part.color);
        x += part.text.length * CHAR;
      }
      const cmdX = PAD_X + PROMPT_LEN * CHAR;
      const typed = line.cmd.length;
      const duration = typed * TYPE_SPEED;

      if (typed) {
        // A window-colored curtain slides right one character at a time.
        body +=
          monoText(cmdX, y, line.cmd, C.fg) +
          `<rect class="curtain" style="--w:${typed * CHAR + 2}px;animation-delay:${t.toFixed(2)}s;` +
          `animation-duration:${duration.toFixed(2)}s;animation-timing-function:steps(${typed}, end)" ` +
          `x="${cmdX - 1}" y="${y - SIZE}" width="${typed * CHAR + 2}" height="${LINE}" fill="${C.window}"/>`;
      }
      if (line.cursor) {
        body += `<rect class="blink" x="${cmdX}" y="${y - SIZE + 2}" width="${CHAR}" height="${SIZE + 3}" fill="${C.accent}"/>`;
      }

      rows.push(`<g class="show" style="animation-delay:${t.toFixed(2)}s">${body}</g>`);
      t += duration + 0.35;
      y += LINE;
      continue;
    }

    if (line.big) {
      y += 10;
      rows.push(
        `<g class="show" style="animation-delay:${t.toFixed(2)}s">` +
          `<text x="${PAD_X}" y="${y + 6}" font-family="${MONO}" font-size="30" font-weight="700" fill="${C.fg}" ` +
          `textLength="${line.out.length * 18}" lengthAdjust="spacing">${escape(line.out)}</text></g>`
      );
      y += LINE + 18;
    } else {
      const color = line.accent ? C.accent : line.muted ? C.muted : C.fg;
      rows.push(`<g class="show" style="animation-delay:${t.toFixed(2)}s">${monoText(PAD_X, y, line.out, color)}</g>`);
      y += LINE;
    }
    t += 0.12;
  }

  const H = y + 14;
  const dots = [0, 1, 2]
    .map((i) => `<circle cx="${24 + i * 20}" cy="${BAR / 2}" r="6" fill="${C.border}"/>`)
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">${escape(title)}</title>
  <style>
    .show { animation: show 0.18s ease-out both; }
    .curtain { opacity: 0; animation-name: type; animation-fill-mode: both; }
    text { white-space: pre; }
    .blink { animation: blink 1.1s linear infinite; }
    @keyframes show { from { opacity: 0; } to { opacity: 1; } }
    @keyframes type {
      from { transform: translateX(0); opacity: 1; }
      99% { transform: translateX(var(--w)); opacity: 1; }
      to { transform: translateX(var(--w)); opacity: 0; }
    }
    @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .show, .curtain, .blink { animation: none; }
    }
  </style>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${C.window}" stroke="${C.border}"/>
  <path d="M0.5 12.5 A12 12 0 0 1 12.5 0.5 H${W - 12.5} A12 12 0 0 1 ${W - 0.5} 12.5 V${BAR} H0.5 Z" fill="${C.bar}"/>
  <line x1="0.5" y1="${BAR}" x2="${W - 0.5}" y2="${BAR}" stroke="${C.border}"/>
  ${dots}
  <text x="${W / 2}" y="${BAR / 2 + 5}" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${C.muted}">franco@tillard: ~</text>
  ${rows.join("\n  ")}
</svg>`;
};

// Keyboard keycap. The primary key uses the accent face.
const keycap = (label, primary = false) => {
  const W = Math.round(label.length * CHAR + 40);
  const H = 46;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escape(label.replace(" ↗", ""))}">
  <rect x="1" y="3" width="${W - 2}" height="${H - 4}" rx="9" fill="${C.keyBase}" stroke="${C.keyEdge}"/>
  <rect x="5" y="4" width="${W - 10}" height="${H - 14}" rx="7" fill="${primary ? C.accent : C.keyFace}"/>
  <text x="${W / 2}" y="25" text-anchor="middle" font-family="${MONO}" font-size="14" font-weight="600"
    fill="${primary ? C.accentFg : C.fg}">${escape(label)}</text>
</svg>`;
};

// Two keys side by side; the active language key is pressed down.
const languageKeys = (active) => {
  const key = 48;
  const gap = 8;
  const W = key * 2 + gap;
  const H = 46;
  const cap = (code, x) => {
    const on = code === active;
    return (
      `<rect x="${x + 1}" y="3" width="${key - 2}" height="${H - 4}" rx="9" fill="${C.keyBase}" stroke="${C.keyEdge}"/>` +
      `<rect x="${x + 5}" y="${on ? 7 : 4}" width="${key - 10}" height="${H - 14}" rx="7" fill="${on ? C.accent : C.keyFace}"/>` +
      `<text x="${x + key / 2}" y="${on ? 28 : 25}" text-anchor="middle" font-family="${MONO}" font-size="14" font-weight="700" ` +
      `fill="${on ? C.accentFg : C.muted}">${code.toUpperCase()}</text>`
    );
  };
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${active === "en" ? "English. Ver en español" : "Español. View in English"}">
  ${cap("en", 0)}${cap("es", key + gap)}
</svg>`;
};

const KEYS = {
  en: { portfolio: "portfolio ↗", linkedin: "linkedin ↗", email: "email" },
  es: { portfolio: "portafolio ↗", linkedin: "linkedin ↗", email: "email" },
};

for (const [lang, session] of Object.entries(SESSIONS)) {
  write(`terminal-${lang}.svg`, terminalSvg(session));
  write(`lang/${lang}.svg`, languageKeys(lang));
  for (const [name, label] of Object.entries(KEYS[lang])) {
    write(`keys/${name}-${lang}.svg`, keycap(label, name === "portfolio"));
  }
}
