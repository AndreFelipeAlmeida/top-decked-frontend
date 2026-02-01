import { api } from "@/adapters/api";
import type { JogadorLojaPublico, JogadorPublico } from "@/types/Players";
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

export const getEstatisticasJogador = async () => {
  const res = await api.get<JogadorEstatisticas>(`${resource}/estatisticas`);
  return res.data;
};

export const getPlayersByOrganizer = async () => {
  const res = await api.get<JogadorLojaPublico[]>(`${resource}/loja`);
  return res.data;
}