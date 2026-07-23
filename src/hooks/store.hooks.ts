import { storeKeys } from "@/keys/store.keys";
import { playersKeys } from "@/keys/players.keys";
import { updateStoreSchema, type UpdateStoreForm } from "@/schemas/store.schemas";
import {
  demoteJogadorOrganizador,
  getStoreById,
  getStores,
  promoteJogadorOrganizador,
  updateMyStore,
  uploadStorePhoto,
} from "@/services/store.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export const useMyStore = (storeId: number | undefined) => {
  return useQuery({
    queryKey: storeKeys.mine(storeId),
    queryFn: () => getStoreById(storeId!),
    enabled: !!storeId,
  });
};

export const useStores = () => {
  return useQuery({
    queryKey: storeKeys.list(),
    queryFn: getStores,
  });
};

export const useUpdateStoreForm = (defaultValues: UpdateStoreForm) => {
  return useForm<UpdateStoreForm>({
    resolver: zodResolver(updateStoreSchema),
    values: defaultValues,
  });
};

export const useUpdateMyStore = (storeId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.mine(storeId) });
    },
  });
};

export const useUploadStorePhoto = (storeId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadStorePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.mine(storeId) });
    },
  });
};

export const usePromoteJogadorOrganizador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jogadorId, tcg }: { jogadorId: number; tcg: string }) =>
      promoteJogadorOrganizador(jogadorId, tcg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playersKeys.all });
    },
  });
};

export const useDemoteJogadorOrganizador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jogadorId, tcg }: { jogadorId: number; tcg: string }) =>
      demoteJogadorOrganizador(jogadorId, tcg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playersKeys.all });
    },
  });
};
