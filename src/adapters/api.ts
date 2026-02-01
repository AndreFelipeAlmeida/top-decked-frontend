import axios from "axios";

const basePath = "/api";

export const api = axios.create({
  baseURL: basePath,
})