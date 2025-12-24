import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const achievements = [
  {
    id: 1,
    name: "Primer Registro",
    description: "Registra tu primer dolor",
    points: 10,
    unlocked: false,
  },
  {
    id: 2,
    name: "Diez Dolores",
    description: "Registra 10 dolores",
    points: 50,
    unlocked: false,
  },
  {
    id: 3,
    name: "Semana Sin Dolor",
    description: "Pasa una semana sin registrar dolores",
    points: 100,
    unlocked: false,
  },
  {
    id: 4,
    name: "Nivel 5",
    description: "Alcanza el nivel 5",
    points: 200,
    unlocked: false,
  },
  {
    id: 5,
    name: "Compartidor",
    description: "Comparte un registro en Facebook",
    points: 30,
    unlocked: false,
  },
];

const levels = [
  { level: 1, pointsRequired: 0 },
  { level: 2, pointsRequired: 50 },
  { level: 3, pointsRequired: 150 },
  { level: 4, pointsRequired: 300 },
  { level: 5, pointsRequired: 500 },
  // Agregar más niveles
];

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    points: 0,
    level: 1,
    recordsCount: 0,
    achievements: achievements,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        setUser(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const saveUserData = async (newUser) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(newUser));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const addPoints = (points) => {
    setUser((prevUser) => {
      const newPoints = prevUser.points + points;
      const newLevel =
        levels.find((l) => newPoints >= l.pointsRequired)?.level ||
        prevUser.level;
      const newUser = { ...prevUser, points: newPoints, level: newLevel };
      saveUserData(newUser);
      return newUser;
    });
  };

  const incrementRecords = () => {
    setUser((prevUser) => {
      const newRecordsCount = prevUser.recordsCount + 1;
      let newAchievements = [...prevUser.achievements];

      // Desbloquear logros
      if (newRecordsCount >= 1 && !newAchievements[0].unlocked) {
        newAchievements[0].unlocked = true;
        addPoints(newAchievements[0].points);
      }
      if (newRecordsCount >= 10 && !newAchievements[1].unlocked) {
        newAchievements[1].unlocked = true;
        addPoints(newAchievements[1].points);
      }

      const newUser = {
        ...prevUser,
        recordsCount: newRecordsCount,
        achievements: newAchievements,
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const unlockAchievement = (id) => {
    setUser((prevUser) => {
      const newAchievements = prevUser.achievements.map((ach) =>
        ach.id === id ? { ...ach, unlocked: true } : ach
      );
      const achievement = newAchievements.find((a) => a.id === id);
      if (achievement) addPoints(achievement.points);
      const newUser = { ...prevUser, achievements: newAchievements };
      saveUserData(newUser);
      return newUser;
    });
  };

  return (
    <UserContext.Provider
      value={{ user, addPoints, incrementRecords, unlockAchievement }}
    >
      {children}
    </UserContext.Provider>
  );
};
