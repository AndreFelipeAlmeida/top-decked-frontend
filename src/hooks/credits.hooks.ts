import { creditsKeys } from "@/keys/credits.keys";
import {
  addCredits,
  createStorePlayer,
  getPlayerCredits,
  getStorePlayerLinks,
  linkExistingPlayer,
  removeCredits,
  unlinkPlayer,
} from "@/services/credit.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStorePlayerLinks = (search: string) => {
  return useQuery({
    queryKey: creditsKeys.storeLinks(search),
    queryFn: () => getStorePlayerLinks(search),
  });
};

export const usePlayerCredits = () => {
  return useQuery({
    queryKey: creditsKeys.playerCredits(),
    queryFn: getPlayerCredits,
  });
};

export const useLinkExistingPlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: linkExistingPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
};

export const useCreateStorePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStorePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
};

export const useUnlinkPlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlinkPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
};

export function useCreditActions({ jogadorId }: { jogadorId: number }) {
  const queryClient = useQueryClient();

  const addCreditsMutation = useMutation({
    mutationFn: (value: number) => addCredits(jogadorId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditsKeys.all });
    },
  });

  const removeCreditsMutation = useMutation({
    mutationFn: (value: number) => removeCredits(jogadorId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditsKeys.all });
    },
  });

  return {
    addCreditsMutation,
    removeCreditsMutation,
  };
}
