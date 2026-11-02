import React from "react";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import AppNavigator from "./navigation/AppNavigator";
import UndoDeleteSnackbar from "./components/UndoDeleteSnackbar";
import ProgressCelebration from "./components/ProgressCelebration";

const AppContent = () => {
  const { theme } = useTheme();
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
      <UndoDeleteSnackbar />
      <ProgressCelebration />
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
