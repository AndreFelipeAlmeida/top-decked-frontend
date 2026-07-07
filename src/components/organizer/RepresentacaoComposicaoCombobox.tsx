import { useState } from 'react';
import { X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import type { RepresentacaoComposicao } from '@/types/Composicao';

type RepresentacaoComposicaoComboboxProps = {
  value: number | null | undefined;
  representacoes: RepresentacaoComposicao[];
  onChange: (id: number | null) => void;
  placeholder?: string;
};

export function RepresentacaoComposicaoCombobox({
  value,
  representacoes,
  onChange,
  placeholder = 'Representação da composição',
}: RepresentacaoComposicaoComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selecionada = representacoes.find((r) => r.id === value) ?? null;

  if (selecionada && !open) {
    return (
      <div className="flex items-center justify-between gap-2 w-56 px-3 py-1.5 border border-border rounded-md text-sm bg-background shrink-0">
        <span className="truncate">{selecionada.nome}</span>
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setOpen(true);
          }}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          title="Trocar representação"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-56 shrink-0">
      <Command className="rounded-md border border-border">
        <CommandInput
          placeholder={placeholder}
          value={search}
          onValueChange={(val) => {
            setSearch(val);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />

        {open && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
            <CommandEmpty className="p-2 text-sm text-muted-foreground">
              Nenhuma representação encontrada.
            </CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {representacoes.map((representacao) => (
                <CommandItem
                  key={representacao.id}
                  value={representacao.nome}
                  onSelect={() => {
                    onChange(representacao.id);
                    setSearch('');
                    setOpen(false);
                  }}
                >
                  {representacao.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        )}
      </Command>
    </div>
  );
}
