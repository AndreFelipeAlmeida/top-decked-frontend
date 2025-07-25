import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Progress } from './ui/progress.tsx';
import { Trophy, TrendingUp, Calendar, Target, Medal, Users } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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

const performanceData = [
  { month: 'Jan', points: 1200 },
  { month: 'Fev', points: 1350 },
  { month: 'Mar', points: 1280 },
  { month: 'Abr', points: 1450 },
  { month: 'Mai', points: 1520 },
  { month: 'Jun', points: 1680 },
];

const recentTournaments = [
  { id: 1, name: 'Weekly Modern', date: '15-07-2025', placement: 2, participants: 32, points: 180 },
  { id: 2, name: 'Standard Showdown', date: '12-07-2025', placement: 5, participants: 24, points: 120 },
  { id: 3, name: 'Friday Night Magic', date: '11-07-2025', placement: 1, participants: 16, points: 200 },
];

export function PlayerDashboard({ onNavigate }: PlayerDashboardProps) {
  const navigateToPlayerDashboard = () => {
    onNavigate('player-dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel do Jogador</h1>
        <p className="text-muted-foreground">Bem-vindo(a) de volta, Alex! Aqui está o seu progresso em torneios.</p>
      </div>

      {/* Cartões de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.680</div>
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
            <div className="text-2xl font-bold">68%</div>
            <Progress value={68} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Torneios</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
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
            <div className="text-2xl font-bold">#12</div>
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
          <CardContent className="h-80">
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
          </CardContent>
        </Card>

        {/* Tendência de Pontuação */}
        <Card>
          <CardHeader>
            <CardTitle>Progressão de Pontos</CardTitle>
            <CardDescription>Seus pontos de ranking nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="#2d1b69"
                  strokeWidth={2}
                  dot={{ fill: '#2d1b69' }}
                />
              </LineChart>
            </ResponsiveContainer>
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
            {recentTournaments.map((tournament) => (
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
                    variant={tournament.placement === 1 ? 'default' : tournament.placement <= 3 ? 'secondary' : 'outline'}
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
              <p className="text-sm text-muted-foreground">1.680 pontos</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Anual</h3>
              <p className="text-3xl font-bold text-primary">#12</p>
              <p className="text-sm text-muted-foreground">15.240 pontos</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Geral</h3>
              <p className="text-3xl font-bold text-primary">#23</p>
              <p className="text-sm text-muted-foreground">28.950 pontos</p>
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
