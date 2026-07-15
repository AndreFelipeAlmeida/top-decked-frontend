import axios from "axios";
import { toast } from "sonner";

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

const lerCookie = (nome: string): string | null => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
};

export const api = axios.create({
    baseURL: "/api",
    // BRK-309: sessão agora vive num cookie (HttpOnly, transversal entre
    // subdomínios) em vez de localStorage — sem isso o browser não manda o
    // cookie em requisições cross-origin/same-site (subdomínio -> domínio
    // raiz e vice-versa).
    withCredentials: true,
});

// BRK-309: o backend valida CSRF comparando o cookie csrf_token (legível
// por JS, diferente do cookie de sessão) com este header — nunca lido do
// localStorage, sempre do próprio cookie, então nem precisa ser guardado
// em nenhum estado do app.
api.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase();
    if (method && MUTATING_METHODS.has(method)) {
        const csrfToken = lerCookie("csrf_token");
        if (csrfToken) {
            config.headers["X-CSRF-Token"] = csrfToken;
        }
    }
    return config;
});

let isRedirecting = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // BRK-311: erro 500 é sempre falha interna do servidor — o usuário
        // final não tem o que fazer com o detail técnico (stack trace,
        // "Internal Server Error", nome de exception etc.), então a
        // mensagem é sempre trocada por uma genérica e amigável, ignorando
        // o que o backend mandou.
        const message =
            status && status >= 500
                ? "Erro de comunicação com o servidor. Por favor, tente mais tarde."
                : error.response?.data?.detail || error.message || "Erro inesperado";

        // POST /login/token respondendo 401 é credencial incorreta (usuário
        // ainda nem tinha sessão pra "expirar") — não é o mesmo caso do
        // token expirando no meio do uso do app. Deixa cair pro toast
        // genérico do fim da função, que mostra a mensagem real do backend.
        const isLoginRequest = error.config?.url?.includes("/login/token");
        // GET /login/profile é a checagem de sessão que roda pra TODO
        // visitante, logado ou não (ver AuthProvider) — um 401 aqui é só
        // "ainda não logou", o estado inicial normal de quem abre o site,
        // não uma sessão que expirou no meio do uso.
        const isSessionCheck = error.config?.url?.includes("/login/profile");

        if (status === 401 && !isLoginRequest && !isSessionCheck) {
            if (!isRedirecting) {
                isRedirecting = true;

                toast.error("Sessão expirada. Faça login novamente.");

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
