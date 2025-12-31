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
  roundness: 20,
  colors: {
    ...MD3LightTheme.colors,
    // Clean tienda-app inspired colors
    primary: "#6B45C4",
    onPrimary: "#FFFFFF",
    primaryContainer: "#F3E5F5",
    onPrimaryContainer: "#4A148C",
    secondary: "#2f5ae0",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#E3F2FD",
    onSecondaryContainer: "#0D47A1",
    tertiary: "#6B45C4",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#F3E5F5",
    onTertiaryContainer: "#4A148C",

    background: "#e8edf2",
    onBackground: "#1f2633",
    surface: "#FFFFFF",
    onSurface: "#1f2633",
    surfaceVariant: "#f3f5fa",
    onSurfaceVariant: "#6f7c8c",
    outline: "#d5dbe7",
  },
  fonts: {
    ...MD3LightTheme.fonts,
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontSize: 20 },
    titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontSize: 16 },
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontSize: 15 },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontSize: 13 },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontSize: 13 },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontSize: 12 },
    labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontSize: 11 },
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  roundness: 20,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#9575CD",
    onPrimary: "#4A148C",
    secondary: "#64B5F6",
    tertiary: "#9575CD",
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    titleLarge: { ...MD3DarkTheme.fonts.titleLarge, fontSize: 20 },
    titleMedium: { ...MD3DarkTheme.fonts.titleMedium, fontSize: 16 },
    bodyLarge: { ...MD3DarkTheme.fonts.bodyLarge, fontSize: 15 },
    bodyMedium: { ...MD3DarkTheme.fonts.bodyMedium, fontSize: 13 },
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
  const navigationTheme = isDarkMode ? NavigationDark : NavigationLight;

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleTheme, theme, navigationTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
