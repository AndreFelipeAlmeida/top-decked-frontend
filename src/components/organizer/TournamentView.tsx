import { ArrowLeft, Trophy, Award, Medal, Edit, Gavel } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTournamentById } from '@/hooks/tournaments.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { usePontuacaoExtraDoTorneio } from '@/hooks/pontuacaoExtra.hooks';
import type { JogadorTorneioLinkPublico } from '@/types/Tournaments';
import { AppCard } from '@/components/ui/app-card';
import Spinner from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { omwTooltip, oomwTooltip } from '@/lib/tiebreakTooltips';
import { nomeDoFormato } from '@/lib/pokemonFormats';
import { nomeDoFormatoMD } from '@/lib/formatoMD';
import { pokemonSpriteUrl } from '@/lib/pokemon';
import { jogoTemRepresentacaoDeck } from '@/lib/pokemonModalidade';
import { formatarDataBR } from '@/lib/dateUtils';
import { CATEGORIAS_OFICIAIS, ordenarPorRankingOficial, type CategoriaFiltro } from '@/lib/rankingOficial';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PontuacaoExtraHistorico } from './PontuacaoExtraHistorico';

const JOGOS_POKEMON = ['POKEMON', 'POKEMON_VGC', 'POKEMON_GO'];

type TipoPontuacao = 'padrao' | 'com_regras';

const rowKey = (link: JogadorTorneioLinkPublico, index: number) =>
  String(link.id ?? link.jogador_id ?? index);

export default function TournamentView() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthenticatedUser();
  const isJogador = user.tipo === 'jogador';

  const { data: torneio, isLoading } = useTournamentById(id);
  const { data: jogador } = useMe(isJogador);
  const { data: pontuacaoExtraDoTorneio, isLoading: isLoadingPontuacaoExtra } = usePontuacaoExtraDoTorneio(id);
  const [tipoPontuacao, setTipoPontuacao] = useState<TipoPontuacao>('com_regras');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaFiltro>('todos');

  if (isLoading) return <Spinner />;

  // TCG só exibe a representação (ícone de arquétipo); VGC/GO só exibem a
  // composição completa (o time) — nunca as duas juntas.
  const temRepresentacaoDeck = jogoTemRepresentacaoDeck(torneio?.jogo);
  const ehJogoPokemon = JOGOS_POKEMON.includes(torneio?.jogo ?? '');

  const linkRows = (torneio?.jogadores ?? []).map((link, index) => ({
    key: rowKey(link, index),
    apelido: link.apelido,
    jogador_id: link.jogador_id,
    tipo: link.tipo ?? 'JOGADOR',
    pontuacao: link.pontuacao,
    pontuacao_com_regras: link.pontuacao_com_regras,
    vitorias: link.vitorias ?? 0,
    derrotas: link.derrotas ?? 0,
    empates: link.empates ?? 0,
    byes: link.byes ?? 0,
    omw: link.porcentagem_vitorias_oponentes ?? null,
    oomw: link.porcentagem_vitorias_oponentes_oponentes ?? null,
    categoria: link.categoria ?? null,
    classificacao_oficial: link.classificacao_oficial ?? null,
    posicao_ranking: link.posicao_ranking ?? null,
    composicaoRepresentacao: link.composicao_representacao ?? null,
    composicaoUnidades: link.composicao_unidades ?? [],
  }));

  // Um jogador que também atuou como Juiz do torneio aparece nos dois
  // lugares: no Ranking normal (com a pontuação que ele de fato fez/ganhou)
  // e na lista separada de Juízes, só pra deixar claro quem arbitrou.
  const pontuacaoDoToggle = (row: { pontuacao: number; pontuacao_com_regras: number }) =>
    tipoPontuacao === 'padrao' ? row.pontuacao : row.pontuacao_com_regras;
  const rankingRows = ordenarPorRankingOficial(
    linkRows.filter((row) => row.tipo !== 'JUIZ'),
    categoriaFiltro,
  );
  const juizesRows = linkRows.filter((row) => row.tipo === 'JUIZ' || row.tipo === 'JOGADOR_E_JUIZ');
  // Vagas/receita contam só jogadores de verdade — um Juiz não ocupa vaga
  // nem paga inscrição, mesmo aparecendo no ranking.
  const jogadoresCount = linkRows.filter((row) => row.tipo !== 'JUIZ').length;

  // Mesma regra de permissão usada em Tournaments.tsx: loja sempre pode
  // editar o que é seu; jogador só se organizar o TCG do torneio nessa loja.
  const podeEditar = !isJogador || (
    jogador?.lojas?.some((loja) =>
      loja.loja_id === torneio?.loja?.id &&
      loja.organizacoes?.some((org) => org.tcg === torneio?.jogo)
    ) ?? false
  );

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <Link to="/torneios" className="inline-flex items-center space-x-2 text-primary hover:text-primary mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para Torneios</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl mb-2 text-foreground">{torneio?.nome}</h1>
            <p className="text-muted-foreground">Informações e ranking de pontuação do torneio</p>
          </div>
          {podeEditar && (
            <Link
              to={`/loja/torneio/${id}/editar`}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Editar Torneio</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AppCard title="Informações do Torneio" icon={<Trophy className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Data Planejada</label>
                  <p className="text-foreground">
                    {formatarDataBR(torneio?.data_planejada)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Horário Planejado</label>
                  <p className="text-foreground">{torneio?.hora_planejada || '--:--'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Início Real</label>
                  <p className="text-foreground">
                    {torneio?.inicio_real ? new Date(torneio.inicio_real).toLocaleString('pt-BR') : 'Não registrado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Fim Real</label>
                  <p className="text-foreground">
                    {torneio?.fim_real ? new Date(torneio.fim_real).toLocaleString('pt-BR') : 'Não registrado'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Formato</label>
                  <p className="text-foreground">{nomeDoFormato(torneio?.formato)}</p>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Vagas Máximas</label>
                  <p className="text-foreground">{torneio?.vagas} jogadores</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Melhor de</label>
                  <p className="text-foreground">{nomeDoFormatoMD(torneio?.melhor_de)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Taxa de Inscrição</label>
                  <p className="text-foreground">R$ {(torneio?.taxa ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Premiação</label>
                  <p className="text-foreground">{torneio?.premio || 'Não informada'}</p>
                </div>
              </div>

              {torneio?.descricao && (
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Descrição</label>
                  <p className="text-foreground text-sm">{torneio.descricao}</p>
                </div>
              )}

              <div className="rounded-lg border-2 border-primary/40 bg-primary/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-primary" />
                  <label className="text-sm font-bold text-primary">Regra Básica</label>
                </div>
                <p className="text-primary font-semibold">
                  {torneio?.regra_basica_id ? 'Regra configurada' : 'Nenhuma regra definida'}
                </p>
              </div>
            </div>
          </AppCard>

          {juizesRows.length > 0 && (
            <AppCard title="Juízes" icon={<Gavel className="w-5 h-5" />}>
              <p className="text-xs text-muted-foreground mb-3">
                Responsáveis pela arbitragem deste torneio.
              </p>
              <div className="divide-y divide-border">
                {juizesRows.map((row) => (
                  <div key={`${row.key}-juiz`} className="py-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {row.apelido || `Jogador #${row.jogador_id}`}
                    </p>
                  </div>
                ))}
              </div>
            </AppCard>
          )}

          <AppCard
            title="Ranking & Pontuações"
            icon={<Trophy className="w-5 h-5" />}
            action={
              <div className="flex flex-wrap items-center gap-2">
                {ehJogoPokemon && (
                  <Select value={categoriaFiltro} onValueChange={(v) => setCategoriaFiltro(v as CategoriaFiltro)}>
                    <SelectTrigger className="w-40" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as Categorias</SelectItem>
                      {CATEGORIAS_OFICIAIS.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Tabs value={tipoPontuacao} onValueChange={(v) => setTipoPontuacao(v as TipoPontuacao)}>
                  <TabsList>
                    <TabsTrigger value="com_regras">Com Regras Extras</TabsTrigger>
                    <TabsTrigger value="padrao">Pontuação Normal</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            }
          >
            {rankingRows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Nenhum jogador inscrito neste torneio.</p>
            ) : (
              <div className="divide-y divide-border">
                {rankingRows.map((row, index) => {
                  const temComposicao = temRepresentacaoDeck
                    ? Boolean(row.composicaoRepresentacao)
                    : row.composicaoUnidades.length > 0;

                  return (
                    <div
                      key={`${row.key}-jogador`}
                      className="flex flex-col gap-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            index < 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index < 3 ? <Medal className="w-3.5 h-3.5" /> : index + 1}
                        </span>
                        <p className="text-sm font-medium text-foreground truncate">
                          {row.apelido || `Jogador #${row.jogador_id}`}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pl-10 sm:pl-0 sm:gap-6 sm:shrink-0 text-sm">
                        <div className="text-center">
                          <p className="font-bold text-success">{row.vitorias}</p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Vit.</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-destructive">{row.derrotas}</p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Der.</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground">{row.empates}</p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Emp.</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground">{row.byes}</p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Byes</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground">
                            {row.omw != null ? `${row.omw.toFixed(2)}%` : '--'}
                          </p>
                          <p className="flex items-center justify-center gap-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            OMW% <InfoTooltip text={omwTooltip} />
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground">
                            {row.oomw != null ? `${row.oomw.toFixed(2)}%` : '--'}
                          </p>
                          <p className="flex items-center justify-center gap-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            OOMW% <InfoTooltip text={oomwTooltip} />
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-primary">{pontuacaoDoToggle(row)}</p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {tipoPontuacao === 'padrao' ? 'Pontuação' : 'Com Regras'}
                          </p>
                        </div>
                      </div>

                      {temComposicao && (
                        <div className="pl-10 sm:pl-0 sm:basis-full">
                          {temRepresentacaoDeck && row.composicaoRepresentacao ? (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center -space-x-4">
                                {row.composicaoRepresentacao.unidades.map((unidade) => (
                                  <img
                                    key={unidade.id}
                                    src={pokemonSpriteUrl(unidade.external_id)}
                                    alt={unidade.nome}
                                    title={unidade.nome}
                                    className="w-16 h-16 rounded-full bg-muted object-contain border-2 border-border"
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground truncate">
                                {row.composicaoRepresentacao.nome}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              {row.composicaoUnidades.map((cu) => (
                                <span
                                  key={cu.unidade_catalogo_id}
                                  className="flex items-center gap-2 rounded-full border border-border bg-muted/40 pl-1 pr-3 py-1 text-sm text-muted-foreground"
                                >
                                  <img
                                    src={pokemonSpriteUrl(cu.unidade.external_id)}
                                    alt={cu.unidade.nome}
                                    className="w-10 h-10 rounded-full object-contain"
                                  />
                                  {cu.unidade.nome} ×{cu.quantidade}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </AppCard>

          <AppCard title="Pontuação Extra" icon={<Award className="w-5 h-5" />}>
            <PontuacaoExtraHistorico itens={pontuacaoExtraDoTorneio} isLoading={isLoadingPontuacaoExtra} />
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
                <span className="text-foreground font-bold">{jogadoresCount} / {torneio?.vagas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Receita Total</span>
                <span className="text-foreground font-bold">R$ {(jogadoresCount * (torneio?.taxa ?? 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
