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
    primary: "#FF6B6B",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FFD9D6",
    onPrimaryContainer: "#7A2331",
    secondary: "#5C7CFA",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#DDE4FF",
    onSecondaryContainer: "#23337A",
    tertiary: "#35C6A5",
    onTertiary: "#0C3B32",
    tertiaryContainer: "#D9FAF1",
    onTertiaryContainer: "#0D4D40",
    background: "#FFF7F3",
    onBackground: "#2E2430",
    surface: "#FFFCFA",
    onSurface: "#2E2430",
    surfaceVariant: "#FFF0E8",
    onSurfaceVariant: "#786B75",
    outline: "#E9CEC4",
    outlineVariant: "#F3DDD5",
    error: "#D95D39",
    heroBackdrop: "#FFE7D6",
    accentMint: "#D8F7E8",
    accentSun: "#FFE7A8",
    accentBerry: "#F3D8FF",
    accentSky: "#DCEBFF",
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
    primary: "#FF8B8B",
    onPrimary: "#4D1E28",
    primaryContainer: "#6A3040",
    onPrimaryContainer: "#FFD9D6",
    secondary: "#9CB1FF",
    onSecondary: "#1A265E",
    secondaryContainer: "#2B3B7E",
    onSecondaryContainer: "#DDE4FF",
    tertiary: "#69E2C6",
    onTertiary: "#123C34",
    tertiaryContainer: "#20574C",
    onTertiaryContainer: "#D9FAF1",
    background: "#1E1721",
    onBackground: "#F8EDEB",
    surface: "#2A202D",
    onSurface: "#F8EDEB",
    surfaceVariant: "#37293A",
    onSurfaceVariant: "#D8C0CC",
    outline: "#715564",
    outlineVariant: "#563E4C",
    error: "#FF9E80",
    heroBackdrop: "#3A2530",
    accentMint: "#1F4C43",
    accentSun: "#5A4A1C",
    accentBerry: "#4A295E",
    accentSky: "#24395C",
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
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const theme = await AsyncStorage.getItem("theme");
      if (theme) {
        setIsDarkMode(JSON.parse(theme));
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

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
