import { api } from "@/adapters/api";
import type { ComposicaoPartidaPublico, Unidade, RepresentacaoComposicao } from "@/types/Composicao";
import type { JogadorTorneioLinkPublico } from "@/types/Tournaments";

export const searchUnidades = async (tcg: string, busca: string) => {
  const response = await api.get<Unidade[]>("/unidades", {
    params: { tcg, busca },
  });
  return response.data;
};

export const getRepresentacoes = async (tcg: string) => {
  const response = await api.get<RepresentacaoComposicao[]>("/lojas/composicoes/representacoes", {
    params: { tcg },
  });
  return response.data;
};

export const createRepresentacao = async (dados: {
  tcg: string;
  nome?: string;
  unidade_1_id: number;
  unidade_2_id: number;
}) => {
  const response = await api.post<RepresentacaoComposicao>("/lojas/composicoes/representacoes", dados);
  return response.data;
};

export const updatePlayerComposicao = async (
  torneioId: string,
  linkId: number,
  dados: {
    composicao_representacao_id: number | null;
    composicao_unidades: { unidade_catalogo_id: number; quantidade: number }[];
  },
) => {
  const response = await api.patch<JogadorTorneioLinkPublico>(
    `/lojas/torneios/${torneioId}/jogadores/${linkId}/composicao`,
    dados,
  );
  return response.data;
};

export const getComposicaoPartida = async (torneioId: string, rodadaId: number, linkId: number) => {
  const response = await api.get<ComposicaoPartidaPublico>(
    `/lojas/torneios/${torneioId}/rodadas/${rodadaId}/jogadores/${linkId}/composicao-partida`,
  );
  return response.data;
};

export const updateComposicaoPartida = async (
  torneioId: string,
  rodadaId: number,
  linkId: number,
  dados: { unidades: { unidade_catalogo_id: number; quantidade: number }[] },
) => {
  const response = await api.patch<ComposicaoPartidaPublico>(
    `/lojas/torneios/${torneioId}/rodadas/${rodadaId}/jogadores/${linkId}/composicao-partida`,
    dados,
  );
  return response.data;
};
