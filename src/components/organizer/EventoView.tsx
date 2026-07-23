import { useState } from 'react';
import { ArrowLeft, Calendar, Settings, Trash2, ListChecks, Users, Award } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { AppCard } from '@/components/ui/app-card';
import { EditableListCard } from '@/components/ui/editable-list-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Spinner from '@/components/ui/spinner';
import { ParticipanteCartela } from './ParticipanteCartela';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useEvento, useDeletarEvento } from '@/hooks/evento.hooks';
import { nomeDaRegraEvento } from '@/schemas/evento.schemas';
import type { ApiErrorDetail } from '@/types/Error';
import { formatarDataBR } from '@/lib/dateUtils';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

const corDoStatus = (status: string) => {
  switch (status) {
    case 'ATIVO': return 'bg-success/15 text-success';
    case 'AGENDADO': return 'bg-info/15 text-info';
    default: return 'bg-muted text-muted-foreground';
  }
};

const rotuloDoStatus = (status: string) => {
  switch (status) {
    case 'ATIVO': return 'Ativo';
    case 'AGENDADO': return 'Agendado';
    case 'ENCERRADO': return 'Encerrado';
    default: return status;
  }
};

export default function EventoView() {
  const { id } = useParams<{ id: string }>();
  const eventoId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const user = useAuthenticatedUser();
  const isJogador = user.tipo === 'jogador';

  const { data: evento, isLoading } = useEvento(eventoId);
  const { data: jogador } = useMe(isJogador);
  const deletarMutation = useDeletarEvento();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  if (isLoading) return <Spinner />;
  if (!evento) return null;

  const podeGerenciar = !isJogador || (
    jogador?.lojas?.some((loja) =>
      loja.loja_id === evento.loja_id && loja.organizacoes?.some((org) => org.tcg === evento.tcg)
    ) ?? false
  );

  const participantesOrdenados = [...evento.participantes].sort((a, b) => b.pontos_total - a.pontos_total);

  const handleExcluir = () => {
    deletarMutation.mutate(evento.id, {
      onSuccess: () => {
        toast.success('Evento excluído.');
        navigate('/eventos');
      },
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao excluir evento.')),
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <Link to="/eventos" className="inline-flex items-center space-x-2 text-primary hover:text-primary mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para Eventos</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl text-foreground">{evento.nome}</h1>
              <span className={`px-2 py-1 text-xs rounded-full font-bold ${corDoStatus(evento.status)}`}>
                {rotuloDoStatus(evento.status)}
              </span>
            </div>
            <p className="text-muted-foreground">
              {evento.loja?.nome ? `${evento.loja.nome} · ` : ''}
              {formatarDataBR(evento.data_inicio)} até{' '}
              {formatarDataBR(evento.data_fim)}
            </p>
          </div>

          {podeGerenciar && (
            <div className="flex gap-2">
              <Link
                to={`/eventos/${evento.id}/configurar`}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configurar</span>
              </Link>
              <Button type="button" variant="destructive" onClick={() => setConfirmandoExclusao(true)}>
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Grid responsivo: coluna 1 = Sobre o Evento + Regras de Pontuação,
          coluna 2 = Metas e Recompensas. Participantes fica fora
          deste grid, ocupando a largura inteira — evita o scroll horizontal
          que a trilha de pontos (ParticipanteCartela) tem ao espremer em 2/3
          da largura quando há muitas metas. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AppCard title="Sobre o Evento" icon={<Calendar className="w-5 h-5" />}>
            <div className="space-y-3">
              {evento.descricao && <p className="text-sm text-foreground">{evento.descricao}</p>}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">De</p>
                  <p className="text-foreground font-medium">{formatarDataBR(evento.data_inicio)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Até</p>
                  <p className="text-foreground font-medium">{formatarDataBR(evento.data_fim)}</p>
                </div>
              </div>
            </div>
          </AppCard>

          <AppCard title="Regras de Pontuação" icon={<ListChecks className="w-5 h-5" />}>
            {evento.regras.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma regra cadastrada ainda.</p>
            ) : (
              <div className="divide-y divide-border">
                {evento.regras.map((regra) => (
                  <div key={regra.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-foreground">{nomeDaRegraEvento(regra.tipo)}</span>
                    <span className="font-bold text-primary">{regra.pontos} pts</span>
                  </div>
                ))}
              </div>
            )}
          </AppCard>

          <EditableListCard
            title="Regras de Pontuação Manual"
            description="Formas de ganhar pontos extras neste evento, lançadas manualmente pelo organizador"
            icon={<Award className="w-5 h-5" />}
            items={evento.regras_manuais}
            emptyMessage="Nenhuma regra manual cadastrada ainda."
            getKey={(regra) => regra.id}
            renderItem={(regra) => (
              <div className="flex items-center justify-between w-full text-sm">
                <span className="text-foreground">{regra.descricao}</span>
                <span className="font-bold text-primary shrink-0 ml-3">{regra.pontos} pts</span>
              </div>
            )}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow p-4 md:p-6">
            <h3 className="text-lg mb-4 text-foreground font-bold flex items-center gap-2">
              <Award className="w-5 h-5" />
              Metas e Recompensas
            </h3>
            {evento.metas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada ainda.</p>
            ) : (
              <div className="space-y-3">
                {evento.metas.map((meta) => (
                  <div key={meta.id} className="flex items-center gap-3 text-sm">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center">
                      {meta.pontos_necessarios}
                    </span>
                    <span className="text-foreground">
                      {meta.recompensa_descricao || 'Recompensa sem descrição'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <AppCard
          title="Participantes"
          description="Pontuação de cada jogador no evento"
          icon={<Users className="w-5 h-5" />}
        >
          {participantesOrdenados.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhum participante ainda.</p>
          ) : (
            <div className="space-y-4">
              {participantesOrdenados.map((participante) => (
                <ParticipanteCartela key={participante.id} participante={participante} metas={evento.metas} />
              ))}
            </div>
          )}
        </AppCard>
      </div>

      <Dialog open={confirmandoExclusao} onOpenChange={setConfirmandoExclusao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir evento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o evento "{evento.nome}"? Essa ação apaga permanentemente o
              evento, suas metas, regras, participantes e pontos manuais — não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmandoExclusao(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" disabled={deletarMutation.isPending} onClick={handleExcluir}>
              {deletarMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
