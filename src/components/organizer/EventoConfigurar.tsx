import { useState } from 'react';
import { ArrowLeft, Edit, Plus, Trash2, Save, X, Award } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AppCard } from '@/components/ui/app-card';
import { EditableListCard } from '@/components/ui/editable-list-card';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParticipanteCartela } from './ParticipanteCartela';
import {
  useEvento,
  useAtualizarEvento,
  useJogadoresDisponiveisEvento,
  useCriarParticipanteEvento,
  useCriarPontosManuaisEvento,
  useCriarRegraEvento,
  useAtualizarRegraEvento,
  useDeletarRegraEvento,
  useCriarRegraManualEvento,
  useAtualizarRegraManualEvento,
  useDeletarRegraManualEvento,
  useCriarMetaEvento,
  useAtualizarMetaEvento,
  useDeletarMetaEvento,
} from '@/hooks/evento.hooks';
import {
  eventoSchema, type EventoForm,
  regraEventoSchema, type RegraEventoForm,
  regraManualEventoSchema, type RegraManualEventoForm,
  metaEventoSchema, type MetaEventoForm,
  pontosManuaisEventoSchema, type PontosManuaisEventoForm,
  TIPOS_REGRA_EVENTO, nomeDaRegraEvento,
} from '@/schemas/evento.schemas';
import { parseNumeroComVirgula } from '@/schemas/playerType.schemas';
import type { ApiErrorDetail } from '@/types/Error';
import type {
  ParticipanteEventoPublico,
  RegraPontuacaoEventoPublico,
  RegraPontuacaoManualEventoPublico,
  MetaEventoPublico,
} from '@/types/Evento';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

export default function EventoConfigurar() {
  const { id } = useParams<{ id: string }>();
  const eventoId = id ? Number(id) : undefined;

  const { data: evento, isLoading } = useEvento(eventoId);

  const [isEditandoEvento, setIsEditandoEvento] = useState(false);
  const [regraEmEdicao, setRegraEmEdicao] = useState<RegraPontuacaoEventoPublico | null>(null);
  const [isRegraModalOpen, setIsRegraModalOpen] = useState(false);
  const [regraManualEmEdicao, setRegraManualEmEdicao] = useState<RegraPontuacaoManualEventoPublico | null>(null);
  const [isRegraManualModalOpen, setIsRegraManualModalOpen] = useState(false);
  const [metaEmEdicao, setMetaEmEdicao] = useState<MetaEventoPublico | null>(null);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isParticipanteModalOpen, setIsParticipanteModalOpen] = useState(false);
  const [participanteParaPontos, setParticipanteParaPontos] = useState<ParticipanteEventoPublico | null>(null);

  const atualizarEventoMutation = useAtualizarEvento(eventoId);
  const { data: jogadoresDisponiveis, isLoading: isLoadingJogadores } = useJogadoresDisponiveisEvento(eventoId);
  const criarParticipanteMutation = useCriarParticipanteEvento(eventoId);
  const criarPontosManuaisMutation = useCriarPontosManuaisEvento(eventoId);
  const criarRegraMutation = useCriarRegraEvento(eventoId);
  const atualizarRegraMutation = useAtualizarRegraEvento(eventoId);
  const deletarRegraMutation = useDeletarRegraEvento(eventoId);
  const criarRegraManualMutation = useCriarRegraManualEvento(eventoId);
  const atualizarRegraManualMutation = useAtualizarRegraManualEvento(eventoId);
  const deletarRegraManualMutation = useDeletarRegraManualEvento(eventoId);
  const criarMetaMutation = useCriarMetaEvento(eventoId);
  const atualizarMetaMutation = useAtualizarMetaEvento(eventoId);
  const deletarMetaMutation = useDeletarMetaEvento(eventoId);

  const {
    register: registerEvento, handleSubmit: handleSubmitEvento, reset: resetEvento,
    formState: { errors: errosEvento },
  } = useForm<EventoForm>({
    resolver: zodResolver(eventoSchema),
    values: evento
      ? { nome: evento.nome, descricao: evento.descricao ?? '', data_inicio: evento.data_inicio, data_fim: evento.data_fim }
      : undefined,
  });

  const {
    register: registerRegra, control: controlRegra, handleSubmit: handleSubmitRegra, reset: resetRegra,
    formState: { errors: errosRegra },
  } = useForm<RegraEventoForm>({
    resolver: zodResolver(regraEventoSchema),
    defaultValues: { tipo: 'PARTICIPACAO', pontos: 1 },
  });

  const {
    register: registerRegraManual, handleSubmit: handleSubmitRegraManual, reset: resetRegraManual,
    formState: { errors: errosRegraManual },
  } = useForm<RegraManualEventoForm>({
    resolver: zodResolver(regraManualEventoSchema),
    defaultValues: { descricao: '', pontos: 1 },
  });

  const {
    register: registerMeta, handleSubmit: handleSubmitMeta, reset: resetMeta,
    formState: { errors: errosMeta },
  } = useForm<MetaEventoForm>({
    resolver: zodResolver(metaEventoSchema),
    defaultValues: { pontos_necessarios: 10, recompensa_descricao: '', recompensa_imagem_url: '' },
  });

  const {
    register: registerPontos, handleSubmit: handleSubmitPontos, reset: resetPontos, setValue: setValuePontos,
    formState: { errors: errosPontos },
  } = useForm<PontosManuaisEventoForm>({
    resolver: zodResolver(pontosManuaisEventoSchema),
    defaultValues: { descricao: '', pontos: 1 },
  });

  const [jogadorEscolhidoId, setJogadorEscolhidoId] = useState('');

  if (isLoading) return <Spinner />;
  if (!evento) return null;

  const onSalvarEvento = (data: EventoForm) => {
    atualizarEventoMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Evento atualizado.');
        setIsEditandoEvento(false);
      },
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao atualizar evento.')),
    });
  };

  const abrirCriarRegra = () => {
    setRegraEmEdicao(null);
    resetRegra({ tipo: 'PARTICIPACAO', pontos: 1 });
    setIsRegraModalOpen(true);
  };

  const abrirEditarRegra = (regra: RegraPontuacaoEventoPublico) => {
    setRegraEmEdicao(regra);
    resetRegra({ tipo: regra.tipo, pontos: regra.pontos });
    setIsRegraModalOpen(true);
  };

  const onSalvarRegra = (data: RegraEventoForm) => {
    const handleSuccess = () => {
      toast.success(regraEmEdicao ? 'Regra atualizada.' : 'Regra criada.');
      setIsRegraModalOpen(false);
      setRegraEmEdicao(null);
    };
    const handleError = (error: unknown) => toast.error(extractErrorMessage(error, 'Erro ao salvar regra.'));

    if (regraEmEdicao) {
      atualizarRegraMutation.mutate({ regraId: regraEmEdicao.id, dados: data }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      criarRegraMutation.mutate(data, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleExcluirRegra = (regra: RegraPontuacaoEventoPublico) => {
    if (!confirm(`Excluir a regra "${nomeDaRegraEvento(regra.tipo)}"?`)) return;
    deletarRegraMutation.mutate(regra.id, {
      onSuccess: () => toast.success('Regra excluída.'),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao excluir regra.')),
    });
  };

  const abrirCriarRegraManual = () => {
    setRegraManualEmEdicao(null);
    resetRegraManual({ descricao: '', pontos: 1 });
    setIsRegraManualModalOpen(true);
  };

  const abrirEditarRegraManual = (regra: RegraPontuacaoManualEventoPublico) => {
    setRegraManualEmEdicao(regra);
    resetRegraManual({ descricao: regra.descricao, pontos: regra.pontos });
    setIsRegraManualModalOpen(true);
  };

  const onSalvarRegraManual = (data: RegraManualEventoForm) => {
    const handleSuccess = () => {
      toast.success(regraManualEmEdicao ? 'Regra manual atualizada.' : 'Regra manual criada.');
      setIsRegraManualModalOpen(false);
      setRegraManualEmEdicao(null);
    };
    const handleError = (error: unknown) => toast.error(extractErrorMessage(error, 'Erro ao salvar regra manual.'));

    if (regraManualEmEdicao) {
      atualizarRegraManualMutation.mutate(
        { regraId: regraManualEmEdicao.id, dados: data },
        { onSuccess: handleSuccess, onError: handleError },
      );
    } else {
      criarRegraManualMutation.mutate(data, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleExcluirRegraManual = (regra: RegraPontuacaoManualEventoPublico) => {
    if (!confirm(`Excluir a regra manual "${regra.descricao}"?`)) return;
    deletarRegraManualMutation.mutate(regra.id, {
      onSuccess: () => toast.success('Regra manual excluída.'),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao excluir regra manual.')),
    });
  };

  const abrirCriarMeta = () => {
    setMetaEmEdicao(null);
    resetMeta({ pontos_necessarios: 10, recompensa_descricao: '', recompensa_imagem_url: '' });
    setIsMetaModalOpen(true);
  };

  const abrirEditarMeta = (meta: MetaEventoPublico) => {
    setMetaEmEdicao(meta);
    resetMeta({
      pontos_necessarios: meta.pontos_necessarios,
      recompensa_descricao: meta.recompensa_descricao ?? '',
      recompensa_imagem_url: meta.recompensa_imagem_url ?? '',
    });
    setIsMetaModalOpen(true);
  };

  const onSalvarMeta = (data: MetaEventoForm) => {
    const dados = {
      pontos_necessarios: data.pontos_necessarios,
      recompensa_descricao: data.recompensa_descricao || null,
      recompensa_imagem_url: data.recompensa_imagem_url || null,
    };
    const handleSuccess = () => {
      toast.success(metaEmEdicao ? 'Meta atualizada.' : 'Meta criada.');
      setIsMetaModalOpen(false);
      setMetaEmEdicao(null);
    };
    const handleError = (error: unknown) => toast.error(extractErrorMessage(error, 'Erro ao salvar meta.'));

    if (metaEmEdicao) {
      atualizarMetaMutation.mutate({ metaId: metaEmEdicao.id, dados }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      criarMetaMutation.mutate(dados, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleExcluirMeta = (meta: MetaEventoPublico) => {
    if (!confirm(`Excluir a meta de ${meta.pontos_necessarios} pontos?`)) return;
    deletarMetaMutation.mutate(meta.id, {
      onSuccess: () => toast.success('Meta excluída.'),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao excluir meta.')),
    });
  };

  const onAdicionarParticipante = () => {
    if (!jogadorEscolhidoId) return;
    criarParticipanteMutation.mutate(Number(jogadorEscolhidoId), {
      onSuccess: () => {
        toast.success('Participante adicionado.');
        setIsParticipanteModalOpen(false);
        setJogadorEscolhidoId('');
      },
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao adicionar participante.')),
    });
  };

  const onSalvarPontosManuais = (data: PontosManuaisEventoForm) => {
    if (!participanteParaPontos) return;
    criarPontosManuaisMutation.mutate(
      { jogador_criado_id: participanteParaPontos.jogador_criado_id, ...data },
      {
        onSuccess: () => {
          toast.success('Pontos adicionados.');
          setParticipanteParaPontos(null);
          resetPontos({ descricao: '', pontos: 1 });
        },
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao adicionar pontos.')),
      },
    );
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <Link to={`/eventos/${evento.id}`} className="inline-flex items-center space-x-2 text-primary hover:text-primary mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para o evento</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl text-foreground">Configurar — {evento.nome}</h1>
          <Button type="button" variant="outline" onClick={() => setIsEditandoEvento(true)}>
            <Edit className="w-4 h-4" />
            Editar Evento
          </Button>
        </div>
      </div>

      <Tabs defaultValue="participantes">
        <TabsList>
          <TabsTrigger value="participantes">Participantes</TabsTrigger>
          <TabsTrigger value="regras">Regras</TabsTrigger>
          <TabsTrigger value="metas">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="participantes" className="pt-4">
          <AppCard
            title="Participantes"
            action={
              <Button type="button" size="sm" onClick={() => setIsParticipanteModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Adicionar Participante
              </Button>
            }
          >
            {evento.participantes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Nenhum participante ainda.</p>
            ) : (
              <div className="space-y-4">
                {evento.participantes.map((participante) => (
                  <ParticipanteCartela
                    key={participante.id}
                    participante={participante}
                    metas={evento.metas}
                    onAdicionarPontos={() => {
                      setParticipanteParaPontos(participante);
                      resetPontos({ descricao: '', pontos: 1 });
                    }}
                  />
                ))}
              </div>
            )}
          </AppCard>
        </TabsContent>

        <TabsContent value="regras" className="pt-4">
          <AppCard
            title="Regras de Pontuação Automáticas"
            description="Contabilizadas a partir dos torneios finalizados dentro do período do evento"
            action={
              <Button type="button" size="sm" onClick={abrirCriarRegra}>
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            }
          >
            {evento.regras.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma regra cadastrada ainda.</p>
            ) : (
              <div className="divide-y divide-border">
                {evento.regras.map((regra) => (
                  <div key={regra.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {regra.pontos} ponto{regra.pontos === 1 ? '' : 's'} por {nomeDaRegraEvento(regra.tipo).toLowerCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => abrirEditarRegra(regra)}
                        className="text-muted-foreground hover:text-primary"
                        title="Editar regra"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluirRegra(regra)}
                        className="text-destructive hover:text-destructive"
                        title="Excluir regra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppCard>

          <div className="mt-6">
            <EditableListCard
              title="Regras de Pontuação Manual"
              description="Vitrine de como os jogadores podem ganhar pontos extras neste evento (lançados manualmente pelo organizador)"
              icon={<Award className="w-5 h-5" />}
              action={
                <Button type="button" size="sm" onClick={abrirCriarRegraManual}>
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              }
              items={evento.regras_manuais}
              emptyMessage="Nenhuma regra manual cadastrada ainda."
              getKey={(regra) => regra.id}
              renderItem={(regra) => (
                <p className="text-sm font-medium text-foreground">
                  {regra.pontos} ponto{regra.pontos === 1 ? '' : 's'} — {regra.descricao}
                </p>
              )}
              onEdit={abrirEditarRegraManual}
              onDelete={handleExcluirRegraManual}
            />
          </div>
        </TabsContent>

        <TabsContent value="metas" className="pt-4">
          <AppCard
            title="Metas e Recompensas"
            action={
              <Button type="button" size="sm" onClick={abrirCriarMeta}>
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            }
          >
            {evento.metas.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma meta cadastrada ainda.</p>
            ) : (
              <div className="divide-y divide-border">
                {[...evento.metas].sort((a, b) => a.pontos_necessarios - b.pontos_necessarios).map((meta) => (
                  <div key={meta.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm">
                        {meta.pontos_necessarios}
                      </span>
                      <p className="text-sm text-foreground truncate">
                        {meta.recompensa_descricao || 'Sem descrição de recompensa'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button type="button" onClick={() => abrirEditarMeta(meta)} className="text-muted-foreground hover:text-primary" title="Editar meta">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => handleExcluirMeta(meta)} className="text-destructive hover:text-destructive" title="Excluir meta">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppCard>
        </TabsContent>
      </Tabs>

      {/* Editar Evento */}
      <Dialog open={isEditandoEvento} onOpenChange={setIsEditandoEvento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEvento(onSalvarEvento)} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Nome</label>
              <input type="text" {...registerEvento('nome')} className="w-full px-3 py-2 border border-border rounded-lg outline-none" />
              {errosEvento.nome && <p className="text-destructive text-xs mt-1">{errosEvento.nome.message}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Descrição</label>
              <textarea {...registerEvento('descricao')} rows={3} className="w-full px-3 py-2 border border-border rounded-lg outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Data de Início</label>
                <input type="date" {...registerEvento('data_inicio')} className="w-full px-3 py-2 border border-border rounded-lg outline-none" />
                {errosEvento.data_inicio && <p className="text-destructive text-xs mt-1">{errosEvento.data_inicio.message}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Data de Fim</label>
                <input type="date" {...registerEvento('data_fim')} className="w-full px-3 py-2 border border-border rounded-lg outline-none" />
                {errosEvento.data_fim && <p className="text-destructive text-xs mt-1">{errosEvento.data_fim.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsEditandoEvento(false); resetEvento(); }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={atualizarEventoMutation.isPending}>
                <Save className="w-4 h-4" />
                {atualizarEventoMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Criar/Editar Regra */}
      <Dialog open={isRegraModalOpen} onOpenChange={setIsRegraModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{regraEmEdicao ? 'Editar Regra' : 'Nova Regra de Pontuação'}</DialogTitle>
            <DialogDescription>Pontos ganhos automaticamente pelo resultado em torneios do período.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRegra(onSalvarRegra)} className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="w-28">
                <label className="block text-sm mb-1 text-muted-foreground">Pontos</label>
                <input
                  type="text"
                  inputMode="decimal"
                  {...registerRegra('pontos', { setValueAs: parseNumeroComVirgula })}
                  className="w-full px-3 py-2 border border-border rounded-lg outline-none"
                />
              </div>
              <span className="pb-2 text-sm text-muted-foreground">por</span>
              <div className="flex-1">
                <Controller
                  name="tipo"
                  control={controlRegra}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_REGRA_EVENTO.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            {errosRegra.pontos && <p className="text-destructive text-xs">{errosRegra.pontos.message}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRegraModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criarRegraMutation.isPending || atualizarRegraMutation.isPending}>
                {criarRegraMutation.isPending || atualizarRegraMutation.isPending ? 'Salvando...' : 'Salvar Regra'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Criar/Editar Regra Manual */}
      <Dialog open={isRegraManualModalOpen} onOpenChange={setIsRegraManualModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{regraManualEmEdicao ? 'Editar Regra Manual' : 'Nova Regra de Pontuação Manual'}</DialogTitle>
            <DialogDescription>
              Vitrine informativa — não lança pontos sozinha, só mostra aos jogadores como podem ganhá-los.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRegraManual(onSalvarRegraManual)} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Descrição</label>
              <textarea
                {...registerRegraManual('descricao')}
                rows={2}
                placeholder="Ex: Trouxe um novato para jogar"
                className="w-full px-3 py-2 border border-border rounded-lg outline-none"
              />
              {errosRegraManual.descricao && <p className="text-destructive text-xs mt-1">{errosRegraManual.descricao.message}</p>}
            </div>
            <div className="w-32">
              <label className="block text-sm mb-1 text-muted-foreground">Pontos</label>
              <input
                type="text"
                inputMode="decimal"
                {...registerRegraManual('pontos', { setValueAs: parseNumeroComVirgula })}
                className="w-full px-3 py-2 border border-border rounded-lg outline-none"
              />
              {errosRegraManual.pontos && <p className="text-destructive text-xs mt-1">{errosRegraManual.pontos.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRegraManualModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criarRegraManualMutation.isPending || atualizarRegraManualMutation.isPending}>
                {criarRegraManualMutation.isPending || atualizarRegraManualMutation.isPending ? 'Salvando...' : 'Salvar Regra'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Criar/Editar Meta */}
      <Dialog open={isMetaModalOpen} onOpenChange={setIsMetaModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{metaEmEdicao ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitMeta(onSalvarMeta)} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Pontos Necessários</label>
              <input
                type="number"
                {...registerMeta('pontos_necessarios', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-border rounded-lg outline-none"
              />
              {errosMeta.pontos_necessarios && <p className="text-destructive text-xs mt-1">{errosMeta.pontos_necessarios.message}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Descrição da Recompensa</label>
              <input
                type="text"
                {...registerMeta('recompensa_descricao')}
                placeholder="Ex: Playmat exclusivo"
                className="w-full px-3 py-2 border border-border rounded-lg outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Mostrada no balão quando não houver imagem cadastrada.</p>
            </div>
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">URL da Imagem (opcional)</label>
              <input
                type="text"
                {...registerMeta('recompensa_imagem_url')}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-border rounded-lg outline-none"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMetaModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criarMetaMutation.isPending || atualizarMetaMutation.isPending}>
                {criarMetaMutation.isPending || atualizarMetaMutation.isPending ? 'Salvando...' : 'Salvar Meta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adicionar Participante */}
      <Dialog open={isParticipanteModalOpen} onOpenChange={setIsParticipanteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Participante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={jogadorEscolhidoId} onValueChange={setJogadorEscolhidoId} disabled={isLoadingJogadores}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoadingJogadores ? 'Carregando...' : 'Selecione um jogador'} />
              </SelectTrigger>
              <SelectContent>
                {jogadoresDisponiveis?.map((jogador) => (
                  <SelectItem key={jogador.id} value={String(jogador.id)}>
                    {jogador.apelido || jogador.game_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isLoadingJogadores && !jogadoresDisponiveis?.length && (
              <p className="text-xs text-muted-foreground">Nenhum jogador cadastrado nesta loja pra este jogo ainda.</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsParticipanteModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!jogadorEscolhidoId || criarParticipanteMutation.isPending} onClick={onAdicionarParticipante}>
              {criarParticipanteMutation.isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pontos por Outros Motivos */}
      <Dialog open={participanteParaPontos !== null} onOpenChange={(open) => !open && setParticipanteParaPontos(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Pontos — Outros Motivos</DialogTitle>
            <DialogDescription>
              {participanteParaPontos?.apelido || participanteParaPontos?.game_id}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPontos(onSalvarPontosManuais)} className="space-y-4">
            {evento.regras_manuais.length > 0 && (
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Regra manual cadastrada (opcional)</label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const regra = evento.regras_manuais.find((r) => String(r.id) === value);
                    if (regra) setValuePontos('descricao', regra.descricao, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Preencher a partir de uma regra cadastrada..." />
                  </SelectTrigger>
                  <SelectContent>
                    {evento.regras_manuais.map((regra) => (
                      <SelectItem key={regra.id} value={String(regra.id)}>
                        {regra.descricao} ({regra.pontos} pt{regra.pontos === 1 ? '' : 's'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">Motivo</label>
              <textarea
                {...registerPontos('descricao')}
                rows={2}
                placeholder="Ex: Ajudou a divulgar o evento"
                className="w-full px-3 py-2 border border-border rounded-lg outline-none"
              />
              {errosPontos.descricao && <p className="text-destructive text-xs mt-1">{errosPontos.descricao.message}</p>}
            </div>
            <div className="w-32">
              <label className="block text-sm mb-1 text-muted-foreground">Pontos</label>
              <input
                type="text"
                inputMode="decimal"
                {...registerPontos('pontos', { setValueAs: parseNumeroComVirgula })}
                className="w-full px-3 py-2 border border-border rounded-lg outline-none"
              />
              {errosPontos.pontos && <p className="text-destructive text-xs mt-1">{errosPontos.pontos.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setParticipanteParaPontos(null)}>
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={criarPontosManuaisMutation.isPending}>
                {criarPontosManuaisMutation.isPending ? 'Adicionando...' : 'Adicionar Pontos'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
