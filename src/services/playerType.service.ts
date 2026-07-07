import { api } from "@/adapters/api";
import type { TipoJogadorBase, TipoJogadorPublico } from "@/types/Player";

const resource = "/lojas/tipoJogador";

export const getPlayerTypes = async () => {
  const response = await api.get<TipoJogadorPublico[]>(`${resource}/`);
  return response.data;
};

export const getPlayerTypesByOrganizer = async (storeId: number) => {
  const response = await api.get<TipoJogadorPublico[]>(`${resource}/loja/${storeId}`);
  return response.data;
};

export const getPlayerTypeById = async (id: number) => {
  const response = await api.get<TipoJogadorPublico>(`${resource}/${id}`);
  return response.data;
};

export const createPlayerType = async (dados: TipoJogadorBase) => {
  const response = await api.post<TipoJogadorPublico>(`${resource}/`, dados);
  return response.data;
};

export const createPlayerTypeAsOrganizer = async (dados: TipoJogadorBase & { loja_id: number }) => {
  const response = await api.post<TipoJogadorPublico>(`${resource}/organizador`, dados);
  return response.data;
};

export const updatePlayerType = async (id: number, dados: Partial<TipoJogadorBase>) => {
  const response = await api.put<TipoJogadorPublico>(`${resource}/${id}`, dados);
  return response.data;
};

export const deletePlayerType = async (id: number) => {
  await api.delete(`${resource}/${id}`);
};
