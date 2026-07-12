import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pontuacaoExtraKeys } from "@/keys/pontuacaoExtra.keys";
import { tournamentsKeys } from "@/keys/tournaments.keys";
import {
  criarPontuacaoExtra,
  getHistoricoPontuacaoExtra,
  getHistoricoPontuacaoExtraOrganizador,
  getJogadoresDisponiveis,
  getPontuacaoExtraDoTorneio,
} from "@/services/pontuacaoExtra.service";
import type { PontuacaoExtraCriar } from "@/types/PontuacaoExtra";

export const useJogadoresDisponiveis = (torneioId: string | undefined, motivo?: string) => {
  return useQuery({
    queryKey: pontuacaoExtraKeys.jogadoresDisponiveis(torneioId, motivo),
    queryFn: () => getJogadoresDisponiveis(torneioId!, motivo),
    enabled: !!torneioId && !!motivo,
  });
};

export const usePontuacaoExtraDoTorneio = (torneioId: string | undefined) => {
  return useQuery({
    queryKey: pontuacaoExtraKeys.porTorneio(torneioId),
    queryFn: () => getPontuacaoExtraDoTorneio(torneioId!),
    enabled: !!torneioId,
  });
};

export const useCriarPontuacaoExtra = (torneioId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: PontuacaoExtraCriar) => criarPontuacaoExtra(torneioId!, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pontuacaoExtraKeys.porTorneio(torneioId) });
      queryClient.invalidateQueries({ queryKey: pontuacaoExtraKeys.all });
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(torneioId) });
    },
  });
};

export const useHistoricoPontuacaoExtra = (tcg: string | undefined) => {
  return useQuery({
    queryKey: pontuacaoExtraKeys.historico(tcg),
    queryFn: () => getHistoricoPontuacaoExtra(tcg),
    enabled: !!tcg,
  });
};

export const useHistoricoPontuacaoExtraOrganizador = (
  lojaId: number | undefined,
  tcg: string | undefined,
) => {
  return useQuery({
    queryKey: pontuacaoExtraKeys.historicoOrganizador(lojaId, tcg),
    queryFn: () => getHistoricoPontuacaoExtraOrganizador(lojaId, tcg),
    enabled: !!lojaId && !!tcg,
  });
};
