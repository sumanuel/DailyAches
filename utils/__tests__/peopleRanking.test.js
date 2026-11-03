import { MEDALS, rankPeopleByRecords } from "../peopleRanking";

const people = (...ids) => ids.map((id) => ({ id }));
const records = (personId, count) =>
  Array.from({ length: count }, () => ({ personId }));

describe("rankPeopleByRecords", () => {
  it("gives gold, silver and bronze by number of records", () => {
    const places = rankPeopleByRecords(people("1", "2", "3", "4"), [
      ...records("1", 2),
      ...records("2", 9),
      ...records("3", 5),
      ...records("4", 1),
    ]);
    expect([...places.entries()]).toEqual([
      ["1", 3],
      ["2", 1],
      ["3", 2],
    ]);
  });

  it("shares a place on a tie and skips the next one", () => {
    const places = rankPeopleByRecords(people("1", "2", "3"), [
      ...records("1", 4),
      ...records("2", 4),
      ...records("3", 1),
    ]);
    expect(places.get("1")).toBe(1);
    expect(places.get("2")).toBe(1);
    expect(places.get("3")).toBe(3);
  });

  it("leaves out people without records", () => {
    const places = rankPeopleByRecords(people("1", "2"), records("1", 3));
    expect([...places.entries()]).toEqual([["1", 1]]);
  });

  it("has no podium for a single person or for no records", () => {
    expect(rankPeopleByRecords(people("1"), records("1", 5)).size).toBe(0);
    expect(rankPeopleByRecords(people("1", "2"), []).size).toBe(0);
    expect(rankPeopleByRecords(undefined, undefined).size).toBe(0);
  });

  it("matches ids whether they are numbers or strings", () => {
    const places = rankPeopleByRecords([{ id: 7 }, { id: 8 }], [{ personId: "7" }]);
    expect(places.get("7")).toBe(1);
  });

  it("has a medal and a label for each place", () => {
    for (const place of [1, 2, 3]) {
      expect(MEDALS[place].emoji).toBeTruthy();
      expect(MEDALS[place].label).toMatch(/lugar$/);
    }
  });
});
