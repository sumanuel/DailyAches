import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "onboardingSeen";

// The guide is shown once per device. Any storage problem counts as "seen":
// a broken disk must never trap someone in the guide.
export const loadOnboardingSeen = async () => {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEY)) === "true";
  } catch {
    return true;
  }
};

export const saveOnboardingSeen = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
  } catch (error) {
    console.warn("Could not save onboarding state:", error?.message);
  }
};
