import HttpService from "./httpService";

class PeopleService {
  // Get all people for the current user
  async getPeople() {
    const response = await HttpService.get("/people");
    if (response.success) {
      return {
        success: true,
        people: response.data?.people || [],
      };
    }
    return response;
  }

  // Get a specific person
  async getPerson(id) {
    const response = await HttpService.get(`/people/${id}`);
    if (response.success) {
      return {
        success: true,
        person: response.data?.person,
      };
    }
    return response;
  }

  // Create a new person
  async createPerson(name, relation = null, imageUrl = null) {
    const response = await HttpService.post("/people", {
      name: name.trim(),
      relation: relation?.trim() || null,
      image_url: imageUrl?.trim() || null,
    });
    if (response.success) {
      return {
        success: true,
        person: response.data?.person,
      };
    }
    return response;
  }

  // Update a person
  async updatePerson(id, name, relation = null, imageUrl = null) {
    const response = await HttpService.put(`/people/${id}`, {
      name: name.trim(),
      relation: relation?.trim() || null,
      image_url: imageUrl?.trim() || null,
    });
    if (response.success) {
      return {
        success: true,
        person: response.data?.person,
      };
    }
    return response;
  }

  // Delete a person
  async deletePerson(id) {
    const response = await HttpService.delete(`/people/${id}`);
    return response;
  }
}

export default new PeopleService();
