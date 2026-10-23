import { mapPainType, mapPerson, mapRecord } from "../apiMappers";

describe("mapPerson", () => {
  it("converts snake_case fields and stringifies the id", () => {
    expect(
      mapPerson({
        id: 4,
        name: "Ana",
        relation: "hermana",
        image_url: "ana.png",
        phone: "555",
        whatsapp_enabled: true,
      }),
    ).toEqual({
      id: "4",
      name: "Ana",
      relationship: "hermana",
      avatar: "ana.png",
      phone: "555",
      whatsappEnabled: true,
    });
  });

  it("applies defaults for missing optional fields", () => {
    const person = mapPerson({ id: "7", name: "Luz" });
    expect(person.relationship).toBe("");
    expect(person.avatar).toBe("Mujer feliz.png");
    expect(person.phone).toBe("");
    expect(person.whatsappEnabled).toBe(false);
  });
});

describe("mapPainType", () => {
  it("maps image_url and defaults it to null", () => {
    expect(mapPainType({ id: 1, name: "Cabeza", image_url: "c.png" })).toEqual({
      id: "1",
      name: "Cabeza",
      image: "c.png",
    });
    expect(mapPainType({ id: 2, name: "Otro" }).image).toBeNull();
  });
});

describe("mapRecord", () => {
  it("uses the enriched fields returned by /records", () => {
    expect(
      mapRecord({
        id: 13,
        person_id: 5,
        pain_type_id: 12,
        pain_level: 5,
        notes: "x",
        created_at: "2026-10-22T22:10:33.715Z",
        person_name: "P",
        pain_type_name: "Dolor",
      }),
    ).toEqual({
      id: "13",
      personId: "5",
      painTypeId: "12",
      pain: "Dolor",
      personName: "P",
      painLevel: 5,
      notes: "x",
      createdAt: "2026-10-22T22:10:33.715Z",
    });
  });
});
