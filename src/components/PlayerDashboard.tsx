import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Progress } from './ui/progress.tsx';
import { Trophy, TrendingUp, Calendar, Target, Medal, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard';

interface PlayerDashboardProps {
  onNavigate: (page: Page) => void;
  currentUser: any;
}

const radarData = [
  { subject: 'Aggro', A: 120, fullMark: 150 },
  { subject: 'Control', A: 98, fullMark: 150 },
  { subject: 'Combo', A: 86, fullMark: 150 },
  { subject: 'Midrange', A: 99, fullMark: 150 },
  { subject: 'Tempo', A: 85, fullMark: 150 },
  { subject: 'Ramp', A: 65, fullMark: 150 },
];

const yearlyProgressionData = [
  { month: 'Jan', year: 2020, points: 1800, wins: 22, losses: 11, draws: 5 },
  { month: 'Fev', year: 2020, points: 1850, wins: 24, losses: 12, draws: 5 },
  { month: 'Mar', year: 2020, points: 1900, wins: 26, losses: 13, draws: 6 },
  { month: 'Abr', year: 2020, points: 1950, wins: 28, losses: 14, draws: 6 },
  { month: 'Mai', year: 2020, points: 2000, wins: 30, losses: 15, draws: 7 },
  { month: 'Jun', year: 2020, points: 2050, wins: 32, losses: 16, draws: 7 },
  { month: 'Jul', year: 2020, points: 2100, wins: 34, losses: 17, draws: 8 },
  { month: 'Ago', year: 2020, points: 2150, wins: 36, losses: 18, draws: 8 },
  { month: 'Set', year: 2020, points: 2200, wins: 38, losses: 19, draws: 9 },
  { month: 'Out', year: 2020, points: 2250, wins: 40, losses: 20, draws: 9 },
  { month: 'Nov', year: 2020, points: 2300, wins: 42, losses: 21, draws: 10 },
  { month: 'Dez', year: 2020, points: 2350, wins: 44, losses: 22, draws: 10 },

  { month: 'Jan', year: 2021, points: 2000, wins: 25, losses: 12, draws: 6 },
  { month: 'Fev', year: 2021, points: 2050, wins: 27, losses: 13, draws: 6 },
  { month: 'Mar', year: 2021, points: 2100, wins: 29, losses: 14, draws: 7 },
  { month: 'Abr', year: 2021, points: 2150, wins: 31, losses: 15, draws: 7 },
  { month: 'Mai', year: 2021, points: 2200, wins: 33, losses: 16, draws: 8 },
  { month: 'Jun', year: 2021, points: 2250, wins: 35, losses: 17, draws: 8 },
  { month: 'Jul', year: 2021, points: 2300, wins: 37, losses: 18, draws: 9 },
  { month: 'Ago', year: 2021, points: 2350, wins: 39, losses: 19, draws: 9 },
  { month: 'Set', year: 2021, points: 2400, wins: 41, losses: 20, draws: 10 },
  { month: 'Out', year: 2021, points: 2450, wins: 43, losses: 21, draws: 10 },
  { month: 'Nov', year: 2021, points: 2500, wins: 45, losses: 22, draws: 11 },
  { month: 'Dez', year: 2021, points: 2550, wins: 47, losses: 23, draws: 11 },

  { month: 'Jan', year: 2022, points: 2200, wins: 28, losses: 14, draws: 7 },
  { month: 'Fev', year: 2022, points: 2250, wins: 30, losses: 15, draws: 7 },
  { month: 'Mar', year: 2022, points: 2300, wins: 32, losses: 16, draws: 8 },
  { month: 'Abr', year: 2022, points: 2350, wins: 34, losses: 17, draws: 8 },
  { month: 'Mai', year: 2022, points: 2400, wins: 36, losses: 18, draws: 9 },
  { month: 'Jun', year: 2022, points: 2450, wins: 38, losses: 19, draws: 9 },
  { month: 'Jul', year: 2022, points: 2500, wins: 40, losses: 20, draws: 10 },
  { month: 'Ago', year: 2022, points: 2550, wins: 42, losses: 21, draws: 10 },
  { month: 'Set', year: 2022, points: 2600, wins: 44, losses: 22, draws: 11 },
  { month: 'Out', year: 2022, points: 2650, wins: 46, losses: 23, draws: 11 },
  { month: 'Nov', year: 2022, points: 2700, wins: 48, losses: 24, draws: 12 },
  { month: 'Dez', year: 2022, points: 2750, wins: 50, losses: 25, draws: 12 },

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
  { id: 1, name: 'Weekly Modern', date: '15-07-2025', placement: 2, participants: 32, points: 180 },
  { id: 2, name: 'Standard Showdown', date: '12-07-2025', placement: 5, participants: 24, points: 120 },
  { id: 3, name: 'Commander Clash', date: '20-07-2025', placement: 1, participants: 10, points: 150 },
  { id: 4, name: 'Legacy League', date: '01-07-2025', placement: 3, participants: 20, points: 170 },
];


const lighterPurpleShades = [
  '#7A49B0',
  '#8B5CF6',
  '#A07CF8',
  '#B899FA',
  '#D0B6FC',
];

const getLineColor = (year: string, currentYear: string, allSelectedYears: string[]) => {
  if (year === currentYear) {
    return '#2d1b69';
  }

  const otherSelectedYears = allSelectedYears
    .filter(y => y !== currentYear)
    .sort((a, b) => parseInt(b) - parseInt(a));

  const indexInOthers = otherSelectedYears.indexOf(year);
  if (indexInOthers !== -1 && indexInOthers < lighterPurpleShades.length) {
    return lighterPurpleShades[indexInOthers];
  }

  return '#CCCCCC';
};


export function PlayerDashboard({ onNavigate, currentUser }: PlayerDashboardProps) {
  const navigateToPlayerDashboard = () => {
    onNavigate('player-dashboard');
  };

  const [selectedMetric, setSelectedMetric] = useState('points');
  const availableYears = Array.from(new Set(yearlyProgressionData.map(d => d.year.toString())))

  const currentYear = new Date().getFullYear().toString();

  const [selectedYears, setSelectedYears] = useState<string[]>(
    availableYears.includes(currentYear) ? [currentYear] : (availableYears.length > 0 ? [availableYears[0]] : [])
  );

  const chartData = Array.from(new Set(yearlyProgressionData.map(d => d.month))).map(month => {
    const monthData: any = { month };
    selectedYears.forEach(year => {
      const yearData = yearlyProgressionData.find(d => d.month === month && d.year.toString() === year);
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

  const handleYearToggle = (year: string) => {
    setSelectedYears(prevYears => {
      const isSelected = prevYears.includes(year);

      if (isSelected) {
        if (prevYears.length > 1) {
          return prevYears.filter(y => y !== year).sort((a, b) => parseInt(b) - parseInt(a));
        }
        return prevYears;
      } else {
        if (prevYears.length < 5) {
          return [...prevYears, year].sort((a, b) => parseInt(b) - parseInt(a));
        }
        return prevYears;
      }
    });
  };

  const sortedRecentTournaments = [...recentTournaments].sort((a, b) => {
    const parseDate = (dateString: string) => {
      const [day, month, year] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    };
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateB.getTime() - dateA.getTime();
  });


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel do Jogador</h1>
        <p className="text-muted-foreground">Bem-vindo(a) de volta, {currentUser?.name || 'Jogador'}! Aqui está o seu progresso em torneios.</p>
      </div>

      {/* Cartões de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser?.stats?.totalPoints.toLocaleString('pt-BR') || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              +160 do último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Vitórias</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser?.stats?.winRate || 'N/A'}%</div>
            <Progress value={currentUser?.stats?.winRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Torneios</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser?.stats?.tournaments || 'N/A'}</div>
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
            <div className="text-2xl font-bold">#{currentUser?.stats?.rank || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Ranking regional
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de Radar de Desempenho por Arquétipo de Deck */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Arquétipo de Deck</CardTitle>
            <CardDescription>Seu desempenho em diferentes tipos de deck</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex flex-col">
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#6c757d', fontSize: 15 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 150]}
                    tick={{dy: 10}}
                  />
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

        {/* Tendência de desempenho */}
        <Card>
          <CardHeader>
            <CardTitle>Progressão Anual de Desempenho</CardTitle>
            <CardDescription>Compare suas métricas de desempenho ao longo dos anos.</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex flex-col">
            <div className="mb-4 space-y-4">
              {/* Seleção de Métricas */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Métrica:</label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Pontos</SelectItem>
                    <SelectItem value="wins">Vitórias</SelectItem>
                    <SelectItem value="losses">Derrotas</SelectItem>
                    <SelectItem value="draws">Empates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Anos:</label>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {availableYears.map(year => (
                    <Button
                      key={year}
                      size="sm"
                      variant={selectedYears.includes(year) ? 'default' : 'outline'}
                      onClick={() => handleYearToggle(year)}
                      className="h-8 flex-shrink-0"
                      disabled={!selectedYears.includes(year) && selectedYears.length >= 5}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Selecione até 5 anos para comparar. Atualmente, exibindo {selectedYears.length} anos.
              </p>
            </div>

            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: string) => [value.toLocaleString('pt-BR'), `${getMetricLabel(selectedMetric)} (${name.split('_')[1]})`]}
                    labelFormatter={(label: string) => `Mês: ${label}`}
                  />
                  <Legend
                    formatter={(value: string) => `${getMetricLabel(selectedMetric)} (${value.split('_')[1]})`}
                  />
                  {selectedYears.map(year => (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={`${selectedMetric}_${year}`}
                      stroke={getLineColor(year, currentYear, selectedYears)}
                      strokeWidth={2}
                      dot={{ fill: getLineColor(year, currentYear, selectedYears), strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: getLineColor(year, currentYear, selectedYears), strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Torneios Recentes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Torneios Recentes</CardTitle>
          <CardDescription>Seus últimos resultados em torneios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedRecentTournaments.map((tournament) => (
              <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    className={
                      tournament.placement === 1
                        ? 'bg-yellow-500 text-white'
                        : tournament.placement === 2
                        ? 'bg-gray-400 text-white'
                        : tournament.placement === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-muted text-muted-foreground'
                    }
                  >
                    #{tournament.placement}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prévia de Rankings */}
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
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Anual</h3>
              <p className="text-3xl font-bold text-primary">#12</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Geral</h3>
              <p className="text-3xl font-bold text-primary">#23</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button onClick={navigateToPlayerDashboard} className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Ver Rankings Completos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
