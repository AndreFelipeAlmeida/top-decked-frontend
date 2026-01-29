import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const basePath = "/api";

const api = {
    get: (endpoint: string) => 
        axios.get(`${basePath}/${endpoint}`),

    post: <TResponse = unknown, Tbody = unknown>
    (endpoint: string, body?: Tbody, config?: AxiosRequestConfig) => 
        axios.post<TResponse>(`${basePath}/${endpoint}`, body, config),

    put: <TResponse = unknown, Tbody = unknown>(endpoint: string, body?: Tbody) =>
        axios.put<TResponse>(`${basePath}/${endpoint}`, body),
};

export { api };