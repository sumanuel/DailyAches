import { translateApiError } from "../apiErrors";

describe("translateApiError for the account endpoints", () => {
  it.each([
    ["Current password is incorrect", 403, "La contraseña actual no es correcta."],
    ["Password is incorrect", 403, "La contraseña no es correcta."],
    [
      "new password must be different from the current one",
      400,
      "La nueva contraseña debe ser distinta de la actual.",
    ],
    [
      "Cannot delete the only admin account",
      409,
      "No puedes eliminar la única cuenta de administrador.",
    ],
    ["password is required", 400, "Escribe tu contraseña."],
  ])("%s", (message, status, expected) => {
    expect(translateApiError(message, status)).toBe(expected);
  });

  it("falls back to the status for unknown English messages", () => {
    expect(translateApiError("Something odd", 403)).toBe("No tienes permiso para hacer esto.");
  });
});
