import axios from "axios";

function resolveApiBaseUrl() {
  const envUrl =
    import.meta.env.VITE_API_URL || "https://api.leetcodepremium.xyz";

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    if (isLocal) {
      return `${window.location.protocol}//${host}:8080`;
    }

    // Force canonical API host for production site domain.
    if (host === "leetcodepremium.xyz" || host === "www.leetcodepremium.xyz") {
      return "https://api.leetcodepremium.xyz";
    }
  }

  return envUrl || "https://api.leetcodepremium.xyz";
}

const API_BASE_URL = resolveApiBaseUrl();
let accessToken = null;
let refreshPromise = null;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const isRefreshRequest = (config) =>
  config?.url?.includes("/auth/refresh") || config?.skipAuthRefresh;

const isAuthEndpoint = (url = "") =>
  url.includes("/auth/login") ||
  url.includes("/auth/signup") ||
  url.includes("/auth/refresh") ||
  url.includes("/auth/google");

const isAuthPagePath = (path = "") =>
  path === "/login" || path === "/signup" || path === "/oauth-success";

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export async function refreshAccessToken() {
  const res = await api.post(
    "/auth/refresh",
    {},
    { withCredentials: true, skipAuthRefresh: true },
  );
  const nextToken = res.data?.access || null;
  setAccessToken(nextToken);
  return nextToken;
}

// Request interceptor - add auth token to all requests
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const is401 = error.response?.status === 401;

    if (
      is401 &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest) &&
      !isAuthEndpoint(originalRequest.url || "")
    ) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const nextToken = await refreshPromise;
        if (!nextToken) throw new Error("No access token from refresh");
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return api(originalRequest);
      } catch {
        clearAccessToken();
        if (
          typeof window !== "undefined" &&
          !isAuthPagePath(window.location.pathname)
        ) {
          window.location.replace("/login");
        }
      }
    }

    if (is401 && isRefreshRequest(originalRequest)) {
      clearAccessToken();
    }

    return Promise.reject(error);
  },
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/signup", userData),
  refresh: () => refreshAccessToken(),
  logout: () => api.post("/auth/logout", {}, { skipAuthRefresh: true }),
  googleAuthUrl: () => `${API_BASE_URL}/auth/google`,
};

export const problemsAPI = {
  getAll: (params) => api.get("/api/problems", { params }),
  getById: (id) => api.get(`/api/problems/${id}`),
  getCompanies: () => api.get("/api/problems/companies"),
};

export const profileAPI = {
  getProfile: () => api.get("/api/profile"),
  getSolvedProblems: () => api.get("/api/profile/solved-problems"),
  addSolvedProblem: (problemId) =>
    api.post("/api/profile/solved-problems", { problemId }),
  removeSolvedProblem: (problemId) =>
    api.delete(`/api/profile/solved-problems/${problemId}`),
  getSolvedSummary: () => api.get("/api/profile/solved-summary"),
};

export const resumeAPI = {
  analyze: (formData) =>
    // Let the browser set the multipart boundary; overriding Content-Type breaks file parsing.
    api.post("/api/resume/analyze", formData),
};

export const paymentAPI = {
  createOrder: (orderData) => api.post("/api/payment/create-order", orderData),
  verifyPayment: (verificationData) =>
    api.post("/api/payment/verify", verificationData),
  getPaymentStatus: (orderId) => api.get(`/api/payment/status/${orderId}`),
  getPaymentHistory: () => api.get("/api/payment/history"),
};

export const premiumAPI = {
  checkDashboard: () => api.get("/api/premium/check-dashboard"),
};

export const referralAPI = {
  getMe: () => api.get("/api/referral/me"),
  join: () => api.post("/api/referral/join"),
  apply: (code) => api.post("/api/referral/apply", { code }),
  getLeaderboard: () => api.get("/api/referral/leaderboard"),
  redeem: (tierId) => api.post("/api/referral/redeem", { tierId }),
};

export default api;
