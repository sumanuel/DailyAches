import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthService from "../utils/authService";
import PeopleService from "../utils/peopleService";
import PainTypesService from "../utils/painTypesService";

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
  { name: "Dolor de cabeza", image: "DolorDeCabeza.png" },
  { name: "Dolor de espalda", image: "DolorDeEspalda.png" },
  { name: "Dolor menstrual", image: "DolorDePiernas.png" },
  { name: "Dolor de estómago", image: "DolorDePiernas.png" },
  { name: "Dolor de garganta", image: "DolorDePiernas.png" },
  { name: "Dolor de dientes", image: "DolorDePiernas.png" },
  { name: "Otro", image: "Mujer feliz.png" },
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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user is authenticated
      const isAuth = await AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        // Load user profile from API
        await loadUserProfile();
      } else {
        // Load local data if not authenticated
        await loadUserData();
      }
    } catch (error) {
      console.error("Error initializing app:", error);
      // Fallback to local data
      await loadUserData();
    } finally {
      setAuthLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await AuthService.getCurrentUser();
      if (response.success && response.user) {
        // Load local data and merge with API user data
        await loadUserData();
        setUser((prevUser) => ({
          ...prevUser,
          profile: {
            name: response.user.name || prevUser.profile.name,
            email: response.user.email || prevUser.profile.email,
          },
        }));
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const loadPeopleFromAPI = async () => {
    try {
      const response = await PeopleService.getPeople();
      if (response.success) {
        setUser((prevUser) => ({
          ...prevUser,
          people: response.people.map((p) => ({
            id: String(p.id),
            name: p.name,
            relationship: p.relation || "",
            avatar: p.image_url || "Mujer feliz.png",
            phone: p.phone || "",
            whatsappEnabled: p.whatsapp_enabled || false,
          })),
        }));
      }
    } catch (error) {
      console.error("Error loading people from API:", error);
    }
  };

  const loadPainTypesFromAPI = async () => {
    try {
      const response = await PainTypesService.getPainTypes();
      if (response.success) {
        setUser((prevUser) => ({
          ...prevUser,
          painTypes: response.painTypes.map((pt) => ({
            id: String(pt.id),
            name: pt.name,
            image: pt.image_url || "Mujer feliz.png",
          })),
        }));
      }
    } catch (error) {
      console.error("Error loading pain types from API:", error);
    }
  };

  const login = async (email, password) => {
    const response = await AuthService.login(email, password);
    if (response.success) {
      setIsAuthenticated(true);
      await loadUserProfile();
      await loadPeopleFromAPI();
      await loadPainTypesFromAPI();
    }
    return response;
  };

  const register = async (email, password, name) => {
    const response = await AuthService.register(email, password, name);
    if (response.success) {
      setIsAuthenticated(true);
      await loadUserProfile();
      await loadPeopleFromAPI();
      await loadPainTypesFromAPI();
    }
    return response;
  };

  const logout = async () => {
    const response = await AuthService.logout();
    if (response.success) {
      setIsAuthenticated(false);
      // Reset user to default state
      setUser({
        points: 0,
        level: 1,
        recordsCount: 0,
        achievements: achievements,
        profile: defaultProfile,
        people: [],
        painTypes: defaultPainTypes,
        records: [],
      });
    }
    return response;
  };

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
            ? parsed.painTypes.map((p) =>
                typeof p === "string"
                  ? { name: p, image: "Mujer feliz.png" }
                  : p
              )
            : defaultPainTypes,
          records: Array.isArray(parsed.records) ? parsed.records : [],
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const saveUserData = async (userData) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
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

  const addPerson = async (
    name,
    relationship,
    avatar,
    phone,
    whatsappEnabled
  ) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    try {
      const response = await PeopleService.createPerson(
        trimmed,
        relationship,
        avatar,
        phone,
        whatsappEnabled
      );
      if (response.success) {
        const newPerson = {
          id: String(response.person.id),
          name: response.person.name,
          relationship: response.person.relation || "",
          avatar: response.person.image_url || "Mujer feliz.png",
          phone: response.person.phone || "",
          whatsappEnabled: response.person.whatsapp_enabled || false,
        };
        setUser((prevUser) => {
          const newUser = {
            ...prevUser,
            people: [newPerson, ...prevUser.people],
          };
          saveUserData(newUser);
          return newUser;
        });
      }
    } catch (error) {
      console.error("Error adding person:", error);
    }
  };

  const removePerson = async (personId) => {
    try {
      await PeopleService.deletePerson(personId);
      setUser((prevUser) => {
        const newUser = {
          ...prevUser,
          people: prevUser.people.filter((p) => p.id !== personId),
          records: prevUser.records.filter((r) => r.personId !== personId),
        };
        saveUserData(newUser);
        return newUser;
      });
    } catch (error) {
      console.error("Error removing person:", error);
    }
  };

  const updatePerson = async (personId, updates) => {
    try {
      const response = await PeopleService.updatePerson(
        personId,
        updates.name,
        updates.relationship,
        updates.avatar,
        updates.phone,
        updates.whatsappEnabled
      );
      if (response.success) {
        setUser((prevUser) => {
          const newPeople = prevUser.people.map((p) =>
            p.id === personId ? { ...p, ...updates } : p
          );
          const newRecords = prevUser.records.map((r) =>
            r.personId === personId
              ? { ...r, personName: updates.name || r.personName }
              : r
          );
          const newUser = {
            ...prevUser,
            people: newPeople,
            records: newRecords,
          };
          saveUserData(newUser);
          return newUser;
        });
      }
    } catch (error) {
      console.error("Error updating person:", error);
    }
  };

  const updateRecord = (recordId, updates) => {
    setUser((prevUser) => {
      const newRecords = prevUser.records.map((r) =>
        r.id === recordId ? { ...r, ...updates } : r
      );
      const newUser = { ...prevUser, records: newRecords };
      saveUserData(newUser);
      return newUser;
    });
  };

  const addPainType = async (name, image = "Mujer feliz.png") => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    try {
      const response = await PainTypesService.createPainType(trimmed, image);
      if (response.success) {
        const newPainType = {
          id: String(response.painType.id),
          name: response.painType.name,
          image: response.painType.image_url || "Mujer feliz.png",
        };
        setUser((prevUser) => {
          const exists = prevUser.painTypes.some(
            (p) => p.name.toLowerCase() === trimmed.toLowerCase()
          );
          if (exists) return prevUser;
          const newUser = {
            ...prevUser,
            painTypes: [newPainType, ...prevUser.painTypes],
          };
          saveUserData(newUser);
          return newUser;
        });
      }
    } catch (error) {
      console.error("Error adding pain type:", error);
      // Fallback to local addition
      setUser((prevUser) => {
        const exists = prevUser.painTypes.some(
          (p) => p.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) return prevUser;
        const newPainType = { id: String(Date.now()), name: trimmed, image };
        const newUser = {
          ...prevUser,
          painTypes: [newPainType, ...prevUser.painTypes],
        };
        saveUserData(newUser);
        return newUser;
      });
    }
  };

  const updatePainType = async (painTypeId, newName, newImage) => {
    const trimmed = (newName || "").trim();
    if (!trimmed) return;
    try {
      const response = await PainTypesService.updatePainType(
        painTypeId,
        trimmed,
        newImage
      );
      if (response.success) {
        setUser((prevUser) => {
          const newUser = {
            ...prevUser,
            painTypes: prevUser.painTypes.map((p) =>
              p.id === painTypeId
                ? {
                    ...p,
                    name: response.painType.name,
                    image: response.painType.image_url || "Mujer feliz.png",
                  }
                : p
            ),
          };
          saveUserData(newUser);
          return newUser;
        });
      }
    } catch (error) {
      console.error("Error updating pain type:", error);
      // Fallback to local update
      setUser((prevUser) => {
        const newUser = {
          ...prevUser,
          painTypes: prevUser.painTypes.map((p) =>
            p.id === painTypeId ? { ...p, name: trimmed, image: newImage } : p
          ),
        };
        saveUserData(newUser);
        return newUser;
      });
    }
  };

  const deleteRecord = (recordId) => {
    setUser((prevUser) => {
      const newUser = {
        ...prevUser,
        records: prevUser.records.filter((r) => r.id !== recordId),
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const removePainType = async (painTypeId) => {
    try {
      await PainTypesService.deletePainType(painTypeId);
      setUser((prevUser) => {
        const newUser = {
          ...prevUser,
          painTypes: prevUser.painTypes.filter((p) => p.id !== painTypeId),
        };
        saveUserData(newUser);
        return newUser;
      });
    } catch (error) {
      console.error("Error removing pain type:", error);
      // Fallback to local removal
      setUser((prevUser) => {
        const newUser = {
          ...prevUser,
          painTypes: prevUser.painTypes.filter((p) => p.id !== painTypeId),
        };
        saveUserData(newUser);
        return newUser;
      });
    }
  };

  const addRecord = ({ personId, personName, pain, notes, image }) => {
    const now = new Date();
    const record = {
      id: String(Date.now()),
      createdAt: now.toISOString(),
      personId: personId || null,
      personName: (personName || "").trim() || "(Sin nombre)",
      pain: (pain || "").trim() || "(Sin dolor)",
      notes: (notes || "").trim() || "",
      image: (image || "").trim() || "",
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
        isAuthenticated,
        authLoading,
        login,
        register,
        logout,
        addPoints,
        incrementRecords,
        unlockAchievement,
        updateProfile,
        addPerson,
        removePerson,
        updatePerson,
        updateRecord,
        deleteRecord,
        addPainType,
        removePainType,
        updatePainType,
        addRecord,
        getLevelProgress,
        getTodayRecords,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
