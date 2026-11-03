import { Platform } from "react-native";
import { isAcceptablePhoto } from "./avatars";

// Taking a photo or choosing one from the gallery for a person's avatar. The
// picture is cropped to a square, shrunk and saved as a small JPEG data URI.

export const PHOTO_SIZE = 192;
const PHOTO_QUALITY = 0.7;

export const CAMERA_DENIED_MESSAGE =
  "Para tomar la foto, permite el acceso a la cámara de DailyAches en los ajustes del teléfono.";
export const CAMERA_UNAVAILABLE_MESSAGE = "La cámara no está disponible aquí.";
export const PHOTO_FAILED_MESSAGE =
  "No se pudo preparar la foto. Prueba con otra o elige un avatar.";

// expo-image-picker and expo-image-manipulator are native modules: they are
// loaded when first needed, never at the top of the file, so a build that lacks
// one gives a message instead of crashing the app at start.
let modules; // undefined = not tried yet, null = not available
const getModules = () => {
  if (modules !== undefined) return modules;
  try {
    modules = {
      picker: require("expo-image-picker"),
      manipulator: require("expo-image-manipulator"),
    };
  } catch (error) {
    console.warn("Photos are not available:", error.message);
    modules = null;
  }
  return modules;
};

// The crop (centered square) and resize that turn any picture into PHOTO_SIZE.
export const squareActions = (width, height, target = PHOTO_SIZE) => {
  const actions = [];
  if (width > 0 && height > 0 && width !== height) {
    const side = Math.min(width, height);
    actions.push({
      crop: {
        originX: Math.floor((width - side) / 2),
        originY: Math.floor((height - side) / 2),
        width: side,
        height: side,
      },
    });
  }
  actions.push({ resize: { width: target, height: target } });
  return actions;
};

const toAvatar = async (native, asset) => {
  const { ImageManipulator, SaveFormat } = native.manipulator;
  let context = ImageManipulator.manipulate(asset.uri);
  for (const action of squareActions(asset.width, asset.height)) {
    context = action.crop ? context.crop(action.crop) : context.resize(action.resize);
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: PHOTO_QUALITY,
    base64: true,
  });
  const dataUri = `data:image/jpeg;base64,${saved.base64}`;
  return isAcceptablePhoto(dataUri) ? dataUri : null;
};

// `launch` may answer with the `denied` message when a permission is missing.
// Result: { success, photo } | { success: false, cancelled } | { success: false, error }.
const pick = async (launch, denied = null) => {
  const native = getModules();
  if (!native) return { success: false, error: PHOTO_FAILED_MESSAGE };
  try {
    const result = await launch(native.picker);
    if (denied && result === denied) return { success: false, error: denied };
    if (result.canceled || !result.assets?.length) {
      return { success: false, cancelled: true };
    }
    const photo = await toAvatar(native, result.assets[0]);
    return photo
      ? { success: true, photo }
      : { success: false, error: PHOTO_FAILED_MESSAGE };
  } catch (error) {
    console.warn("Could not prepare the photo:", error.message);
    return { success: false, error: PHOTO_FAILED_MESSAGE };
  }
};

const options = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 1,
};

export const takePhoto = () => {
  if (Platform.OS === "web") {
    return Promise.resolve({ success: false, error: CAMERA_UNAVAILABLE_MESSAGE });
  }
  return pick(async (picker) => {
    const permission = await picker.requestCameraPermissionsAsync();
    if (!permission.granted) return CAMERA_DENIED_MESSAGE;
    return picker.launchCameraAsync(options);
  }, CAMERA_DENIED_MESSAGE);
};

export const choosePhoto = () =>
  pick((picker) => picker.launchImageLibraryAsync(options));
