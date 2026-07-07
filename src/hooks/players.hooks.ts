import { authKeys } from "@/keys/auth.keys";
import { creditsKeys } from "@/keys/credits.keys";
import { achievementsKeys } from "@/keys/achievements.keys";
import { playersKeys } from "@/keys/players.keys";
import {
  getImpactoTrocaGameId,
  getPlayerById,
  getPlayerStatistics,
  getPlayers,
  getPlayersByOrganizer,
  getStoreByUser,
  updatePlayer,
  updatePlayerGameId,
  uploadPlayerPhoto,
} from "@/services/player.service";
import { updatePlayerProfileSchema, type UpdatePlayerProfileForm } from "@/schemas/player.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export const usePlayers = (page: number, search: string) => {
  return useQuery({
    queryKey: playersKeys.list(page, search),
    queryFn: () => getPlayers({ page, search }),
  });
};

export const usePlayerById = (id: number | undefined) => {
  return useQuery({
    queryKey: playersKeys.detail(id),
    queryFn: () => getPlayerById(id!),
    enabled: !!id,
  });
};

export const usePlayerStatistics = () => {
  return useQuery({
    queryKey: playersKeys.statistics(),
    queryFn: getPlayerStatistics,
  });
};

export const usePlayersByOrganizer = () => {
  return useQuery({
    queryKey: playersKeys.byOrganizer(),
    queryFn: getPlayersByOrganizer,
  });
};

export const useStoreByUser = (usuarioId: number | undefined) => {
  return useQuery({
    queryKey: ['store-by-user', usuarioId],
    queryFn: () => getStoreByUser(usuarioId!),
    enabled: !!usuarioId,
  });
};

export const useUpdatePlayerGameId = (playerId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlayerGameId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playersKeys.detail(playerId) });
      // useMe() (authKeys.all) é a fonte usada pela própria tela de perfil —
      // sem invalidar aqui, o ID exibido ficava com o valor antigo em cache
      // até um refresh manual da página.
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      // Trocar de GameID pode desvincular créditos de loja e recalcular
      // conquistas no backend (ver docs/DIVIDA_TECNICA.md) — sem invalidar
      // esses dois, a carteira e as conquistas ficam mostrando dados de antes
      // da troca até um refresh manual.
      queryClient.invalidateQueries({ queryKey: creditsKeys.all });
      queryClient.invalidateQueries({ queryKey: achievementsKeys.all });
    },
  });
};

export const useUpdatePlayerProfileForm = (defaultValues: UpdatePlayerProfileForm) => {
  return useForm<UpdatePlayerProfileForm>({
    resolver: zodResolver(updatePlayerProfileSchema),
    values: defaultValues,
  });
};

export const useUpdatePlayer = (playerId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playersKeys.detail(playerId) });
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
};

export const useUploadPlayerPhoto = (playerId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPlayerPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playersKeys.detail(playerId) });
      // useMe() (authKeys.all) é a fonte que PlayerProfileWallet.tsx usa pra
      // exibir a própria foto — sem invalidar, a foto antiga fica em cache
      // até um refresh manual.
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
};

// Usado só no instante em que o jogador tenta trocar de um GameID já
// existente para outro (não no primeiro cadastro) — busca sob demanda
// (enabled) o quanto ele perderia de atribuição de torneios/créditos.
export const useImpactoTrocaGameId = (tcg: string, enabled: boolean) => {
  return useQuery({
    queryKey: playersKeys.impactoTrocaGameId(tcg),
    queryFn: () => getImpactoTrocaGameId(tcg),
    enabled,
  });
};
