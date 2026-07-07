import { categoryKeys } from '@/keys/stock.keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory, updateCategory } from '@/services/category.service';
import { toast } from 'sonner';
import type { ApiError } from '@/types/Error';

export function useCategoryActions() {
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: (newCategory: { nome: string }) => createCategory(newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Categoria criada com sucesso")
    },
    onError: () => toast.error("Erro durante a criação da Categoria")
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nome: string } }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Categoria removida com sucesso!', { id: 'delete-cat' });
    },
    onError: (error: ApiError) => {
      const detail = error.response?.data?.detail;
      const errorMessage =
        typeof detail === 'string'
          ? detail
          : 'Erro ao excluir categoria ou categoria em uso.';

      toast.error('Falha na exclusão', {
        id: 'delete-cat',
        description: errorMessage,
      });
    },
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,

    isPending:
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      deleteCategoryMutation.isPending,
  };
}
