import { composicaoKeys } from "@/keys/composicao.keys";
import { tournamentsKeys } from "@/keys/tournaments.keys";
import {
  createRepresentacao,
  getComposicaoPartida,
  getRepresentacoes,
  searchUnidades,
  updateComposicaoPartida,
  updatePlayerComposicao,
} from "@/services/composicao.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// `busca` já deve chegar debounced de quem chama — o hook só decide não
// disparar a busca com menos de 2 caracteres (evita rajada de requests
// inúteis enquanto o usuário ainda está digitando a primeira letra).
export const useUnidades = (tcg: string, busca: string) => {
  return useQuery({
    queryKey: composicaoKeys.unidades(tcg, busca),
    queryFn: () => searchUnidades(tcg, busca),
    enabled: busca.trim().length >= 2,
  });
};

export const useRepresentacoes = (tcg: string) => {
  return useQuery({
    queryKey: composicaoKeys.representacoes(tcg),
    queryFn: () => getRepresentacoes(tcg),
  });
};

export const useCreateRepresentacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRepresentacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: composicaoKeys.all });
    },
  });
};

export const useUpdatePlayerComposicao = (torneioId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      linkId,
      dados,
    }: {
      linkId: number;
      dados: {
        composicao_representacao_id: number | null;
        composicao_unidades: { unidade_catalogo_id: number; quantidade: number }[];
      };
    }) => updatePlayerComposicao(torneioId!, linkId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentsKeys.detail(torneioId) });
    },
  });
};

// Só faz sentido buscar/editar pra Pokémon GO (única composição que muda de
// rodada pra rodada — ver JOGOS_COM_COMPOSICAO_POR_PARTIDA no backend);
// `enabled` cabe a quem chama, condicionado ao jogo do torneio.
export const useComposicaoPartida = (
  torneioId: string | undefined,
  rodadaId: number | undefined,
  linkId: number | undefined | null,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: composicaoKeys.partida(rodadaId, linkId),
    queryFn: () => getComposicaoPartida(torneioId!, rodadaId!, linkId!),
    enabled: enabled && !!torneioId && !!rodadaId && !!linkId,
  });
};

export const useUpdateComposicaoPartida = (torneioId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rodadaId,
      linkId,
      dados,
    }: {
      rodadaId: number;
      linkId: number;
      dados: { unidades: { unidade_catalogo_id: number; quantidade: number }[] };
    }) => updateComposicaoPartida(torneioId!, rodadaId, linkId, dados),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: composicaoKeys.partida(variables.rodadaId, variables.linkId),
      });
    },
  });
};
