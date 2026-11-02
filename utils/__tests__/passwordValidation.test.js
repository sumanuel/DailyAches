import {
  PASSWORD_MIN_LENGTH,
  validatePasswordChange,
  validatePasswordForDeletion,
} from "../validation";

describe("validatePasswordChange", () => {
  it("accepts a proper change", () => {
    expect(
      validatePasswordChange({ current: "secret1", next: "newsecret", confirm: "newsecret" }),
    ).toEqual({});
  });

  it("asks for every empty field", () => {
    expect(Object.keys(validatePasswordChange({}))).toEqual(["current", "next", "confirm"]);
  });

  it("requires the same minimum length as the API", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(6);
    const errors = validatePasswordChange({ current: "secret1", next: "abc", confirm: "abc" });
    expect(errors.next).toMatch(/al menos 6/);
    expect(errors.confirm).toBeUndefined();
  });

  it("rejects the same password and a mismatching confirmation", () => {
    expect(
      validatePasswordChange({ current: "secret1", next: "secret1", confirm: "secret1" }).next,
    ).toMatch(/distinta/);
    expect(
      validatePasswordChange({ current: "secret1", next: "newsecret", confirm: "other" }).confirm,
    ).toMatch(/no coinciden/);
  });

  it("ignores surrounding spaces, as the API does", () => {
    expect(
      validatePasswordChange({ current: " secret1 ", next: " newsecret ", confirm: "newsecret" }),
    ).toEqual({});
  });
});

describe("validatePasswordForDeletion", () => {
  it("asks for the password to delete the account", () => {
    expect(validatePasswordForDeletion("")).toMatch(/Escribe tu contraseña/);
    expect(validatePasswordForDeletion("   ")).not.toBe("");
    expect(validatePasswordForDeletion("secret1")).toBe("");
  });
});
