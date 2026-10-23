import { useCallback } from "react";
import { buildProgressState } from "../utils/gamification";
import PeopleService from "../utils/peopleService";
import PainTypesService from "../utils/painTypesService";
import RecordsService from "../utils/recordsService";
import { mapPerson, mapPainType, mapRecord } from "../utils/apiMappers";

// People, pain types and records: API calls plus the matching `user` state updates.
// Shares the UserProvider state so useUser() keeps exposing a single flat API.
export default function useRemoteData({
  user,
  setUser,
  saveUserData,
  incrementRecords,
}) {
  const loadPeopleFromAPI = useCallback(async () => {
    try {
      const response = await PeopleService.getPeople();
      if (response.success) {
        setUser((prevUser) => ({
          ...prevUser,
          people: response.people.map(mapPerson),
        }));
      }
    } catch (error) {
      console.error("Error loading people from API:", error);
    }
  }, [setUser]);

  const loadPainTypesFromAPI = useCallback(async () => {
    try {
      const response = await PainTypesService.getPainTypes();
      if (response.success) {
        setUser((prevUser) => ({
          ...prevUser,
          painTypes: response.painTypes.map(mapPainType),
        }));
      }
    } catch (error) {
      console.error("Error loading pain types from API:", error);
    }
  }, [setUser]);

  const loadRecordsFromAPI = useCallback(async () => {
    try {
      const response = await RecordsService.getRecords();
      if (response.success && response.records) {
        setUser((prevUser) => ({
          ...prevUser,
          records: response.records.map(mapRecord),
        }));
      }
    } catch (error) {
      console.error("Error loading records from API:", error);
    }
  }, [setUser]);

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
        const newPerson = mapPerson(response.person);
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

    try {
      const response = await PainTypesService.createPainType(
        trimmed,
        image || undefined,
      );

      if (response.success) {
        const newPainType = mapPainType(response.painType);
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

  return {
    loadPeopleFromAPI,
    loadPainTypesFromAPI,
    loadRecordsFromAPI,
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
  };
}
