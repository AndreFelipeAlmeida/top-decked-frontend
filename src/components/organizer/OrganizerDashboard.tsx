import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Plus, Download, Upload, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useQuery } from '@tanstack/react-query';
import { getTournaments } from '@/services/lojasTorneiosService';
import { getMonthlyTournaments, getFormatData, getRecentTournaments, getUpcomingTournaments } from '@/selectors/tournaments.selectors'; 
import Spinner from '../ui/Spinner';

export default function OrganizerDashboard() {
  const { user } = useAuthContext();
  
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: getTournaments,
    retry: false
  });

  const monthlyData = getMonthlyTournaments(tournaments);
  const formatData = getFormatData(tournaments);
  const upcomingTournaments = getUpcomingTournaments(tournaments);
  const recentTournaments = getRecentTournaments(tournaments);

  if (isLoading) return <Spinner />;

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-gray-900 font-bold">Painel de Controle</h1>
        <p className="text-gray-600">Bem-vindo de volta, {user?.nome}!</p>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link 
          to="/loja/criar-torneio"
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Criar Novo Torneio</span>
        </Link>
        <button className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Exportar Dados</span>
        </button>
        <Link
          to="/loja/rankings"
          className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
        >
          <Users className="w-5 h-5" />
          <span>Gerenciar Jogadores</span>
        </Link>
        <button className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Gerenciar Anúncios</span>
        </button>
      </div>

      {/* KPIs (Indicadores) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/loja/torneios"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-sm text-gray-600 mb-1">Torneios Ativos</div>
          <div className="text-3xl text-gray-900 font-bold">{upcomingTournaments.length}</div>
          <div className="text-xs text-green-600 mt-1">+2 desde a última semana</div>
        </Link>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total de Participantes</div>
          <div className="text-3xl text-gray-900 font-bold">
            {tournaments.reduce((acc, t) => acc + (t.jogadores?.length || 0), 0)}
          </div>
          <div className="text-xs text-green-600 mt-1">+15% este mês</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Eventos Finalizados</div>
          <div className="text-3xl text-gray-900 font-bold">{recentTournaments.length}</div>
          <div className="text-xs text-gray-600 mt-1">Total acumulado</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Média de Público</div>
          <div className="text-3xl text-gray-900 font-bold">
            {tournaments.length > 0 
              ? Math.round(tournaments.reduce((acc, t) => acc + (t.jogadores?.length || 0), 0) / tournaments.length) 
              : 0}
          </div>
          <div className="text-xs text-gray-600 mt-1">por torneio</div>
        </div>
      </div>

      {/* Gráficos de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-gray-900 font-bold">Atividade Mensal de Torneios</h2>
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

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-gray-900 font-bold">Distribuição por Formato</h2>
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-gray-900 font-bold">Próximos Torneios</h2>
          <div className="space-y-3">
            {upcomingTournaments.length > 0 ? upcomingTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                to={`/loja/torneio/${tournament.id}/configurar`}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors block"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-gray-900 font-bold">{tournament.nome}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(tournament.data_inicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-bold">
                    {tournament.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{tournament.jogadores?.length || 0} jogadores inscritos</span>
                </div>
              </Link>
            )) : <p className="text-gray-500 text-sm">Nenhum torneio agendado.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-gray-900 font-bold">Torneios Recentes</h2>
          <div className="space-y-3">
            {recentTournaments.length > 0 ? recentTournaments.map((tournament) => (
              <div key={tournament.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-gray-900 font-bold">{tournament.nome}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(tournament.data_inicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{tournament.jogadores?.length || 0} jogadores</span>
                  <span className="text-purple-600 font-bold italic">Vencedor: {tournament.vencedor}</span>
                </div>
              </div>
            )) : <p className="text-gray-500 text-sm">Nenhum torneio finalizado recentemente.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}