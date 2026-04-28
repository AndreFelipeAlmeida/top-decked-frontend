import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Tag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Categoria } from '@/types/Stock';
import { useCategoryActions } from '../hooks/useCategoryActions';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';

interface CategoryTabsProps {
  categories: Categoria[];
  activeId: number;
  onSelect: (id: number) => void;
  onAddCategory: () => void;
  maxVisible?: number;
}

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
  onAddCategory,
  maxVisible = 6,
}: CategoryTabsProps) {
  const { deleteCategoryMutation } = useCategoryActions();
  const [categoryToDelete, setCategoryToDelete] = useState<Categoria | null>(
    null,
  );

  const displayedCategories = useMemo(() => {
    const activeIndex = categories.findIndex((c) => c.id === activeId);

    if (activeIndex >= maxVisible) {
      const activeCategory = categories[activeIndex];
      const others = categories.filter((c) => c.id !== activeId);
      return [activeCategory, ...others.slice(0, maxVisible - 1)];
    }

    return categories.slice(0, maxVisible);
  }, [categories, activeId, maxVisible]);

  const extraCategories = categories.filter(
    (cat) => !displayedCategories.find((d) => d.id === cat.id),
  );

  const handleOpenConfirm = (e: React.MouseEvent, cat: Categoria) => {
    e.stopPropagation();
    setCategoryToDelete(cat);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          if (activeId === categoryToDelete.id) onSelect(-1);
          setCategoryToDelete(null);
        },
      });
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2 overflow-x-auto p-2 scrollbar-hide">
        <TabButton
          label="Todas"
          isActive={activeId === -1}
          onClick={() => onSelect(-1)}
        />

        {displayedCategories.map((cat) => (
          <div key={cat.id} className="relative group">
            <TabButton
              label={cat.nome}
              isActive={activeId === cat.id}
              onClick={() => onSelect(cat.id)}
            />

            <button
              onClick={(e) => handleOpenConfirm(e, cat)}
              disabled={deleteCategoryMutation.isPending}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm disabled:bg-gray-400"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {extraCategories.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-500 h-9"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="flex flex-col gap-1">
                {extraCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-gray-100 group transition-colors"
                  >
                    <button
                      onClick={() => onSelect(cat.id)}
                      className="flex items-center flex-1 text-left font-medium text-gray-700"
                    >
                      <Tag className="w-3 h-3 mr-2 text-gray-400" />
                      {cat.nome}
                    </button>

                    <button
                      onClick={(e) => handleOpenConfirm(e, cat)}
                      disabled={deleteCategoryMutation.isPending}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      <Button
        variant="outline"
        size="sm"
        onClick={onAddCategory}
        className="border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 gap-2 ml-4"
      >
        <Plus className="w-4 h-4" />
      </Button>
      </div>


      <ConfirmDeleteModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteCategoryMutation.isPending}
        title="Excluir Categoria"
        description={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.nome}"? Esta ação não pode ser desfeita e só será permitida se não houver produtos vinculados.`}
      />
    </div>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
        isActive
          ? 'bg-purple-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}
