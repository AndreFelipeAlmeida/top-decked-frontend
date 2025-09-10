import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { CheckCircle, XCircle, Minus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DetailedStatisticsProps {
  yearlyProgressionData: any[];
  availableYears: string[];
  frequentOpponentsData: any[]; // Prop para os dados reais dos oponentes
  performanceByFormatData: any[]; // Prop para os dados do gráfico de formato
}

const COLORS = ['#2d1b69', '#ffd700', '#8b5cf6', '#06b6d4', '#10b981'];

export function DetailedStatistics({ yearlyProgressionData, availableYears, frequentOpponentsData, performanceByFormatData }: DetailedStatisticsProps) {
  const [selectedMetric, setSelectedMetric] = useState('points');
  const [selectedYears, setSelectedYears] = useState(['2024', '2025']);

  const filteredData = yearlyProgressionData.filter(d => selectedYears.includes(d.year.toString()));

  const chartData = Array.from(new Set(filteredData.map((d: any) => d.month))).map((month: any) => {
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
      '2025': '#2d1b69',
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
      if (selectedYears.length < 5) {
        setSelectedYears([...selectedYears, year]);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Evolução de Desempenho Anual */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Desempenho Anual</CardTitle>
            <CardDescription>Compare suas métricas de desempenho ao longo dos anos selecionados</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex flex-col">
            <div className="mb-4 space-y-4 flex-shrink-0">
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
              <p className="text-xs text-muted-foreground">
                Selecione até 5 anos para comparar. Atualmente exibindo {selectedYears.length} anos.
              </p>
            </div>

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

        {/* Gráfico de Participação por Formato de Torneio (Descomentado e usando dados reais) */}
        <Card>
          <CardHeader>
            <CardTitle>Participação por Formato de Torneio</CardTitle>
            <CardDescription>Distribuição dos formatos de torneio em que você participou</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex items-center justify-center">
            {performanceByFormatData.length > 0 ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceByFormatData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="pontuacao_media"
                    >
                      {performanceByFormatData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} pts`, props.payload.nome]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de formato de torneio encontrado.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Oponentes Frequentes */}
      <Card>
        <CardHeader>
          <CardTitle>Oponentes Frequentes</CardTitle>
          <CardDescription>Seu histórico de confrontos com oponentes regulares</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Oponente</TableHead>
                <TableHead className="text-center">V-D-E</TableHead>
                <TableHead className="text-center">Dif. de Placar</TableHead>
                <TableHead className="text-center">Taxa de Vitória</TableHead>
                <TableHead className="text-center">Total de Confrontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {frequentOpponentsData && frequentOpponentsData.length > 0 ? (
                frequentOpponentsData.map((opponent, index) => {
                  const totalEncounters = (opponent.vitorias || 0) + (opponent.derrotas || 0) + (opponent.empates || 0);
                  const winRate = totalEncounters > 0 ? Math.round((opponent.vitorias / totalEncounters) * 100) : 0;
                  const scoreDifferential = (opponent.vitorias || 0) - (opponent.derrotas || 0);

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{opponent.nome}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600">{opponent.vitorias || 0}</span>-
                        <span className="text-red-600">{opponent.derrotas || 0}</span>-
                        <span className="text-yellow-600">{opponent.empates || 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={scoreDifferential > 0 ? 'default' : scoreDifferential === 0 ? 'secondary' : 'destructive'}
                        >
                          {scoreDifferential > 0 ? `+${scoreDifferential}` : scoreDifferential}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={winRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {winRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {totalEncounters}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum oponente frequente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}