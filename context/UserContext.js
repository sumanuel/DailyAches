import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthService from "../utils/authService";
import { useAuth } from "./AuthContext";
import useRemoteData from "./useRemoteData";
import {
  levels,
  getDefaultAchievements,
  mergeAchievements,
  defaultPainTypes,
  defaultProfile,
  computeLevel,
  getLevelMeta,
  getNextLevelRequirement,
  applyAutomaticAchievements,
  buildProgressState,
  isSameDay,
  getUserStorageKey,
} from "../utils/gamification";

// Progress saved before it was kept per user lived under this single key.
const LEGACY_STORAGE_KEY = getUserStorageKey(null);

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const getInitialUser = () => ({
  points: 0,
  level: 1,
  recordsCount: 0,
  achievements: getDefaultAchievements(),
  profile: defaultProfile,
  people: [],
  painTypes: defaultPainTypes,
  records: [],
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [hydrated, setHydrated] = useState(false);
  const wasAuthenticated = useRef(false);
  // Where this session's progress is saved: one key per user, so a second
  // account on the same device does not inherit the first one's points.
  const storageKeyRef = useRef(LEGACY_STORAGE_KEY);
  const auth = useAuth();

  const loadUserData = useCallback(async (userId) => {
    try {
      const key = getUserStorageKey(userId);
      storageKeyRef.current = key;
      let data = await AsyncStorage.getItem(key);
      if (!data && userId) {
        // One-time move of progress saved before it was kept per user.
        const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
          data = legacy;
          await AsyncStorage.setItem(key, legacy);
          await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }
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
  }, []);

  // Stable: it only reads a ref, and useRemoteData depends on it.
  const saveUserData = useCallback(async (userData) => {
    try {
      await AsyncStorage.setItem(
        storageKeyRef.current,
        JSON.stringify(userData),
      );
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  }, []);

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

  const {
    loadPeopleFromAPI,
    loadPainTypesFromAPI,
    loadRecordsFromAPI,
    ...remoteActions
  } = useRemoteData({ user, setUser, saveUserData, incrementRecords });

  const loadUserProfile = useCallback(async () => {
    try {
      const response = await AuthService.getCurrentUser();
      if (response.success && response.user) {
        // Load local data and merge with API user data
        await loadUserData(response.user.id);
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
        await loadRecordsFromAPI({ reconcile: true });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }, [loadUserData, loadPeopleFromAPI, loadPainTypesFromAPI, loadRecordsFromAPI]);

  // Hydrate state whenever the session changes: remote data when logged in,
  // local data when not, and a reset right after logging out.
  useEffect(() => {
    if (auth.authLoading) return;
    let active = true;
    (async () => {
      if (auth.isAuthenticated) {
        wasAuthenticated.current = true;
        await loadUserProfile();
      } else if (wasAuthenticated.current) {
        wasAuthenticated.current = false;
        storageKeyRef.current = LEGACY_STORAGE_KEY;
        setUser(getInitialUser());
      } else {
        await loadUserData();
      }
      if (active) setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, [auth.isAuthenticated, auth.authLoading, loadUserData, loadUserProfile]);

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

  const getTodayRecords = useCallback(() => {
    const today = new Date();
    return user.records.filter((r) => {
      const d = new Date(r.createdAt);
      return isSameDay(d, today);
    });
  }, [user.records]);

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: auth.isAuthenticated,
        authLoading: auth.authLoading || !hydrated,
        login: auth.login,
        register: auth.register,
        logout: auth.logout,
        addPoints,
        incrementRecords,
        unlockAchievement,
        updateProfile,
        ...remoteActions,
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
