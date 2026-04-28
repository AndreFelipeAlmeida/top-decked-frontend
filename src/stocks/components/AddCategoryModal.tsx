import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CategoriaCadastro } from '@/types/Stock';
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

  const [newCategory, setNewCategory] = useState<CategoriaCadastro>({
    nome: '',
  });

  const resetForm = () => {
    setNewCategory({
      nome: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(newCategory)
    createCategoryMutation.mutate(newCategory, {
      onSuccess: () => {
        resetForm();
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="p-6 border-b border-gray-200 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-medium text-gray-900">
            Cadastrar Nova Categoria
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Nome da Categoria *
              </label>
              <input
                required
                type="text"
                value={newCategory.nome}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, nome: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                placeholder="Pacote de Booster"
              />
            </div>
          </div>

          {/* Footer com Botões */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
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
