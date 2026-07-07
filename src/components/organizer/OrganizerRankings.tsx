import { useMemo } from 'react';
import { Medal, Trophy } from 'lucide-react';

import Spinner from '@/components/ui/spinner';
import { TournamentFiltersBar } from './TournamentFiltersBar';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { useTournaments } from '@/hooks/tournaments.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import { useTournamentFilters } from '@/hooks/useTournamentFilters';
import { nomeDoJogo } from '@/lib/tcgGames';
import { StatusTorneio } from '@/types/Enums';

type JogadorRanking = {
  jogadorId: number;
  contaJogadorId: number | null;
  apelido: string;
  gameId: string | null;
  torneios: number;
  pontuacao: number;
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
  const { data: jogador, isLoading: isMeLoading } = useMe(isJogador);
  const { data: torneios, isLoading: isTournamentsLoading } = useTournaments(user.tipo);

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
  
  const isLoading = (isJogador && isMeLoading) || isTournamentsLoading;

  const ranking = useMemo<JogadorRanking[]>(() => {
    const porJogador = new Map<number, {
      contaJogadorId: number | null;
      apelido: string;
      gameId: string | null;
      torneios: number;
      pontuacao: number;
      vitorias: number;
      derrotas: number;
      empates: number;
      byes: number;
      omwSoma: number;
      omwCount: number;
      oomwSoma: number;
      oomwCount: number;
    }>();

    for (const torneio of torneiosFiltrados) {
      for (const link of torneio.jogadores ?? []) {
        const chave = link.jogador_criado_id;
        if (chave == null) continue;

        const atual = porJogador.get(chave) ?? {
          contaJogadorId: link.jogador_id ?? null,
          apelido: link.apelido || `Jogador #${chave}`,
          gameId: link.game_id ?? null,
          torneios: 0,
          pontuacao: 0,
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
        atual.pontuacao += link.pontuacao_com_regras ?? 0;
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
        vitorias: dados.vitorias,
        derrotas: dados.derrotas,
        empates: dados.empates,
        byes: dados.byes,
        omwMedio: dados.omwCount ? dados.omwSoma / dados.omwCount : null,
        oomwMedio: dados.oomwCount ? dados.oomwSoma / dados.oomwCount : null,
      }))
      .sort((a, b) =>
        b.pontuacao - a.pontuacao ||
        (b.omwMedio ?? 0) - (a.omwMedio ?? 0) ||
        (b.oomwMedio ?? 0) - (a.oomwMedio ?? 0)
      );
  }, [torneiosFiltrados]);

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
        statusFiltro={statusFiltro}
        onStatusChange={setStatusFiltro}
        showStatusFilter={false}
        formatoFiltro={formatoFiltro}
        onFormatoChange={setFormatoFiltro}
        formatosDisponiveis={formatosDisponiveis}
        showLojaFilter={isJogador}
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
                    <p className="text-xs text-muted-foreground truncate">
                      {item.gameId ? `#${item.gameId} · ` : ''}{item.torneios} {item.torneios === 1 ? 'torneio' : 'torneios'}
                      {item.omwMedio != null && ` · OMW% ${item.omwMedio.toFixed(1)}`}
                      {item.oomwMedio != null && ` · OOMW% ${item.oomwMedio.toFixed(1)}`}
                    </p>
                  </div>

                  <span className="hidden md:block text-center text-sm text-success font-medium">{item.vitorias}</span>
                  <span className="hidden md:block text-center text-sm text-destructive font-medium">{item.derrotas}</span>
                  <span className="hidden md:block text-center text-sm text-muted-foreground font-medium">{item.empates}</span>
                  <span className="hidden md:block text-center text-sm text-muted-foreground font-medium">{item.byes}</span>

                  <span className="text-right text-lg font-bold text-primary shrink-0 ml-auto md:ml-0">
                    {item.pontuacao}
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
