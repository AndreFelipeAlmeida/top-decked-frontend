import { playertypesKeys } from "@/keys/playerTypes.keys";
import {
  createPlayerType,
  createPlayerTypeAsOrganizer,
  deletePlayerType,
  getPlayerTypes,
  getPlayerTypesByOrganizer,
  updatePlayerType,
} from "@/services/playerType.service";
import type { TipoJogadorBase } from "@/types/Player";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePlayerTypesByOrganizer = (
  store_id?: number
) => {
  return useQuery({
    queryKey: playertypesKeys.list(store_id),
    enabled: !!store_id,
    queryFn: async () => {
      if (!store_id) {
        throw new Error(
          'store_id não informado'
        );
      }
      return getPlayerTypesByOrganizer(store_id);
    },
  });
};

// CRUD de regras de pontuação da própria loja (organizer/PlayerRules e CreateTournament da loja).
// `enabled` deve ser desligado quando quem está logado não é a loja (ex.: jogador
// organizador na tela de editar torneio) — o endpoint exige token de loja.
export const usePlayerTypes = (enabled: boolean = true) => {
  return useQuery({
    queryKey: playertypesKeys.all,
    queryFn: getPlayerTypes,
    enabled,
  });
};

export const useCreatePlayerType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlayerType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playertypesKeys.all });
    },
  });
};

// Criação rápida de regra por um jogador organizador de uma loja (modal em CreateOrganizerTournament).
export const useCreatePlayerTypeAsOrganizer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlayerTypeAsOrganizer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playertypesKeys.all });
    },
  });
};

export const useUpdatePlayerType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: Partial<TipoJogadorBase> }) =>
      updatePlayerType(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playertypesKeys.all });
    },
  });
};

export const useDeletePlayerType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlayerType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playertypesKeys.all });
    },
  });
};