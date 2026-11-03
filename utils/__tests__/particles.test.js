import {
  FALLBACK_COLORS,
  HEART_EMOJIS,
  MAX_PARTICLES,
  PRESETS,
  burstLength,
  makeParticles,
  seededRandom,
} from "../particles";

describe("seededRandom", () => {
  it("repeats the same numbers for the same seed", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("differs between seeds and stays between 0 and 1", () => {
    const a = seededRandom(1);
    const b = seededRandom(2);
    expect(a()).not.toBe(b());
    const random = seededRandom(7);
    for (let i = 0; i < 200; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("makeParticles", () => {
  it("is deterministic and gives each preset its own count", () => {
    for (const preset of Object.keys(PRESETS)) {
      const first = makeParticles(preset, { seed: 5 });
      expect(first).toHaveLength(PRESETS[preset].count);
      expect(first).toEqual(makeParticles(preset, { seed: 5 }));
    }
    expect(makeParticles("confetti", { seed: 1 })).not.toEqual(
      makeParticles("confetti", { seed: 2 }),
    );
  });

  it("caps the number of pieces and ignores unknown presets", () => {
    expect(makeParticles("confetti", { count: 500 })).toHaveLength(MAX_PARTICLES);
    expect(makeParticles("confetti", { count: 0 })).toHaveLength(0);
    expect(makeParticles("fireworks")).toEqual([]);
  });

  it("makes colored paper from the given colors, or a default set", () => {
    const pieces = makeParticles("confetti", { colors: ["#111111", "#222222"] });
    expect(new Set(pieces.map((p) => p.color))).toEqual(new Set(["#111111", "#222222"]));
    expect(pieces.every((p) => p.glyph === null && p.w > 0 && p.h > 0)).toBe(true);
    const plain = makeParticles("confetti");
    expect(plain.every((p) => FALLBACK_COLORS.includes(p.color))).toBe(true);
  });

  it("floats hearts up without falling back down", () => {
    const hearts = makeParticles("hearts", { seed: 3 });
    expect(hearts.every((p) => HEART_EMOJIS.includes(p.glyph))).toBe(true);
    expect(hearts.every((p) => p.up > 0 && p.fall === 0)).toBe(true);
  });

  it("uses the emojis it is given", () => {
    const pieces = makeParticles("emoji", { emojis: ["🔥", "🤯"], count: 20 });
    expect(new Set(pieces.map((p) => p.glyph))).toEqual(new Set(["🔥", "🤯"]));
  });

  it("makes rain that starts above the screen, spreads across it and falls past it", () => {
    const rain = makeParticles("rain", { width: 400, height: 800, seed: 9 });
    for (const piece of rain) {
      expect(piece.y0).toBeLessThan(0);
      expect(Math.abs(piece.x0)).toBeLessThanOrEqual(200);
      expect(piece.fall).toBeGreaterThan(800);
    }
    expect(Math.min(...rain.map((p) => p.x0))).toBeLessThan(0);
    expect(Math.max(...rain.map((p) => p.x0))).toBeGreaterThan(0);
  });

  it("keeps every piece moving for a positive time", () => {
    for (const preset of Object.keys(PRESETS)) {
      for (const piece of makeParticles(preset, { seed: 11 })) {
        expect(piece.duration).toBeGreaterThan(0);
        expect(piece.delay).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("burstLength", () => {
  it("is when the last piece ends", () => {
    expect(burstLength([{ delay: 100, duration: 900 }, { delay: 0, duration: 1500 }])).toBe(1500);
    expect(burstLength([])).toBe(0);
  });
});
