import {
  DEFAULT_PAIN_LEVEL,
  PAIN_LEVELS,
  getLastPainTypeForPerson,
  getPainLevelLabel,
  normalizePainLevel,
} from "../painLevel";

describe("pain level scale", () => {
  it("covers 1 to 10", () => {
    expect(PAIN_LEVELS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("labels each band", () => {
    expect(getPainLevelLabel(1)).toBe("Leve");
    expect(getPainLevelLabel(3)).toBe("Leve");
    expect(getPainLevelLabel(4)).toBe("Moderado");
    expect(getPainLevelLabel(6)).toBe("Moderado");
    expect(getPainLevelLabel(7)).toBe("Intenso");
    expect(getPainLevelLabel(8)).toBe("Intenso");
    expect(getPainLevelLabel(9)).toBe("Muy intenso");
    expect(getPainLevelLabel(10)).toBe("Muy intenso");
  });
});

describe("normalizePainLevel", () => {
  it("clamps to the range the API accepts", () => {
    expect(normalizePainLevel(0)).toBe(1);
    expect(normalizePainLevel(11)).toBe(10);
    expect(normalizePainLevel(7.6)).toBe(8);
  });

  it("falls back to the default for unusable values", () => {
    expect(normalizePainLevel(undefined)).toBe(DEFAULT_PAIN_LEVEL);
    expect(normalizePainLevel("abc")).toBe(DEFAULT_PAIN_LEVEL);
    expect(normalizePainLevel(null)).toBe(DEFAULT_PAIN_LEVEL);
    expect(normalizePainLevel("")).toBe(DEFAULT_PAIN_LEVEL);
  });
});

describe("getLastPainTypeForPerson", () => {
  const painTypes = [
    { id: "1", name: "Cabeza" },
    { id: "2", name: "Espalda" },
  ];
  const records = [
    { personId: "7", painTypeId: "1", pain: "Cabeza", createdAt: "2026-10-01T10:00:00Z" },
    { personId: "7", painTypeId: "2", pain: "Espalda", createdAt: "2026-10-03T10:00:00Z" },
    { personId: "8", painTypeId: "1", pain: "Cabeza", createdAt: "2026-10-05T10:00:00Z" },
  ];

  it("returns the most recent pain type for that person only", () => {
    expect(getLastPainTypeForPerson(records, "7", painTypes)).toBe(painTypes[1]);
    expect(getLastPainTypeForPerson(records, "8", painTypes)).toBe(painTypes[0]);
  });

  it("returns null without records, person or a matching pain type", () => {
    expect(getLastPainTypeForPerson(records, "99", painTypes)).toBeNull();
    expect(getLastPainTypeForPerson(records, null, painTypes)).toBeNull();
    expect(getLastPainTypeForPerson([], "7", painTypes)).toBeNull();
    expect(getLastPainTypeForPerson(records, "7", [])).toBeNull();
  });

  it("falls back to the pain name when the id no longer matches", () => {
    const old = [{ personId: "7", painTypeId: "404", pain: "Cabeza", createdAt: "2026-10-01T10:00:00Z" }];
    expect(getLastPainTypeForPerson(old, "7", painTypes)).toBe(painTypes[0]);
  });
});
