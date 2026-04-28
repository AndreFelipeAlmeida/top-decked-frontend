import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createStock,
  deleteStock,
  updateQuantity,
  updateStock,
} from '../service/product.service';
import type { EstoqueCadastro, EstoqueMovimentacao } from '@/types/Stock';
import { toast } from 'sonner';

export function useProductActions() {
  const queryClient = useQueryClient();

  const PRODUCTS_QUERY_KEY = ['products'];

  const createProductMutation = useMutation({
    mutationFn: (newProduct: EstoqueCadastro) => createStock(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success("Estoque atualizado!")
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EstoqueCadastro }) =>
      updateStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => deleteStock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  return {
    createProductMutation,
    moveStockMutation,
    updateProductMutation,
    deleteProductMutation,
    isLoading:
      createProductMutation.isPending ||
      updateProductMutation.isPending ||
      deleteProductMutation.isPending,
  };
}
