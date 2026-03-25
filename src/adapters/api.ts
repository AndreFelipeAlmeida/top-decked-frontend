import axios from "axios";
import { toast } from "sonner";


export const api = axios.create({
    baseURL: "/api",
});

let isRedirecting = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        const message =
            error.response?.data?.detail || error.message || "Erro inesperado";

        if (status === 401) {
            if (!isRedirecting) {
                isRedirecting = true;

                toast.error("Sessão expirada. Faça login novamente.");

                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");

                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }
            return Promise.reject(error);
        }

        toast.error(message);
        return Promise.reject(error);
    },
);