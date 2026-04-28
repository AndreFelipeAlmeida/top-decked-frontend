import { api } from "@/adapters/api";
import type { GetPlayersResponse, JogadorLojaPublico, JogadorPublico } from "@/types/Player";
import type { JogadorEstatisticas } from "@/types/Statistics";

const resource = "/jogadores";


export const obterJogadores = async ({ page = 1, limit = 10, search = "" }) => {
    const res = await api.get<GetPlayersResponse>(`${resource}/`, {
        params: { page, limit, search },
    });

    return res.data;
};


export const obterPerfilJogador = async (id: number) => {
  const res = await api.get<JogadorPublico>(`${resource}/${id}`);
  return res.data;
};

export const editarPerfilJogador = async (pokemon_id: string) => {
  const res = await api.put<JogadorPublico>(`${resource}/`, {
    tcgs: [
      {
        tcg: 'POKEMON',
        id: pokemon_id,
      },
    ],
  });

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