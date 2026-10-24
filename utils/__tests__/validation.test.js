import { translateApiError } from "../apiErrors";
import {
  isValidEmail,
  toDateInput,
  validateBirthDate,
  validateName,
  validatePhone,
  validateProfile,
} from "../validation";

describe("translateApiError", () => {
  it("translates the messages the API sends", () => {
    expect(translateApiError("Invalid credentials", 401)).toBe(
      "El correo o la contraseña no son correctos.",
    );
    expect(translateApiError("Email already registered", 409)).toBe(
      "Ese correo ya tiene una cuenta.",
    );
    expect(translateApiError("pain_level must be between 1 and 10", 400)).toBe(
      "La intensidad debe estar entre 1 y 10.",
    );
  });

  it("matches ignoring case and extra wording", () => {
    expect(
      translateApiError("Cannot delete pain type because it is being used in existing records", 409),
    ).toBe("No se puede eliminar: ese tipo de dolor ya tiene registros.");
    expect(translateApiError("A PAIN TYPE WITH THIS NAME ALREADY EXISTS", 409)).toBe(
      "Ya existe un tipo de dolor con ese nombre.",
    );
  });

  it("never shows unknown English: it falls back to the status", () => {
    expect(translateApiError("Something odd", 400)).toBe("Revisa los datos e inténtalo de nuevo.");
    expect(translateApiError("Something odd", 503)).toMatch(/servidor/);
    expect(translateApiError("", undefined)).toMatch(/inesperado/);
    expect(translateApiError(undefined, 404)).toBe("No encontramos lo que buscabas.");
  });
});

describe("isValidEmail", () => {
  it("accepts normal addresses and rejects broken ones", () => {
    expect(isValidEmail("ana@example.com")).toBe(true);
    expect(isValidEmail("  ana@example.com ")).toBe(true);
    expect(isValidEmail("ana@")).toBe(false);
    expect(isValidEmail("ana example@x.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("validateName", () => {
  it("requires a non-empty name within the limit", () => {
    expect(validateName("   ")).toBe("El nombre es obligatorio.");
    expect(validateName("Ana")).toBe("");
    expect(validateName("x".repeat(61))).toMatch(/60 caracteres/);
    expect(validateName("", { label: "El dolor" })).toBe("El dolor es obligatorio.");
  });
});

describe("validatePhone", () => {
  it("is optional and checks digits", () => {
    expect(validatePhone("")).toBe("");
    expect(validatePhone("+52 (55) 1234-5678")).toBe("");
    expect(validatePhone("12345")).toMatch(/teléfono válido/);
    expect(validatePhone("abc1234567")).toMatch(/teléfono válido/);
    expect(validatePhone("1".repeat(16))).toMatch(/teléfono válido/);
  });
});

describe("validateBirthDate", () => {
  const now = new Date(2026, 9, 24);

  it("is optional", () => {
    expect(validateBirthDate("", now)).toBe("");
  });

  it("requires the AAAA-MM-DD format and a real date", () => {
    expect(validateBirthDate("1990-04-23", now)).toBe("");
    expect(validateBirthDate("23/04/1990", now)).toMatch(/AAAA-MM-DD/);
    expect(validateBirthDate("1990-02-31", now)).toBe("Esa fecha no existe.");
    expect(validateBirthDate("1850-01-01", now)).toBe("Esa fecha no existe.");
  });

  it("rejects future dates", () => {
    expect(validateBirthDate("2026-10-25", now)).toMatch(/futura/);
    expect(validateBirthDate("2026-10-24", now)).toBe("");
  });
});

describe("validateProfile", () => {
  it("returns only the fields that have a problem", () => {
    expect(validateProfile({ name: "Ana", phone: "", birthDate: "" })).toEqual({});
    expect(
      validateProfile({ name: "", phone: "12", birthDate: "ayer" }),
    ).toEqual({
      name: "El nombre es obligatorio.",
      phone: expect.stringMatching(/teléfono/),
      birthDate: expect.stringMatching(/AAAA-MM-DD/),
    });
  });
});

describe("toDateInput", () => {
  it("keeps the AAAA-MM-DD part of what the API returns", () => {
    expect(toDateInput("1990-04-23T00:00:00.000Z")).toBe("1990-04-23");
    expect(toDateInput("1990-04-23")).toBe("1990-04-23");
    expect(toDateInput(null)).toBe("");
    expect(toDateInput("ayer")).toBe("");
  });
});
