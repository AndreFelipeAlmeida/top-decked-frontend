import { Check, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppCard } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAprovarLoja, useLojasPendentes, useRejeitarLoja } from '@/hooks/admin.hooks';
import type { ApiErrorDetail } from '@/types/Error';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

export function LojasPendentesTab() {
  const { data: lojas, isLoading } = useLojasPendentes();
  const aprovarMutation = useAprovarLoja();
  const rejeitarMutation = useRejeitarLoja();

  const handleAprovar = (lojaId: number, nome: string) => {
    aprovarMutation.mutate(lojaId, {
      onSuccess: () => toast.success(`Loja "${nome}" aprovada.`),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao aprovar loja.')),
    });
  };

  const handleRejeitar = (lojaId: number, nome: string) => {
    if (!confirm(`Rejeitar o cadastro de "${nome}"? Ela não conseguirá acessar a plataforma.`)) return;
    rejeitarMutation.mutate(lojaId, {
      onSuccess: () => toast.success(`Loja "${nome}" rejeitada.`),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao rejeitar loja.')),
    });
  };

  if (isLoading) return <Spinner />;

  return (
    <AppCard
      title="Lojas Pendentes de Aprovação"
      description="Novas lojas ficam bloqueadas até que um administrador aprove ou rejeite o cadastro."
    >
      {!lojas?.length ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma loja pendente no momento.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lojas.map((loja) => (
              <TableRow key={loja.id}>
                <TableCell className="font-medium text-foreground">{loja.nome}</TableCell>
                <TableCell className="text-muted-foreground">{loja.usuario.email}</TableCell>
                <TableCell className="text-muted-foreground">{loja.endereco || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="icon-sm"
                      title="Aprovar"
                      disabled={aprovarMutation.isPending || rejeitarMutation.isPending}
                      onClick={() => handleAprovar(loja.id, loja.nome)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      title="Rejeitar"
                      disabled={aprovarMutation.isPending || rejeitarMutation.isPending}
                      onClick={() => handleRejeitar(loja.id, loja.nome)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </AppCard>
  );
}
