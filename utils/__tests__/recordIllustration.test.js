import { getRecordIllustrationKey } from "../../constants/illustrations";

const painTypesById = {
  7: { id: "7", name: "Muñeca", image: "Piernas.png" },
  8: { id: "8", name: "Cabeza", image: null },
};

describe("getRecordIllustrationKey", () => {
  it("uses the icon chosen for the pain type, whatever its name", () => {
    const record = { painTypeId: "7", pain: "Muñeca" };
    expect(getRecordIllustrationKey(record, painTypesById)).toBe("Piernas.png");
  });

  it("gives two pain types two different icons", () => {
    const a = getRecordIllustrationKey({ painTypeId: "7", pain: "Muñeca" }, painTypesById);
    const b = getRecordIllustrationKey(
      { painTypeId: "9", pain: "Resaca", image: "Resaca.png" },
      painTypesById,
    );
    expect(a).not.toBe(b);
    expect(b).toBe("Resaca.png");
  });

  it("follows a change of icon made after the record was saved", () => {
    const record = { painTypeId: "7", pain: "Muñeca", image: "Cabeza.png" };
    expect(getRecordIllustrationKey(record, painTypesById)).toBe("Piernas.png");
  });

  it("falls back to the icon the API sent with the record", () => {
    const record = { painTypeId: "99", pain: "Rara", image: "Presion.png" };
    expect(getRecordIllustrationKey(record, painTypesById)).toBe("Presion.png");
  });

  it("falls back to what the name maps to, and then to the default", () => {
    expect(
      getRecordIllustrationKey({ painTypeId: "98", pain: "Dolor de cabeza" }, painTypesById),
    ).toBe("DolorDeCabeza.png");
    expect(getRecordIllustrationKey({ pain: "Algo sin icono" })).toBe("Mujer feliz.png");
    expect(getRecordIllustrationKey(undefined)).toBe("Mujer feliz.png");
  });
});
