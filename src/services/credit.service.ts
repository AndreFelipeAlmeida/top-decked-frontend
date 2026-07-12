import { api } from "@/adapters/api";
import type {
  CreditoJogador,
  LojaJogadorLink,
  LojaJogadorPublico,
} from "@/types/Credito";

const resource = "/creditos";

export const getStorePlayerLinks = async (search = "") => {
  const response = await api.get<LojaJogadorPublico[]>(`${resource}/`, {
    params: { search },
  });
  return response.data;
};

export const getPlayerCredits = async () => {
  const response = await api.get<CreditoJogador[]>(`${resource}/jogador`);
  return response.data;
};

export const linkExistingPlayer = async ({
  jogadorId,
  apelido,
}: {
  jogadorId: number;
  apelido?: string;
}) => {
  const response = await api.post<LojaJogadorLink>(`${resource}/${jogadorId}`, null, {
    params: { apelido },
  });
  return response.data;
};

export const addCredits = async (id: number, valor: number) => {
  const response = await api.patch<LojaJogadorLink>(`${resource}/${id}/adicionar-credito`, {
    novos_creditos: valor,
  });
  return response.data;
};

export const removeCredits = async (id: number, valor: number) => {
  const response = await api.patch<LojaJogadorLink>(`${resource}/${id}/remover-credito`, {
    retirar_creditos: valor,
  });
  return response.data;
};

export const unlinkPlayer = async (jogadorId: number) => {
  const response = await api.delete<LojaJogadorLink>(`${resource}/${jogadorId}`);
  return response.data;
};
