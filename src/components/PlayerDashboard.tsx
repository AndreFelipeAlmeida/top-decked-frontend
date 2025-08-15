import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Progress } from './ui/progress.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Trophy, TrendingUp, Calendar, Target, Medal, Users, BarChart3 } from 'lucide-react';
import { RadarChart,BarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, PieChart, Pie, Cell } from 'recharts';
import { User } from '../data/store.ts';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

interface PlayerDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
  onNavigateToTournament: (tournamentId: string) => void;
  currentUser: User | null;
}

export function PlayerDashboard({ onNavigate, onNavigateToTournament, currentUser }: PlayerDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState('points');
  const [selectedYears, setSelectedYears] = useState(['2024', '2025']);

  const [yearlyProgressionData, setYearlyProgressionData] = useState<any[]>([]);
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [radarData, setRadarData] = useState([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [totalRank, setTotalRank] = useState<any>();
  const [mensalRank, setMensalRank] = useState<any>();
  const [anualRank, setAnualRank] = useState<any>();
  const [totalTournments, setTotalTournments] = useState<any>();
  const [winRate, setWinRate] = useState<any>();

  useEffect(() => {
    async function fetchStats() {
      try {
      if (!currentUser) return;
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`http://localhost:8000/jogadores/estatisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Erro ao buscar estatísticas');
      
      const data = await res.json();
      setTotalRank(data.rank_geral)
      setMensalRank(data.rank_mensal)
      setAnualRank(data.rank_anual)
      setTotalTournments(data.torneio_totais)
      setWinRate(data.taxa_vitoria)

      const formattedYearly = data.estatisticas_anuais.map((item: any) => ({
        month: item.mes,
        year: item.ano,
        points: item.pontos,
        wins: item.vitorias,
        losses: item.derrotas,
        draws: item.empates,
      }));

      const uniqueYears = Array.from(new Set<number>(formattedYearly.map(d => d.year)))
        .sort((a, b) => b - a)
        .map(y => y.toString());

      setAvailableYears(uniqueYears);
      
      const formattedHistory = data.historico.map((item: any) => ({
        id: item.id,
        name: item.nome,
        date: new Date(item.data_inicio).toLocaleDateString('pt-BR'),
        placement: item.colocacao,
        participants: item.participantes,
        points: item.pontuacao,
      }));

      setYearlyProgressionData(formattedYearly);
      setRecentTournaments(formattedHistory);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  // Dentro do componente PlayerDashboard, antes do return
  const currentYear = new Date().getFullYear();

  // Filtra dados do ano atual
  const dataAnoAtual = yearlyProgressionData.filter(d => d.year === currentYear);

  // Cálculo de pontos anuais (soma de todos os meses do ano atual)
  const pontosAnuais = dataAnoAtual.reduce((acc, item) => acc + (item.points || 0), 0);

  // Cálculo de pontos mensais (último mês disponível do ano atual)
  const pontosMensais = dataAnoAtual.length > 0
    ? dataAnoAtual[dataAnoAtual.length - 1].points
    : 0;
  async function fetchRadarData() {
    if (!currentUser) return;
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(
        `http://localhost:8000/ranking/desempenho`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error('Erro ao buscar desempenho por formatos');

      const data = await res.json();

      // Mapeando para o formato do RadarChart
      const formattedData = data.map(item => ({
        subject: item.formato,
        A: item.pontos,
      }));

      const mockData = [
        { subject: "Challenger", A: 40 },
        { subject: "Semanal", A: 20 },
      ];

      // Combina mock + dados reais e atualiza o estado
      setRadarData(prev => [...mockData, ...formattedData]);
    } catch (err) {
      console.error(err);
    }
  }
  const fetchData = async () => {
    await fetchRadarData();
    await fetchStats();
  };
  fetchData();
}, [currentUser]);

  const filteredData = yearlyProgressionData.filter(d => selectedYears.includes(d.year.toString()));

  // Group data by month for comparison
  const chartData = Array.from(new Set(filteredData.map(d => d.month))).map(month => {
    const monthData: any = { month };
    selectedYears.forEach(year => {
      const yearData = filteredData.find(d => d.month === month && d.year.toString() === year);
      if (yearData) {
        monthData[`${selectedMetric}_${year}`] = yearData[selectedMetric as keyof typeof yearData];
      }
    });
    return monthData;
  });
  const totalPoints = yearlyProgressionData.reduce((acc, item) => acc + (item.points || 0), 0);
  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'points': return 'Pontos';
      case 'wins': return 'Vitórias';
      case 'losses': return 'Derrotas';
      case 'draws': return 'Empates';
      default: return 'Pontos';
    }
  };

  const getLineColor = (year: string) => {
    const colors = {
      '2025': '#2d1b69', // Current year - primary color
      '2024': '#7A49B0',
      '2023': '#8B5CF6',
      '2022': '#A07CF8',
      '2021': '#B899FA',
      '2020': '#D0B6FC',
    };
    return colors[year as keyof typeof colors] || '#D0B6FC';
  };

  const handleYearToggle = (year: string) => {
    if (selectedYears.includes(year)) {
      if (selectedYears.length > 1) {
        setSelectedYears(selectedYears.filter(y => y !== year));
      }
    } else {
      if (selectedYears.length < 5) { // Updated limit to 5 years
        setSelectedYears([...selectedYears, year]);
      }
    }
  };

  // Helper function to get ranking badge styles
  const getRankingBadgeStyles = (placement: number) => {
    switch (placement) {
      case 1:
        return {
          className: 'text-white bg-yellow-500 hover:bg-yellow-500 border-yellow-500', // Gold
          variant: 'default' as const
        };
      case 2:
        return {
          className: 'text-white bg-gray-400 hover:bg-gray-400 border-gray-400', // Silver
          variant: 'default' as const
        };
      case 3:
        return {
          className: 'text-white bg-amber-600 hover:bg-amber-600 border-amber-600', // Bronze
          variant: 'default' as const
        };
      default:
        return {
          className: 'text-muted-foreground bg-secondary hover:bg-secondary border-border', // Default
          variant: 'outline' as const
        };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel do Jogador</h1>
        <p className="text-muted-foreground">Bem-vindo de volta, {currentUser?.name || 'Jogador'}! Aqui está seu progresso em torneios.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Vitórias</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <Progress value={winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Torneios</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTournments}</div>
            <p className="text-xs text-muted-foreground">
              Torneios Totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking Atual</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{totalRank}</div>
            <p className="text-xs text-muted-foreground">
              Ranking geral
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Seasonal Progress Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Formato</CardTitle>
            <CardDescription>Seu desempenho em diferentes tipos de formatos de torneios</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex items-center justify-center">
            <div className="w-full h-80">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={radarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="A" fill="#2d1b69" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>

        </Card>

        {/* Enhanced Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Progressão Anual de Desempenho</CardTitle>
            <CardDescription>Compare suas métricas de desempenho ao longo dos últimos anos</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex flex-col">
            <div className="mb-4 space-y-4 flex-shrink-0">
              {/* Metric Selection */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Métrica:</label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Pontos</SelectItem>
                    <SelectItem value="wins">Vitórias</SelectItem>
                    <SelectItem value="losses">Derrotas</SelectItem>
                    <SelectItem value="draws">Empates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Selection - Years in descending order */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Anos:</label>
                <div className="flex space-x-2 flex-wrap">
                  {availableYears.map(year => (
                    <Button
                      key={year}
                      size="sm"
                      variant={selectedYears.includes(year) ? 'default' : 'outline'}
                      onClick={() => handleYearToggle(year)}
                      className="h-8"
                      disabled={!selectedYears.includes(year) && selectedYears.length >= 5}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Updated helper text */}
              <p className="text-xs text-muted-foreground">
                Selecione até 5 anos para comparar. Atualmente exibindo {selectedYears.length} anos.
              </p>
            </div>

            {/* Chart container with flex-1 to take remaining space */}
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="w-full h-full max-h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name: string) => [value.toLocaleString('pt-BR'), `${getMetricLabel(selectedMetric)} (${name.split('_')[1]})`]}
                      labelFormatter={(label) => `Mês: ${label}`}
                    />
                    <Legend
                      formatter={(value) => `${getMetricLabel(selectedMetric)} ${value.split('_')[1]}`}
                    />
                    {selectedYears.map(year => (
                      <Line
                        key={year}
                        type="monotone"
                        dataKey={`${selectedMetric}_${year}`}
                        stroke={getLineColor(year)}
                        strokeWidth={2}
                        dot={{ fill: getLineColor(year), strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: getLineColor(year), strokeWidth: 2 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tournaments */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Torneios Recentes</CardTitle>
          <CardDescription>Seus últimos resultados em torneios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTournaments.map((tournament) => {
              const badgeStyles = getRankingBadgeStyles(tournament.placement);
              return (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => onNavigateToTournament(`tournament-${tournament.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground">{tournament.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{tournament.participants}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">+{tournament.points} pts</span>
                      </div>
                    </div>
                    <Badge
                      variant={badgeStyles.variant}
                      className={badgeStyles.className}
                    >
                      #{tournament.placement}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => onNavigate('tournament-list')} className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <BarChart3 className="h-4 w-4" />
              <span>Ver Todos os Torneios</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Rankings Atuais</CardTitle>
          <CardDescription>Sua posição em várias tabelas de classificação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Mensal</h3>
              <p className="text-3xl font-bold text-primary">#{mensalRank}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Anual</h3>
              <p className="text-3xl font-bold text-primary">#{anualRank}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Geral</h3>
              <p className="text-3xl font-bold text-primary">#{totalRank}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => onNavigate('ranking')} className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Trophy className="h-4 w-4" />
              <span>Ver Rankings Completos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}