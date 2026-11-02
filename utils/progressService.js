import HttpService from "./httpService";
import { API_ENDPOINTS } from "../constants/api";
import { progressFromApi } from "./serverProgress";

// Wraps the progress endpoints. Like the other services it never throws: it
// answers { success, progress } or { success: false, error }.
const fromResponse = (response) => {
  if (!response.success) return response;
  const progress = progressFromApi(response.data?.progress);
  return progress
    ? { success: true, progress }
    : { success: false, error: "No se pudo leer tu progreso." };
};

class ProgressService {
  async getProgress() {
    return fromResponse(await HttpService.get(API_ENDPOINTS.PROGRESS));
  }

  // Claims an achievement the records alone do not unlock (sharing).
  async claimAchievement(achievementId) {
    return fromResponse(
      await HttpService.post(`${API_ENDPOINTS.PROGRESS}/achievements/${achievementId}`),
    );
  }
}

export default new ProgressService();
