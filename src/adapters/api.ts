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

        // POST /login/token respondendo 401 é credencial incorreta (usuário
        // ainda nem tinha sessão pra "expirar") — não é o mesmo caso do
        // token expirando no meio do uso do app. Deixa cair pro toast
        // genérico do fim da função, que mostra a mensagem real do backend.
        const isLoginRequest = error.config?.url?.includes("/login/token");

        if (status === 401 && !isLoginRequest) {
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

        // 404 costuma significar "lista vazia" em vários endpoints deste
        // backend (ver DIVIDA_TECNICA.md) — não é um erro que o usuário
        // precise ver como toast; quem chamou decide como tratar a ausência
        // de dado (estado vazio, campo desabilitado, etc.).
        if (status === 404) {
            return Promise.reject(error);
        }

        toast.error(message);
        return Promise.reject(error);
    },
);