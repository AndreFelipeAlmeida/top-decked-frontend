import { ArrowLeft, Trophy, Edit, Save, Upload, Award, RefreshCw, Medal, X, Search, Plus, Gavel, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import {
  useTournamentById,
  useImportTournamentResults,
  useUpdateTournament,
  useUpdatePlayerScore,
  useUpdatePlayerRule,
  useRecalculateTournamentScore,
  useOrganizadoresDisponiveisParaJuiz,
  useAdicionarJuiz,
  useRemoverJuiz,
} from '@/hooks/tournaments.hooks';
import { usePlayerTypes, usePlayerTypesByOrganizer } from '@/hooks/playerTypes.hooks';
import { useRepresentacoes, useUpdatePlayerComposicao } from '@/hooks/composicao.hooks';
import { useTemporadas, useTemporadasLoja } from '@/hooks/temporadas.hooks';
import { usePontuacaoExtraDoTorneio } from '@/hooks/pontuacaoExtra.hooks';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { updateStoreTournamentSchema, type UpdateStoreTournamentForm } from '@/schemas/tournament.schemas';
import type { JogadorTorneioLinkPublico } from '@/types/Tournaments';
import type { ApiErrorDetail } from '@/types/Error';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComposicaoRepresentacaoModal } from './ComposicaoRepresentacaoModal';
import { ComposicaoUnidadesModal } from './ComposicaoUnidadesModal';
import { QuickCreateRuleDialog } from './QuickCreateRuleDialog';
import { QuickCreateSeasonDialog } from './QuickCreateSeasonDialog';
import { PontuacaoExtraForm } from './PontuacaoExtraForm';
import { PontuacaoExtraHistorico } from './PontuacaoExtraHistorico';
import { RepresentacaoComposicaoCombobox } from './RepresentacaoComposicaoCombobox';
import { RodadasTab } from './RodadasTab';
import { pokemonSpriteUrl } from '@/lib/pokemon';
import { jogoTemRepresentacaoDeck } from '@/lib/pokemonModalidade';
import { pokemonFormats } from '@/lib/pokemonFormats';
import { formatosMD } from '@/lib/formatoMD';
import { encontrarTemporadaDaData } from '@/lib/temporadaUtils';

const JOGOS_POKEMON = ['POKEMON', 'POKEMON_VGC', 'POKEMON_GO'];

type ScoreField = 'pontuacao' | 'pontuacao_com_regras';
type ScoreOverrides = Record<string, Partial<Record<ScoreField, number>>>;

const rowKey = (link: JogadorTorneioLinkPublico, index: number) =>
  String(link.id ?? link.jogador_id ?? index);

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

type ScoreBoxProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
};

function ScoreBox({ label, value, onChange, onCommit }: ScoreBoxProps) {
  return (
    <div className="flex flex-col items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={(e) => onCommit(Number(e.target.value))}
        className="w-16 h-16 cursor-pointer rounded-lg border-2 border-primary/30 bg-primary/10 text-center text-lg font-bold text-primary outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary"
      />
      <span className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground text-center">{label}</span>
    </div>
  );
}

export default function TournamentEditDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scoreOverrides, setScoreOverrides] = useState<ScoreOverrides>({});
  const [buscaJogador, setBuscaJogador] = useState('');
  const [composicaoModalAberto, setComposicaoModalAberto] = useState(false);
  const [linkParaNovaRepresentacao, setLinkParaNovaRepresentacao] = useState<number | null>(null);
  const [composicaoUnidadesModalLinkId, setComposicaoUnidadesModalLinkId] = useState<number | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [showSeasonWarningModal, setShowSeasonWarningModal] = useState(false);
  const [showQuickCreateSeasonModal, setShowQuickCreateSeasonModal] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<UpdateStoreTournamentForm | null>(null);
  const [isJuizModalOpen, setIsJuizModalOpen] = useState(false);
  const [juizEscolhidoId, setJuizEscolhidoId] = useState('');

  const user = useAuthenticatedUser();
  const isJogador = user.tipo === 'jogador';

  const { data: torneio, isLoading } = useTournamentById(id);

  // Composições estão implementadas pro TCG Pokémon, Pokémon VGC e Pokémon GO
  // (ver docs/COMPOSICAO.md) — só o TCG tem representação de deck (não existe
  // "deck" em VGC/GO), o resto é sempre a composição completa (o time de 6
  // Pokémon). GO tem uma particularidade a mais — o jogador escolhe 3 dos 6
  // por partida — mas isso é editado na tela do console do torneio (por
  // rodada), não aqui.
  const tcgSuportaComposicao =
    torneio?.jogo === 'POKEMON' || torneio?.jogo === 'POKEMON_VGC' || torneio?.jogo === 'POKEMON_GO';
  const temRepresentacaoDeck = jogoTemRepresentacaoDeck(torneio?.jogo);
  const { data: representacoes } = useRepresentacoes(torneio?.jogo ?? 'POKEMON');
  const updateComposicaoMutation = useUpdatePlayerComposicao(id);

  // Aviso de "torneio fora de temporada" (ver docs/TEMPORADAS.md) só faz
  // sentido pras 3 variantes de Pokémon com Temporada cadastrável, e só pra
  // torneios importados de .tdf — um torneio criado manualmente na
  // plataforma não vem de um import, então esse fluxo específico não se
  // aplica a ele (o organizador ainda pode cadastrar a temporada a qualquer
  // momento pela tela de Temporadas, fora deste aviso).
  const ehJogoPokemon = JOGOS_POKEMON.includes(torneio?.jogo ?? '');
  const ehTorneioImportado = torneio?.tipo === 'IMPORTADO';
  const { data: temporadasLoja } = useTemporadas(!isJogador && ehJogoPokemon ? torneio?.jogo ?? undefined : undefined);
  const { data: temporadasOrganizador } = useTemporadasLoja(
    isJogador && ehJogoPokemon ? torneio?.loja?.id : undefined,
    ehJogoPokemon ? torneio?.jogo ?? undefined : undefined,
  );
  const temporadas = isJogador ? temporadasOrganizador : temporadasLoja;

  // GET /lojas/tipoJogador/ exige token de loja — um jogador organizador
  // (agora com acesso a esta página, ver docs/DIVIDA_TECNICA.md) precisa
  // buscar as regras pelo endpoint que aceita token de jogador + loja_id.
  const { data: regrasLoja, isLoading: isLoadingRegrasLoja } = usePlayerTypes(!isJogador);
  const { data: regrasJogador, isLoading: isLoadingRegrasJogador } = usePlayerTypesByOrganizer(
    isJogador ? torneio?.loja?.id : undefined,
  );

  const regras = isJogador ? regrasJogador : regrasLoja;
  const isLoadingRegras = isJogador ? isLoadingRegrasJogador : isLoadingRegrasLoja;

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<UpdateStoreTournamentForm>({
    resolver: zodResolver(updateStoreTournamentSchema),
    values: {
      nome: torneio?.nome ?? '',
      data_planejada: torneio?.data_planejada ?? '',
      hora_planejada: torneio?.hora_planejada ?? '',
      formato: torneio?.formato ?? '',
      melhor_de: torneio?.melhor_de ?? '',
      // Torneios importados antes desta correção podem ter vagas=0 mesmo com
      // jogadores reais — nesse caso mostra a quantidade de participantes
      // como valor inicial em vez de deixar "0" (ver docs/DIVIDA_TECNICA.md).
      vagas: torneio?.vagas || torneio?.jogadores?.length || 0,
      taxa: torneio?.taxa ?? 0,
      premio: torneio?.premio ?? '',
      descricao: torneio?.descricao ?? '',
      regra_basica_id: torneio?.regra_basica_id ?? undefined,
      pontuacao_de_participacao: torneio?.pontuacao_de_participacao ?? 0,
      inicio_real: torneio?.inicio_real ?? '',
      fim_real: torneio?.fim_real ?? '',
      conta_em_eventos: torneio?.conta_em_eventos ?? true,
    },
  });
  const formData = watch();

  const updateMutation = useUpdateTournament(id);
  const updateScoreMutation = useUpdatePlayerScore(id);
  const updateRuleMutation = useUpdatePlayerRule(id);
  const recalculateMutation = useRecalculateTournamentScore(id);
  const importMutation = useImportTournamentResults(id);
  const { data: pontuacaoExtraDoTorneio, isLoading: isLoadingPontuacaoExtra } = usePontuacaoExtraDoTorneio(id);
  const { data: organizadoresDisponiveisJuiz, isLoading: isLoadingOrganizadoresJuiz } = useOrganizadoresDisponiveisParaJuiz(id);
  const adicionarJuizMutation = useAdicionarJuiz(id);
  const removerJuizMutation = useRemoverJuiz(id);

  const performSave = (data: UpdateStoreTournamentForm) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        // Se o torneio tem regra básica definida, salvar aqui reaplica a regra
        // no backend e recalcula as pontuações oficiais — descarta ajustes
        // manuais pendentes, então limpamos os overrides locais também.
        setScoreOverrides({});
        setPendingSaveData(null);
        toast.success('Alterações salvas com sucesso!');
        navigate(`/loja/torneio/${id}/visualizar`);
      },
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao salvar alterações.')),
    });
  };

  const onSave = (data: UpdateStoreTournamentForm) => {
    // Torneio importado (.tdf) sem nenhuma Temporada cadastrada cobrindo a
    // data planejada — avisa antes de salvar, já que sem Temporada o
    // jogador não entra na categorização de idade (ver docs/TEMPORADAS.md).
    // Torneios criados manualmente ou jogos fora do Pokémon não passam por
    // este aviso (pedido explícito do usuário: o aviso é no fluxo de import).
    const temporadaEncontrada = encontrarTemporadaDaData(data.data_planejada, temporadas);
    if (ehTorneioImportado && ehJogoPokemon && !temporadaEncontrada) {
      setPendingSaveData(data);
      setShowSeasonWarningModal(true);
      return;
    }

    performSave(data);
  };

  const handleSalvarMesmoAssim = () => {
    setShowSeasonWarningModal(false);
    if (pendingSaveData) performSave(pendingSaveData);
  };

  const handleAbrirCadastroTemporada = () => {
    setShowSeasonWarningModal(false);
    setShowQuickCreateSeasonModal(true);
  };

  const handleTemporadaCriada = () => {
    setShowQuickCreateSeasonModal(false);
    if (pendingSaveData) performSave(pendingSaveData);
  };

  const handleImport = () => {
    if (!selectedFile) return;
    importMutation.mutate(selectedFile, {
      onSuccess: (torneioImportado) => {
        setShowImportModal(false);
        setSelectedFile(null);
        setScoreOverrides({});
        toast.success('Resultados importados com sucesso!');

        // A importação recria o torneio do zero (apaga o antigo e gera um novo
        // a partir do XML), então o id pode mudar — sem redirecionar, a página
        // fica presa na URL do torneio antigo, que não existe mais.
        if (torneioImportado.id !== id) {
          navigate(`/loja/torneio/${torneioImportado.id}/editar`, { replace: true });
        }
      },
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao importar resultados.')),
    });
  };

  const updateScore = (key: string, field: ScoreField, value: number) => {
    setScoreOverrides((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const commitScore = (
    row: { linkId: number | null | undefined; pontuacao: number; pontuacao_com_regras: number },
    field: ScoreField,
    value: number,
  ) => {
    if (!row.linkId) return;

    updateScoreMutation.mutate(
      {
        linkId: row.linkId,
        dados: {
          pontuacao: field === 'pontuacao' ? value : row.pontuacao,
          pontuacao_com_regras: field === 'pontuacao_com_regras' ? value : row.pontuacao_com_regras,
        },
      },
      {
        onSuccess: () => toast.success('Pontuação atualizada.'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao atualizar pontuação.')),
      },
    );
  };

  // regraExtraId null = "Nenhuma", o jogador volta a pontuar só pela regra
  // básica do torneio, sem ajuste nenhum (ver docs/REGRA_EXTRA.md).
  const handlePlayerRuleChange = (linkId: number | null | undefined, regraExtraId: number | null) => {
    if (!linkId) return;

    updateRuleMutation.mutate(
      { linkId, regraExtraId },
      {
        onSuccess: () => toast.success('Regra extra do jogador atualizada.'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao atualizar regra extra do jogador.')),
      },
    );
  };

  const handleRecalculate = () => {
    // Usa a regra e a pontuação por participação selecionadas no formulário
    // (mesmo que ainda não tenham sido salvas) — o organizador não deveria
    // precisar clicar em "Salvar Alterações" antes de recalcular com o que
    // acabou de escolher.
    recalculateMutation.mutate({
      regraBasicaId: formData.regra_basica_id,
      pontuacaoDeParticipacao: formData.pontuacao_de_participacao,
    }, {
      onSuccess: () => {
        setScoreOverrides({});
        toast.success('Pontuações recalculadas a partir da regra básica do torneio.');
      },
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao recalcular pontuações.')),
    });
  };

  const composicaoUnidadesParaEnvio = (linkId: number) => {
    const linkAtual = torneio?.jogadores?.find((j) => j.id === linkId);
    return (linkAtual?.composicao_unidades ?? []).map((cu) => ({
      unidade_catalogo_id: cu.unidade_catalogo_id,
      quantidade: cu.quantidade,
    }));
  };

  const handleComposicaoRepresentacaoChange = (
    linkId: number | null | undefined,
    composicaoRepresentacaoId: number | null,
  ) => {
    if (!linkId) return;

    updateComposicaoMutation.mutate(
      {
        linkId,
        dados: {
          composicao_representacao_id: composicaoRepresentacaoId,
          composicao_unidades: composicaoUnidadesParaEnvio(linkId),
        },
      },
      {
        onSuccess: () => toast.success('Representação de composição atualizada.'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao atualizar composição do jogador.')),
      },
    );
  };

  const handleComposicaoUnidadesSave = (
    linkId: number | null | undefined,
    composicaoRepresentacaoId: number | null | undefined,
    composicaoUnidades: { unidade_catalogo_id: number; quantidade: number }[],
  ) => {
    if (!linkId) return;

    updateComposicaoMutation.mutate(
      {
        linkId,
        dados: {
          composicao_representacao_id: composicaoRepresentacaoId ?? null,
          composicao_unidades: composicaoUnidades,
        },
      },
      {
        onSuccess: () => {
          toast.success('Composição salva.');
          setComposicaoUnidadesModalLinkId(null);
        },
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao salvar composição.')),
      },
    );
  };

  const handleAbrirNovaRepresentacao = (linkId: number | null | undefined) => {
    if (!linkId) return;
    setLinkParaNovaRepresentacao(linkId);
    setComposicaoModalAberto(true);
  };

  const handleRepresentacaoCriada = (representacao: { id: number }) => {
    if (linkParaNovaRepresentacao) {
      handleComposicaoRepresentacaoChange(linkParaNovaRepresentacao, representacao.id);
    }
    setLinkParaNovaRepresentacao(null);
  };

  const handleAdicionarJuiz = () => {
    if (!juizEscolhidoId) return;
    adicionarJuizMutation.mutate(Number(juizEscolhidoId), {
      onSuccess: () => {
        toast.success('Juiz cadastrado no torneio.');
        setIsJuizModalOpen(false);
        setJuizEscolhidoId('');
      },
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao cadastrar Juiz.')),
    });
  };

  const handleRemoverJuiz = (linkId: number | null | undefined) => {
    if (!linkId) return;
    removerJuizMutation.mutate(linkId, {
      onSuccess: () => toast.success('Juiz removido do torneio.'),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao remover Juiz.')),
    });
  };

  if (isLoading) return <Spinner />;

  const participantesRows = (torneio?.jogadores ?? []).map((link, index) => ({
    key: rowKey(link, index),
    linkId: link.id,
    apelido: link.apelido,
    jogador_id: link.jogador_id,
    game_id: link.game_id,
    tipo: link.tipo ?? 'JOGADOR',
  }));

  // Um jogador que também atuou como Juiz do torneio aparece nos dois
  // lugares: no Ranking normal (com a pontuação que ele de fato fez/ganhou)
  // e na lista separada de Juízes, só pra deixar claro quem arbitrou.
  const rankingRows = (torneio?.jogadores ?? [])
    .map((link, index) => {
      const key = rowKey(link, index);
      const overrides = scoreOverrides[key];
      return {
        key,
        linkId: link.id,
        apelido: link.apelido,
        jogador_id: link.jogador_id,
        tipo: link.tipo ?? 'JOGADOR',
        regraExtraId: link.regra_extra_id ?? null,
        pontuacao: overrides?.pontuacao ?? link.pontuacao,
        pontuacao_com_regras: overrides?.pontuacao_com_regras ?? link.pontuacao_com_regras,
      };
    })
    .sort((a, b) => b.pontuacao_com_regras - a.pontuacao_com_regras)
    .map((row, index) => ({ ...row, posicao: index + 1 }));

  // Vagas/receita contam só jogadores de verdade — um Juiz não ocupa vaga
  // nem paga inscrição, mesmo agora aparecendo no ranking.
  const jogadoresCount = rankingRows.filter((row) => row.tipo !== 'JUIZ').length;

  const composicaoRows = (torneio?.jogadores ?? []).map((link, index) => ({
    key: rowKey(link, index),
    linkId: link.id,
    apelido: link.apelido,
    jogador_id: link.jogador_id,
    composicaoRepresentacaoId: link.composicao_representacao_id,
    composicaoRepresentacao: link.composicao_representacao,
    composicaoUnidades: link.composicao_unidades ?? [],
  }));

  const temRegraBasica = Boolean(formData.regra_basica_id);
  // A regra básica já define a pontuação padrão do torneio, então não faz
  // sentido oferecê-la de novo como "regra extra".
  const regrasExtrasDisponiveis = regras?.filter((regra) => regra.id !== formData.regra_basica_id);

  const buscaNormalizada = buscaJogador.trim().toLowerCase();
  const participantesFiltrados = buscaNormalizada
    ? participantesRows.filter((row) => row.apelido?.toLowerCase().includes(buscaNormalizada))
    : participantesRows;
  // Listas totalmente separadas: quem é JOGADOR_E_JUIZ é uma única linha no
  // backend (fonte única de verdade), mas aparece nas duas listas aqui —
  // key com sufixo diferente em cada uma pra não colidir na árvore do DOM.
  const participantesJogadores = participantesFiltrados.filter((row) => row.tipo !== 'JUIZ');
  const participantesJuizes = participantesFiltrados.filter((row) => row.tipo === 'JUIZ' || row.tipo === 'JOGADOR_E_JUIZ');
  const rankingFiltrado = buscaNormalizada
    ? rankingRows.filter((row) => row.apelido?.toLowerCase().includes(buscaNormalizada))
    : rankingRows;
  const composicaoRowsFiltrados = buscaNormalizada
    ? composicaoRows.filter((row) => row.apelido?.toLowerCase().includes(buscaNormalizada))
    : composicaoRows;

  return (
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <Link to="/torneios" className="inline-flex items-center space-x-2 text-primary hover:text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para Torneios</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl mb-2 text-foreground">Editar Torneio</h1>
              <p className="text-muted-foreground">Gerencie as informações e o ranking de pontuação</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/loja/torneio/${id}/visualizar`}
                className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span>Visualizar</span>
              </Link>
              <button onClick={() => setShowImportModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent transition-colors">
                <Upload className="w-4 h-4" />
                <span>Importar .tdf</span>
              </button>
              <button
                onClick={handleSubmit(onSave)}
                disabled={updateMutation.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AppCard title="Informações do Torneio" icon={<Edit className="w-5 h-5" />}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">Nome do Torneio</label>
                  <input type="text" {...register('nome')} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                  {errors.nome && <p className="text-destructive text-sm mt-1">{errors.nome.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Data Planejada</label>
                    <input type="date" {...register('data_planejada')} className="w-full px-4 py-2 border border-border rounded-lg outline-none" />
                    {errors.data_planejada && <p className="text-destructive text-sm mt-1">{errors.data_planejada.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Horário Planejado</label>
                    <input type="time" {...register('hora_planejada')} className="w-full px-4 py-2 border border-border rounded-lg outline-none" />
                    {errors.hora_planejada && <p className="text-destructive text-sm mt-1">{errors.hora_planejada.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Início Real</label>
                    <input type="datetime-local" {...register('inicio_real')} className="w-full px-4 py-2 border border-border rounded-lg outline-none" />
                    {errors.inicio_real && <p className="text-destructive text-sm mt-1">{errors.inicio_real.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Fim Real</label>
                    <input type="datetime-local" {...register('fim_real')} className="w-full px-4 py-2 border border-border rounded-lg outline-none" />
                    {errors.fim_real && <p className="text-destructive text-sm mt-1">{errors.fim_real.message}</p>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground -mt-2">
                  Preenchido automaticamente ao importar o XML do torneio; pode ser corrigido aqui se necessário. Usado para calcular a conquista "Horas Jogadas".
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Formato</label>
                    <Controller
                      name="formato"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {pokemonFormats.map((formato) => (
                              <SelectItem key={formato.id} value={formato.id}>{formato.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.formato && <p className="text-destructive text-sm mt-1">{errors.formato.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Vagas Máximas</label>
                    <input type="number" {...register('vagas', { valueAsNumber: true })} className="w-full px-4 py-2 border border-border rounded-lg outline-none" />
                    {errors.vagas && <p className="text-destructive text-sm mt-1">{errors.vagas.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Melhor de</label>
                    <Controller
                      name="melhor_de"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {formatosMD.map((formato) => (
                              <SelectItem key={formato.id} value={formato.id}>{formato.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.melhor_de && <p className="text-destructive text-sm mt-1">{errors.melhor_de.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Taxa de Inscrição</label>
                    <input type="number" {...register('taxa', { valueAsNumber: true })} className="w-full px-4 py-2 border border-border rounded-lg outline-none" />
                    {errors.taxa && <p className="text-destructive text-sm mt-1">{errors.taxa.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Premiação</label>
                    <input type="text" {...register('premio')} className="w-full px-4 py-2 border border-border rounded-lg outline-none" />
                    {errors.premio && <p className="text-destructive text-sm mt-1">{errors.premio.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">Pontuação por Participação</label>
                  <input
                    type="number"
                    {...register('pontuacao_de_participacao', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-border rounded-lg outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Pontos que todo jogador já ganha só por participar, somados antes de qualquer resultado de rodada.
                  </p>
                  {errors.pontuacao_de_participacao && (
                    <p className="text-destructive text-sm mt-1">{errors.pontuacao_de_participacao.message}</p>
                  )}
                </div>

                <label className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <input type="checkbox" {...register('conta_em_eventos')} className="rounded border-border" />
                  Conta pontos nos Eventos ativos do período
                </label>

                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">Descrição</label>
                  <textarea {...register('descricao')} rows={3} className="w-full px-4 py-2 border border-border rounded-lg outline-none" />
                  {errors.descricao && <p className="text-destructive text-sm mt-1">{errors.descricao.message}</p>}
                </div>

                {/* Regra Básica — em destaque, define a pontuação oficial do torneio */}
                <div className="rounded-lg border-2 border-primary/40 bg-primary/10 p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      <label className="text-sm font-bold text-primary">Regra Básica</label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRuleModalOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Nova Regra
                    </Button>
                  </div>
                  <Controller
                    name="regra_basica_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(value) => field.onChange(Number(value))}
                        disabled={isLoadingRegras}
                      >
                        <SelectTrigger className="w-full border-primary/40">
                          <SelectValue
                            placeholder={isLoadingRegras ? 'Carregando regras...' : 'Selecione um conjunto de regras'}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {regras?.map((regra) => (
                            <SelectItem key={regra.id} value={String(regra.id)}>{regra.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.regra_basica_id && <p className="text-destructive text-sm mt-1">{errors.regra_basica_id.message}</p>}
                  {!isLoadingRegras && !regras?.length && (
                    <p className="text-xs text-warning mt-2">
                      Nenhuma regra cadastrada ainda — crie uma clicando em "Nova Regra".
                    </p>
                  )}
                  <p className="text-xs text-primary mt-2">
                    Define quantos pontos cada jogador ganha por vitória, empate ou derrota neste torneio.
                  </p>
                </div>
              </div>
            </AppCard>

            <AppCard
              title="Ranking & Pontuações"
              description="Participantes do torneio e ajuste fino de pontuação por jogador."
              icon={<Trophy className="w-5 h-5" />}
              action={
                temRegraBasica && (
                  <button
                    onClick={handleRecalculate}
                    disabled={recalculateMutation.isPending}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary bg-primary/15 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
                    {recalculateMutation.isPending ? 'Recalculando...' : 'Recalcular Pontuações'}
                  </button>
                )
              }
            >
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={buscaJogador}
                  onChange={(e) => setBuscaJogador(e.target.value)}
                  placeholder="Buscar jogador pelo nome..."
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Tabs defaultValue="participantes">
                <TabsList>
                  <TabsTrigger value="participantes">Participantes</TabsTrigger>
                  <TabsTrigger value="pontuacao" disabled={!temRegraBasica}>
                    Pontuação
                  </TabsTrigger>
                  <TabsTrigger value="composicoes">Composições</TabsTrigger>
                  <TabsTrigger value="rodadas">Rodadas</TabsTrigger>
                  <TabsTrigger value="pontuacao-extra">Pontuação Extra</TabsTrigger>
                </TabsList>

                <TabsContent value="participantes" className="pt-4 space-y-6">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Gavel className="w-4 h-4" />
                        Juízes
                      </h3>
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsJuizModalOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Cadastrar Juiz
                      </Button>
                    </div>
                    {participantesJuizes.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">Nenhum Juiz cadastrado neste torneio ainda.</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {participantesJuizes.map((row) => (
                          <div key={`${row.key}-juiz`} className="flex items-center justify-between gap-3 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {row.apelido || `Jogador #${row.jogador_id}`}
                              </p>
                              {row.game_id && (
                                <span className="text-xs text-muted-foreground">#{row.game_id}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoverJuiz(row.linkId)}
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                              title="Remover Juiz"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2">Jogadores</h3>
                    {participantesJogadores.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">
                        {buscaNormalizada ? 'Nenhum jogador encontrado.' : 'Nenhum jogador inscrito neste torneio.'}
                      </p>
                    ) : (
                      <div className="divide-y divide-border">
                        {participantesJogadores.map((row) => (
                          <div key={`${row.key}-jogador`} className="flex items-center gap-3 py-3">
                            <p className="text-sm font-medium text-foreground truncate">
                              {row.apelido || `Jogador #${row.jogador_id}`}
                            </p>
                            {row.game_id && (
                              <span className="text-xs text-muted-foreground">#{row.game_id}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="pontuacao" className="pt-4">
                  {!temRegraBasica ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      Selecione a regra básica do torneio para habilitar a pontuação.
                    </p>
                  ) : rankingFiltrado.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      {buscaNormalizada ? 'Nenhum jogador encontrado.' : 'Nenhum jogador inscrito neste torneio.'}
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {rankingFiltrado.map((row) => (
                        <div
                          key={`${row.key}-jogador`}
                          className={`flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg ${
                            row.regraExtraId ? 'bg-warning/10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                row.posicao <= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {row.posicao <= 3 ? <Medal className="w-3.5 h-3.5" /> : row.posicao}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {row.apelido || `Jogador #${row.jogador_id}`}
                              </p>
                              {row.regraExtraId && (
                                <span className="text-[10px] uppercase tracking-wide font-bold text-warning">
                                  Regra extra aplicada
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <Select
                              value={row.regraExtraId ? String(row.regraExtraId) : 'nenhuma'}
                              onValueChange={(value) =>
                                handlePlayerRuleChange(row.linkId, value === 'nenhuma' ? null : Number(value))
                              }
                            >
                              <SelectTrigger className={`w-56 ${row.regraExtraId ? 'border-warning/60' : ''}`} size="sm">
                                <SelectValue placeholder="Regra Extra" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nenhuma">Nenhuma (usa só a regra padrão)</SelectItem>
                                {regrasExtrasDisponiveis?.map((regra) => (
                                  <SelectItem key={regra.id} value={String(regra.id)}>{regra.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <ScoreBox
                              label="Pontuação"
                              value={row.pontuacao}
                              onChange={(value) => updateScore(row.key, 'pontuacao', value)}
                              onCommit={(value) => commitScore(row, 'pontuacao', value)}
                            />
                            <ScoreBox
                              label="Com Regras"
                              value={row.pontuacao_com_regras}
                              onChange={(value) => updateScore(row.key, 'pontuacao_com_regras', value)}
                              onCommit={(value) => commitScore(row, 'pontuacao_com_regras', value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}              
                </TabsContent>

                <TabsContent value="composicoes" className="pt-4">
                  {!tcgSuportaComposicao ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      Composições ainda não implementadas para o TCG {torneio?.jogo}.
                    </p>
                  ) : composicaoRowsFiltrados.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      {buscaNormalizada ? 'Nenhum jogador encontrado.' : 'Nenhum jogador inscrito neste torneio.'}
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {composicaoRowsFiltrados.map((row) => (
                        <div key={row.key} className="flex flex-col gap-3 py-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground truncate">
                              {row.apelido || `Jogador #${row.jogador_id}`}
                            </p>

                            {temRepresentacaoDeck && (
                              <div className="flex items-center gap-2 shrink-0">
                                {row.composicaoRepresentacao && (
                                  <div className="flex items-center -space-x-2">
                                    {row.composicaoRepresentacao.unidades.map((unidade) => (
                                      <img
                                        key={unidade.id}
                                        src={pokemonSpriteUrl(unidade.external_id)}
                                        alt={unidade.nome}
                                        title={unidade.nome}
                                        className="w-8 h-8 rounded-full bg-muted object-contain border border-border"
                                      />
                                    ))}
                                  </div>
                                )}

                                <RepresentacaoComposicaoCombobox
                                  value={row.composicaoRepresentacaoId}
                                  representacoes={representacoes ?? []}
                                  onChange={(id) => handleComposicaoRepresentacaoChange(row.linkId, id)}
                                />

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAbrirNovaRepresentacao(row.linkId)}
                                >
                                  <Plus className="w-4 h-4" />
                                  Nova
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* TCG só cadastra representação (acima); VGC/GO só
                              cadastram a composição completa (time) — nunca as
                              duas ao mesmo tempo. */}
                          {!temRepresentacaoDeck && (
                            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                              <p className="text-sm text-muted-foreground">
                                {`${row.composicaoUnidades.length}/6 Pokémon no time`}
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setComposicaoUnidadesModalLinkId(row.linkId ?? null)}
                              >
                                Editar Time
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="rodadas" className="pt-4">
                  <RodadasTab torneio={torneio} torneioId={id} />
                </TabsContent>

                <TabsContent value="pontuacao-extra" className="pt-4 space-y-6">
                  {id && <PontuacaoExtraForm torneioId={id} />}
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2">Histórico deste torneio</h3>
                    <PontuacaoExtraHistorico itens={pontuacaoExtraDoTorneio} isLoading={isLoadingPontuacaoExtra} />
                  </div>
                </TabsContent>
              </Tabs>
            </AppCard>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow p-4 md:p-6">
              <h3 className="text-lg mb-4 text-foreground font-bold">Estatísticas Rápidas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="px-2 py-1 bg-success/15 text-success text-xs rounded-full font-bold">{torneio?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Jogadores</span>
                  <span className="text-foreground font-bold">{jogadoresCount} / {formData.vagas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Receita Total</span>
                  <span className="text-foreground font-bold">R$ {(jogadoresCount * (formData.taxa ?? 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Importação */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl text-foreground font-bold mb-4">Importar Resultados (.tdf)</h3>
              <p className="text-sm text-muted-foreground mb-6">Selecione o arquivo .tdf exportado do software de torneios para atualizar os dados automaticamente.</p>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-6">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <input
                  type="file"
                  accept=".tdf"
                  className="hidden"
                  id="xml-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    e.target.value = '';

                    if (file && !file.name.toLowerCase().endsWith('.tdf')) {
                      toast.error('Selecione um arquivo .tdf exportado do software de torneios.');
                      return;
                    }

                    setSelectedFile(file);
                  }}
                />
                {selectedFile ? (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm">
                    <span className="truncate max-w-[200px] text-foreground">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      title="Remover arquivo selecionado"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="xml-upload" className="bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors text-sm font-bold inline-block">
                    Selecionar Arquivo
                  </label>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 text-muted-foreground font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || importMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 font-bold"
                >
                  {importMutation.isPending ? 'Importando...' : 'Confirmar Importação'}
                </button>
              </div>
            </div>
          </div>
        )}

        <QuickCreateRuleDialog
          open={isRuleModalOpen}
          onOpenChange={setIsRuleModalOpen}
          isJogadorOrganizador={isJogador}
          lojaId={torneio?.loja?.id}
          defaultTcg={torneio?.jogo ?? 'POKEMON'}
          onCreated={(regraId) => setValue('regra_basica_id', regraId, { shouldValidate: true })}
        />

        <Dialog
          open={showSeasonWarningModal}
          onOpenChange={(open) => {
            setShowSeasonWarningModal(open);
            if (!open) setPendingSaveData(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Torneio fora de qualquer temporada cadastrada</DialogTitle>
              <DialogDescription>
                Este torneio não está dentro do período de nenhuma temporada cadastrada para{' '}
                {torneio?.jogo}. Deseja cadastrar uma temporada para ele agora?
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm text-warning">
              Se você continuar sem cadastrar uma temporada, o torneio será salvo normalmente, mas
              os jogadores dele não entrarão no filtro de categoria (Junior/Senior/Master) do Ranking.
            </p>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleSalvarMesmoAssim}>
                Não, salvar mesmo assim
              </Button>
              <Button type="button" onClick={handleAbrirCadastroTemporada}>
                Cadastrar Temporada
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <QuickCreateSeasonDialog
          open={showQuickCreateSeasonModal}
          onOpenChange={setShowQuickCreateSeasonModal}
          isJogadorOrganizador={isJogador}
          lojaId={torneio?.loja?.id}
          tcg={torneio?.jogo ?? 'POKEMON'}
          onCreated={handleTemporadaCriada}
        />

        <ComposicaoRepresentacaoModal
          open={composicaoModalAberto}
          onOpenChange={setComposicaoModalAberto}
          tcg={torneio?.jogo ?? 'POKEMON'}
          onCreated={handleRepresentacaoCriada}
        />

        <ComposicaoUnidadesModal
          open={composicaoUnidadesModalLinkId !== null}
          onOpenChange={(open) => {
            if (!open) setComposicaoUnidadesModalLinkId(null);
          }}
          tcg={torneio?.jogo ?? 'POKEMON'}
          unidadesIniciais={
            torneio?.jogadores?.find((j) => j.id === composicaoUnidadesModalLinkId)?.composicao_unidades ?? []
          }
          onSave={(unidades) => {
            const linkAtual = torneio?.jogadores?.find((j) => j.id === composicaoUnidadesModalLinkId);
            handleComposicaoUnidadesSave(composicaoUnidadesModalLinkId, linkAtual?.composicao_representacao_id, unidades);
          }}
          salvando={updateComposicaoMutation.isPending}
        />

        <Dialog open={isJuizModalOpen} onOpenChange={setIsJuizModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Juiz</DialogTitle>
              <DialogDescription>
                Vincule um organizador da loja como Juiz deste torneio antes de atribuir pontos extras a ele.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={juizEscolhidoId} onValueChange={setJuizEscolhidoId} disabled={isLoadingOrganizadoresJuiz}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingOrganizadoresJuiz ? 'Carregando...' : 'Selecione um organizador'} />
                </SelectTrigger>
                <SelectContent>
                  {organizadoresDisponiveisJuiz?.map((jogador) => (
                    <SelectItem key={jogador.id} value={String(jogador.id)}>
                      {jogador.apelido || jogador.game_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isLoadingOrganizadoresJuiz && !organizadoresDisponiveisJuiz?.length && (
                <p className="text-xs text-muted-foreground">
                  Nenhum organizador disponível — todos já são Juiz aqui, ou nenhum organizador está cadastrado na loja pra este TCG.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsJuizModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!juizEscolhidoId || adicionarJuizMutation.isPending}
                onClick={handleAdicionarJuiz}
              >
                {adicionarJuizMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
