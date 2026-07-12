import { api } from "@/adapters/api";
import type {
  EventoAtualizar,
  EventoCompletoPublico,
  EventoCriar,
  MetaEventoCriar,
  MetaEventoPublico,
  ParticipanteEventoPublico,
  PontosManualEventoCriar,
  RegraPontuacaoEventoCriar,
  RegraPontuacaoEventoPublico,
  RegraPontuacaoManualEventoCriar,
  RegraPontuacaoManualEventoPublico,
  EventoPublico,
} from "@/types/Evento";
import type { JogadorCriadoPublico } from "@/types/JogadorCriado";

const resource = "/lojas/eventos";

// GET /lojas/eventos/ não é escopado por loja de propósito — mesmo padrão de
// GET /lojas/torneios/: jogadores navegam eventos de qualquer loja (ver
// docs/EVENTOS.md), não só os que já participam.
export const getEventos = async (tcg: string | undefined) => {
  const response = await api.get<EventoPublico[]>(`${resource}/`, { params: { tcg } });
  return response.data;
};

export const getEventosDaLoja = async (tcg: string | undefined) => {
  const response = await api.get<EventoPublico[]>(`${resource}/loja`, { params: { tcg } });
  return response.data;
};

export const getEvento = async (eventoId: number) => {
  const response = await api.get<EventoCompletoPublico>(`${resource}/${eventoId}`);
  return response.data;
};

export const criarEvento = async (dados: EventoCriar) => {
  const response = await api.post<EventoPublico>(`${resource}/`, dados);
  return response.data;
};

export const criarEventoOrganizador = async (dados: EventoCriar & { loja_id: number }) => {
  const response = await api.post<EventoPublico>(`${resource}/organizador`, dados);
  return response.data;
};

export const atualizarEvento = async (eventoId: number, dados: EventoAtualizar) => {
  const response = await api.put<EventoPublico>(`${resource}/${eventoId}`, dados);
  return response.data;
};

export const deletarEvento = async (eventoId: number) => {
  await api.delete(`${resource}/${eventoId}`);
};

export const getJogadoresDisponiveisEvento = async (eventoId: number) => {
  const response = await api.get<JogadorCriadoPublico[]>(`${resource}/${eventoId}/jogadores-disponiveis`);
  return response.data;
};

export const criarParticipanteEvento = async (eventoId: number, jogadorCriadoId: number) => {
  const response = await api.post<ParticipanteEventoPublico>(
    `${resource}/${eventoId}/participantes`,
    { jogador_criado_id: jogadorCriadoId },
  );
  return response.data;
};

export const criarPontosManuaisEvento = async (eventoId: number, dados: PontosManualEventoCriar) => {
  const response = await api.post<ParticipanteEventoPublico>(`${resource}/${eventoId}/pontos-manuais`, dados);
  return response.data;
};

export const criarMetaEvento = async (eventoId: number, dados: MetaEventoCriar) => {
  const response = await api.post<MetaEventoPublico>(`${resource}/${eventoId}/metas`, dados);
  return response.data;
};

export const atualizarMetaEvento = async (eventoId: number, metaId: number, dados: MetaEventoCriar) => {
  const response = await api.put<MetaEventoPublico>(`${resource}/${eventoId}/metas/${metaId}`, dados);
  return response.data;
};

export const deletarMetaEvento = async (eventoId: number, metaId: number) => {
  await api.delete(`${resource}/${eventoId}/metas/${metaId}`);
};

export const criarRegraEvento = async (eventoId: number, dados: RegraPontuacaoEventoCriar) => {
  const response = await api.post<RegraPontuacaoEventoPublico>(`${resource}/${eventoId}/regras`, dados);
  return response.data;
};

export const atualizarRegraEvento = async (eventoId: number, regraId: number, dados: RegraPontuacaoEventoCriar) => {
  const response = await api.put<RegraPontuacaoEventoPublico>(`${resource}/${eventoId}/regras/${regraId}`, dados);
  return response.data;
};

export const deletarRegraEvento = async (eventoId: number, regraId: number) => {
  await api.delete(`${resource}/${eventoId}/regras/${regraId}`);
};

export const criarRegraManualEvento = async (eventoId: number, dados: RegraPontuacaoManualEventoCriar) => {
  const response = await api.post<RegraPontuacaoManualEventoPublico>(`${resource}/${eventoId}/regras-manuais`, dados);
  return response.data;
};

export const atualizarRegraManualEvento = async (
  eventoId: number,
  regraId: number,
  dados: RegraPontuacaoManualEventoCriar,
) => {
  const response = await api.put<RegraPontuacaoManualEventoPublico>(
    `${resource}/${eventoId}/regras-manuais/${regraId}`,
    dados,
  );
  return response.data;
};

export const deletarRegraManualEvento = async (eventoId: number, regraId: number) => {
  await api.delete(`${resource}/${eventoId}/regras-manuais/${regraId}`);
};
