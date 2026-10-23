import React from "react";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import AppNavigator from "./navigation/AppNavigator";

const AppContent = () => {
  const { theme } = useTheme();
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
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
