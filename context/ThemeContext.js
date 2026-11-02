import React, { createContext, useContext, useState, useEffect } from "react";
import {
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
} from "react-native-paper";
import {
  DefaultTheme as NavigationLightTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkColors, lightColors } from "../constants/palettes";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const { LightTheme: NavigationLight, DarkTheme: NavigationDark } =
  adaptNavigationTheme({
    reactNavigationLight: NavigationLightTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

const lightTheme = {
  ...MD3LightTheme,
  roundness: 24,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    displaySmall: { ...MD3LightTheme.fonts.displaySmall, fontSize: 34 },
    headlineSmall: { ...MD3LightTheme.fonts.headlineSmall, fontSize: 26 },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontSize: 21 },
    titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontSize: 17 },
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontSize: 15 },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontSize: 14 },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontSize: 13 },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontSize: 12 },
    labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontSize: 11 },
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  roundness: 24,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    displaySmall: { ...MD3DarkTheme.fonts.displaySmall, fontSize: 34 },
    headlineSmall: { ...MD3DarkTheme.fonts.headlineSmall, fontSize: 26 },
    titleLarge: { ...MD3DarkTheme.fonts.titleLarge, fontSize: 21 },
    titleMedium: { ...MD3DarkTheme.fonts.titleMedium, fontSize: 17 },
    bodyLarge: { ...MD3DarkTheme.fonts.bodyLarge, fontSize: 15 },
    bodyMedium: { ...MD3DarkTheme.fonts.bodyMedium, fontSize: 14 },
    labelLarge: { ...MD3DarkTheme.fonts.labelLarge, fontSize: 13 },
    labelMedium: { ...MD3DarkTheme.fonts.labelMedium, fontSize: 12 },
    labelSmall: { ...MD3DarkTheme.fonts.labelSmall, fontSize: 11 },
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const theme = await AsyncStorage.getItem("theme");
        if (active && theme) {
          setIsDarkMode(JSON.parse(theme));
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const saveTheme = async (theme) => {
    try {
      await AsyncStorage.setItem("theme", JSON.stringify(theme));
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveTheme(newTheme);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigationBase = isDarkMode ? NavigationDark : NavigationLight;
  const navigationTheme = {
    ...navigationBase,
    colors: {
      ...navigationBase.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outlineVariant,
      notification: theme.colors.tertiary,
    },
  };

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleTheme, theme, navigationTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
