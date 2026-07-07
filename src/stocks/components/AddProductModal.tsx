import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Estoque, Categoria } from '@/types/Stock';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductForm } from '@/schemas/stock.schemas';
import { useProductActions } from '../hooks/useProductActions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RegisterProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Categoria[] | undefined;
  initialData?: Estoque | null;
}

export function RegisterProductModal({
  isOpen,
  onClose,
  categories,
  initialData,
}: RegisterProductModalProps) {
  const { createProductMutation, updateProductMutation } = useProductActions();
  const isEditing = !!initialData;

  const { register, control, handleSubmit } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nome: initialData?.nome ?? '',
      categoria: initialData?.categoria ?? 0,
      quantidade: initialData?.quantidade ?? 0,
      min_quantidade: initialData?.min_quantidade ?? 0,
      preco: initialData?.preco ?? 0,
    },
  });

  const onSubmit = (data: ProductForm) => {
    if (isEditing && initialData) {
      updateProductMutation.mutate(
        { id: initialData.id, data },
        { onSuccess: onClose },
      );
    } else {
      createProductMutation.mutate(data, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle className="text-xl font-medium text-foreground">
            {isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                type="text"
                {...register('nome')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Categoria *
              </label>
              <Controller
                name="categoria"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantidade */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Qtd Atual
                </label>
                <input
                  type="number"
                  {...register('quantidade', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              {/* Preço */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('preco', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {/* Estoque Mínimo */}
            <div>
              <label className="block text-sm font-medium mb-1 text-destructive">
                Mínimo para Alerta
              </label>
              <input
                type="number"
                {...register('min_quantidade', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-destructive/40 rounded-lg focus:ring-2 focus:ring-destructive outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-card"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                createProductMutation.isPending ||
                updateProductMutation.isPending
              }
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
            >
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
