import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventoKeys } from "@/keys/evento.keys";
import {
  atualizarEvento,
  atualizarMetaEvento,
  atualizarRegraEvento,
  atualizarRegraManualEvento,
  criarEvento,
  criarEventoOrganizador,
  criarMetaEvento,
  criarParticipanteEvento,
  criarPontosManuaisEvento,
  criarRegraEvento,
  criarRegraManualEvento,
  deletarEvento,
  deletarMetaEvento,
  deletarRegraEvento,
  deletarRegraManualEvento,
  getEvento,
  getEventos,
  getEventosDaLoja,
  getJogadoresDisponiveisEvento,
} from "@/services/evento.service";
import type {
  EventoAtualizar,
  EventoCriar,
  MetaEventoCriar,
  PontosManualEventoCriar,
  RegraPontuacaoEventoCriar,
  RegraPontuacaoManualEventoCriar,
} from "@/types/Evento";

export const useEventos = (tcg: string | undefined) => {
  return useQuery({
    queryKey: eventoKeys.list(tcg),
    queryFn: () => getEventos(tcg),
    enabled: !!tcg,
  });
};

export const useEventosDaLoja = (tcg: string | undefined) => {
  return useQuery({
    queryKey: eventoKeys.listLoja(tcg),
    queryFn: () => getEventosDaLoja(tcg),
    enabled: !!tcg,
  });
};

export const useEvento = (eventoId: number | undefined) => {
  return useQuery({
    queryKey: eventoKeys.detail(eventoId),
    queryFn: () => getEvento(eventoId!),
    enabled: !!eventoId,
  });
};

export const useJogadoresDisponiveisEvento = (eventoId: number | undefined) => {
  return useQuery({
    queryKey: eventoKeys.jogadoresDisponiveis(eventoId),
    queryFn: () => getJogadoresDisponiveisEvento(eventoId!),
    enabled: !!eventoId,
  });
};

export const useCriarEvento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: EventoCriar) => criarEvento(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.all }),
  });
};

export const useCriarEventoOrganizador = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: EventoCriar & { loja_id: number }) => criarEventoOrganizador(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.all }),
  });
};

export const useAtualizarEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: EventoAtualizar) => atualizarEvento(eventoId!, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) });
      queryClient.invalidateQueries({ queryKey: eventoKeys.all });
    },
  });
};

export const useDeletarEvento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventoId: number) => deletarEvento(eventoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.all }),
  });
};

export const useCriarParticipanteEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jogadorCriadoId: number) => criarParticipanteEvento(eventoId!, jogadorCriadoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) });
      queryClient.invalidateQueries({ queryKey: eventoKeys.jogadoresDisponiveis(eventoId) });
    },
  });
};

export const useCriarPontosManuaisEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: PontosManualEventoCriar) => criarPontosManuaisEvento(eventoId!, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) }),
  });
};

export const useCriarMetaEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: MetaEventoCriar) => criarMetaEvento(eventoId!, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) }),
  });
};

export const useAtualizarMetaEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ metaId, dados }: { metaId: number; dados: MetaEventoCriar }) =>
      atualizarMetaEvento(eventoId!, metaId, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) }),
  });
};

export const useDeletarMetaEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (metaId: number) => deletarMetaEvento(eventoId!, metaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) }),
  });
};

export const useCriarRegraEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: RegraPontuacaoEventoCriar) => criarRegraEvento(eventoId!, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) }),
  });
};

export const useAtualizarRegraEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ regraId, dados }: { regraId: number; dados: RegraPontuacaoEventoCriar }) =>
      atualizarRegraEvento(eventoId!, regraId, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) }),
  });
};

export const useDeletarRegraEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (regraId: number) => deletarRegraEvento(eventoId!, regraId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) }),
  });
};

export const useCriarRegraManualEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: RegraPontuacaoManualEventoCriar) => criarRegraManualEvento(eventoId!, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) }),
  });
};

export const useAtualizarRegraManualEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ regraId, dados }: { regraId: number; dados: RegraPontuacaoManualEventoCriar }) =>
      atualizarRegraManualEvento(eventoId!, regraId, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) }),
  });
};

export const useDeletarRegraManualEvento = (eventoId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (regraId: number) => deletarRegraManualEvento(eventoId!, regraId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventoKeys.detail(eventoId) }),
  });
};
