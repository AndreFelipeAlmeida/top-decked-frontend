import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUnidades } from '@/hooks/composicao.hooks';
import { pokemonSpriteUrl } from '@/lib/pokemon';
import type { Unidade, ComposicaoUnidade } from '@/types/Composicao';

type LinhaComposicao = {
  unidade: Unidade;
  quantidade: number;
};

const paraLinhas = (unidades: ComposicaoUnidade[]): LinhaComposicao[] =>
  unidades.map((cu) => ({ unidade: cu.unidade, quantidade: cu.quantidade }));

type ComposicaoUnidadesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tcg: string;
  unidadesIniciais: ComposicaoUnidade[];
  onSave: (unidades: { unidade_catalogo_id: number; quantidade: number }[]) => void;
  salvando?: boolean;
};

export function ComposicaoUnidadesModal({
  open,
  onOpenChange,
  tcg,
  unidadesIniciais,
  onSave,
  salvando,
}: ComposicaoUnidadesModalProps) {
  const [linhas, setLinhas] = useState<LinhaComposicao[]>(() => paraLinhas(unidadesIniciais));
  const [busca, setBusca] = useState('');
  const [buscaDebounced] = useDebounce(busca, 300);
  const { data: resultados, isLoading } = useUnidades(tcg, buscaDebounced);

  useEffect(() => {
    if (open) {
      setLinhas(paraLinhas(unidadesIniciais));
      setBusca('');
    }
    // Só precisa re-sincronizar quando o modal abre, não a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const adicionarUnidade = (unidade: Unidade) => {
    setLinhas((atual) => {
      const existente = atual.find((linha) => linha.unidade.id === unidade.id);
      if (existente) {
        return atual.map((linha) =>
          linha.unidade.id === unidade.id ? { ...linha, quantidade: linha.quantidade + 1 } : linha,
        );
      }
      return [...atual, { unidade, quantidade: 1 }];
    });
  };

  const atualizarQuantidade = (unidadeId: number, quantidade: number) => {
    setLinhas((atual) =>
      atual.map((linha) => (linha.unidade.id === unidadeId ? { ...linha, quantidade } : linha)),
    );
  };

  const removerUnidade = (unidadeId: number) => {
    setLinhas((atual) => atual.filter((linha) => linha.unidade.id !== unidadeId));
  };

  const total = linhas.reduce((soma, linha) => soma + linha.quantidade, 0);

  const handleSave = () => {
    onSave(
      linhas
        .filter((linha) => linha.quantidade > 0)
        .map((linha) => ({ unidade_catalogo_id: linha.unidade.id, quantidade: linha.quantidade })),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Composição Completa</DialogTitle>
          <DialogDescription>
            Busque as unidades da composição e ajuste a quantidade de cada uma.
          </DialogDescription>
        </DialogHeader>

        <div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar unidade pelo nome..."
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
          />

          {buscaDebounced.trim().length >= 2 && (
            <div className="mt-2 max-h-40 overflow-y-auto">
              {isLoading ? (
                <p className="text-xs text-muted-foreground text-center py-3">Buscando...</p>
              ) : resultados && resultados.length > 0 ? (
                <div className="grid grid-cols-6 gap-2">
                  {resultados.map((unidade) => (
                    <button
                      key={unidade.id}
                      type="button"
                      onClick={() => adicionarUnidade(unidade)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                    >
                      <img
                        src={pokemonSpriteUrl(unidade.external_id)}
                        alt={unidade.nome}
                        className="w-10 h-10 object-contain"
                      />
                      <span className="text-xs text-foreground truncate max-w-full capitalize">
                        {unidade.nome}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">Nenhuma unidade encontrada.</p>
              )}
            </div>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-border border border-border rounded-lg">
          {linhas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma unidade adicionada ainda.
            </p>
          ) : (
            linhas.map((linha) => (
              <div key={linha.unidade.id} className="flex items-center gap-3 p-2">
                <img
                  src={pokemonSpriteUrl(linha.unidade.external_id)}
                  alt={linha.unidade.nome}
                  className="w-8 h-8 object-contain shrink-0"
                />
                <span className="text-sm text-foreground capitalize truncate flex-1">
                  {linha.unidade.nome}
                </span>
                <input
                  type="number"
                  min={1}
                  value={linha.quantidade}
                  onChange={(e) => atualizarQuantidade(linha.unidade.id, Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-border rounded text-sm text-center outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => removerUnidade(linha.unidade.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  title="Remover unidade"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <p className="text-sm text-muted-foreground text-right">Total: {total} unidades</p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={salvando} onClick={handleSave}>
            {salvando ? 'Salvando...' : 'Salvar Composição'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
