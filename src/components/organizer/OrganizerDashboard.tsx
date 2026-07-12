import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Plus, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/authContext.hooks';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import { getMonthlyTournaments, getFormatData, getRecentTournaments, getUpcomingTournaments } from '@/selectors/tournaments.selectors';
import Spinner from '../ui/spinner';
import { useTournaments } from '@/hooks/tournaments.hooks';
import { DashboardActionButton } from '@/components/ui/dashboard-action-button';
import { ImportTournamentButton } from './ImportTournamentButton';
import { dataExibicaoTorneio } from '@/lib/dateUtils';

export default function OrganizerDashboard() {
  const { user } = useAuthContext();
  const { selectedTcg } = useTcgSelection();
  const navigate = useNavigate();

  const { data: tournamentsRaw = [], isLoading } = useTournaments('loja');

  // A barra lateral de jogos filtra o dashboard pelo jogo selecionado (mesmo
  // padrão de Tournaments.tsx/OrganizerRankings.tsx).
  const tournaments = useMemo(
    () => tournamentsRaw.filter((t) => t.jogo === selectedTcg),
    [tournamentsRaw, selectedTcg],
  );

  const monthlyData = getMonthlyTournaments(tournaments);
  const formatData = getFormatData(tournaments);
  const upcomingTournaments = getUpcomingTournaments(tournaments);
  const recentTournaments = getRecentTournaments(tournaments);

  if (isLoading) return <Spinner />;

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-foreground font-bold">Painel de Controle</h1>
        <p className="text-muted-foreground">Bem-vindo de volta, {user?.nome}!</p>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardActionButton to="/loja/criar-torneio" icon={Plus} label="Criar Novo Torneio" variant="primary" />
        <ImportTournamentButton onImported={(torneioId) => navigate(`/loja/torneio/${torneioId}/editar`)} />
        <DashboardActionButton to="/loja/jogadores" icon={Users} label="Gerenciar Jogadores" />
      </div>

      {/* KPIs (Indicadores) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/torneios"
          className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-sm text-muted-foreground mb-1">Torneios Ativos</div>
          <div className="text-3xl text-foreground font-bold">{upcomingTournaments.length}</div>
          <div className="text-xs text-success mt-1">+2 desde a última semana</div>
        </Link>
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="text-sm text-muted-foreground mb-1">Total de Participantes</div>
          <div className="text-3xl text-foreground font-bold">
            {tournaments.reduce((acc, t) => acc + (t.jogadores?.length || 0), 0)}
          </div>
          <div className="text-xs text-success mt-1">+15% este mês</div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="text-sm text-muted-foreground mb-1">Eventos Finalizados</div>
          <div className="text-3xl text-foreground font-bold">{recentTournaments.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total acumulado</div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="text-sm text-muted-foreground mb-1">Média de Público</div>
          <div className="text-3xl text-foreground font-bold">
            {tournaments.length > 0 
              ? Math.round(tournaments.reduce((acc, t) => acc + (t.jogadores?.length || 0), 0) / tournaments.length) 
              : 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">por torneio</div>
        </div>
      </div>

      {/* Gráficos de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-foreground font-bold">Atividade Mensal de Torneios</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip labelFormatter={(label) => `Mês: ${label}`} />
              <Bar dataKey="tournaments" name="Torneios" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-foreground font-bold">Distribuição por Formato</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart width={400} height={300}>
              <Pie
                data={formatData}
                dataKey="value"
                label={false} // Desativa a label flutuante
                outerRadius={80}
              >
                {formatData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/> 
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Listas de Torneios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-foreground font-bold">Próximos Torneios</h2>
          <div className="space-y-3">
            {upcomingTournaments.length > 0 ? upcomingTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                to={`/loja/torneio/${tournament.id}/editar`}
                className="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors block"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-foreground font-bold">{tournament.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dataExibicaoTorneio(tournament)}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-success/15 text-success text-xs rounded font-bold">
                    {tournament.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{tournament.jogadores?.length || 0} jogadores inscritos</span>
                </div>
              </Link>
            )) : <p className="text-muted-foreground text-sm">Nenhum torneio agendado.</p>}
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-foreground font-bold">Torneios Recentes</h2>
          <div className="space-y-3">
            {recentTournaments.length > 0 ? recentTournaments.map((tournament) => (
              <div key={tournament.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-foreground font-bold">{tournament.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dataExibicaoTorneio(tournament)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{tournament.jogadores?.length || 0} jogadores</span>
                  <span className="text-primary font-bold italic">Vencedor: {tournament.vencedor}</span>
                </div>
              </div>
            )) : <p className="text-muted-foreground text-sm">Nenhum torneio finalizado recentemente.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}