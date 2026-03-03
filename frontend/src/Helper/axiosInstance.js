
import axios from "axios";


const BASE_URL = "http://localhost:5000/api/v1";
// const BASE_URL = "https://doctor-appointment-backend-t00j.onrender.com/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Interceptor to dynamically set the token from Redux (if available)
axiosInstance.interceptors.request.use(
  
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;