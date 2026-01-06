import HttpService from "./httpService";

class PainTypesService {
  // Get all pain types for the current user
  async getPainTypes() {
    const response = await HttpService.get("/pain-types");
    if (response.success) {
      return {
        success: true,
        painTypes: response.data?.painTypes || [],
      };
    }
    return response;
  }

  // Get a specific pain type
  async getPainType(id) {
    const response = await HttpService.get(`/pain-types/${id}`);
    if (response.success) {
      return {
        success: true,
        painType: response.data?.painType,
      };
    }
    return response;
  }

  // Create a new pain type
  async createPainType(name, imageUrl = null) {
    const response = await HttpService.post("/pain-types", {
      name: name.trim(),
      image_url: imageUrl?.trim() || null,
    });
    if (response.success) {
      return {
        success: true,
        painType: response.data?.painType,
      };
    }
    return response;
  }

  // Update an existing pain type
  async updatePainType(id, name, imageUrl = null) {
    console.log("PainTypesService.updatePainType called with:", {
      id,
      name,
      imageUrl,
    });
    const response = await HttpService.put(`/pain-types/${id}`, {
      name: name.trim(),
      image_url: imageUrl?.trim() || null,
    });
    console.log("PainTypesService.updatePainType HTTP response:", response);
    if (response.success) {
      return {
        success: true,
        painType: response.data?.painType,
      };
    }
    return response;
  }

  // Delete a pain type
  async deletePainType(id) {
    const response = await HttpService.delete(`/pain-types/${id}`);
    if (response.success) {
      return {
        success: true,
        message: response.data?.message || "Pain type deleted successfully",
      };
    }
    return response;
  }
}

export default new PainTypesService();
