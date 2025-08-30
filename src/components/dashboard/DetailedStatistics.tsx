import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { CheckCircle, XCircle, Minus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { User } from '../../data/store.ts';

interface DetailedStatisticsProps {
  currentUser: User | null;
}

// Tournament format participation data
const formatData = [
  { name: 'Standard', value: 35, tournaments: 15 },
  { name: 'Modern', value: 25, tournaments: 11 },
  { name: 'Draft', value: 20, tournaments: 8 },
  { name: 'Commander', value: 12, tournaments: 5 },
  { name: 'Legacy', value: 8, tournaments: 3 },
];

const COLORS = ['#2d1b69', '#ffd700', '#8b5cf6', '#06b6d4', '#10b981'];

// Enhanced yearly progression data with multiple metrics and years (limited to recent years)
const yearlyProgressionData = [
  // 2023 Data
  { month: 'Jan', year: 2023, points: 1580, wins: 52, losses: 29, draws: 9 },
  { month: 'Feb', year: 2023, points: 1640, wins: 56, losses: 31, draws: 8 },
  { month: 'Mar', year: 2023, points: 1720, wins: 61, losses: 33, draws: 10 },
  { month: 'Apr', year: 2023, points: 1790, wins: 65, losses: 35, draws: 9 },
  { month: 'May', year: 2023, points: 1860, wins: 70, losses: 37, draws: 11 },
  { month: 'Jun', year: 2023, points: 1920, wins: 74, losses: 39, draws: 10 },
  { month: 'Jul', year: 2023, points: 1980, wins: 78, losses: 41, draws: 12 },
  { month: 'Aug', year: 2023, points: 2050, wins: 83, losses: 43, draws: 11 },
  { month: 'Sep', year: 2023, points: 2120, wins: 87, losses: 45, draws: 13 },
  { month: 'Oct', year: 2023, points: 2180, wins: 92, losses: 47, draws: 12 },
  { month: 'Nov', year: 2023, points: 2240, wins: 96, losses: 49, draws: 14 },
  { month: 'Dec', year: 2023, points: 2300, wins: 100, losses: 51, draws: 13 },

  // 2024 Data
  { month: 'Jan', year: 2024, points: 1200, wins: 15, losses: 8, draws: 2 },
  { month: 'Feb', year: 2024, points: 1350, wins: 19, losses: 10, draws: 3 },
  { month: 'Mar', year: 2024, points: 1280, wins: 17, losses: 11, draws: 4 },
  { month: 'Apr', year: 2024, points: 1450, wins: 23, losses: 12, draws: 3 },
  { month: 'May', year: 2024, points: 1520, wins: 26, losses: 14, draws: 5 },
  { month: 'Jun', year: 2024, points: 1680, wins: 31, losses: 15, draws: 4 },
  { month: 'Jul', year: 2024, points: 1750, wins: 34, losses: 17, draws: 6 },
  { month: 'Aug', year: 2024, points: 1820, wins: 38, losses: 18, draws: 5 },
  { month: 'Sep', year: 2024, points: 1890, wins: 42, losses: 20, draws: 7 },
  { month: 'Oct', year: 2024, points: 1960, wins: 45, losses: 22, draws: 6 },
  { month: 'Nov', year: 2024, points: 2020, wins: 49, losses: 23, draws: 8 },
  { month: 'Dec', year: 2024, points: 2080, wins: 52, losses: 25, draws: 7 },

  // 2025 Data (Current Year)
  { month: 'Jan', year: 2025, points: 1180, wins: 14, losses: 7, draws: 3 },
  { month: 'Feb', year: 2025, points: 1420, wins: 20, losses: 9, draws: 2 },
  { month: 'Mar', year: 2025, points: 1580, wins: 26, losses: 11, draws: 4 },
  { month: 'Apr', year: 2025, points: 1740, wins: 32, losses: 13, draws: 3 },
  { month: 'May', year: 2025, points: 1890, wins: 37, losses: 15, draws: 5 },
  { month: 'Jun', year: 2025, points: 2020, wins: 43, losses: 17, draws: 4 },
  { month: 'Jul', year: 2025, points: 2180, wins: 49, losses: 19, draws: 6 },
  { month: 'Aug', year: 2025, points: 2340, wins: 55, losses: 21, draws: 5 },
  { month: 'Sep', year: 2025, points: 2480, wins: 61, losses: 23, draws: 7 },
  { month: 'Oct', year: 2025, points: 2620, wins: 67, losses: 25, draws: 6 },
  { month: 'Nov', year: 2025, points: 2750, wins: 73, losses: 27, draws: 8 },
  { month: 'Dec', year: 2025, points: 2880, wins: 79, losses: 29, draws: 7 },
];

// Frequent opponents data
const frequentOpponents = [
  {
    name: 'Marcus Rodriguez',
    wins: 8,
    losses: 5,
    draws: 2,
    scoreDifferential: '+3',
    winRate: 53,
    lastResult: 'Win',
    totalEncounters: 15
  },
  {
    name: 'Sarah Kim',
    wins: 6,
    losses: 7,
    draws: 1,
    scoreDifferential: '-1',
    winRate: 43,
    lastResult: 'Loss',
    totalEncounters: 14
  },
  {
    name: 'David Thompson',
    wins: 9,
    losses: 3,
    draws: 1,
    scoreDifferential: '+6',
    winRate: 69,
    lastResult: 'Win',
    totalEncounters: 13
  },
  {
    name: 'Lisa Chen',
    wins: 4,
    losses: 8,
    draws: 0,
    scoreDifferential: '-4',
    winRate: 33,
    lastResult: 'Loss',
    totalEncounters: 12
  },
  {
    name: 'Michael Johnson',
    wins: 7,
    losses: 4,
    draws: 1,
    scoreDifferential: '+3',
    winRate: 58,
    lastResult: 'Draw',
    totalEncounters: 12
  },
  {
    name: 'Emma Wilson',
    wins: 5,
    losses: 5,
    draws: 1,
    scoreDifferential: '0',
    winRate: 45,
    lastResult: 'Win',
    totalEncounters: 11
  },
  {
    name: 'Ryan O\'Connor',
    wins: 6,
    losses: 4,
    draws: 0,
    scoreDifferential: '+2',
    winRate: 60,
    lastResult: 'Win',
    totalEncounters: 10
  }
];

export function DetailedStatistics({ currentUser }: DetailedStatisticsProps) {
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

  const getResultIcon = (result: string) => {
    switch (result.toLowerCase()) {
      case 'win':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'loss':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'draw':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getResultText = (result: string) => {
    switch (result.toLowerCase()) {
      case 'win':
        return 'Vitória';
      case 'loss':
        return 'Derrota';
      case 'draw':
        return 'Empate';
      default:
        return result;
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Desempenho Anual</CardTitle>
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
                      formatter={(value, name) => [value, `${getMetricLabel(selectedMetric)} (${name.split('_')[1]})`]}
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

        {/* Tournament Format Performance Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Participação por Formato de Torneio</CardTitle>
            <CardDescription>Distribuição dos formatos de torneio em que você participou</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex items-center justify-center">
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formatData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Frequent Opponents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Oponentes Frequentes</CardTitle>
          <CardDescription>Seu histórico de confrontos com oponentes regulares (ordenado por total de partidas jogadas)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Oponente</TableHead>
                <TableHead className="text-center">V-D-E</TableHead>
                <TableHead className="text-center">Dif. de Placar</TableHead>
                <TableHead className="text-center">Taxa de Vitória</TableHead>
                <TableHead className="text-center">Último Resultado</TableHead>
                <TableHead className="text-center">Total de Confrontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {frequentOpponents.map((opponent, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{opponent.name}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-green-600">{opponent.wins}</span>-
                    <span className="text-red-600">{opponent.losses}</span>-
                    <span className="text-yellow-600">{opponent.draws}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={opponent.scoreDifferential.startsWith('+') ? 'default' : 
                              opponent.scoreDifferential === '0' ? 'secondary' : 'destructive'}
                    >
                      {opponent.scoreDifferential}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={opponent.winRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                      {opponent.winRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {getResultIcon(opponent.lastResult)}
                      <span>{getResultText(opponent.lastResult)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {opponent.totalEncounters}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}