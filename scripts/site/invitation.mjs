// Marker alphabet and geometry adapted from the supplied Starburst Thanks Footer.
const hash = n => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
const round = value => Math.round(value * 100) / 100;
const GLYPHS = {
  A: [6, "M0 10L3 0L6 10M1.2 6.2L4.8 6.2"],
  B: [5.6, "M0 10L0 0L3.2 0Q5.2 0 5.2 2.4Q5.2 4.8 3 4.8L0 4.8M3 4.8Q5.6 4.8 5.6 7.4Q5.6 10 3 10L0 10"],
  C: [5.5, "M5.5 1.2Q4.6 0 3 0Q0 0 0 5Q0 10 3 10Q4.6 10 5.5 8.8"],
  D: [5.6, "M0 0L0 10L2.6 10Q5.6 10 5.6 5Q5.6 0 2.6 0Z"],
  E: [5, "M5 0L0 0L0 10L5 10M0 5L3.8 5"],
  F: [5, "M5 0L0 0L0 10M0 5L3.8 5"],
  G: [6, "M5.6 1.4Q4.6 0 3 0Q0 0 0 5Q0 10 3 10Q6 10 6 6L3.4 6"],
  H: [5.6, "M0 0L0 10M5.6 0L5.6 10M0 5L5.6 5"],
  I: [1, "M0.5 0L0.5 10"],
  J: [4.6, "M4.6 0L4.6 7Q4.6 10 2.3 10Q0 10 0 7.6"],
  K: [5.4, "M0 0L0 10M5.4 0L0 6.2M1.8 4.6L5.4 10"],
  L: [4.6, "M0 0L0 10L4.6 10"],
  M: [7, "M0 10L0.6 0L3.5 7L6.4 0L7 10"],
  N: [5.6, "M0 10L0 0L5.6 10L5.6 0"],
  O: [6, "M3 0Q0 0 0 5Q0 10 3 10Q6 10 6 5Q6 0 3 0Z"],
  P: [5.2, "M0 10L0 0L3 0Q5.2 0 5.2 2.7Q5.2 5.4 3 5.4L0 5.4"],
  Q: [6.4, "M3 0Q0 0 0 5Q0 10 3 10Q6 10 6 5Q6 0 3 0ZM3.6 7L6.4 10.6"],
  R: [5.4, "M0 10L0 0L3 0Q5.2 0 5.2 2.7Q5.2 5.4 3 5.4L0 5.4M2.4 5.4L5.4 10"],
  S: [5.2, "M5 1.2Q4.2 0 2.6 0Q0.2 0 0.2 2.5Q0.2 4.6 2.6 5Q5.2 5.5 5.2 7.6Q5.2 10 2.6 10Q0.8 10 0 8.6"],
  T: [6, "M0 0L6 0M3 0L3 10"],
  U: [5.6, "M0 0L0 7Q0 10 2.8 10Q5.6 10 5.6 7L5.6 0"],
  V: [6, "M0 0L3 10L6 0"],
  W: [8, "M0 0L1.9 10L4 2.6L6.1 10L8 0"],
  X: [5.6, "M0 0L5.6 10M5.6 0L0 10"],
  Y: [5.6, "M0 0L2.8 5L5.6 0M2.8 5L2.8 10"],
  Z: [5.4, "M0 0L5.4 0L0 10L5.4 10"],
  "0": [5, "M2.5 0Q0 0 0 5Q0 10 2.5 10Q5 10 5 5Q5 0 2.5 0Z"],
  "1": [3, "M0 2L2 0L2 10"],
  "2": [5, "M0 2Q0.6 0 2.6 0Q5 0 5 2.6Q5 4.6 0 10L5 10"],
  "3": [5.2, "M0 1Q1 0 2.5 0Q5 0 5 2.4Q5 4.8 2.2 4.8Q5.2 4.8 5.2 7.4Q5.2 10 2.5 10Q0.8 10 0 8.8"],
  "4": [5.4, "M4 10L4 0L0 7L5.4 7"],
  "5": [5, "M5 0L0.6 0L0.2 4.6Q1.2 4 2.6 4Q5 4 5 7Q5 10 2.4 10Q0.8 10 0 8.8"],
  "6": [5, "M4.6 0.8Q3.8 0 2.6 0Q0 0 0 5.6Q0 10 2.5 10Q5 10 5 7.2Q5 4.6 2.6 4.6Q0.8 4.6 0 6"],
  "7": [5, "M0 0L5 0L1.6 10"],
  "8": [5, "M2.5 4.8Q0.2 4.8 0.2 2.4Q0.2 0 2.5 0Q4.8 0 4.8 2.4Q4.8 4.8 2.5 4.8Q0 4.8 0 7.4Q0 10 2.5 10Q5 10 5 7.4Q5 4.8 2.5 4.8Z"],
  "9": [5, "M5 4Q4.2 5.4 2.4 5.4Q0 5.4 0 2.7Q0 0 2.5 0Q5 0 5 4L5 6Q5 10 2.4 10Q1 10 0.2 9"],
  "!": [1, "M0.5 0L0.5 6.8M0.5 9.4L0.5 10"],
  "?": [4.6, "M0 1.6Q0.6 0 2.4 0Q4.6 0 4.6 2.4Q4.6 4 2.4 5.2L2.4 7M2.4 9.4L2.4 10"],
  ".": [1, "M0.5 9.4L0.5 10"],
  ",": [1.4, "M0.9 9.2L0.3 11"],
  "'": [1, "M0.5 0L0.5 2.6"],
  ":": [1, "M0.5 3L0.5 3.6M0.5 9.4L0.5 10"],
  "-": [3.6, "M0 5.4L3.6 5.4"],
  "/": [4, "M4 0L0 10"],
  "&": [6, "M6 10L1.4 3.4Q0.6 2 1.6 0.8Q2.6 0 3.6 0.8Q4.4 2 2.6 3.8L1 5.4Q0 6.6 0 8Q0 10 2.2 10Q4 10 5.6 6.6"],
};
export const starPath = (
  points,
  outer,
  inner,
  cx = 0,
  cy = 0,
  wobble = 0,
  seed = 0,
) => {
  const n = Math.max(3, Math.floor(points) || 3)
  const pts = []
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 ? inner : outer * (1 + (hash(i * 9.7 + seed) - 0.5) * wobble)
    pts.push(round(cx + Math.cos(a) * r) + " " + round(cy + Math.sin(a) * r))
  }
  return "M" + pts.join("L") + "Z"
}

/**
 * A pen loop round the headline: a tilted ellipse that goes a little more than
 * once round and spirals in, so the ends overshoot instead of meeting.
 * Fits inside a w × h box.
 */
export const loopPath = (w = 100, h = 40, turns = 1.1, tilt = -5, steps = 140) => {
  const cx = w / 2
  const cy = h / 2
  const rx = w * 0.46
  const ry = h * 0.36
  const tr = (tilt * Math.PI) / 180
  const ct = Math.cos(tr)
  const st = Math.sin(tr)
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const u = i / steps
    const a = Math.PI * 0.92 + u * turns * Math.PI * 2
    const k = 1 - 0.06 * u + 0.015 * Math.sin(a * 3)
    const x = Math.cos(a) * rx * k
    const y = Math.sin(a) * ry * k * (1 + 0.04 * u)
    pts.push(round(cx + x * ct - y * st) + " " + round(cy + x * st + y * ct))
  }
  return "M" + pts.join("L")
}


export function scriptLetters(text) {
 let x = 0;
 const letters = [];
 for (const [index,character] of [...text.toUpperCase()].entries()) {
  const glyph = GLYPHS[character];
  if (!glyph) { x += 3.2; continue; }
  const dy = round((hash(index * 7.31 + 41.1) - .5) * 1.1);
  const rotation = round((hash(index * 3.17 + 15.9) - .5) * 8);
  letters.push(`<path d="${glyph[1]}" transform="translate(${round(x)} ${dy}) rotate(${rotation} ${glyph[0]/2} 5)" style="--letter-delay:${index * 35}ms"/>`);
  x += glyph[0] + 1.9;
 }
 return `<svg class="invitation-script" viewBox="-5 -3 ${round(x + 10)} 17" aria-hidden="true" focusable="false"><g transform="skewX(-12)">${letters.join('')}</g></svg>`;
}
const hand = `<span class="invitation-hand" aria-hidden="true"><svg viewBox="0 -5 26 33" focusable="false"><path class="hand-tap" d="M10 .2V-3.4M5.6 1.4L3.3-.9M14.4 1.4L16.7-.9"/><path class="hand-palm" d="M8 13V3.5A2 2 0 0 1 12 3.5V10.5A2 2 0 0 1 16 10.5V11.5A2 2 0 0 1 20 11.5V12.5A1.8 1.8 0 0 1 23.6 12.5V19Q23.6 27 16 27H13Q9.5 27 7.6 24L3 17.4Q2 15.6 3.6 14.8Q5 14.2 6.2 15.6L8 18Z"/><path class="hand-knuckles" d="M12 10.5V15M16 11.5V15.5M20 12.5V16"/></svg></span>`;
const messages = ["LET'S BUILD IT", 'MAKE IT HAPPEN', 'CREATE SOMETHING GREAT'];
export function starburstInvitation() {
 return `<section class="invitation invitation-starburst section-space" data-starburst-invitation aria-labelledby="invitation-title"><div class="invitation-stage"><svg class="invitation-orbit" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${loopPath()}"/></svg><button class="invitation-star" type="button" disabled aria-label="Change the handwritten message" aria-describedby="invitation-message"><span class="invitation-star-pop"><svg viewBox="-52 -52 104 104" aria-hidden="true" focusable="false"><path d="${starPath(12,46,20,0,0,.22,2)}"/></svg></span><span class="invitation-sparks" aria-hidden="true"></span></button><h2 id="invitation-title">Have something<br>worth building<span class="cobalt-period">?</span></h2><div class="invitation-lettering">${messages.map((message,index)=>`<span class="invitation-message"${index?' hidden':''}>${scriptLetters(message)}</span>`).join('')}</div><span class="invitation-sr" id="invitation-message" role="status">${messages[0]}</span></div><p class="invitation-signoff">A good idea deserves a great start.</p><div class="invitation-contact"><span class="invitation-pill-wrap"><a class="invitation-pill invitation-project-link" href="/contact/">Start a project <span aria-hidden="true">↗</span></a>${hand}</span><span class="invitation-pill-wrap"><a class="invitation-pill invitation-email" href="mailto:hello@themoduloproject.com">hello@themoduloproject.com</a>${hand}</span><button class="invitation-copy" type="button" hidden aria-label="Copy email address">Copy email</button></div><p class="invitation-copy-status" role="status"></p></section>`;
}
