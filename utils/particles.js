// Pieces for the little bursts of confetti, hearts and emojis. Pure: given a
// preset and a seed it returns the same pieces every time, and the component
// (components/BurstProvider.js) only animates them.
//
// Every piece moves along a path of progress t, from 0 to 1:
//   x = x0 + dx * out(t) + sin(t * waves * 2 * pi) * sway
//   y = y0 - up * out(t) + fall * t * t        (out(t) is an ease-out)
// so a burst goes up and sideways and then falls, hearts float up, and rain
// falls from above.

export const MAX_PARTICLES = 60;

// Faces and drops that fall when something is deleted.
export const DELETE_EMOJIS = ["😢", "😭", "💧"];

export const HEART_EMOJIS = ["❤️", "💖", "💗", "💕"];
export const FALLBACK_COLORS = ["#FF6B6B", "#4D96FF", "#FFD93D", "#6BCB77", "#C77DFF"];

// The same seed gives the same sequence of numbers between 0 and 1.
export const seededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const between = (random, min, max) => min + (max - min) * random();
const pick = (random, list) => list[Math.floor(random() * list.length)];
const sign = (random) => (random() < 0.5 ? -1 : 1);

export const PRESETS = {
  confetti: { count: 30 }, // colored paper out of one point
  rain: { count: 44 }, // colored paper falling over the whole screen
  emojiRain: { count: 14 }, // emojis falling over the whole screen
  hearts: { count: 9 }, // emojis floating up
  emoji: { count: 8 }, // emojis out of one point
};

const paper = (random, colors, index) => {
  const square = random() < 0.5;
  const size = between(random, 6, 11);
  return {
    glyph: null,
    color: colors[index % colors.length],
    w: size,
    h: square ? size : size * 1.7,
    round: random() < 0.25,
  };
};

const glyph = (random, emojis, min, max) => ({
  glyph: pick(random, emojis),
  color: null,
  w: between(random, min, max),
  h: 0,
  round: false,
});

// `width` and `height` are the screen: rain (of paper or of emojis) spreads over the first and falls
// across the second. Returns at most MAX_PARTICLES pieces.
export const makeParticles = (
  preset,
  { count, seed = 1, emojis, colors, width = 360, height = 640 } = {},
) => {
  const settings = PRESETS[preset];
  if (!settings) return [];
  const random = seededRandom(seed);
  const total = Math.min(MAX_PARTICLES, Math.max(0, Math.round(count ?? settings.count)));
  const palette = colors?.length ? colors : FALLBACK_COLORS;
  const symbols = emojis?.length ? emojis : preset === "hearts" ? HEART_EMOJIS : ["✨"];

  return Array.from({ length: total }, (_, index) => {
    const base = { id: index, x0: 0, y0: 0, sway: 0, waves: 1 };

    if (preset === "confetti") {
      return {
        ...base,
        ...paper(random, palette, index),
        dx: sign(random) * between(random, 50, 170),
        up: between(random, 90, 230),
        fall: between(random, 120, 260),
        rotate: sign(random) * between(random, 360, 900),
        delay: between(random, 0, 140),
        duration: between(random, 1100, 1700),
      };
    }
    if (preset === "rain") {
      return {
        ...base,
        ...paper(random, palette, index),
        x0: between(random, -width / 2, width / 2),
        y0: -between(random, 30, 140),
        dx: sign(random) * between(random, 0, 30),
        up: 0,
        fall: height + 220,
        sway: between(random, 8, 26),
        waves: between(random, 1, 3),
        rotate: sign(random) * between(random, 540, 1080),
        delay: between(random, 0, 900),
        duration: between(random, 2200, 3600),
      };
    }
    if (preset === "emojiRain") {
      return {
        ...base,
        ...glyph(random, symbols, 22, 34),
        x0: between(random, -width / 2, width / 2),
        y0: -between(random, 30, 140),
        dx: sign(random) * between(random, 0, 20),
        up: 0,
        fall: height + 220,
        sway: between(random, 6, 18),
        waves: between(random, 1, 2),
        rotate: sign(random) * between(random, 10, 30),
        delay: between(random, 0, 1200),
        duration: between(random, 2400, 3800),
      };
    }
    if (preset === "hearts") {
      return {
        ...base,
        ...glyph(random, symbols, 16, 28),
        dx: sign(random) * between(random, 10, 50),
        up: between(random, 110, 230),
        fall: 0,
        sway: between(random, 8, 22),
        waves: between(random, 1, 2),
        rotate: sign(random) * between(random, 5, 25),
        delay: between(random, 0, 450),
        duration: between(random, 1300, 2000),
      };
    }
    return {
      ...base,
      ...glyph(random, symbols, 18, 28),
      dx: sign(random) * between(random, 30, 110),
      up: between(random, 70, 160),
      fall: between(random, 60, 140),
      rotate: sign(random) * between(random, 10, 40),
      delay: between(random, 0, 120),
      duration: between(random, 900, 1300),
    };
  });
};

// How long a set of pieces takes to finish, so the layer can remove it.
export const burstLength = (particles) =>
  particles.reduce((end, piece) => Math.max(end, piece.delay + piece.duration), 0);
