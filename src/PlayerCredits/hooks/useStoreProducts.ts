import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type StoreProduct = {
  id: number;
  nome: string;
  categoria: 'produtos' | 'cantina';
  preco: number;
  quantidade: number;
};

type CheckoutPayload = {
  jogadorId: number;
  items: Array<{
    id: number;
    quantidade: number;
  }>;
};

export function useStoreProducts(search: string) {
  return useQuery<StoreProduct[]>({
    queryKey: ['store-products', search],
    queryFn: async () => {
      // TODO: trocar pelo service real
      return [];
    },
  });
}

export function useCheckoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      // TODO: trocar pelo service real
      console.log('checkout payload', payload);

      return true;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['store-products'],
      });

      queryClient.invalidateQueries({
        queryKey: ['creditos-players'],
      });
    },
  });
}
