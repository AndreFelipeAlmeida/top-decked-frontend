import { useState } from 'react';
import { Plus, Trash2, Calendar, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ApiErrorDetail } from '@/types/Error';
import type { EventoPublico } from '@/types/Evento';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import { useViewMode } from '@/hooks/viewModeContext.hooks';
import { useOrganizadorDoTenantAtual } from '@/hooks/organizadorTenant.hooks';
import {
  useEventos,
  useEventosDaLoja,
  useCriarEvento,
  useCriarEventoOrganizador,
  useDeletarEvento,
} from '@/hooks/evento.hooks';
import { eventoSchema, type EventoForm } from '@/schemas/evento.schemas';
import { nomeDoJogo } from '@/lib/tcgGames';
import { formatarDataBR } from '@/lib/dateUtils';
import { OrganizerViewSwitch } from '@/components/player/OrganizerViewSwitch';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

const corDoStatus = (status: EventoPublico['status']) => {
  switch (status) {
    case 'ATIVO':
      return 'bg-success/15 text-success border-success/40';
    case 'AGENDADO':
      return 'bg-info/15 text-info border-info/40';
    case 'ENCERRADO':
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const rotuloDoStatus = (status: EventoPublico['status']) => {
  switch (status) {
    case 'ATIVO': return 'Ativo';
    case 'AGENDADO': return 'Agendado';
    case 'ENCERRADO': return 'Encerrado';
    default: return status;
  }
};

export default function Eventos() {
  const user = useAuthenticatedUser();
  const isJogador = user.tipo === 'jogador';

  const { selectedTcg } = useTcgSelection();
  const { viewMode } = useViewMode();
  const { data: jogador, isLoading: isMeLoading } = useMe(isJogador);

  const { isOrganizador: isOrganizadorDoTenant, tcgs: tcgsOrganizados, lojaId: tenantLojaId } =
    useOrganizadorDoTenantAtual();
  const isOrganizerOfSelectedTcg = isOrganizadorDoTenant && tcgsOrganizados.includes(selectedTcg ?? '');
  const podeCriarEvento = isJogador ? isOrganizerOfSelectedTcg && viewMode === 'organizador' : true;

  // Loja só vê os próprios eventos; jogador navega eventos de qualquer loja
  // (mesmo padrão de Tournaments.tsx) e pode gerenciar os que ele organiza.
  const { data: eventosJogador, isLoading: isLoadingJogador } = useEventos(isJogador ? selectedTcg : undefined);
  const { data: eventosLoja, isLoading: isLoadingLoja } = useEventosDaLoja(!isJogador ? selectedTcg : undefined);
  const eventos = isJogador ? eventosJogador : eventosLoja;
  const isLoadingEventos = isJogador ? isLoadingJogador : isLoadingLoja;

  const podeGerenciarEvento = (evento: EventoPublico) =>
    !isJogador || (
      jogador?.lojas?.some((loja) =>
        loja.loja_id === evento.loja_id && loja.organizacoes?.some((org) => org.tcg === evento.tcg)
      ) ?? false
    );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventoParaExcluir, setEventoParaExcluir] = useState<EventoPublico | null>(null);

  const criarMutation = useCriarEvento();
  const criarOrganizadorMutation = useCriarEventoOrganizador();
  const deletarMutation = useDeletarEvento();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventoForm>({
    resolver: zodResolver(eventoSchema),
    defaultValues: { nome: '', descricao: '', data_inicio: '', data_fim: '' },
  });

  const isLoading = (isJogador && isMeLoading) || isLoadingEventos;
  if (isLoading) return <Spinner />;

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    reset();
  };

  const onSubmitCriar = (data: EventoForm) => {
    if (!selectedTcg) return;

    const handleSuccess = () => {
      toast.success('Evento criado com sucesso!');
      handleCloseCreateModal();
    };
    const handleError = (error: unknown) => toast.error(extractErrorMessage(error, 'Erro ao criar evento.'));

    // Botão de "Criar Evento" só aparece quando podeCriarEvento é true, e
    // pra jogador isso já exige estar no subdomínio da loja organizada
    // (tenantLojaId sempre definido nesse caso) — ver useOrganizadorDoTenantAtual.
    if (isJogador) {
      criarOrganizadorMutation.mutate(
        { ...data, tcg: selectedTcg, loja_id: tenantLojaId! },
        { onSuccess: handleSuccess, onError: handleError },
      );
    } else {
      criarMutation.mutate({ ...data, tcg: selectedTcg }, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleConfirmarExclusao = () => {
    if (!eventoParaExcluir) return;
    deletarMutation.mutate(eventoParaExcluir.id, {
      onSuccess: () => {
        toast.success('Evento excluído.');
        setEventoParaExcluir(null);
      },
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao excluir evento.')),
    });
  };

  const isSalvandoCriacao = criarMutation.isPending || criarOrganizadorMutation.isPending;

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-foreground">Eventos</h1>
          <p className="text-muted-foreground">
            Programas de pontuação de {nomeDoJogo(selectedTcg)} com metas e recompensas
          </p>
        </div>

        <div className="flex items-center gap-4">
          <OrganizerViewSwitch visible={isJogador && isOrganizerOfSelectedTcg} />
          {podeCriarEvento && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-5 h-5" />
              Criar Evento
            </Button>
          )}
        </div>
      </div>

      {!eventos?.length ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 py-16">
          <Trophy className="w-8 h-8" />
          <span className="text-sm">Nenhum evento de {nomeDoJogo(selectedTcg)} encontrado.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((evento) => (
            <div key={evento.id} className="bg-card rounded-lg shadow hover:shadow-lg transition-shadow p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-foreground">{evento.nome}</h3>
                <span className={`shrink-0 px-2 py-1 text-xs rounded border font-medium ${corDoStatus(evento.status)}`}>
                  {rotuloDoStatus(evento.status)}
                </span>
              </div>

              {evento.loja?.nome && (
                <p className="text-xs text-muted-foreground">{evento.loja.nome}</p>
              )}

              {evento.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{evento.descricao}</p>
              )}

              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                {formatarDataBR(evento.data_inicio)} até{' '}
                {formatarDataBR(evento.data_fim)}
              </p>

              <div className="flex gap-2 mt-2">
                <Link
                  to={`/eventos/${evento.id}`}
                  className="flex-1 text-center px-4 py-2 rounded-lg font-medium transition-colors bg-primary text-white hover:bg-primary/90"
                >
                  Visualizar
                </Link>
                {podeGerenciarEvento(evento) && (
                  <>
                    <Link
                      to={`/eventos/${evento.id}/configurar`}
                      className="flex-1 text-center px-4 py-2 rounded-lg font-medium transition-colors bg-muted text-muted-foreground hover:bg-accent"
                    >
                      Configurar
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEventoParaExcluir(evento)}
                      title="Excluir evento"
                      className="px-3 py-2 rounded-lg font-medium transition-colors bg-destructive/15 text-destructive hover:bg-destructive/25"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={(open) => (open ? setIsCreateModalOpen(true) : handleCloseCreateModal())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Evento</DialogTitle>
            <DialogDescription>
              Um programa de pontuação de {nomeDoJogo(selectedTcg)} com metas e recompensas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitCriar)} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Nome</label>
              <input
                type="text"
                {...register('nome')}
                placeholder="Ex: Liga de Verão 2026"
                className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.nome && <p className="text-destructive text-xs mt-1">{errors.nome.message}</p>}
            </div>

            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Descrição (opcional)</label>
              <textarea
                {...register('descricao')}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Data de Início</label>
                <input
                  type="date"
                  {...register('data_inicio')}
                  className="w-full px-3 py-2 border border-border rounded-lg outline-none"
                />
                {errors.data_inicio && <p className="text-destructive text-xs mt-1">{errors.data_inicio.message}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Data de Fim</label>
                <input
                  type="date"
                  {...register('data_fim')}
                  className="w-full px-3 py-2 border border-border rounded-lg outline-none"
                />
                {errors.data_fim && <p className="text-destructive text-xs mt-1">{errors.data_fim.message}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseCreateModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSalvandoCriacao}>
                {isSalvandoCriacao ? 'Criando...' : 'Criar Evento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={eventoParaExcluir !== null} onOpenChange={(open) => !open && setEventoParaExcluir(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir evento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o evento "{eventoParaExcluir?.nome}"? Essa ação apaga
              permanentemente o evento, suas metas, regras, participantes e pontos manuais — não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEventoParaExcluir(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deletarMutation.isPending}
              onClick={handleConfirmarExclusao}
            >
              {deletarMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
