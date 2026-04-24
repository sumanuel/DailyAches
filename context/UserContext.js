import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthService from "../utils/authService";
import PeopleService from "../utils/peopleService";
import PainTypesService from "../utils/painTypesService";
import RecordsService from "../utils/recordsService";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const achievementDefinitions = [
  {
    id: 1,
    name: "Primer Registro",
    description: "Registra el primer dolor del tablero",
    points: 15,
    icon: "flag-checkered",
    unlocked: false,
  },
  {
    id: 2,
    name: "Tres al Radar",
    description: "Acumula 3 registros",
    points: 20,
    icon: "radar",
    unlocked: false,
  },
  {
    id: 3,
    name: "Cinco Episodios",
    description: "Acumula 5 registros",
    points: 30,
    icon: "clipboard-pulse-outline",
    unlocked: false,
  },
  {
    id: 4,
    name: "Diez Dolores",
    description: "Acumula 10 registros",
    points: 45,
    icon: "notebook-multiple",
    unlocked: false,
  },
  {
    id: 5,
    name: "Veinte al Archivo",
    description: "Acumula 20 registros",
    points: 70,
    icon: "archive-outline",
    unlocked: false,
  },
  {
    id: 6,
    name: "Cuarenta en Bitácora",
    description: "Acumula 40 registros",
    points: 110,
    icon: "book-open-page-variant-outline",
    unlocked: false,
  },
  {
    id: 7,
    name: "Nivel 2",
    description: "Llega al nivel Observadora",
    points: 20,
    icon: "star-circle-outline",
    unlocked: false,
  },
  {
    id: 8,
    name: "Nivel 4",
    description: "Llega al nivel Cuidadora",
    points: 45,
    icon: "medal-outline",
    unlocked: false,
  },
  {
    id: 9,
    name: "Nivel 6",
    description: "Llega al nivel Estratega",
    points: 70,
    icon: "compass-rose",
    unlocked: false,
  },
  {
    id: 10,
    name: "Nivel 8",
    description: "Llega al nivel Leyenda",
    points: 100,
    icon: "crown-outline",
    unlocked: false,
  },
  {
    id: 11,
    name: "Nivel 10",
    description: "Alcanza el rango máximo actual",
    points: 160,
    icon: "star-four-points-circle-outline",
    unlocked: false,
  },
  {
    id: 12,
    name: "Compartidor",
    description: "Comparte un registro",
    points: 30,
    icon: "share-variant-outline",
    unlocked: false,
  },
];

const levels = [
  { level: 1, pointsRequired: 0, title: "Chispa", icon: "🌱" },
  { level: 2, pointsRequired: 40, title: "Observadora", icon: "👀" },
  { level: 3, pointsRequired: 95, title: "Cronista", icon: "📝" },
  { level: 4, pointsRequired: 170, title: "Cuidadora", icon: "🩹" },
  { level: 5, pointsRequired: 270, title: "Radar", icon: "💫" },
  { level: 6, pointsRequired: 395, title: "Estratega", icon: "🧭" },
  { level: 7, pointsRequired: 545, title: "Guardiana", icon: "🛡️" },
  { level: 8, pointsRequired: 725, title: "Leyenda", icon: "🌟" },
  { level: 9, pointsRequired: 935, title: "Maestra", icon: "👑" },
  { level: 10, pointsRequired: 1180, title: "Oraculo", icon: "🔮" },
];

const achievementRules = [
  { id: 1, recordsCount: 1 },
  { id: 2, recordsCount: 3 },
  { id: 3, recordsCount: 5 },
  { id: 4, recordsCount: 10 },
  { id: 5, recordsCount: 20 },
  { id: 6, recordsCount: 40 },
  { id: 7, level: 2 },
  { id: 8, level: 4 },
  { id: 9, level: 6 },
  { id: 10, level: 8 },
  { id: 11, level: 10 },
];

const getDefaultAchievements = () =>
  achievementDefinitions.map((achievement) => ({ ...achievement }));

const mergeAchievements = (savedAchievements = []) => {
  const savedById = new Map(
    (savedAchievements || []).map((achievement) => [
      achievement.id,
      achievement,
    ]),
  );

  return achievementDefinitions.map((achievement) => ({
    ...achievement,
    unlocked: savedById.get(achievement.id)?.unlocked || false,
  }));
};

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
  phone: "",
  birth_date: "",
};

const computeLevel = (points) => {
  let current = levels[0];
  for (const lvl of levels) {
    if (points >= lvl.pointsRequired) current = lvl;
  }
  return current.level;
};

const getLevelMeta = (level) =>
  levels.find((entry) => entry.level === level) || levels[0];

const getNextLevelRequirement = (level) => {
  const idx = levels.findIndex((l) => l.level === level);
  if (idx < 0) return null;
  return levels[idx + 1] || null;
};

const applyAutomaticAchievements = ({ achievements, recordsCount, points }) => {
  const nextAchievements = achievements.map((achievement) => ({
    ...achievement,
  }));
  let nextPoints = points;
  let changed = true;

  while (changed) {
    changed = false;
    const currentLevel = computeLevel(nextPoints);

    for (const rule of achievementRules) {
      const achievement = nextAchievements.find(
        (entry) => entry.id === rule.id,
      );
      if (!achievement || achievement.unlocked) continue;

      const qualifiesByRecords =
        typeof rule.recordsCount === "number" &&
        recordsCount >= rule.recordsCount;
      const qualifiesByLevel =
        typeof rule.level === "number" && currentLevel >= rule.level;

      if (qualifiesByRecords || qualifiesByLevel) {
        achievement.unlocked = true;
        nextPoints += achievement.points;
        changed = true;
      }
    }
  }

  return {
    achievements: nextAchievements,
    points: nextPoints,
    level: computeLevel(nextPoints),
  };
};

const buildProgressState = (
  prevUser,
  { recordsAdded = 0, basePoints = 0 } = {},
) => {
  const recordsCount = prevUser.recordsCount + recordsAdded;
  const points = prevUser.points + basePoints;
  const automatic = applyAutomaticAchievements({
    achievements: prevUser.achievements,
    recordsCount,
    points,
  });

  return {
    ...prevUser,
    recordsCount,
    achievements: automatic.achievements,
    points: automatic.points,
    level: automatic.level,
  };
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
    achievements: getDefaultAchievements(),
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
            phone: response.user.phone || prevUser.profile.phone,
            birth_date: response.user.birth_date || prevUser.profile.birth_date,
          },
        }));
        // Load API data
        await loadPeopleFromAPI();
        await loadPainTypesFromAPI();
        await loadRecordsFromAPI();
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
            image: pt.image_url || null,
          })),
        }));
      }
    } catch (error) {
      console.error("Error loading pain types from API:", error);
    }
  };

  const loadRecordsFromAPI = async () => {
    try {
      const response = await RecordsService.getRecords();
      if (response.success && response.records) {
        setUser((prevUser) => ({
          ...prevUser,
          records: response.records.map((r) => ({
            id: String(r.id),
            personId: String(r.person_id),
            painTypeId: String(r.pain_type_id),
            pain: r.pain_type_name,
            personName: r.person_name,
            painLevel: r.pain_level,
            notes: r.notes,
            createdAt: r.created_at,
          })),
        }));
      }
    } catch (error) {
      console.error("Error loading records from API:", error);
    }
  };

  const login = async (email, password) => {
    const response = await AuthService.login(email, password);
    if (response.success) {
      setIsAuthenticated(true);
      await loadUserProfile();
      await loadPeopleFromAPI();
      await loadPainTypesFromAPI();
      await loadRecordsFromAPI();
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
        achievements: getDefaultAchievements(),
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
                  typeof parsed.points === "number" ? parsed.points : 0,
                ),
          recordsCount:
            typeof parsed.recordsCount === "number" ? parsed.recordsCount : 0,
          achievements: mergeAchievements(parsed.achievements),
          profile: parsed.profile
            ? { ...defaultProfile, ...parsed.profile }
            : defaultProfile,
          people: Array.isArray(parsed.people) ? parsed.people : [],
          painTypes: Array.isArray(parsed.painTypes)
            ? parsed.painTypes.map((p) =>
                typeof p === "string" ? { name: p, image: null } : p,
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
      const automatic = applyAutomaticAchievements({
        achievements: prevUser.achievements,
        recordsCount: prevUser.recordsCount,
        points: prevUser.points + points,
      });
      const newUser = {
        ...prevUser,
        achievements: automatic.achievements,
        points: automatic.points,
        level: automatic.level,
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const incrementRecords = (basePoints = 0) => {
    setUser((prevUser) => {
      const newUser = buildProgressState(prevUser, {
        recordsAdded: 1,
        basePoints,
      });
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
      const automatic = applyAutomaticAchievements({
        achievements: newAchievements,
        recordsCount: prevUser.recordsCount,
        points: prevUser.points + pointsDelta,
      });
      const newUser = {
        ...prevUser,
        achievements: automatic.achievements,
        points: automatic.points,
        level: automatic.level,
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const updateProfile = async (partial) => {
    try {
      const response = await AuthService.updateProfile(partial);
      if (response.success) {
        setUser((prevUser) => {
          const newUser = {
            ...prevUser,
            profile: {
              ...prevUser.profile,
              name: response.user.name || prevUser.profile.name,
              email: response.user.email || prevUser.profile.email,
              phone: response.user.phone || prevUser.profile.phone,
              birth_date:
                response.user.birth_date || prevUser.profile.birth_date,
            },
          };
          saveUserData(newUser);
          return newUser;
        });
      } else {
        // Fallback to local update if API fails
        setUser((prevUser) => {
          const newUser = {
            ...prevUser,
            profile: { ...prevUser.profile, ...(partial || {}) },
          };
          saveUserData(newUser);
          return newUser;
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      // Fallback to local update
      setUser((prevUser) => {
        const newUser = {
          ...prevUser,
          profile: { ...prevUser.profile, ...(partial || {}) },
        };
        saveUserData(newUser);
        return newUser;
      });
    }
  };

  const addPerson = async (
    name,
    relationship,
    avatar,
    phone,
    whatsappEnabled,
  ) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    try {
      const response = await PeopleService.createPerson(
        trimmed,
        relationship,
        avatar,
        phone,
        whatsappEnabled,
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
        updates.whatsappEnabled,
      );
      if (response.success) {
        setUser((prevUser) => {
          const newPeople = prevUser.people.map((p) =>
            p.id === personId ? { ...p, ...updates } : p,
          );
          const newRecords = prevUser.records.map((r) =>
            r.personId === personId
              ? { ...r, personName: updates.name || r.personName }
              : r,
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
        r.id === recordId ? { ...r, ...updates } : r,
      );
      const newUser = { ...prevUser, records: newRecords };
      saveUserData(newUser);
      return newUser;
    });
  };

  const addPainType = async (name, image = null) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;

    console.log("addPainType called with:", { name: trimmed, image });

    try {
      const response = await PainTypesService.createPainType(
        trimmed,
        image || undefined,
      );
      console.log("PainTypesService.createPainType response:", response);

      if (response.success) {
        const newPainType = {
          id: String(response.painType.id),
          name: response.painType.name,
          image: response.painType.image_url || null,
        };
        console.log("New pain type created:", newPainType);
        setUser((prevUser) => {
          const exists = prevUser.painTypes.some(
            (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
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

      // Check if it's a duplicate error (409)
      if (error.response?.status === 409) {
        throw new Error("Ya existe un tipo de dolor con este nombre");
      }

      // Fallback to local addition for other errors
      setUser((prevUser) => {
        const exists = prevUser.painTypes.some(
          (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
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
    console.log("updatePainType called with:", {
      painTypeId,
      newName,
      newImage,
      typeOfId: typeof painTypeId,
    });

    // Validate that painTypeId is a valid number
    if (!painTypeId || isNaN(parseInt(painTypeId))) {
      console.error(
        "ERROR: painTypeId must be a valid number, got:",
        painTypeId,
      );
      alert(
        "Error: ID de tipo de dolor inválido. Asegúrate de que sea un número.",
      );
      return;
    }

    const trimmed = (newName || "").trim();
    if (!trimmed) return;

    // If newImage is not provided or is empty, keep the current image
    const currentPainType = user.painTypes.find((p) => p.id === painTypeId);
    const imageToUse =
      newImage !== undefined && newImage !== null && newImage !== ""
        ? newImage
        : currentPainType?.image;

    console.log("Current pain type found:", currentPainType);

    if (!currentPainType) {
      console.error("ERROR: Pain type not found with ID:", painTypeId);
      alert(
        "Error: Tipo de dolor no encontrado. Verifica que el ID sea correcto.",
      );
      return;
    }

    try {
      const response = await PainTypesService.updatePainType(
        painTypeId,
        trimmed,
        imageToUse,
      );
      console.log("PainTypesService.updatePainType response:", response);
      if (response.success) {
        setUser((prevUser) => {
          const newUser = {
            ...prevUser,
            painTypes: prevUser.painTypes.map((p) =>
              p.id === painTypeId
                ? {
                    ...p,
                    name: response.painType.name,
                    image: response.painType.image_url || null,
                  }
                : p,
            ),
          };
          saveUserData(newUser);
          return newUser;
        });
      }
    } catch (error) {
      console.error("Error updating pain type:", error);

      // Check if it's a duplicate error (409)
      if (error.response?.status === 409) {
        throw new Error("Ya existe un tipo de dolor con este nombre");
      }

      // Fallback to local update for other errors
      setUser((prevUser) => {
        const newUser = {
          ...prevUser,
          painTypes: prevUser.painTypes.map((p) =>
            p.id === painTypeId
              ? { ...p, name: trimmed, image: imageToUse }
              : p,
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
      const response = await PainTypesService.deletePainType(painTypeId);
      if (!response.success) {
        // Check if it's a validation error (pain type in use) - don't remove locally
        if (
          response.status === 409 &&
          response.error.includes("being used in existing records")
        ) {
          return { success: false, error: response.error };
        }

        // For other API errors, still remove locally but indicate failure
        setUser((prevUser) => {
          const newUser = {
            ...prevUser,
            painTypes: prevUser.painTypes.filter((p) => p.id !== painTypeId),
          };
          saveUserData(newUser);
          return newUser;
        });
        return { success: false, error: response.error };
      }

      // API success
      setUser((prevUser) => {
        const newUser = {
          ...prevUser,
          painTypes: prevUser.painTypes.filter((p) => p.id !== painTypeId),
        };
        saveUserData(newUser);
        return newUser;
      });
      return { success: true };
    } catch (error) {
      console.error("Error removing pain type:", error);
      // For network/other errors, don't remove locally
      return { success: false, error: error.message };
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
      const progressState = buildProgressState(prevUser, {
        recordsAdded: 1,
        basePoints: 10,
      });
      const newUser = {
        ...progressState,
        records: newRecords,
      };
      saveUserData(newUser);
      return newUser;
    });
  };

  const createRecordAPI = async (recordData) => {
    try {
      const response = await RecordsService.createRecord(recordData);
      if (response.success) {
        // Reload records from API to get updated data
        await loadRecordsFromAPI();
        // Update local stats
        incrementRecords(10);
        return { success: true, record: response.record };
      }
      return response;
    } catch (error) {
      console.error("Error creating record:", error);
      return { success: false, error: error.message };
    }
  };

  const updateRecordAPI = async (recordId, recordData) => {
    try {
      const response = await RecordsService.updateRecord(recordId, recordData);
      if (response.success) {
        // Reload records from API to get updated data
        await loadRecordsFromAPI();
        return { success: true, record: response.record };
      }
      return response;
    } catch (error) {
      console.error("Error updating record:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteRecordAPI = async (recordId) => {
    try {
      const response = await RecordsService.deleteRecord(recordId);
      if (response.success) {
        // Reload records from API to get updated data
        await loadRecordsFromAPI();
        return { success: true };
      }
      return response;
    } catch (error) {
      console.error("Error deleting record:", error);
      return { success: false, error: error.message };
    }
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
        createRecordAPI,
        updateRecordAPI,
        deleteRecordAPI,
        loadPeopleFromAPI,
        loadPainTypesFromAPI,
        loadRecordsFromAPI,
        getLevelProgress,
        getLevelMeta,
        levels,
        getTodayRecords,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
