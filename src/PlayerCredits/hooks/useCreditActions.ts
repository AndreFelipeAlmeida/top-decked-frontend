import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCredits, removeCredits } from '@/services/creditoService';

type CreditMutationProps = {
  jogadorId: number;
};

export function useCreditActions({ jogadorId }: CreditMutationProps) {
  const queryClient = useQueryClient();

  const addCreditsMutation = useMutation({
    mutationFn: (value: number) => addCredits(jogadorId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditos-players'] });
    },
  });

  const removeCreditsMutation = useMutation({
    mutationFn: (value: number) => removeCredits(jogadorId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditos-players'] });
    },
  });

  return {
    addCreditsMutation,
    removeCreditsMutation,
  };
}
