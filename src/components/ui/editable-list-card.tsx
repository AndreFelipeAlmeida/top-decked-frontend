import type { ReactNode } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { AppCard } from '@/components/ui/app-card';

type EditableListCardProps<T> = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  items: T[];
  emptyMessage: string;
  getKey: (item: T) => string | number;
  renderItem: (item: T) => ReactNode;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
};

// Card genérico de "lista editável": título + botão de ação no cabeçalho
// (normalmente "Adicionar") e itens com ícones de editar/excluir opcionais.
// Usado em qualquer vitrine/gestão de itens simples (ex.: Regras de
// Pontuação Manual). Sem onEdit/onDelete, funciona como vitrine somente
// leitura.
export function EditableListCard<T>({
  title,
  description,
  icon,
  action,
  items,
  emptyMessage,
  getKey,
  renderItem,
  onEdit,
  onDelete,
}: EditableListCardProps<T>) {
  return (
    <AppCard title={title} description={description} icon={icon} action={action}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">{emptyMessage}</p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={getKey(item)} className="flex items-center justify-between py-3 gap-3">
              <div className="min-w-0">{renderItem(item)}</div>
              {(onEdit || onDelete) && (
                <div className="flex items-center gap-3 shrink-0">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="text-muted-foreground hover:text-primary"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="text-destructive hover:text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppCard>
  );
}
