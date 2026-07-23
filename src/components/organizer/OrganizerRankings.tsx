import { useMemo, useState } from 'react';
import { Medal, TriangleAlert, Trophy } from 'lucide-react';

import Spinner from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { TournamentFiltersBar } from './TournamentFiltersBar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { useTournaments } from '@/hooks/tournaments.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import { useIsTenant } from '@/hooks/tenantContext.hooks';
import { useTournamentFilters } from '@/hooks/useTournamentFilters';
import { useTemporadas, useTemporadasLoja } from '@/hooks/temporadas.hooks';
import { nomeDoJogo } from '@/lib/tcgGames';
import { dataEstaNaTemporada } from '@/lib/temporadaUtils';
import { momentoEfetivoTorneio } from '@/lib/dateUtils';
import { omwTooltip, oomwTooltip } from '@/lib/tiebreakTooltips';
import { StatusTorneio } from '@/types/Enums';

// Mesmas 3 variantes de Pokémon que têm Temporada cadastrável (ver
// TemporadasPokemon.tsx) — só nelas faz sentido oferecer o filtro de
// categoria/temporada no Ranking, já que categoria só é calculada quando
// existe uma Temporada pro jogo/período do torneio.
const JOGOS_POKEMON = ['POKEMON', 'POKEMON_VGC', 'POKEMON_GO'];

const CATEGORIAS = ['Junior', 'Senior', 'Master'];

type TipoPontuacao = 'padrao' | 'com_regras';

type JogadorRanking = {
  jogadorId: number;
  contaJogadorId: number | null;
  apelido: string;
  gameId: string | null;
  torneios: number;
  pontuacao: number;
  pontuacaoComRegras: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  byes: number;
  omwMedio: number | null;
  oomwMedio: number | null;
};

const corDaBarra = (posicao: number) => {
  if (posicao === 1) return 'bg-gold';
  if (posicao === 2) return 'bg-slate-300';
  if (posicao === 3) return 'bg-amber-600';
  return 'bg-transparent';
};

export default function OrganizerRankings() {
  const user = useAuthenticatedUser();
  const isJogador = user.tipo === 'jogador';

  const { selectedTcg } = useTcgSelection();
  const isTenant = useIsTenant();
  const { data: jogador, isLoading: isMeLoading } = useMe(isJogador);
  const { data: torneios, isLoading: isTournamentsLoading } = useTournaments(user.tipo);

  const ehJogoPokemon = JOGOS_POKEMON.includes(selectedTcg ?? '');

  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [temporadaFiltro, setTemporadaFiltro] = useState('todas');
  const [tipoPontuacao, setTipoPontuacao] = useState<TipoPontuacao>('com_regras');

  // O ranking é sempre de um jogo específico (o selecionado na barra lateral)
  // — os filtros abaixo (busca/formato/loja/período) refinam dentro desse
  // jogo, igual à página de Torneios. Só torneios já finalizados entram no
  // ranking (pontuação/desempate de um torneio em andamento ainda pode
  // mudar) — por isso não há filtro de status aqui, diferente de Torneios.
  const torneiosDoJogo = useMemo(
    () => (torneios ?? []).filter((t) => t.jogo === selectedTcg && t.status === StatusTorneio.FINALIZADO),
    [torneios, selectedTcg],
  );

  const {
    busca, setBusca,
    statusFiltro, setStatusFiltro,
    formatoFiltro, setFormatoFiltro,
    lojaFiltro, setLojaFiltro,
    datePreset, usaDataCustom, selecionarPreset,
    dataInicioCustom, dataFimCustom, handleDataCustomChange,
    formatosDisponiveis, lojasDisponiveis,
    torneiosFiltrados,
  } = useTournamentFilters(torneiosDoJogo, isJogador);

  const { data: temporadasLoja } = useTemporadas(!isJogador && ehJogoPokemon ? selectedTcg : undefined);
  const { data: temporadasOrganizador } = useTemporadasLoja(
    isJogador && ehJogoPokemon && lojaFiltro !== 'todas' ? Number(lojaFiltro) : undefined,
    ehJogoPokemon ? selectedTcg : undefined,
  );
  const temporadas = isJogador ? temporadasOrganizador : temporadasLoja;
  const podeFiltrarTemporada = ehJogoPokemon && (!isJogador || lojaFiltro !== 'todas');

  const isLoading = (isJogador && isMeLoading) || isTournamentsLoading;

  const temporadaSelecionada = useMemo(
    () => (temporadas ?? []).find((t) => String(t.id) === temporadaFiltro),
    [temporadas, temporadaFiltro],
  );

  const torneiosParaRanking = useMemo(() => {
    if (!temporadaSelecionada) return torneiosFiltrados;
    return torneiosFiltrados.filter((torneio) => dataEstaNaTemporada(momentoEfetivoTorneio(torneio), temporadaSelecionada));
  }, [torneiosFiltrados, temporadaSelecionada]);

  const ranking = useMemo<JogadorRanking[]>(() => {
    const porJogador = new Map<number, {
      contaJogadorId: number | null;
      apelido: string;
      gameId: string | null;
      torneios: number;
      pontuacao: number;
      pontuacaoComRegras: number;
      vitorias: number;
      derrotas: number;
      empates: number;
      byes: number;
      omwSoma: number;
      omwCount: number;
      oomwSoma: number;
      oomwCount: number;
    }>();
    // Um jogador tem no máximo UMA linha por torneio (ver
    // TipoParticipanteTorneio.JOGADOR_E_JUIZ para quem acumula os dois
    // papéis) — cada iteração de `link` aqui já é um torneio distinto pro
    // mesmo jogador, sem risco de contar o mesmo torneio duas vezes.
    for (const torneio of torneiosParaRanking) {
      for (const link of torneio.jogadores ?? []) {
        if (link.tipo === 'JUIZ') continue;
        const chave = link.jogador_criado_id;
        if (chave == null) continue;
        if (categoriaFiltro !== 'todos' && link.categoria !== categoriaFiltro) continue;

        const atual = porJogador.get(chave) ?? {
          contaJogadorId: link.jogador_id ?? null,
          apelido: link.apelido || `Jogador #${chave}`,
          gameId: link.game_id ?? null,
          torneios: 0,
          pontuacao: 0,
          pontuacaoComRegras: 0,
          vitorias: 0,
          derrotas: 0,
          empates: 0,
          byes: 0,
          omwSoma: 0,
          omwCount: 0,
          oomwSoma: 0,
          oomwCount: 0,
        };

        atual.torneios += 1;
        atual.pontuacao += link.pontuacao ?? 0;
        atual.pontuacaoComRegras += link.pontuacao_com_regras ?? 0;
        atual.vitorias += link.vitorias ?? 0;
        atual.derrotas += link.derrotas ?? 0;
        atual.empates += link.empates ?? 0;
        atual.byes += link.byes ?? 0;

        if (link.porcentagem_vitorias_oponentes != null) {
          atual.omwSoma += link.porcentagem_vitorias_oponentes;
          atual.omwCount += 1;
        }
        if (link.porcentagem_vitorias_oponentes_oponentes != null) {
          atual.oomwSoma += link.porcentagem_vitorias_oponentes_oponentes;
          atual.oomwCount += 1;
        }

        porJogador.set(chave, atual);
      }
    }

    return Array.from(porJogador.entries())
      .map(([jogadorId, dados]) => ({
        jogadorId,
        contaJogadorId: dados.contaJogadorId,
        apelido: dados.apelido,
        gameId: dados.gameId,
        torneios: dados.torneios,
        pontuacao: dados.pontuacao,
        pontuacaoComRegras: dados.pontuacaoComRegras,
        vitorias: dados.vitorias,
        derrotas: dados.derrotas,
        empates: dados.empates,
        byes: dados.byes,
        omwMedio: dados.omwCount ? dados.omwSoma / dados.omwCount : null,
        oomwMedio: dados.oomwCount ? dados.oomwSoma / dados.oomwCount : null,
      }))
      .sort((a, b) => {
        const pontuacaoA = tipoPontuacao === 'padrao' ? a.pontuacao : a.pontuacaoComRegras;
        const pontuacaoB = tipoPontuacao === 'padrao' ? b.pontuacao : b.pontuacaoComRegras;
        return (
          pontuacaoB - pontuacaoA ||
          (b.omwMedio ?? 0) - (a.omwMedio ?? 0) ||
          (b.oomwMedio ?? 0) - (a.oomwMedio ?? 0) ||
          // Critério final, determinístico, se tudo acima empatar: ordem
          // alfabética.
          a.apelido.localeCompare(b.apelido, 'pt-BR')
        );
      });
  }, [torneiosParaRanking, categoriaFiltro, tipoPontuacao]);

  if (isLoading) return <Spinner />;
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-foreground">Rankings</h1>
        <p className="text-muted-foreground">
          Classificação de {nomeDoJogo(selectedTcg)} com base nos torneios filtrados abaixo
        </p>
      </div>

      <TournamentFiltersBar
        busca={busca}
        onBuscaChange={setBusca}
        showBuscaFilter={false}
        statusFiltro={statusFiltro}
        onStatusChange={setStatusFiltro}
        showStatusFilter={false}
        formatoFiltro={formatoFiltro}
        onFormatoChange={setFormatoFiltro}
        formatosDisponiveis={formatosDisponiveis}
        showLojaFilter={isJogador && !isTenant}
        lojaFiltro={lojaFiltro}
        onLojaChange={setLojaFiltro}
        lojasDisponiveis={lojasDisponiveis}
        datePreset={datePreset}
        onSelecionarPreset={selecionarPreset}
        usaDataCustom={usaDataCustom}
        dataInicioCustom={dataInicioCustom}
        dataFimCustom={dataFimCustom}
        onDataCustomChange={handleDataCustomChange}
      />

      {ehJogoPokemon && (
        <div className="bg-card p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Categorias</SelectItem>
              {CATEGORIAS.map((categoria) => (
                <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {podeFiltrarTemporada ? (
            <Select value={temporadaFiltro} onValueChange={setTemporadaFiltro}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas as Temporadas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Temporadas</SelectItem>
                {(temporadas ?? []).map((temporada) => (
                  <SelectItem key={temporada.id} value={String(temporada.id)}>
                    {temporada.nome || `${temporada.mes_inicio}/${temporada.ano_inicio} – ${temporada.mes_fim}/${temporada.ano_fim}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-xs text-muted-foreground self-center">
              Selecione uma loja específica acima para filtrar por temporada.
            </p>
          )}
        </div>
      )}

      {categoriaFiltro !== 'todos' && (
        <Alert className="mb-6">
          <TriangleAlert className="text-warning" />
          <AlertDescription>
            Apenas os torneios dentro de temporadas são contabilizados nesse ranking.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end mb-4">
        <Tabs value={tipoPontuacao} onValueChange={(v) => setTipoPontuacao(v as TipoPontuacao)}>
          <TabsList>
            <TabsTrigger value="com_regras">Com Regras Extras</TabsTrigger>
            <TabsTrigger value="padrao">Pontuação Normal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {ranking.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 py-12">
          <Trophy className="w-6 h-6" />
          <span className="text-sm">Nenhum resultado ainda para este jogo com os filtros selecionados.</span>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <div className="hidden md:grid grid-cols-[0.375rem_auto_1fr_repeat(4,4.5rem)_5rem] gap-3 px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
            <span />
            <span>#</span>
            <span>Jogador</span>
            <span className="text-center">Vit.</span>
            <span className="text-center">Der.</span>
            <span className="text-center">Emp.</span>
            <span className="text-center">Byes</span>
            <span className="text-right">Pontos</span>
          </div>

          <div className="divide-y divide-border">
            {ranking.map((item, index) => {
              const posicao = index + 1;
              return (
                <div
                  key={item.jogadorId}
                  className={`flex md:grid md:grid-cols-[0.375rem_auto_1fr_repeat(4,4.5rem)_5rem] items-center gap-3 px-4 py-3 ${
                    posicao <= 3 ? 'bg-accent/30' : ''
                  }`}
                >
                  <div className={`w-1.5 self-stretch rounded-full ${corDaBarra(posicao)}`} />

                  <div className="flex items-center gap-2 w-8 shrink-0 md:w-auto">
                    {posicao <= 3 ? (
                      <Medal className={`w-4 h-4 ${
                        posicao === 1 ? 'text-gold' : posicao === 2 ? 'text-slate-400' : 'text-amber-600'
                      }`} />
                    ) : (
                      <span className="text-sm text-muted-foreground">{posicao}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 md:flex-none">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.apelido}
                      {item.contaJogadorId != null && item.contaJogadorId === jogador?.id && (
                        <span className="ml-2 text-xs text-primary">(você)</span>
                      )}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                      <span className="truncate">
                        {item.gameId ? `#${item.gameId} · ` : ''}{item.torneios} {item.torneios === 1 ? 'torneio' : 'torneios'}
                        {item.omwMedio != null && ` · OMW% ${item.omwMedio.toFixed(2)}`}
                        {item.oomwMedio != null && ` · OOMW% ${item.oomwMedio.toFixed(2)}`}
                      </span>
                      {(item.omwMedio != null || item.oomwMedio != null) && (
                        <InfoTooltip text={`${omwTooltip} ${oomwTooltip}`} />
                      )}
                    </p>
                  </div>

                  <span className="hidden md:block text-center text-sm text-success font-medium">{item.vitorias}</span>
                  <span className="hidden md:block text-center text-sm text-destructive font-medium">{item.derrotas}</span>
                  <span className="hidden md:block text-center text-sm text-muted-foreground font-medium">{item.empates}</span>
                  <span className="hidden md:block text-center text-sm text-muted-foreground font-medium">{item.byes}</span>

                  <span className="text-right text-lg font-bold text-primary shrink-0 ml-auto md:ml-0">
                    {tipoPontuacao === 'padrao' ? item.pontuacao : item.pontuacaoComRegras}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
