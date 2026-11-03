import { MAX_PHOTO_LENGTH, isAcceptablePhoto, isPhotoAvatar } from "../avatars";

describe("avatars", () => {
  it("tells a photo from a drawn avatar", () => {
    expect(isPhotoAvatar("data:image/jpeg;base64,AAAA")).toBe(true);
    expect(isPhotoAvatar("Mujer feliz.png")).toBe(false);
    expect(isPhotoAvatar(null)).toBe(false);
    expect(isPhotoAvatar(undefined)).toBe(false);
  });

  it("refuses a photo that is too long", () => {
    const small = "data:image/jpeg;base64," + "A".repeat(1000);
    const huge = "data:image/jpeg;base64," + "A".repeat(MAX_PHOTO_LENGTH);
    expect(isAcceptablePhoto(small)).toBe(true);
    expect(isAcceptablePhoto(huge)).toBe(false);
    expect(isAcceptablePhoto("Mujer feliz.png")).toBe(false);
  });
});

const makeContext = (base64 = "QUJD") => {
  const calls = [];
  const context = {
    crop: jest.fn((rect) => {
      calls.push(["crop", rect]);
      return context;
    }),
    resize: jest.fn((size) => {
      calls.push(["resize", size]);
      return context;
    }),
    renderAsync: jest.fn().mockResolvedValue({
      saveAsync: jest.fn().mockResolvedValue({ uri: "file://out.jpg", base64 }),
    }),
  };
  return { context, calls };
};

const makeModules = ({ picked, permission = { granted: true }, base64 } = {}) => {
  const { context, calls } = makeContext(base64);
  return {
    calls,
    picker: {
      requestCameraPermissionsAsync: jest.fn().mockResolvedValue(permission),
      launchCameraAsync: jest.fn().mockResolvedValue(picked),
      launchImageLibraryAsync: jest.fn().mockResolvedValue(picked),
    },
    manipulator: {
      ImageManipulator: { manipulate: jest.fn(() => context) },
      SaveFormat: { JPEG: "jpeg" },
    },
  };
};

// The service remembers whether the native modules could be loaded, so every
// test gets a fresh copy with its own platform and modules.
const loadService = ({ os = "android", native = makeModules(), missing = false } = {}) => {
  jest.resetModules();
  const { Platform } = require("react-native");
  Platform.OS = os;
  if (missing) {
    jest.doMock("expo-image-picker", () => {
      throw new Error("Cannot find native module 'ExponentImagePicker'");
    });
  } else {
    jest.doMock("expo-image-picker", () => native.picker);
  }
  jest.doMock("expo-image-manipulator", () => native.manipulator);
  return { service: require("../photoService"), native };
};

const asset = (width, height) => ({ uri: "file://in.jpg", width, height });

describe("squareActions", () => {
  const { squareActions } = loadService().service;

  it("crops the center of a wide picture and then shrinks it", () => {
    expect(squareActions(4000, 3000, 192)).toEqual([
      { crop: { originX: 500, originY: 0, width: 3000, height: 3000 } },
      { resize: { width: 192, height: 192 } },
    ]);
  });

  it("crops the center of a tall picture", () => {
    expect(squareActions(1000, 1500, 192)[0]).toEqual({
      crop: { originX: 0, originY: 250, width: 1000, height: 1000 },
    });
  });

  it("only shrinks a picture that is already square or has no size", () => {
    expect(squareActions(800, 800, 192)).toEqual([{ resize: { width: 192, height: 192 } }]);
    expect(squareActions(undefined, undefined, 192)).toHaveLength(1);
  });
});

describe("photoService", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("turns a gallery picture into a small JPEG data URI", async () => {
    const native = makeModules({ picked: { canceled: false, assets: [asset(4000, 3000)] } });
    const { service } = loadService({ native });
    const result = await service.choosePhoto();
    expect(result).toEqual({ success: true, photo: "data:image/jpeg;base64,QUJD" });
    expect(native.calls).toEqual([
      ["crop", { originX: 500, originY: 0, width: 3000, height: 3000 }],
      ["resize", { width: 192, height: 192 }],
    ]);
    expect(native.picker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
  });

  it("asks for the camera first and takes the photo", async () => {
    const native = makeModules({ picked: { canceled: false, assets: [asset(900, 900)] } });
    const { service } = loadService({ native });
    expect((await service.takePhoto()).success).toBe(true);
    expect(native.picker.requestCameraPermissionsAsync).toHaveBeenCalled();
    expect(native.picker.launchCameraAsync).toHaveBeenCalled();
  });

  it("explains how to allow the camera when it is denied", async () => {
    const native = makeModules({ permission: { granted: false } });
    const { service } = loadService({ native });
    const result = await service.takePhoto();
    expect(result).toEqual({ success: false, error: service.CAMERA_DENIED_MESSAGE });
    expect(native.picker.launchCameraAsync).not.toHaveBeenCalled();
  });

  it("stays quiet when the person cancels", async () => {
    const native = makeModules({ picked: { canceled: true, assets: null } });
    const { service } = loadService({ native });
    expect(await service.choosePhoto()).toEqual({ success: false, cancelled: true });
  });

  it("has no camera on web", async () => {
    const { service } = loadService({ os: "web" });
    const result = await service.takePhoto();
    expect(result).toEqual({ success: false, error: service.CAMERA_UNAVAILABLE_MESSAGE });
  });

  it("refuses a result that is too big to save", async () => {
    const native = makeModules({
      picked: { canceled: false, assets: [asset(800, 800)] },
      base64: "A".repeat(200000),
    });
    const { service } = loadService({ native });
    const result = await service.choosePhoto();
    expect(result).toEqual({ success: false, error: service.PHOTO_FAILED_MESSAGE });
  });

  it("gives a message when the picture cannot be processed", async () => {
    const native = makeModules({ picked: { canceled: false, assets: [asset(800, 800)] } });
    native.manipulator.ImageManipulator.manipulate = jest.fn(() => {
      throw new Error("decode failed");
    });
    const { service } = loadService({ native });
    expect(await service.choosePhoto()).toEqual({
      success: false,
      error: service.PHOTO_FAILED_MESSAGE,
    });
  });

  it("gives a message instead of crashing when the module is missing", async () => {
    const { service } = loadService({ missing: true });
    expect((await service.choosePhoto()).success).toBe(false);
  });
});
