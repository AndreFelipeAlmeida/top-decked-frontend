import { api } from '@/adapters/api';
import type { Credito, CreditoJogador, CreditoPublico, CreditoUpdate } from '@/types/Credito';
import type { LojaCriarJogador } from '@/types/Player';

const resource = '/creditos';

export const updateCredits = async (
  id: number,
  updatedStock: CreditoUpdate,
): Promise<Credito> => {
  const response = await api.put<Credito>(`${resource}/${id}`, updatedStock);
  return response.data;
};

export const addCreditsById = async ({
  jogadorId,
  apelido,
}: {
  jogadorId: number;
  apelido?: string;
}): Promise<Credito> => {
  const response = await api.post<Credito>(`${resource}/${jogadorId}`, null, {
    params: { apelido },
  });

  return response.data;
};

export const addCredits = async (
  id: number,
  addCredits: number,
): Promise<Credito> => {
  const response = await api.patch<Credito>(
    `${resource}/${id}/adicionar-credito`,
    { novos_creditos: addCredits },
  );
  return response.data;
};

export const removeCredits = async (
  id: number,
  removeCredits: number,
): Promise<Credito> => {
  const response = await api.patch<Credito>(
    `${resource}/${id}/remover-credito`,
    { retirar_creditos: removeCredits },
  );
  return response.data;
};

export const getPlayerCredits = async (): Promise<CreditoJogador[]> => {
  const response = await api.get<CreditoJogador[]>(`${resource}/jogador`);
  return response.data;
};

export const unlinkPlayer = async (jogadorId: number) => {
  const res = await api.delete(`${resource}/${jogadorId}`);
  return res.data;
};

export const getPlayersStoreLink = async ({ search = '' }) => {
  const res = await api.get<CreditoPublico[]>(`${resource}/`, {
    params: { search },
  });
  return res.data;
};

export const criarJogadorLoja = async (novo_jogador: LojaCriarJogador) => {
  const res = await api.post<CreditoPublico>(`${resource}/`, novo_jogador);
  return res.data;
};
