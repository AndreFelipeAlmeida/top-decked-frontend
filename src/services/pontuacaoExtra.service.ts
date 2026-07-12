import { api } from "@/adapters/api";
import type { JogadorCriadoPublico } from "@/types/JogadorCriado";
import type { PontuacaoExtraCriar, PontuacaoExtraPublico } from "@/types/PontuacaoExtra";

const resourceTorneios = "/lojas/torneios";
const resourceHistorico = "/lojas/pontuacao-extra";

export const criarPontuacaoExtra = async (torneioId: string, dados: PontuacaoExtraCriar) => {
  const response = await api.post<PontuacaoExtraPublico>(
    `${resourceTorneios}/${torneioId}/pontuacao-extra`,
    dados,
  );
  return response.data;
};

export const getPontuacaoExtraDoTorneio = async (torneioId: string) => {
  const response = await api.get<PontuacaoExtraPublico[]>(
    `${resourceTorneios}/${torneioId}/pontuacao-extra`,
  );
  return response.data;
};

export const getJogadoresDisponiveis = async (torneioId: string, motivo?: string) => {
  const response = await api.get<JogadorCriadoPublico[]>(
    `${resourceTorneios}/${torneioId}/jogadores-disponiveis`,
    { params: { motivo } },
  );
  return response.data;
};

// Loja usa o próprio token; jogador organizador precisa informar em nome de
// qual loja está consultando (mesmo padrão de temporada.service.ts).
export const getHistoricoPontuacaoExtra = async (tcg: string | undefined) => {
  const response = await api.get<PontuacaoExtraPublico[]>(`${resourceHistorico}/`, {
    params: { tcg },
  });
  return response.data;
};

export const getHistoricoPontuacaoExtraOrganizador = async (
  lojaId: number | undefined,
  tcg: string | undefined,
) => {
  const response = await api.get<PontuacaoExtraPublico[]>(`${resourceHistorico}/organizador`, {
    params: { loja_id: lojaId, tcg },
  });
  return response.data;
};
