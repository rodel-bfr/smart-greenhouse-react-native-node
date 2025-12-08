// services/apiClient.js
// Enhanced apiClient with clear organization and better error handling

import axios from "axios";
import { auth } from "./firebase";
import { DEMO_MODE, API_BASE_URL, WEATHER_API_KEY } from "./config"; // Import config constants
import { normalizeDataToToday } from "../utils/dateAdjustment"; // Utility for date normalization
import { getSimulatedWeather } from "./mockWeather"; // Import the weather simulator

// Create the Axios instance using the dynamic Base URL from config.js
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// =================================================================
// 🔐 SECURITY INTERCEPTOR
// =================================================================
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        // console.log("Firebase ID Token added to headers.");
      } catch (error) {
        console.error("Could not get Firebase ID token", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =================================================================
// 🐞 DEBUGGING INTERCEPTORS
// =================================================================
apiClient.interceptors.request.use(
  (config) => {
    console.log("API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      // data: config.data, // Uncomment to see payload
    });
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error("Response Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

// =================================================================
// 👤 USER MANAGEMENT
// =================================================================

// Get single user by ID
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users_data/${userId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

// Get ALL users data
export const getAllUsersData = () => apiClient.get("/users_data");

// Create new user data
export const createUserData = (userData) => apiClient.post("/users_data", userData);

// Delete user
export const deleteUserById = (userId) => apiClient.delete(`/users_data/${userId}`);

// Update user data - Smart method (Tries PATCH, then PUT)
export const updateUserById = async (userId, updatedData) => {
  try {
    console.log(`Attempting to update user ${userId}:`, updatedData);

    // Try PATCH first (partial update)
    try {
      const response = await apiClient.patch(`/users_data/${userId}`, updatedData);
      return response;
    } catch (patchError) {
      console.warn("PATCH failed, trying PUT:", patchError.message);

      // Method 2: If PATCH fails, try PUT (full update)
      const currentUser = await getUserById(userId);
      const fullUserData = { ...currentUser.data, ...updatedData };

      const response = await apiClient.put(`/users_data/${userId}`, fullUserData);
      return response;
    }
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    if (error.response?.status === 404) throw new Error(`User ${userId} not found`);
    throw error;
  }
};

// =================================================================
// 📞 CONTACT MANAGEMENT
// =================================================================

export const submitContact = async (contactData) => {
  try {
    const response = await apiClient.post("/contacts", contactData);
    return response.data;
  } catch (error) {
    console.error("Contact submission error:", error);
    throw new Error("Failed to submit contact form");
  }
};

export const getContacts = async () => {
  try {
    const response = await apiClient.get("/contacts");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch contacts");
  }
};

export const getContactById = async (id) => {
  try {
    const response = await apiClient.get(`/contacts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch contact");
  }
};

export const updateContactStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/contacts/${id}`, { status });
    return response.data;
  } catch (error) {
    throw new Error("Failed to update contact status");
  }
};

export const deleteContact = async (id) => {
  try {
    const response = await apiClient.delete(`/contacts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete contact");
  }
};

// =================================================================
// ✅ TASKS API CALLS
// =================================================================

// Get all tasks
export const getTasks = () =>
  apiClient.get("/tasks", {
    params: { t: Date.now() }, // Prevent caching
    headers: { "Cache-Control": "no-cache" },
  });

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await apiClient.post("/tasks", taskData);
    return response;
  } catch (error) {
    console.error("Task creation error:", error);
    throw error;
  }
};

// Update an existing task (Patch -> Put fallback)
export const updateTask = async (taskId, updatedData) => {
  try {
    try {
      return await apiClient.patch(`/tasks/${taskId}`, updatedData);
    } catch (patchError) {
      console.warn("Task PATCH failed, trying PUT fallback.");
      const currentTask = await apiClient.get(`/tasks/${taskId}`);
      const fullTaskData = { ...currentTask.data, ...updatedData };
      return await apiClient.put(`/tasks/${taskId}`, fullTaskData);
    }
  } catch (error) {
    console.error(`Task update error for ${taskId}:`, error);
    throw error;
  }
};

// Delete Task
export const deleteTask = (taskId) => apiClient.delete(`/tasks/${taskId}`);

// =================================================================
// 🌦️ REAL-TIME WEATHER (Hybrid: Demo + Real)
// =================================================================
export const getRealtimeWeather = async (location) => {
  // 🅰️ OPTION A: DEMO MODE (Mock Data)
  if (DEMO_MODE) {
    // Simulate a small network delay to make the app feel "real"
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // Get the raw mock data
    const mockData = getSimulatedWeather(location);
    
    // Format it exactly like real data
    return formatWeatherData(mockData); 
  }

  // 🅱️ OPTION B: PRODUCTION MODE (Real API)
  const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=${WEATHER_API_KEY}&contentType=json`;

  try {
    const response = await axios.get(apiUrl);
    // Format the real data
    return formatWeatherData(response.data);
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    // Optional: Fallback to mock data if the real API fails (Safety Net)
    // return formatWeatherData(getSimulatedWeather(location));
    throw new Error("Could not fetch weather information.");
  }
};

// 🛠️ HELPER: Standardize Data
// This logic used to be inside getRealtimeWeather. 
// We moved it here so it works for BOTH Real and Mock data.
const formatWeatherData = (data) => {
  const today = data.days[0];
  const nextDay = data.days[1];
  const current = data.currentConditions || today;

  const getEmoji = (c) => {
    const t = c ? c.toLowerCase() : "";
    if (t.includes("clear")) return "☀️";
    if (t.includes("cloud")) return "☁️";
    if (t.includes("rain")) return "🌧️";
    if (t.includes("snow")) return "❄️";
    if (t.includes("storm")) return "⛈️";
    return "🌤️";
  };

  // Calculate hourly forecast logic
  const now = new Date();

  const nextHour = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();
  
  let hourlyForecast = [];

  if (today && Array.isArray(today.hours)) {
    // Filter hours remaining in the day
    const hoursFromToday = today.hours.filter((h) => parseInt(h.datetime.split(":")[0], 10) >= nextHour);
    
    // If we are near the end of the day, grab hours from tomorrow
    if (hoursFromToday.length < 12 && nextDay?.hours) {
      hourlyForecast = hoursFromToday.concat(nextDay.hours.slice(0, 12 - hoursFromToday.length));
    } else {
      hourlyForecast = hoursFromToday.slice(0, 12);
    }
    
    hourlyForecast = hourlyForecast.map((h) => ({
      hour: h.datetime.slice(0, 5),
      temp: h.temp,
      weather_type: h.conditions,
      emoji: getEmoji(h.conditions),
    }));
  }

  return {
    currentWeather: {
      location: data.resolvedAddress,
      weather_type: current.conditions,
      temperature: current.temp,
      humidity: current.humidity,
      wind: `${current.winddir}° ${current.windspeed} km/h`,
    },
    hourlyForecast,
  };
};

// =================================================================
// 🌿 GREENHOUSE, SENSORS & ACTUATORS
// =================================================================

export const getGreenhouses = () => apiClient.get("/greenhouses");

export const getSensors = () => apiClient.get("/sensors");
export const getSensorsByGreenhouse = (greenhouseId) =>
  apiClient.get(`/sensors?greenhouse_id=${greenhouseId}`);

export const getActuators = () => apiClient.get("/actuators");
export const getActuatorsByGreenhouse = (greenhouseId) =>
  apiClient.get(`/actuators?greenhouse_id=${greenhouseId}`);

export const updateActuator = (id, updatedData) =>
  apiClient.put(`/actuators/${id}`, updatedData);

// =================================================================
// ⚡ ACTUATOR COMMANDS
// =================================================================

export const sendActuatorCommand = async ({
  actuator_id,
  command,
  issued_by_user_id,
  level,
  expires_at,
  duration_minutes,
}) => {
  if (!issued_by_user_id) throw new Error("Firebase UID undefined!");

  const payload = { actuator_id, command, issued_by_user_id };
  if (level !== undefined && level !== null) payload.level = level;
  if (expires_at) payload.expires_at = expires_at.toISOString().slice(0, 19).replace("T", " ");
  if (duration_minutes) payload.duration_minutes = duration_minutes;

  console.log("📤 Sending Command:", payload);
  try {
    const response = await apiClient.post("/actuators/commands", payload);
    return response.data;
  } catch (err) {
    console.error("❌ Command Error:", err.response?.data || err.message);
    throw err;
  }
};

export const getCommandsByActuator = (actuatorId) =>
  apiClient.get(`/actuators/commands?actuator_id=${actuatorId}`);

// =================================================================
// 📅 ACTUATOR SCHEDULES
// =================================================================

export const getActuatorSchedulesByGreenhouse = (greenhouseId) =>
  apiClient.get(`/actuator_schedules?greenhouse_id=${greenhouseId}`);

export const createActuatorSchedule = async ({
  actuator_id,
  greenhouse_id,
  schedule_date,
  start_time,
  end_time,
  issued_by_user_id
}) => {
  if (!issued_by_user_id) throw new Error("Firebase UID undefined!");
  
  const payload = { actuator_id, greenhouse_id, schedule_date, start_time, end_time, issued_by_user_id };
  
  try {
    const response = await apiClient.post("/actuator_schedules", payload);
    return response.data;
  } catch (err) {
    console.error("❌ Schedule Error:", err.response?.data || err.message);
    throw err;
  }
};

export const deleteActuatorSchedule = async (scheduleId) => {
  try {
    const response = await apiClient.delete(`/actuator_schedules/${scheduleId}`);
    return response.data;
  } catch (err) {
    throw err;
  }
};

// =================================================================
// 📈 SENSOR READINGS (With Demo Time Travel)
// =================================================================

export const getReadingsBySensor = async (sensorId, signal) => {
  try {
    const response = await apiClient.get(`/sensors_readings?sensor_id=${sensorId}`, { signal });
    // 🎩 TIME TRAVEL MAGIC (For Demo Mode)
    if (DEMO_MODE) {
       response.data = normalizeDataToToday(response.data);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const getOutsideWeatherByGreenhouse = async (greenhouseId) => {
  try {
    const response = await apiClient.get(`/outside_weather?greenhouse_id=${greenhouseId}`);
    if (DEMO_MODE) {
       response.data = normalizeDataToToday(response.data);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export default apiClient;