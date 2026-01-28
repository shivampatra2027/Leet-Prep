import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  googleAuthUrl: () => `${API_BASE_URL}/auth/google`,
};

export const problemsAPI = {
  getAll: (params) => api.get("/api/problems", { params }),
  getById: (id) => api.get(`/api/problems/${id}`),
  getCompanies: () => api.get("/api/problems/companies"),
};

export const profileAPI = {
  getProfile: () => api.get("/api/profile"),
  updateLeetcodeUsername: (username) => api.put("/api/profile/leetcode-username", { leetcodeUsername: username }),
  syncLeetcode: () => api.post("/api/profile/sync-leetcode"),
  getSolvedProblems: () => api.get("/api/profile/solved-problems"),
};

export const premiumAPI = {
  checkDashboard: () => api.get("/api/premium/check-dashboard"),
};

export default api;
