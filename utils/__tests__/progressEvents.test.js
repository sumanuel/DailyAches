import {
  getDefaultAchievements,
  buildProgressState,
  defaultProfile,
} from "../gamification";
import {
  celebrationMessage,
  describeProgress,
  withProgressEvent,
} from "../progressEvents";

const baseUser = () => ({
  ...defaultProfile,
  points: 0,
  level: 1,
  recordsCount: 0,
  achievements: getDefaultAchievements(),
});

describe("describeProgress", () => {
  it("returns null when nothing changed", () => {
    const user = baseUser();
    expect(describeProgress(user, { ...user })).toBeNull();
  });

  it("reports the first record with its achievement and bonus points", () => {
    const prev = baseUser();
    const next = buildProgressState(prev, { recordsAdded: 1, basePoints: 10 });
    const event = describeProgress(prev, next);

    expect(event.recordSaved).toBe(true);
    expect(event.newAchievements.map((a) => a.name)).toContain("Primer Registro");
    expect(event.pointsGained).toBe(next.points - prev.points);
    expect(event.pointsGained).toBeGreaterThan(10);
  });

  it("only lists achievements that were not unlocked before", () => {
    const first = buildProgressState(baseUser(), { recordsAdded: 1, basePoints: 10 });
    const second = buildProgressState(first, { recordsAdded: 1, basePoints: 10 });
    const event = describeProgress(first, second);

    expect(event.newAchievements.map((a) => a.name)).not.toContain("Primer Registro");
  });

  it("flags a level-up", () => {
    const prev = { ...baseUser(), points: 30 };
    const next = buildProgressState(prev, { recordsAdded: 1, basePoints: 20 });
    const event = describeProgress(prev, next);

    expect(event.leveledUp).toBe(true);
    expect(event.level).toBe(next.level);
  });
});

describe("withProgressEvent", () => {
  it("leaves the user alone when there is nothing to celebrate", () => {
    const user = baseUser();
    const next = { ...user };
    expect(withProgressEvent(user, next)).toBe(next);
  });

  it("stamps an event with a new id each time", () => {
    const prev = baseUser();
    const a = withProgressEvent(prev, buildProgressState(prev, { recordsAdded: 1, basePoints: 10 }));
    const b = withProgressEvent(prev, buildProgressState(prev, { recordsAdded: 1, basePoints: 10 }));
    expect(a.progressEvent.id).toBeDefined();
    expect(b.progressEvent.id).not.toBe(a.progressEvent.id);
  });
});

describe("celebrationMessage", () => {
  const event = (overrides) => ({
    pointsGained: 10,
    newAchievements: [],
    leveledUp: false,
    recordSaved: true,
    level: 1,
    levelTitle: "Chispa",
    ...overrides,
  });

  it("says plain points for a normal record", () => {
    expect(celebrationMessage(event())).toEqual({
      kind: "points",
      icon: "✅",
      title: "+10 puntos",
      detail: "Registro guardado",
    });
  });

  it("names a single achievement", () => {
    const message = celebrationMessage(
      event({ newAchievements: [{ id: 1, name: "Primer Registro", points: 15 }], pointsGained: 25 }),
    );
    expect(message.kind).toBe("achievement");
    expect(message.title).toContain("Primer Registro");
    expect(message.detail).toBe("+25 puntos");
  });

  it("groups several achievements", () => {
    const message = celebrationMessage(
      event({
        newAchievements: [
          { id: 1, name: "A", points: 1 },
          { id: 2, name: "B", points: 1 },
        ],
      }),
    );
    expect(message.title).toBe("¡2 logros desbloqueados!");
    expect(message.detail).toContain("A · B");
  });

  it("puts a level-up above everything else", () => {
    const message = celebrationMessage(
      event({
        leveledUp: true,
        level: 2,
        levelTitle: "Observadora",
        newAchievements: [{ id: 1, name: "A", points: 1 }],
      }),
    );
    expect(message.kind).toBe("level");
    expect(message.title).toBe("¡Subiste al nivel 2!");
    expect(message.detail).toBe("Observadora · A");
  });

  it("has no detail when points come from something other than a record", () => {
    expect(celebrationMessage(event({ recordSaved: false })).detail).toBeUndefined();
  });
});
