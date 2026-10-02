import axios from "axios";

const resolveBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window === "undefined") {
    return "http://localhost:4501";
  }

  const { hostname } = window.location;
  const localHosts = ["localhost", "127.0.0.1", "0.0.0.0"];

  return localHosts.includes(hostname)
    ? "http://localhost:4501"
    : window.location.origin;
};

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("cravingToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
