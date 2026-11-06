import axios from "axios";

const AUTH_TOKEN_KEY = "adacela-admin-token";
const configuredBaseURL = import.meta.env.VITE_API_BASE_URL;
const baseURL = configuredBaseURL
  ? (() => {
      const url = new URL(configuredBaseURL);
      if (import.meta.env.DEV && url.hostname === "localhost") {
        url.hostname = "127.0.0.1";
      }
      return url.toString().replace(/\/$/, "");
    })()
  : undefined;

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window === "undefined"
      ? null
      : window.sessionStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiAuthToken() {
  return typeof window === "undefined"
    ? null
    : window.sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function setApiAuthToken(token) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearApiAuthToken() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export default api;