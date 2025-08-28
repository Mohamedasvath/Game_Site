import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // comes from .env file
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const fetchGames = () => API.get("/games");
