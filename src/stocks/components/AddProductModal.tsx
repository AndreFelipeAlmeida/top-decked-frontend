import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Estoque, EstoqueCadastro, Categoria } from '@/types/Stock';
import { useProductActions } from '../hooks/useProductActions';

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

  const [product, setProduct] = useState<EstoqueCadastro>(() => ({
    nome: initialData?.nome ?? '',
    categoria: initialData?.categoria ?? 0,
    quantidade: initialData?.quantidade ?? 0,
    min_quantidade: initialData?.min_quantidade ?? 0,
    preco: initialData?.preco ?? 0,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && initialData) {
      updateProductMutation.mutate(
        { id: initialData.id, data: product },
        { onSuccess: onClose },
      );
    } else {
      createProductMutation.mutate(product, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="p-6 border-b border-gray-200">
          <DialogTitle className="text-xl font-medium text-gray-900">
            {isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                required
                type="text"
                value={product.nome}
                onChange={(e) =>
                  setProduct({ ...product, nome: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Categoria *
              </label>
              <select
                required
                value={product.categoria || ''}
                onChange={(e) =>
                  setProduct({ ...product, categoria: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none bg-white"
              >
                <option value="" disabled hidden>
                  Selecione uma categoria
                </option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantidade */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Qtd Atual
                </label>
                <input
                  type="number"
                  value={product.quantidade}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      quantidade: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
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
                  value={product.preco}
                  onChange={(e) =>
                    setProduct({ ...product, preco: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
            </div>

            {/* Estoque Mínimo */}
            <div>
              <label className="block text-sm font-medium mb-1 text-red-600">
                Mínimo para Alerta
              </label>
              <input
                type="number"
                value={product.min_quantidade}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    min_quantidade: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                createProductMutation.isPending ||
                updateProductMutation.isPending
              }
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
            >
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
