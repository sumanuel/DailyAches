import { Alert, Platform } from "react-native";
import { confirmAction, showMessage } from "../confirm";

const options = { title: "Eliminar", message: "¿Seguro?" };

describe("confirmAction", () => {
  afterEach(() => {
    Platform.OS = "ios";
    jest.restoreAllMocks();
    delete global.window;
  });

  it("uses the browser confirm on web", async () => {
    Platform.OS = "web";
    global.window = { confirm: jest.fn(() => true) };

    await expect(confirmAction(options)).resolves.toBe(true);
    expect(global.window.confirm).toHaveBeenCalledWith("Eliminar\n\n¿Seguro?");

    global.window.confirm.mockReturnValue(false);
    await expect(confirmAction(options)).resolves.toBe(false);
  });

  it("resolves with the button the user presses on native", async () => {
    jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) =>
      buttons.find((b) => b.text === "Eliminar").onPress(),
    );
    await expect(confirmAction(options)).resolves.toBe(true);

    Alert.alert.mockImplementation((title, message, buttons) =>
      buttons.find((b) => b.style === "cancel").onPress(),
    );
    await expect(confirmAction(options)).resolves.toBe(false);
  });

  it("treats dismissing the dialog as a no", async () => {
    jest.spyOn(Alert, "alert").mockImplementation((t, m, b, opts) => opts.onDismiss());
    await expect(confirmAction(options)).resolves.toBe(false);
  });

  it("lets the button label be changed", async () => {
    const spy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    confirmAction({ ...options, confirmText: "Eliminar todo" });
    expect(spy.mock.calls[0][2].map((b) => b.text)).toEqual(["Cancelar", "Eliminar todo"]);
  });
});

describe("showMessage", () => {
  afterEach(() => {
    Platform.OS = "ios";
    jest.restoreAllMocks();
    delete global.window;
  });

  it("alerts through the browser on web and through Alert on native", () => {
    Platform.OS = "web";
    global.window = { alert: jest.fn() };
    showMessage("Aviso", "Texto");
    expect(global.window.alert).toHaveBeenCalledWith("Aviso\n\nTexto");

    Platform.OS = "ios";
    const spy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    showMessage("Aviso", "Texto");
    expect(spy).toHaveBeenCalledWith("Aviso", "Texto");
  });
});
