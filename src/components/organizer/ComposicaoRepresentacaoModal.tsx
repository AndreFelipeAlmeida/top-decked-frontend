import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import axios from 'axios';
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
import { useUnidades, useCreateRepresentacao } from '@/hooks/composicao.hooks';
import { pokemonSpriteUrl } from '@/lib/pokemon';
import type { Unidade, RepresentacaoComposicao } from '@/types/Composicao';
import type { ApiErrorDetail } from '@/types/Error';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

type UnidadeThumbProps = {
  unidade: Unidade;
  onClick: () => void;
};

function UnidadeThumb({ unidade, onClick }: UnidadeThumbProps) {
  const [carregou, setCarregou] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
    >
      <div className="w-12 h-12 relative flex items-center justify-center">
        {!carregou && <div className="absolute inset-0 rounded-full bg-muted animate-pulse" />}
        <img
          src={pokemonSpriteUrl(unidade.external_id)}
          alt={unidade.nome}
          onLoad={() => setCarregou(true)}
          onError={() => setCarregou(true)}
          className={`w-12 h-12 object-contain transition-opacity ${carregou ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <span className="text-xs text-foreground truncate max-w-full capitalize">{unidade.nome}</span>
    </button>
  );
}

type UnidadePickerProps = {
  tcg: string;
  label: string;
  value: Unidade | null;
  onChange: (unidade: Unidade | null) => void;
};

function UnidadePicker({ tcg, label, value, onChange }: UnidadePickerProps) {
  const [busca, setBusca] = useState('');
  const [buscaDebounced] = useDebounce(busca, 300);
  const { data: resultados, isLoading } = useUnidades(tcg, buscaDebounced);

  return (
    <div>
      <label className="block text-sm mb-2 text-muted-foreground">{label}</label>

      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/10 p-2">
          <div className="flex items-center gap-2 min-w-0">
            <img src={pokemonSpriteUrl(value.external_id)} alt={value.nome} className="w-10 h-10 object-contain" />
            <span className="text-sm font-medium text-foreground capitalize truncate">{value.nome}</span>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            title="Trocar unidade"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar unidade pelo nome..."
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
          />

          {buscaDebounced.trim().length >= 2 && (
            <div className="mt-2 max-h-48 overflow-y-auto">
              {isLoading ? (
                <p className="text-xs text-muted-foreground text-center py-3">Buscando...</p>
              ) : resultados && resultados.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {resultados.map((unidade) => (
                    <UnidadeThumb
                      key={unidade.id}
                      unidade={unidade}
                      onClick={() => onChange(unidade)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">Nenhuma unidade encontrada.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

type ComposicaoRepresentacaoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tcg: string;
  onCreated: (representacao: RepresentacaoComposicao) => void;
};

export function ComposicaoRepresentacaoModal({ open, onOpenChange, tcg, onCreated }: ComposicaoRepresentacaoModalProps) {
  const [unidade1, setUnidade1] = useState<Unidade | null>(null);
  const [unidade2, setUnidade2] = useState<Unidade | null>(null);
  const [nome, setNome] = useState('');
  const createMutation = useCreateRepresentacao();

  const limpar = () => {
    setUnidade1(null);
    setUnidade2(null);
    setNome('');
  };

  const handleCreate = () => {
    if (!unidade1 || !unidade2) return;

    createMutation.mutate(
      {
        tcg,
        nome: nome.trim() || undefined,
        unidade_1_id: unidade1.id,
        unidade_2_id: unidade2.id,
      },
      {
        onSuccess: (representacao) => {
          toast.success('Representação criada com sucesso!');
          limpar();
          onOpenChange(false);
          onCreated(representacao);
        },
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao criar representação.')),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) limpar();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Representação de Composição</DialogTitle>
          <DialogDescription>
            Escolha as duas unidades que representam esse arquétipo (ex: Dragapult + Munkidori).
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <UnidadePicker tcg={tcg} label="Unidade 1" value={unidade1} onChange={setUnidade1} />
          <UnidadePicker tcg={tcg} label="Unidade 2" value={unidade2} onChange={setUnidade2} />
        </div>

        <div>
          <label className="block text-sm mb-2 text-muted-foreground">Nome (opcional)</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={
              unidade1 && unidade2
                ? `${unidade1.nome} ${unidade2.nome}`
                : 'Gerado automaticamente a partir das unidades'
            }
            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary capitalize"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!unidade1 || !unidade2 || createMutation.isPending}
            onClick={handleCreate}
          >
            {createMutation.isPending ? 'Criando...' : 'Criar Representação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
