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
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    // Softer pastel purple + lower-contrast surfaces
    primary: "#7C3AED",
    onPrimary: "#FFFFFF",
    primaryContainer: "#F2EAFE",
    onPrimaryContainer: "#2B0A6B",
    secondary: "#8B5CF6",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#F5EEFF",
    onSecondaryContainer: "#2B0A6B",
    tertiary: "#A78BFA",
    onTertiary: "#2B0A6B",
    tertiaryContainer: "#F7F2FF",
    onTertiaryContainer: "#2B0A6B",

    background: "#F4F3F8",
    onBackground: "#13101F",
    surface: "#FFFFFF",
    onSurface: "#13101F",
    surfaceVariant: "#ECE9F6",
    onSurfaceVariant: "#433D5B",
    outline: "#CFC8E6",
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
  roundness: 16,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#C4B5FD",
    onPrimary: "#1C093B",
    secondary: "#A78BFA",
    tertiary: "#DDD6FE",
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
