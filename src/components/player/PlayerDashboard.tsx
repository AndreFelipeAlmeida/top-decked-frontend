import { useEffect, useMemo } from 'react';
import { LayoutDashboard, Trophy, Plus, TrendingUp, Swords, Medal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthenticatedUser } from '@/hooks/authContext.hooks';
import { useMe } from '@/hooks/auth.hooks';
import { usePlayerStatistics } from '@/hooks/players.hooks';
import { useTournaments } from '@/hooks/tournaments.hooks';
import { useViewMode } from '@/hooks/viewModeContext.hooks';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import { useOrganizadorDoTenantAtual } from '@/hooks/organizadorTenant.hooks';
import { useAchievementHistory } from '@/hooks/achievements.hooks';
import { OrganizerViewSwitch } from './OrganizerViewSwitch';
import { DashboardActionButton } from '@/components/ui/dashboard-action-button';
import { ImportTournamentButton } from '@/components/organizer/ImportTournamentButton';
import Spinner from '@/components/ui/spinner';
import { StatusTorneio } from '@/types/Enums';
import { dataExibicaoTorneio, momentoEfetivoTorneio } from '@/lib/dateUtils';
import { nomeDoJogo } from '@/lib/tcgGames';

const ULTIMA_VISITA_CONQUISTAS_KEY = 'ultima_visita_conquistas';

const QUANTIDADE_TORNEIOS_RECENTES = 5;

const corDoStatus = (status: string) => {
  switch (status) {
    case StatusTorneio.ABERTO:
      return 'bg-success/15 text-success border-success/40';
    case StatusTorneio.EM_ANDAMENTO:
      return 'bg-primary/15 text-primary border-primary/40';
    case StatusTorneio.FINALIZADO:
      return 'bg-info/15 text-info border-info/40';
    default:
      return 'bg-muted text-foreground border-border';
  }
};

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const user = useAuthenticatedUser();
  const { data: jogador, isLoading } = useMe(true);
  const { viewMode } = useViewMode();
  const { data: historico } = useAchievementHistory();
  const { selectedTcg, mostrarTodosOsJogos } = useTcgSelection();

  const tcgFiltro = mostrarTodosOsJogos ? undefined : selectedTcg;
  const { data: estatisticas, isLoading: isStatsLoading } = usePlayerStatistics(tcgFiltro);
  const { data: torneios, isLoading: isTorneiosLoading } = useTournaments('jogador');

  const { isOrganizador: isOrganizer, tcgs: tcgsOrganizados, lojaId } = useOrganizadorDoTenantAtual();

  const podeImportarTorneio = tcgsOrganizados.includes('POKEMON');

  const torneiosRecentes = useMemo(() => {
    if (!jogador) return [];
    return (torneios ?? [])
      .filter((t) => t.jogadores?.some((j) => j.jogador_id === jogador.id))
      .filter((t) => mostrarTodosOsJogos || t.jogo === selectedTcg)
      .sort((a, b) => momentoEfetivoTorneio(b).getTime() - momentoEfetivoTorneio(a).getTime())
      .slice(0, QUANTIDADE_TORNEIOS_RECENTES);
  }, [torneios, jogador, mostrarTodosOsJogos, selectedTcg]);

  useEffect(() => {
    if (!historico || historico.length === 0) return;

    const ultimaVisitaStr = localStorage.getItem(ULTIMA_VISITA_CONQUISTAS_KEY);
    const ultimaVisita = ultimaVisitaStr ? new Date(ultimaVisitaStr) : null;

    const novasConquistas = ultimaVisita
      ? historico.filter((item) => new Date(item.conquistado_em) > ultimaVisita)
      : [];

    for (const item of novasConquistas) {
      toast.success(`🏆 ${item.conquista_nome} chegou ao nível ${item.nome_nivel}!`);
    }

    localStorage.setItem(ULTIMA_VISITA_CONQUISTAS_KEY, new Date().toISOString());
  }, [historico]);

  if (isLoading) return <Spinner />;

  const conquistasRecentes = historico?.slice(0, 3) ?? [];

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-foreground font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user.nome}!{' '}
            {mostrarTodosOsJogos ? '' : `Mostrando dados de ${nomeDoJogo(selectedTcg)}.`}
          </p>
        </div>

        <OrganizerViewSwitch visible={isOrganizer} />
      </div>

      {viewMode === 'organizador' && isOrganizer && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardActionButton to="/jogador/criar-torneio" icon={Plus} label="Criar Torneio" variant="primary" />
          {podeImportarTorneio && (
            <ImportTournamentButton
              isJogadorOrganizador
              lojaIdFixo={lojaId}
              onImported={(torneioId) => navigate(`/loja/torneio/${torneioId}/editar`)}
            />
          )}
        </div>
      )}

      {/* Estatísticas */}
      {isStatsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow p-6 h-24" />
          ))}
        </div>
      ) : estatisticas && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Medal className="w-4 h-4" />
              Rank Geral
            </div>
            <p className="text-2xl font-bold text-foreground">
              {estatisticas.rank_geral != null ? `#${estatisticas.rank_geral}` : '—'}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <TrendingUp className="w-4 h-4" />
              Taxa de Vitória
            </div>
            <p className="text-2xl font-bold text-foreground">{estatisticas.taxa_vitoria}%</p>
          </div>

          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Trophy className="w-4 h-4" />
              Torneios Jogados
            </div>
            <p className="text-2xl font-bold text-foreground">{estatisticas.torneio_totais}</p>
          </div>

          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Swords className="w-4 h-4" />
              Vitórias / Derrotas / Empates
            </div>
            <p className="text-2xl font-bold text-foreground">
              <span className="text-success">{estatisticas.vitorias}</span>
              {' / '}
              <span className="text-destructive">{estatisticas.derrotas}</span>
              {' / '}
              <span className="text-muted-foreground">{estatisticas.empates}</span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            Torneios Recentes
          </h3>

          {isTorneiosLoading ? (
            <Spinner />
          ) : torneiosRecentes.length > 0 ? (
            <div className="space-y-3">
              {torneiosRecentes.map((torneio) => (
                <Link
                  key={torneio.id}
                  to={`/loja/torneio/${torneio.id}/visualizar`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{torneio.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {dataExibicaoTorneio(torneio)}
                      {torneio.loja?.nome ? ` · ${torneio.loja.nome}` : ''}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 text-xs rounded border font-medium ${corDoStatus(torneio.status)}`}>
                    {torneio.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Você ainda não participou de nenhum torneio.
            </p>
          )}
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Conquistas Recentes
            </h3>
          </div>

          {conquistasRecentes.length > 0 ? (
            <div className="space-y-3 mb-4">
              {conquistasRecentes.map((item) => (
                <div key={`${item.conquista_codigo}-${item.nivel}`} className="flex items-center gap-3 text-sm">
                  <span className="text-xl">{item.conquista_icone}</span>
                  <div className="min-w-0">
                    <p className="text-foreground font-medium truncate">
                      {item.conquista_nome} — {item.nome_nivel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.conquistado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">Nenhuma conquista desbloqueada ainda.</p>
          )}

          <Link to="/jogador/conquistas" className="text-sm font-medium text-primary hover:text-primary">
            Ver todas as conquistas →
          </Link>
        </div>
      </div>
    </div>
  );
}
