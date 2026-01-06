import HttpService from "./httpService";

class RecordsService {
  // Get all records for the current user
  static async getRecords() {
    try {
      const response = await HttpService.get("/records");
      if (response.success) {
        return { success: true, records: response.data.records };
      }
      return response;
    } catch (error) {
      console.error("Error fetching records:", error);
      return { success: false, error: error.message };
    }
  }

  // Get today's records for the current user
  static async getTodayRecords() {
    try {
      const response = await HttpService.get("/records/today");
      if (response.success) {
        return { success: true, records: response.data.records };
      }
      return response;
    } catch (error) {
      console.error("Error fetching today records:", error);
      return { success: false, error: error.message };
    }
  }

  // Create a new record
  static async createRecord(recordData) {
    try {
      const response = await HttpService.post("/records", recordData);
      if (response.success) {
        return { success: true, record: response.data.record };
      }
      return response;
    } catch (error) {
      console.error("Error creating record:", error);
      return { success: false, error: error.message };
    }
  }

  // Update a record
  static async updateRecord(recordId, recordData) {
    try {
      const response = await HttpService.put(
        `/records/${recordId}`,
        recordData
      );
      if (response.success) {
        return { success: true, record: response.data.record };
      }
      return response;
    } catch (error) {
      console.error("Error updating record:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete a record
  static async deleteRecord(recordId) {
    try {
      const response = await HttpService.delete(`/records/${recordId}`);
      if (response.success) {
        return { success: true };
      }
      return response;
    } catch (error) {
      console.error("Error deleting record:", error);
      return { success: false, error: error.message };
    }
  }

  // Get records for a specific person
  static async getRecordsByPerson(personId) {
    try {
      const response = await HttpService.get(`/records/person/${personId}`);
      if (response.success) {
        return { success: true, records: response.data.records };
      }
      return response;
    } catch (error) {
      console.error("Error fetching records by person:", error);
      return { success: false, error: error.message };
    }
  }

  // Get records for a specific date range
  static async getRecordsByDateRange(startDate, endDate) {
    try {
      const response = await HttpService.get(
        `/records/range?start=${startDate}&end=${endDate}`
      );
      if (response.success) {
        return { success: true, records: response.data.records };
      }
      return response;
    } catch (error) {
      console.error("Error fetching records by date range:", error);
      return { success: false, error: error.message };
    }
  }
}

export default RecordsService;
