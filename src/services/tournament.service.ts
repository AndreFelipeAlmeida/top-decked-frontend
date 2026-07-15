import { api } from "@/adapters/api";
import type { JogadorTorneioLinkPublico, TorneioAtualizar, TorneioPublico } from "@/types/Tournaments";
import type { CreateOrganizerTournamentForm, CreateStoreTournamentForm } from "@/schemas/tournament.schemas";
import type { JogadorCriadoPublico } from "@/types/JogadorCriado";

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

// Loja usa o próprio token — sem loja_id, diferente de importOrganizerTournament
// (jogador organizador, que precisa dizer em nome de qual loja importa).
export const importTournament = async (file: File) => {
  const formData = new FormData();
  formData.append("arquivo", file);

  const response = await api.post<TorneioPublico>(
    `${resource}/importar`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
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

export const recalculateTournamentScore = async (
  torneioId: string,
  regraBasicaId?: number,
  pontuacaoDeParticipacao?: number,
) => {
  const response = await api.post<TorneioPublico>(
    `${resource}/${torneioId}/recalcular-pontuacao`,
    { regra_basica_id: regraBasicaId, pontuacao_de_participacao: pontuacaoDeParticipacao },
  );
  return response.data;
};

export const updatePlayerRule = async (
  torneioId: string,
  linkId: number,
  regraExtraId: number | null,
) => {
  const response = await api.patch<TorneioPublico>(
    `${resource}/${torneioId}/jogadores/${linkId}/regra`,
    { regra_extra_id: regraExtraId },
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

export const deleteRodada = async (torneioId: string, numRodada: number) => {
  const response = await api.delete<TorneioPublico>(
    `${resource}/${torneioId}/rodadas/${numRodada}`,
  );
  return response.data;
};

export const inscreverJogador = async (torneioId: string) => {
  const response = await api.post<JogadorTorneioLinkPublico>(`${resource}/${torneioId}/inscricao`);
  return response.data;
};

export const desinscreverJogador = async (torneioId: string) => {
  await api.delete(`${resource}/${torneioId}/inscricao`);
};

export const getOrganizadoresDisponiveisParaJuiz = async (torneioId: string) => {
  const response = await api.get<JogadorCriadoPublico[]>(
    `${resource}/${torneioId}/organizadores-disponiveis-juiz`,
  );
  return response.data;
};

export const adicionarJuiz = async (torneioId: string, jogadorCriadoId: number) => {
  const response = await api.post<JogadorTorneioLinkPublico>(
    `${resource}/${torneioId}/juizes`,
    { jogador_criado_id: jogadorCriadoId },
  );
  return response.data;
};

export const removerJuiz = async (torneioId: string, linkId: number) => {
  await api.delete(`${resource}/${torneioId}/juizes/${linkId}`);
};
