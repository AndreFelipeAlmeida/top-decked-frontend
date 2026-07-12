import { temporadasKeys } from "@/keys/temporadas.keys";
import {
  createTemporada,
  createTemporadaOrganizador,
  deleteTemporada,
  getTemporadas,
  getTemporadasLoja,
} from "@/services/temporada.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useTemporadas = (tcg: string | undefined) => {
  return useQuery({
    queryKey: temporadasKeys.list(tcg),
    queryFn: () => getTemporadas(tcg),
    enabled: !!tcg,
  });
};

// Pro jogador-organizador, que não tem token de loja — mesmo padrão de
// usePlayerTypesByOrganizer (GET /lojas/tipoJogador/organizador): busca as
// temporadas de UMA loja específica via GET /lojas/temporadas/loja/{loja_id},
// que exige o jogador ser organizador dela (ver TemporadaService no backend).
// Se ele não for organizador da loja selecionada, a chamada falha e a lista
// fica vazia — não tratado como erro visível, só sem opções no filtro.
export const useTemporadasLoja = (lojaId: number | undefined, tcg: string | undefined) => {
  return useQuery({
    queryKey: temporadasKeys.listLoja(lojaId, tcg),
    queryFn: () => getTemporadasLoja(lojaId, tcg),
    enabled: !!lojaId && !!tcg,
    retry: false,
  });
};

export const useCreateTemporada = (tcg: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemporada,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: temporadasKeys.list(tcg) });
    },
  });
};

export const useCreateTemporadaOrganizador = (lojaId: number | undefined, tcg: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemporadaOrganizador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: temporadasKeys.listLoja(lojaId, tcg) });
    },
  });
};

export const useDeleteTemporada = (tcg: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemporada,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: temporadasKeys.list(tcg) });
    },
  });
};

// Mesmo endpoint de exclusão (DELETE /lojas/temporadas/{id} já aceita tanto
// loja quanto jogador-organizador — ver TemporadaService no backend), só
// muda a chave invalidada: a lista buscada por loja_id, não a da loja dona
// do token.
export const useDeleteTemporadaOrganizador = (lojaId: number | undefined, tcg: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemporada,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: temporadasKeys.listLoja(lojaId, tcg) });
    },
  });
};
