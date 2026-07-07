import { api } from "@/adapters/api";
import type { JogadorTorneioLinkPublico, TorneioAtualizar, TorneioPublico } from "@/types/Tournaments";
import type { CreateOrganizerTournamentForm, CreateStoreTournamentForm } from "@/schemas/tournament.schemas";

const resource = "/lojas/torneios";

export const getTournaments = async () => {
  const response = await api.get<TorneioPublico[]>(`${resource}/`);
  return response.data;
};

export const getTournamentsByStore = async () => {
  const response = await api.get<TorneioPublico[]>(`${resource}/loja`);
  return response.data;
};

export const getTournamentById = async (id: string) => {
  const response = await api.get<TorneioPublico>(`${resource}/${id}`);
  return response.data;
};

export const createTournament = async (dados: CreateStoreTournamentForm) => {
  const response = await api.post<TorneioPublico>(`${resource}/criar`, dados);
  return response.data;
};

export const createOrganizerTournament = async (data: CreateOrganizerTournamentForm) => {
  const response = await api.post<TorneioPublico>(`${resource}/criar-organizador`, data);
  return response.data;
};

export const importOrganizerTournament = async (lojaId: number, file: File) => {
  const formData = new FormData();
  formData.append("arquivo", file);

  const response = await api.post<TorneioPublico>(
    `${resource}/importar-organizador`,
    formData,
    {
      params: { loja_id: lojaId },
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const updateTournament = async (id: string, dados: TorneioAtualizar) => {
  const response = await api.put<TorneioPublico>(`${resource}/${id}`, dados);
  return response.data;
};

export const importTournamentResults = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("arquivo", file);

  const response = await api.post<TorneioPublico>(`${resource}/${id}/importar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updatePlayerScore = async (
  torneioId: string,
  linkId: number,
  dados: { pontuacao: number; pontuacao_com_regras: number },
) => {
  const response = await api.patch<JogadorTorneioLinkPublico>(
    `${resource}/${torneioId}/jogadores/${linkId}/pontuacao`,
    dados,
  );
  return response.data;
};

export const recalculateTournamentScore = async (torneioId: string, regraBasicaId?: number) => {
  const response = await api.post<TorneioPublico>(
    `${resource}/${torneioId}/recalcular-pontuacao`,
    { regra_basica_id: regraBasicaId },
  );
  return response.data;
};

export const updatePlayerRule = async (
  torneioId: string,
  linkId: number,
  tipoJogadorId: number | null,
) => {
  const response = await api.patch<TorneioPublico>(
    `${resource}/${torneioId}/jogadores/${linkId}/regra`,
    { tipo_jogador_id: tipoJogadorId },
  );
  return response.data;
};

export const generateRound = async (torneioId: string) => {
  const response = await api.post(`${resource}/${torneioId}/rodada`);
  return response.data;
};

export const updateRodada = async (
  torneioId: string,
  rodadaId: number,
  dados: {
    jogador1_id?: number | null;
    jogador2_id?: number | null;
    vencedor_id?: number | null;
  },
) => {
  const response = await api.patch<TorneioPublico>(
    `${resource}/${torneioId}/rodadas/${rodadaId}`,
    dados,
  );
  return response.data;
};

export const deleteTournament = async (torneioId: string) => {
  await api.delete(`${resource}/${torneioId}`);
};

export const inscreverJogador = async (torneioId: string) => {
  const response = await api.post<JogadorTorneioLinkPublico>(`${resource}/${torneioId}/inscricao`);
  return response.data;
};

export const desinscreverJogador = async (torneioId: string) => {
  await api.delete(`${resource}/${torneioId}/inscricao`);
};
