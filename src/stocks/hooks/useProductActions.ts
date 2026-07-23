import { stockKeys } from '@/keys/stock.keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createStock,
  deleteStock,
  updateItemCategory,
  updateQuantity,
  updateStock,
} from '@/services/product.service';
import type { Estoque, EstoqueCadastro, EstoqueMovimentacao } from '@/types/Stock';
import { toast } from 'sonner';

export function useProductActions() {
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: (newProduct: EstoqueCadastro) => createStock(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      toast.success('Produto registrado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao registrar produto.');
    }
  });

  const moveStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EstoqueMovimentacao }) =>
      updateQuantity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      toast.success("Estoque atualizado!")
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EstoqueCadastro }) =>
      updateStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => deleteStock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
    },
  });

  const moveItemCategoryMutation = useMutation({
    mutationFn: ({ id, categoria }: { id: number; categoria: number }) =>
      updateItemCategory(id, categoria),
    onMutate: async ({ id, categoria }) => {
      await queryClient.cancelQueries({ queryKey: stockKeys.all });
      const previousProducts = queryClient.getQueryData<Estoque[]>(stockKeys.all);
      queryClient.setQueryData<Estoque[]>(stockKeys.all, (old) =>
        old?.map((item) => (item.id === id ? { ...item, categoria } : item)),
      );
      return { previousProducts };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(stockKeys.all, context.previousProducts);
      }
      toast.error('Erro ao mover item de categoria.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
    },
  });

  return {
    createProductMutation,
    moveStockMutation,
    updateProductMutation,
    deleteProductMutation,
    moveItemCategoryMutation,
    isLoading:
      createProductMutation.isPending ||
      updateProductMutation.isPending ||
      deleteProductMutation.isPending,
  };
}
