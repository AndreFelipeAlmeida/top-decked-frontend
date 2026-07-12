import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEntidades, useRegistrosEntidade } from '@/hooks/admin.hooks';
import type { ColunaEntidade, RegistroEntidade } from '@/types/Admin';

// Registro de outra tabela usado só pra popular o <Select> de uma FK — o
// "rótulo" é o melhor campo textual disponível (nome > apelido > email),
// com o id cru como último recurso.
const rotuloDoRegistro = (registro: RegistroEntidade): string => {
  const candidatos = ['nome', 'apelido', 'nome_nivel', 'descricao', 'email', 'game_id'];
  for (const campo of candidatos) {
    const valor = registro[campo];
    if (typeof valor === 'string' && valor.trim()) return valor;
  }
  return `#${registro.id}`;
};

type EntidadeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  colunas: ColunaEntidade[];
  registroEmEdicao: RegistroEntidade | null;
  onSalvar: (dados: RegistroEntidade) => void;
  salvando: boolean;
};

function CampoChaveEstrangeira({
  coluna,
  valor,
  onChange,
}: {
  coluna: ColunaEntidade;
  valor: unknown;
  onChange: (valor: number | null) => void;
}) {
  const tabelaAlvo = coluna.chave_estrangeira!.tabela;
  const { data: entidades } = useEntidades();
  const tabelaGerenciavel = entidades?.some((entidade) => entidade.nome === tabelaAlvo) ?? false;
  const { data: registros, isLoading } = useRegistrosEntidade(tabelaGerenciavel ? tabelaAlvo : undefined);

  // Tabela referenciada não é administrável por aqui (ex.: usuario, dona da
  // senha) — degrada pra um input numérico simples em vez de travar a tela.
  if (!tabelaGerenciavel) {
    return (
      <input
        type="number"
        value={typeof valor === 'number' ? valor : ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        placeholder={`id em "${tabelaAlvo}"`}
        className="w-full px-3 py-2 border border-border rounded-lg outline-none"
      />
    );
  }

  return (
    <Select
      value={valor != null ? String(valor) : ''}
      onValueChange={(v) => onChange(v ? Number(v) : null)}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? 'Carregando...' : `Selecione em "${tabelaAlvo}"`} />
      </SelectTrigger>
      <SelectContent>
        {registros?.map((registro) => (
          <SelectItem key={String(registro.id)} value={String(registro.id)}>
            {rotuloDoRegistro(registro)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CampoEntidade({
  coluna,
  valor,
  onChange,
}: {
  coluna: ColunaEntidade;
  valor: unknown;
  onChange: (valor: unknown) => void;
}) {
  if (coluna.chave_estrangeira) {
    return <CampoChaveEstrangeira coluna={coluna} valor={valor} onChange={onChange} />;
  }

  if (coluna.tipo === 'boolean') {
    return (
      <input
        type="checkbox"
        checked={Boolean(valor)}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-border"
      />
    );
  }

  if (coluna.tipo === 'enum') {
    return (
      <Select value={valor != null ? String(valor) : ''} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {coluna.enum_valores?.map((opcao) => (
            <SelectItem key={opcao} value={opcao}>{opcao}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (coluna.tipo === 'integer' || coluna.tipo === 'float') {
    return (
      <input
        type="number"
        step={coluna.tipo === 'float' ? 'any' : 1}
        value={typeof valor === 'number' ? valor : ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full px-3 py-2 border border-border rounded-lg outline-none"
      />
    );
  }

  if (coluna.tipo === 'date') {
    return (
      <input
        type="date"
        value={typeof valor === 'string' ? valor.slice(0, 10) : ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-3 py-2 border border-border rounded-lg outline-none"
      />
    );
  }

  if (coluna.tipo === 'datetime') {
    return (
      <input
        type="datetime-local"
        value={typeof valor === 'string' ? valor.slice(0, 16) : ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-3 py-2 border border-border rounded-lg outline-none"
      />
    );
  }

  return (
    <input
      type="text"
      value={typeof valor === 'string' ? valor : valor != null ? String(valor) : ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-border rounded-lg outline-none"
    />
  );
}

export function EntidadeFormDialog({
  open,
  onOpenChange,
  titulo,
  colunas,
  registroEmEdicao,
  onSalvar,
  salvando,
}: EntidadeFormDialogProps) {
  // Sem useEffect de propósito: o pai (EntidadesTab) remonta este componente
  // (via `key`) toda vez que abre pra um registro diferente ou pra criar um
  // novo — o estado já nasce correto, sem precisar sincronizar depois.
  const [valores, setValores] = useState<RegistroEntidade>(() => registroEmEdicao ?? {});

  const colunasEditaveis = colunas.filter((coluna) => !coluna.chave_primaria);

  const handleSalvar = () => {
    onSalvar(valores);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {colunasEditaveis.map((coluna) => (
            <div key={coluna.nome}>
              <label className="block text-sm mb-1 text-muted-foreground">
                {coluna.nome}
                {!coluna.nullable && <span className="text-destructive"> *</span>}
              </label>
              <CampoEntidade
                coluna={coluna}
                valor={valores[coluna.nome]}
                onChange={(valor) => setValores((atual) => ({ ...atual, [coluna.nome]: valor }))}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={salvando} onClick={handleSalvar}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
