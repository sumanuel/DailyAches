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

const defaultPainTypes = [
  "Dolor de cabeza",
  "Dolor de espalda",
  "Dolor menstrual",
  "Dolor de estómago",
  "Dolor de garganta",
  "Dolor de dientes",
  "Otro",
];

const defaultProfile = {
  name: "",
  email: "",
};

const computeLevel = (points) => {
  let current = levels[0];
  for (const lvl of levels) {
    if (points >= lvl.pointsRequired) current = lvl;
  }
  return current.level;
};

const getNextLevelRequirement = (level) => {
  const idx = levels.findIndex((l) => l.level === level);
  if (idx < 0) return null;
  return levels[idx + 1] || null;
};

const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    points: 0,
    level: 1,
    recordsCount: 0,
    achievements: achievements,
    profile: defaultProfile,
    people: [],
    painTypes: defaultPainTypes,
    records: [],
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        const parsed = JSON.parse(data);
        setUser({
          points: typeof parsed.points === "number" ? parsed.points : 0,
          level:
            typeof parsed.level === "number"
              ? parsed.level
              : computeLevel(
                  typeof parsed.points === "number" ? parsed.points : 0
                ),
          recordsCount:
            typeof parsed.recordsCount === "number" ? parsed.recordsCount : 0,
          achievements: Array.isArray(parsed.achievements)
            ? parsed.achievements
            : achievements,
          profile: parsed.profile
            ? { ...defaultProfile, ...parsed.profile }
            : defaultProfile,
          people: Array.isArray(parsed.people) ? parsed.people : [],
          painTypes: Array.isArray(parsed.painTypes)
            ? parsed.painTypes
            : defaultPainTypes,
          records: Array.isArray(parsed.records) ? parsed.records : [],
        });
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
      const newLevel = computeLevel(newPoints);
      const newUser = { ...prevUser, points: newPoints, level: newLevel };
      saveUserData(newUser);
      return newUser;
    });
  };

  const incrementRecords = () => {
    setUser((prevUser) => {
      const newRecordsCount = prevUser.recordsCount + 1;
      let newPoints = prevUser.points;
      const newAchievements = prevUser.achievements.map((ach) => ({ ...ach }));

      // Desbloquear logros
      const first = newAchievements.find((a) => a.id === 1);
      if (newRecordsCount >= 1 && first && !first.unlocked) {
        first.unlocked = true;
        newPoints += first.points;
      }
      const ten = newAchievements.find((a) => a.id === 2);
      if (newRecordsCount >= 10 && ten && !ten.unlocked) {
        ten.unlocked = true;
        newPoints += ten.points;
      }

      const newLevel = computeLevel(newPoints);
      const newUser = {
        ...prevUser,
        recordsCount: newRecordsCount,
        achievements: newAchievements,
        points: newPoints,
        level: newLevel,
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const unlockAchievement = (id) => {
    setUser((prevUser) => {
      let pointsDelta = 0;
      const newAchievements = prevUser.achievements.map((ach) => {
        if (ach.id !== id) return ach;
        if (ach.unlocked) return ach;
        pointsDelta += ach.points;
        return { ...ach, unlocked: true };
      });
      const newPoints = prevUser.points + pointsDelta;
      const newLevel = computeLevel(newPoints);
      const newUser = {
        ...prevUser,
        achievements: newAchievements,
        points: newPoints,
        level: newLevel,
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const updateProfile = (partial) => {
    setUser((prevUser) => {
      const newUser = {
        ...prevUser,
        profile: { ...prevUser.profile, ...(partial || {}) },
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const addPerson = (name, relationship, avatar) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    setUser((prevUser) => {
      const exists = prevUser.people.some(
        (p) => (p.name || "").toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return prevUser;
      const newPerson = {
        id: String(Date.now()),
        name: trimmed,
        relationship: relationship || "",
        avatar: avatar || "Mujer feliz.png",
      };
      const newUser = { ...prevUser, people: [newPerson, ...prevUser.people] };
      saveUserData(newUser);
      return newUser;
    });
  };

  const removePerson = (personId) => {
    setUser((prevUser) => {
      const newUser = {
        ...prevUser,
        people: prevUser.people.filter((p) => p.id !== personId),
        records: prevUser.records.filter((r) => r.personId !== personId),
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const addPainType = (pain) => {
    const trimmed = (pain || "").trim();
    if (!trimmed) return;
    setUser((prevUser) => {
      const exists = prevUser.painTypes.some(
        (p) => (p || "").toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return prevUser;
      const newUser = {
        ...prevUser,
        painTypes: [trimmed, ...prevUser.painTypes],
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const removePainType = (pain) => {
    setUser((prevUser) => {
      const newUser = {
        ...prevUser,
        painTypes: prevUser.painTypes.filter((p) => p !== pain),
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const addRecord = ({ personId, personName, pain, notes }) => {
    const now = new Date();
    const record = {
      id: String(Date.now()),
      createdAt: now.toISOString(),
      personId: personId || null,
      personName: (personName || "").trim() || "(Sin nombre)",
      pain: (pain || "").trim() || "(Sin dolor)",
      notes: (notes || "").trim() || "",
    };

    setUser((prevUser) => {
      const newRecords = [record, ...prevUser.records];

      const newRecordsCount = prevUser.recordsCount + 1;
      let newPoints = prevUser.points + 10; // +10 por registro
      const newAchievements = prevUser.achievements.map((ach) => ({ ...ach }));

      const first = newAchievements.find((a) => a.id === 1);
      if (newRecordsCount >= 1 && first && !first.unlocked) {
        first.unlocked = true;
        newPoints += first.points;
      }
      const ten = newAchievements.find((a) => a.id === 2);
      if (newRecordsCount >= 10 && ten && !ten.unlocked) {
        ten.unlocked = true;
        newPoints += ten.points;
      }

      const newLevel = computeLevel(newPoints);
      const lvl5 = newAchievements.find((a) => a.id === 4);
      if (newLevel >= 5 && lvl5 && !lvl5.unlocked) {
        lvl5.unlocked = true;
        newPoints += lvl5.points;
      }

      const finalLevel = computeLevel(newPoints);
      const newUser = {
        ...prevUser,
        records: newRecords,
        recordsCount: newRecordsCount,
        points: newPoints,
        level: finalLevel,
        achievements: newAchievements,
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const getLevelProgress = () => {
    const next = getNextLevelRequirement(user.level);
    if (!next) return { progress: 1, nextLevel: null, remaining: 0 };
    const currentReq =
      levels.find((l) => l.level === user.level)?.pointsRequired ?? 0;
    const span = next.pointsRequired - currentReq;
    const progress =
      span <= 0 ? 1 : Math.min(1, (user.points - currentReq) / span);
    const remaining = Math.max(0, next.pointsRequired - user.points);
    return { progress, nextLevel: next.level, remaining };
  };

  const getTodayRecords = () => {
    const today = new Date();
    return user.records.filter((r) => {
      const d = new Date(r.createdAt);
      return isSameDay(d, today);
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        addPoints,
        incrementRecords,
        unlockAchievement,
        updateProfile,
        addPerson,
        removePerson,
        addPainType,
        removePainType,
        addRecord,
        getLevelProgress,
        getTodayRecords,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
