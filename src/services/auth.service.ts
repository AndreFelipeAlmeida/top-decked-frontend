import { api } from "@/adapters/api";
import type { User } from "@/types/User";
import type { JogadorCriar, JogadorPublico } from "@/types/Player";

const resource = "/login";

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export const login = async (username: string, password: string) => {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const response = await api.post<LoginResponse>(`${resource}/token`, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data;
};

export const register = async (novoJogador: JogadorCriar) => {
  const response = await api.post<JogadorPublico>("/jogadores/", novoJogador);
  return response.data;
};

export const getSession = async () => {
  const response = await api.get<User>(`${resource}/profile`);
  return response.data;
};

export const esqueciSenha = async (email: string) => {
  const response = await api.post<{ detail: string }>(`${resource}/esqueci-senha`, { email });
  return response.data;
};

export const validarTokenRedefinicao = async (token: string) => {
  const response = await api.get<{ valido: boolean }>(`${resource}/validar-token-redefinicao`, {
    params: { token },
  });
  return response.data;
};

export const redefinirSenha = async (token: string, novaSenha: string) => {
  const response = await api.post<{ detail: string }>(`${resource}/redefinir-senha`, {
    token,
    nova_senha: novaSenha,
  });
  return response.data;
};
