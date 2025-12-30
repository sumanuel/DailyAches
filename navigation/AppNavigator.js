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
import StatsScreen from "../screens/StatsScreen";
import MoreScreen from "../screens/MoreScreen";
import SettingsScreen from "../screens/SettingsScreen";
import PainSettingsScreen from "../screens/PainSettingsScreen";

import { useTheme } from "../context/ThemeContext";

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator initialRouteName="Login">
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
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
    </Stack.Navigator>
  );
};

const RegistroStackNavigator = () => {
  return (
    <Stack.Navigator>
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
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StatsMain"
        component={StatsScreen}
        options={{ title: "Estadísticas" }}
      />
    </Stack.Navigator>
  );
};

const MoreStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MoreMain"
        component={MoreScreen}
        options={{ title: "Más" }}
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Home: "home-variant",
            Registro: "account-multiple",
            Estadísticas: "chart-bar",
            Más: "dots-horizontal-circle-outline",
          };
          const iconName = iconMap[route.name] || "circle-outline";
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Registro" component={RegistroStackNavigator} />
      <Tab.Screen name="Estadísticas" component={StatsStackNavigator} />
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
