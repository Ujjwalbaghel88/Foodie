import axios from "axios";

const fallbackBaseURL =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
      ? "http://localhost:4501"
      : window.location.origin
    : "http://localhost:4501";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || fallbackBaseURL,
  withCredentials: true,
});

export default api;
