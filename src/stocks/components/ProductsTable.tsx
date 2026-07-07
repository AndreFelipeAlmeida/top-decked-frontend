import { Plus, Minus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useProductActions } from '../hooks/useProductActions';
import { Badge } from '@/components/ui/badge';
import type { Categoria, Estoque } from '@/types/Stock';


interface ProductTableProps {
  items: Estoque[];
  onEdit: (item: Estoque) => void;
  categories: Categoria[];
}

export function ProductTable({ items, onEdit, categories }: ProductTableProps) {
  const { moveStockMutation, deleteProductMutation } = useProductActions();

  const handleStockMovement = (item: Estoque, direction: 'UP' | 'DOWN') => {
    moveStockMutation.mutate({
      id: item.id,
      data: {
        quantidade: 1,
        descricao:
          (direction === 'UP' ? `Adição rápida de ` : `Redução rápida de `) + item.nome,
        tipo: direction === 'UP' ? 'entrada' : 'saida',
      },
    });
  };

  const handleDelete = (item: Estoque) => {
    if (
      window.confirm(`Tem certeza que deseja excluir o produto "${item.nome}"?`)
    ) {
      deleteProductMutation.mutate(item.id);
    }
  };

  return (
    <div className="rounded-md border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[30%] text-muted-foreground">
              Nome do Item
            </TableHead>
            <TableHead className="text-muted-foreground">Categoria</TableHead>
            <TableHead className="text-center text-muted-foreground">
              Quantidade
            </TableHead>
            <TableHead className="text-muted-foreground">Preço Unitário</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-right text-muted-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isLowStock = item.quantidade < item.min_quantidade;

            return (
              <TableRow
                key={item.id}
                className={`transition-colors ${isLowStock ? 'bg-destructive/10 hover:bg-destructive/15' : 'hover:bg-accent'}`}
              >
                {/* Nome */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isLowStock && (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    )}
                    <span
                      className={isLowStock ? 'text-destructive' : 'text-foreground'}
                    >
                      {item.nome}
                    </span>
                  </div>
                </TableCell>

                {/* Categoria */}
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {categories.find(c => c.id === item.categoria)?.nome}
                  </span>
                </TableCell>

                {/* Controles de Quantidade */}
                <TableCell>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleStockMovement(item, 'DOWN')}
                      disabled={
                        item.quantidade === 0 || moveStockMutation.isPending
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <div className="flex flex-col items-center min-w-11.25">
                      <span
                        className={`text-sm font-bold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}
                      >
                        {item.quantidade}
                      </span>
                      {isLowStock && (
                        <span className="text-[10px] text-destructive font-bold">
                          MIN: {item.min_quantidade}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="default"
                      size="icon"
                      className="h-7 w-7 bg-primary hover:bg-primary/90"
                      onClick={() => handleStockMovement(item, 'UP')}
                      disabled={moveStockMutation.isPending}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>

                {/* Preço */}
                <TableCell>
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(item.preco)}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={isLowStock ? 'destructive' : 'secondary'}
                    className="font-medium"
                  >
                    {isLowStock ? 'Estoque Baixo' : 'Em Estoque'}
                  </Badge>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => onEdit(item)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/15"
                      onClick={() => handleDelete(item)}
                      disabled={deleteProductMutation.isPending}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
