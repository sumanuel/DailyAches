import React from "react";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import AppNavigator from "./navigation/AppNavigator";
import UndoDeleteSnackbar from "./components/UndoDeleteSnackbar";
import ProgressCelebration from "./components/ProgressCelebration";
import { BurstProvider } from "./components/BurstProvider";
import { ToastProvider } from "./components/ToastProvider";
import MoodAmbience from "./components/MoodAmbience";

const AppContent = () => {
  const { theme } = useTheme();
  return (
    <PaperProvider theme={theme}>
      <BurstProvider>
        <ToastProvider>
          <AppNavigator />
          <UndoDeleteSnackbar />
          <ProgressCelebration />
          <MoodAmbience />
        </ToastProvider>
      </BurstProvider>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
