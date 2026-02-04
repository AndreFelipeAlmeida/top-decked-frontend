import { api } from "@/adapters/api";
import type { TipoJogadorPublico, TipoJogadorBase } from "@/types/Player";

const resource = "/lojas/tipoJogador";

export const getTiposJogador = async () => {
  const res = await api.get<TipoJogadorPublico[]>(`${resource}/`);
  return res.data;
};

export const criarTipoJogador = async (dados: TipoJogadorBase) => {
  const res = await api.post<TipoJogadorPublico>(`${resource}/`, dados);
  return res.data;
};

export const atualizarTipoJogador = async (id: number, dados: TipoJogadorBase) => {
  const res = await api.put<TipoJogadorPublico>(`${resource}/${id}`, dados);
  return res.data;
};

export const deletarTipoJogador = async (id: number) => {
  await api.delete(`${resource}/${id}`);
};