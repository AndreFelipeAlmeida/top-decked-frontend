import { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppCard } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAtualizarRegistroEntidade,
  useColunasEntidade,
  useCriarRegistroEntidade,
  useDeletarRegistroEntidade,
  useEntidades,
  useRegistrosEntidade,
} from '@/hooks/admin.hooks';
import { EntidadeFormDialog } from './EntidadeFormDialog';
import type { RegistroEntidade } from '@/types/Admin';
import type { ApiErrorDetail } from '@/types/Error';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

const formatarValor = (valor: unknown): string => {
  if (valor === null || valor === undefined) return '—';
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
  return String(valor);
};

export function EntidadesTab() {
  const [entidadeSelecionada, setEntidadeSelecionada] = useState('');
  const [registroEmEdicao, setRegistroEmEdicao] = useState<RegistroEntidade | null>(null);
  const [isFormAberto, setIsFormAberto] = useState(false);

  const { data: entidades, isLoading: isLoadingEntidades } = useEntidades();
  const { data: colunas, isLoading: isLoadingColunas } = useColunasEntidade(entidadeSelecionada || undefined);
  const { data: registros, isLoading: isLoadingRegistros } = useRegistrosEntidade(entidadeSelecionada || undefined);

  const criarMutation = useCriarRegistroEntidade(entidadeSelecionada || undefined);
  const atualizarMutation = useAtualizarRegistroEntidade(entidadeSelecionada || undefined);
  const deletarMutation = useDeletarRegistroEntidade(entidadeSelecionada || undefined);

  const colunaPrimaria = colunas?.find((coluna) => coluna.chave_primaria)?.nome ?? 'id';

  const abrirCriar = () => {
    setRegistroEmEdicao(null);
    setIsFormAberto(true);
  };

  const abrirEditar = (registro: RegistroEntidade) => {
    setRegistroEmEdicao(registro);
    setIsFormAberto(true);
  };

  const handleSalvar = (dados: RegistroEntidade) => {
    const handleSuccess = () => {
      toast.success(registroEmEdicao ? 'Registro atualizado.' : 'Registro criado.');
      setIsFormAberto(false);
      setRegistroEmEdicao(null);
    };
    const handleError = (error: unknown) => toast.error(extractErrorMessage(error, 'Erro ao salvar registro.'));

    if (registroEmEdicao) {
      const registroId = registroEmEdicao[colunaPrimaria] as string | number;
      atualizarMutation.mutate({ registroId, dados }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      criarMutation.mutate(dados, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDeletar = (registro: RegistroEntidade) => {
    const registroId = registro[colunaPrimaria] as string | number;
    if (!confirm(`Excluir o registro #${registroId} de "${entidadeSelecionada}"? Essa ação não pode ser desfeita.`)) return;

    deletarMutation.mutate(registroId, {
      onSuccess: () => toast.success('Registro excluído.'),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao excluir registro.')),
    });
  };

  return (
    <AppCard
      title="CRUD Dinâmico de Entidades"
      description="Selecione uma tabela do sistema para visualizar e editar seus registros diretamente."
      action={
        entidadeSelecionada && (
          <Button type="button" size="sm" onClick={abrirCriar}>
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        )
      }
    >
      <div className="mb-4 max-w-sm">
        <Select value={entidadeSelecionada} onValueChange={setEntidadeSelecionada} disabled={isLoadingEntidades}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoadingEntidades ? 'Carregando...' : 'Selecione uma entidade'} />
          </SelectTrigger>
          <SelectContent>
            {entidades?.map((entidade) => (
              <SelectItem key={entidade.nome} value={entidade.nome}>{entidade.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!entidadeSelecionada ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Escolha uma entidade acima para ver seus registros.
        </p>
      ) : isLoadingColunas || isLoadingRegistros ? (
        <Spinner />
      ) : !registros?.length ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nenhum registro cadastrado ainda.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {colunas?.map((coluna) => (
                <TableHead key={coluna.nome}>{coluna.nome}</TableHead>
              ))}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((registro) => (
              <TableRow key={String(registro[colunaPrimaria])}>
                {colunas?.map((coluna) => (
                  <TableCell key={coluna.nome} className="text-muted-foreground">
                    {formatarValor(registro[coluna.nome])}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEditar(registro)}
                      className="text-muted-foreground hover:text-primary"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletar(registro)}
                      className="text-destructive hover:text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {colunas && (
        <EntidadeFormDialog
          // Remonta o formulário do zero a cada abertura (criar novo ou
          // editar um registro diferente) — mais simples e mais seguro que
          // sincronizar estado com useEffect (ver EntidadeFormDialog.tsx).
          key={isFormAberto ? String(registroEmEdicao?.[colunaPrimaria] ?? 'novo') : 'fechado'}
          open={isFormAberto}
          onOpenChange={setIsFormAberto}
          titulo={registroEmEdicao ? `Editar registro em "${entidadeSelecionada}"` : `Novo registro em "${entidadeSelecionada}"`}
          colunas={colunas}
          registroEmEdicao={registroEmEdicao}
          onSalvar={handleSalvar}
          salvando={criarMutation.isPending || atualizarMutation.isPending}
        />
      )}
    </AppCard>
  );
}
