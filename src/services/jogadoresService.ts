import { api } from "@/adapters/api";
import type { JogadorPublico } from "@/types/Players";
import type { JogadorEstatisticas } from "@/types/Statistics";

const resource = "/jogadores";

export const obterPerfilJogador = async (id: number) => {
  const res = await api.get<JogadorPublico>(`${resource}/${id}`);
  return res.data;
};

export const obterLojaPorUsuario = async (usuarioId: number) => {
    const res = await api.get<JogadorPublico>(`/lojas/usuario/${usuarioId}`);
    return res.data;
};

export const obterEstatisticas = async (id: number) => {
  const res = await api.get<JogadorEstatisticas>(`${resource}/${id}/estatisticas`);
  return res.data;
};