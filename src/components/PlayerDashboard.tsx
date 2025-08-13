import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Progress } from './ui/progress.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Trophy, TrendingUp, Calendar, Target, Medal, Users, BarChart3 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { User } from '../data/store.ts';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

interface PlayerDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
  onNavigateToTournament: (tournamentId: string) => void;
  currentUser: User | null;
}

const radarData = [
  { subject: 'Aggro', A: 120, fullMark: 150 },
  { subject: 'Control', A: 98, fullMark: 150 },
  { subject: 'Combo', A: 86, fullMark: 150 },
  { subject: 'Midrange', A: 99, fullMark: 150 },
  { subject: 'Tempo', A: 85, fullMark: 150 },
  { subject: 'Ramp', A: 65, fullMark: 150 },
];

// Enhanced yearly progression data with multiple metrics and years (limited to recent years)
const yearlyProgressionData = [
  // 2023 Data
  { month: 'Jan', year: 2023, points: 1580, wins: 52, losses: 29, draws: 9 },
  { month: 'Fev', year: 2023, points: 1640, wins: 56, losses: 31, draws: 8 },
  { month: 'Mar', year: 2023, points: 1720, wins: 61, losses: 33, draws: 10 },
  { month: 'Abr', year: 2023, points: 1790, wins: 65, losses: 35, draws: 9 },
  { month: 'Mai', year: 2023, points: 1860, wins: 70, losses: 37, draws: 11 },
  { month: 'Jun', year: 2023, points: 1920, wins: 74, losses: 39, draws: 10 },
  { month: 'Jul', year: 2023, points: 1980, wins: 78, losses: 41, draws: 12 },
  { month: 'Ago', year: 2023, points: 2050, wins: 83, losses: 43, draws: 11 },
  { month: 'Set', year: 2023, points: 2120, wins: 87, losses: 45, draws: 13 },
  { month: 'Out', year: 2023, points: 2180, wins: 92, losses: 47, draws: 12 },
  { month: 'Nov', year: 2023, points: 2240, wins: 96, losses: 49, draws: 14 },
  { month: 'Dez', year: 2023, points: 2300, wins: 100, losses: 51, draws: 13 },

  // 2024 Data
  { month: 'Jan', year: 2024, points: 1200, wins: 15, losses: 8, draws: 2 },
  { month: 'Fev', year: 2024, points: 1350, wins: 19, losses: 10, draws: 3 },
  { month: 'Mar', year: 2024, points: 1280, wins: 17, losses: 11, draws: 4 },
  { month: 'Abr', year: 2024, points: 1450, wins: 23, losses: 12, draws: 3 },
  { month: 'Mai', year: 2024, points: 1520, wins: 26, losses: 14, draws: 5 },
  { month: 'Jun', year: 2024, points: 1680, wins: 31, losses: 15, draws: 4 },
  { month: 'Jul', year: 2024, points: 1750, wins: 34, losses: 17, draws: 6 },
  { month: 'Ago', year: 2024, points: 1820, wins: 38, losses: 18, draws: 5 },
  { month: 'Set', year: 2024, points: 1890, wins: 42, losses: 20, draws: 7 },
  { month: 'Out', year: 2024, points: 1960, wins: 45, losses: 22, draws: 6 },
  { month: 'Nov', year: 2024, points: 2020, wins: 49, losses: 23, draws: 8 },
  { month: 'Dez', year: 2024, points: 2080, wins: 52, losses: 25, draws: 7 },

  // 2025 Data (Current Year)
  { month: 'Jan', year: 2025, points: 1180, wins: 14, losses: 7, draws: 3 },
  { month: 'Fev', year: 2025, points: 1420, wins: 20, losses: 9, draws: 2 },
  { month: 'Mar', year: 2025, points: 1580, wins: 26, losses: 11, draws: 4 },
  { month: 'Abr', year: 2025, points: 1740, wins: 32, losses: 13, draws: 3 },
  { month: 'Mai', year: 2025, points: 1890, wins: 37, losses: 15, draws: 5 },
  { month: 'Jun', year: 2025, points: 2020, wins: 43, losses: 17, draws: 4 },
  { month: 'Jul', year: 2025, points: 2180, wins: 49, losses: 19, draws: 6 },
  { month: 'Ago', year: 2025, points: 2340, wins: 55, losses: 21, draws: 5 },
  { month: 'Set', year: 2025, points: 2480, wins: 61, losses: 23, draws: 7 },
  { month: 'Out', year: 2025, points: 2620, wins: 67, losses: 25, draws: 6 },
  { month: 'Nov', year: 2025, points: 2750, wins: 73, losses: 27, draws: 8 },
  { month: 'Dez', year: 2025, points: 2880, wins: 79, losses: 29, draws: 7 },
];

const recentTournaments = [
  { id: 1, name: 'Modern Semanal', date: '15/12/2024', placement: 2, participants: 32, points: 180 },
  { id: 2, name: 'Confronto Padrão', date: '10/12/2024', placement: 5, participants: 24, points: 120 },
  { id: 3, name: 'Magic de Sexta à Noite', date: '08/12/2024', placement: 1, participants: 16, points: 200 },
  { id: 4, name: 'Noite de Commander', date: '05/12/2024', placement: 3, participants: 12, points: 100 },
];

export function PlayerDashboard({ onNavigate, onNavigateToTournament, currentUser }: PlayerDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState('points');
  const [selectedYears, setSelectedYears] = useState(['2024', '2025']); // Default to current vs previous year

  // Years in descending order (current year first)
  const availableYears = ['2025', '2024', '2023', '2022', '2021'];

  // Filter data based on selected years
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
            <div className="text-2xl font-bold">{currentUser?.stats?.totalPoints || 1680}</div>
            <p className="text-xs text-muted-foreground">
              +160 do mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Vitórias</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser?.stats?.winRate || 68}%</div>
            <Progress value={currentUser?.stats?.winRate || 68} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Torneios</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser?.stats?.tournaments || 24}</div>
            <p className="text-xs text-muted-foreground">
              Nesta temporada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking Atual</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{currentUser?.stats?.rank || 12}</div>
            <p className="text-xs text-muted-foreground">
              Ranking regional
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Seasonal Progress Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Arquétipo de Deck</CardTitle>
            <CardDescription>Seu desempenho em diferentes tipos de deck</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex items-center justify-center">
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 150]} />
                  <Radar
                    name="Desempenho"
                    dataKey="A"
                    stroke="#2d1b69"
                    fill="#2d1b69"
                    fillOpacity={0.6}
                  />
                </RadarChart>
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
              <p className="text-3xl font-bold text-primary">#8</p>
              <p className="text-sm text-muted-foreground">{currentUser?.stats?.totalPoints || 1680} pontos</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Anual</h3>
              <p className="text-3xl font-bold text-primary">#{currentUser?.stats?.rank || 12}</p>
              <p className="text-sm text-muted-foreground">15.240 pontos</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Geral</h3>
              <p className="text-3xl font-bold text-primary">#23</p>
              <p className="text-sm text-muted-foreground">28.950 pontos</p>
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