import axios from "axios";

const isDebug = import.meta.env.VITE_DEBUG === "true";

const baseURL = isDebug
  ? "/api"
  : import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL,
});
