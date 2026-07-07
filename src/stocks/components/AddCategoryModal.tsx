import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, type CategoryForm } from '@/schemas/stock.schemas';
import { useCategoryActions } from '../hooks/useCategoryActions';


interface RegisterProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterCategoryModal({
  isOpen,
  onClose,
}: RegisterProductModalProps) {
  const { createCategoryMutation } = useCategoryActions();

  const { register, handleSubmit, reset } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { nome: '' },
  });

  const onSubmit = (data: CategoryForm) => {
    createCategoryMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="p-6 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-medium text-foreground">
            Cadastrar Nova Categoria
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Nome da Categoria *
              </label>
              <input
                type="text"
                {...register('nome')}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Pacote de Booster"
              />
            </div>
          </div>

          {/* Footer com Botões */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-card transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
            >
              {createCategoryMutation.isPending
                ? 'Cadastrando...'
                : 'Cadastrar Categoria'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
