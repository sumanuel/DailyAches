import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

import HomeScreen from "../screens/HomeScreen";
import PeopleScreen from "../screens/PeopleScreen";
import RecordPainScreen from "../screens/RecordPainScreen";
import HistoryPeopleScreen from "../screens/HistoryPeopleScreen";
import StatsScreen from "../screens/StatsScreen";
import MoreScreen from "../screens/MoreScreen";
import ProgressScreen from "../screens/ProgressScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import PainSettingsScreen from "../screens/PainSettingsScreen";

import { useTheme } from "../context/ThemeContext";

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  const { theme } = useTheme();
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Iniciar Sesión" }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Registro" }}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: "Recuperar Contraseña" }}
      />
    </AuthStack.Navigator>
  );
};

const HomeStackNavigator = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: "Inicio" }}
      />
      <Stack.Screen
        name="RecordPain"
        component={RecordPainScreen}
        options={{ title: "Registrar dolor" }}
      />
    </Stack.Navigator>
  );
};

const RegistroStackNavigator = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="People"
        component={PeopleScreen}
        options={{ title: "Registro" }}
      />
      <Stack.Screen
        name="RecordPain"
        component={RecordPainScreen}
        options={{ title: "Registrar dolor" }}
      />
    </Stack.Navigator>
  );
};

const StatsStackNavigator = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="StatsMain"
        component={HistoryPeopleScreen}
        options={{ title: "Historial" }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={StatsScreen}
        options={({ route }) => ({
          title: route?.params?.personName
            ? `Historial · ${route.params.personName}`
            : "Historial",
        })}
      />
    </Stack.Navigator>
  );
};

const MoreStackNavigator = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="MoreMain"
        component={MoreScreen}
        options={{ title: "Más" }}
      />
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: "Progreso" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Perfil" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Configuración" }}
      />
      <Stack.Screen
        name="PainSettings"
        component={PainSettingsScreen}
        options={{ title: "Configurar dolores" }}
      />
    </Stack.Navigator>
  );
};

const MainTabsNavigator = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Home: "home-variant",
            Registro: "account-multiple",
            Historial: "history",
            Más: "dots-horizontal-circle-outline",
          };
          const iconName = iconMap[route.name] || "circle-outline";
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ title: "Inicio" }}
      />
      <Tab.Screen name="Registro" component={RegistroStackNavigator} />
      <Tab.Screen name="Historial" component={StatsStackNavigator} />
      <Tab.Screen name="Más" component={MoreStackNavigator} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { navigationTheme } = useTheme();
  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        <RootStack.Screen name="Main" component={MainTabsNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
