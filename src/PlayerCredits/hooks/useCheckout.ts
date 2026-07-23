import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutVenda } from '@/services/pdv.service';
import { stockKeys } from '@/keys/stock.keys';
import { creditsKeys } from '@/keys/credits.keys';
import { toast } from 'sonner';

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkoutVenda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.vendaveis });
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      queryClient.invalidateQueries({ queryKey: creditsKeys.all });
      toast.success('Venda finalizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao finalizar a venda.');
    },
  });
}
