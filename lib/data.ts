import { Doctor, HealthRecord } from "./type";

// Helper function to safely access localStorage
function safeLocalStorage() {
    if (typeof window !== "undefined") {
      return window.localStorage;
    }
    return null; // Return null if localStorage is not available (e.g., on the server)
  }
  
  // Fetch doctors from the API and store in localStorage
  export async function getDoctors(): Promise<Doctor[]> {
    const localStorage = safeLocalStorage();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
    try {
      const response = await fetch(`${apiUrl}/api/appointment/doctors`, {
        cache: "no-store",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
  
      const doctors = await response.json();
  
      // Save the fetched data to localStorage (only if available)
      if (localStorage) {
        localStorage.setItem("doctors", JSON.stringify(doctors));
      }
  
      return doctors;
    } catch (error) {
      console.error("Error fetching doctors:", error);
  
      // Attempt to retrieve data from localStorage if the API call fails
      if (localStorage) {
        const cachedDoctors = localStorage.getItem("doctors");
        return cachedDoctors ? JSON.parse(cachedDoctors) : [];
      }
  
      return [];
    }
  }
  
  // Fetch health records from the API and store in localStorage
  export async function getHealthRecords(): Promise<HealthRecord[]> {
    const localStorage = safeLocalStorage();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
    try {
      const response = await fetch(`${apiUrl}/api/health-record`, {
        cache: "no-store",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch health records");
      }
  
      const healthRecords = await response.json();
  
      // Save the fetched data to localStorage (only if available)
      if (localStorage) {
        localStorage.setItem("healthRecords", JSON.stringify(healthRecords));
      }
  
      return healthRecords;
    } catch (error) {
      console.error("Error fetching health records:", error);
  
      // Attempt to retrieve data from localStorage if the API call fails
      if (localStorage) {
        const cachedHealthRecords = localStorage.getItem("healthRecords");
        return cachedHealthRecords ? JSON.parse(cachedHealthRecords) : [];
      }
  
      return [];
    }
  }
  
  // Fetch a specific health record by ID and filter by user ID
  export async function getHealthRecordById(id: number, userId: number): Promise<HealthRecord | null> {
    const localStorage = safeLocalStorage();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
    try {
      const response = await fetch(`${apiUrl}/api/health-record/${id}`, {
        cache: "no-store",
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch health record with ID ${id}`);
      }
  
      const healthRecord: HealthRecord = await response.json();
  
      // Check if the health record belongs to the specified user
      if (healthRecord.patient_id !== userId) {
        console.error(`Health record with ID ${id} does not belong to user with ID ${userId}`);
        return null;
      }
  
      // Save the fetched health record to localStorage (only if available)
      if (localStorage) {
        const cachedHealthRecords = localStorage.getItem("healthRecordsById") || "{}";
        const healthRecordsById = JSON.parse(cachedHealthRecords);
        healthRecordsById[id] = healthRecord;
        localStorage.setItem("healthRecordsById", JSON.stringify(healthRecordsById));
      }
  
      return healthRecord;
    } catch (error) {
      console.error(`Error fetching health record with ID ${id}:`, error);
  
      // Attempt to retrieve the specific health record from localStorage if the API call fails
      if (localStorage) {
        const cachedHealthRecordsById = localStorage.getItem("healthRecordsById");
        if (cachedHealthRecordsById) {
          const healthRecordsById = JSON.parse(cachedHealthRecordsById);
          const cachedRecord = healthRecordsById[id];
  
          // Check if the cached record belongs to the specified user
          if (cachedRecord && cachedRecord.patient_id === userId) {
            return cachedRecord;
          }
        }
      }
  
      return null;
    }
  }