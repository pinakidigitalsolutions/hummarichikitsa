
import axios from "axios";

import { BASE_URL } from "./constants";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Simple request caching mechanism
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Interceptor to dynamically set the token from Redux (if available)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const requestUrl = config.url || "";
    const isDynamicAppointmentEndpoint = /\/appointment(\/|$)/.test(requestUrl);
    const shouldSkipCache = config.skipCache === true || isDynamicAppointmentEndpoint;

    // Cache GET requests only (except dynamic endpoints)
    if (config.method === "get" && !shouldSkipCache) {
      const cacheKey = `${config.url}?${new URLSearchParams(config.params || {}).toString()}`;
      const cachedData = requestCache.get(cacheKey);

      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        // Return cached data without making a request
        config.adapter = () =>
          Promise.resolve({
            data: cachedData.data,
            status: 200,
            statusText: "OK (cached)",
            headers: {},
            config: config,
          });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to cache successful GET requests
axiosInstance.interceptors.response.use(
  (response) => {
    const responseUrl = response.config.url || "";
    const isDynamicAppointmentEndpoint = /\/appointment(\/|$)/.test(responseUrl);
    const shouldSkipCache = response.config.skipCache === true || isDynamicAppointmentEndpoint;

    // Cache GET requests (except dynamic endpoints)
    if (response.config.method === "get" && !shouldSkipCache) {
      const cacheKey = `${response.config.url}?${new URLSearchParams(
        response.config.params || {}
      ).toString()}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export cache control functions
export const clearCache = () => {
  requestCache.clear();
};

export const invalidateCache = (pattern) => {
  const keysToDelete = [];
  for (let key of requestCache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach((key) => requestCache.delete(key));
};

export default axiosInstance;