import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Calendar, Users, Trophy, Plus, Upload, TrendingUp, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TournamentImport } from './TournamentImport.tsx';
import { tournamentStore } from '../data/store.ts';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

interface OrganizerDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
}

const monthlyData = [
  { month: 'Jan', tournaments: 8, participants: 245 },
  { month: 'Fev', tournaments: 12, participants: 380 },
  { month: 'Mar', tournaments: 10, participants: 320 },
  { month: 'Abr', tournaments: 15, participants: 450 },
  { month: 'Mai', tournaments: 18, participants: 520 },
  { month: 'Jun', tournaments: 22, participants: 680 },
];

const formatData = [
  { name: 'Modern', value: 35, color: '#2d1b69' },
  { name: 'Standard', value: 25, color: '#6366f1' },
  { name: 'Commander', value: 20, color: '#8b5cf6' },
  { name: 'Legacy', value: 15, color: '#ffd700' },
  { name: 'Draft', value: 5, color: '#06b6d4' },
];

const upcomingTournaments = [
  { id: 1, name: 'Modern Semanal', date: '2024-12-20', participants: 28, maxParticipants: 32, status: 'open' },
  { id: 2, name: 'Confronto Standard', date: '2024-12-22', participants: 24, maxParticipants: 24, status: 'closed' },
  { id: 3, name: 'Noite de Commander', date: '2024-12-25', participants: 8, maxParticipants: 16, status: 'open' },
  { id: 4, name: 'Torneio Legacy', date: '2024-12-28', participants: 12, maxParticipants: 20, status: 'open' },
];

const recentTournaments = [
  { id: 1, name: 'Friday Night Magic', date: '2024-12-15', participants: 32, status: 'closed', winner: 'Alex Chen' },
  { id: 2, name: 'Standard Semanal', date: '2024-12-12', participants: 24, status: 'closed', winner: 'Sarah Johnson' },
  { id: 3, name: 'Modern Masters', date: '2024-12-10', participants: 48, status: 'closed', winner: 'Mike Rodriguez' },
];

export function OrganizerDashboard({ onNavigate }: OrganizerDashboardProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const currentUser = tournamentStore.getCurrentUser(); // Fetch current user from store

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel do Organizador</h1>
        <p className="text-muted-foreground">Bem-vindo de volta! Gerencie seus torneios e acompanhe o desempenho.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-8">
        <Button 
          onClick={() => onNavigate('tournament-creation')}
          className="h-16 flex items-center space-x-3"
        >
          <Plus className="h-5 w-5" />
          <span>Criar Novo Torneio</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-16 w-full flex items-center space-x-3"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload className="h-5 w-5" />
          <span>Importar Dados do Torneio</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => onNavigate('player-rules')}
          className="h-16 flex items-center space-x-3"
        >
          <FileText className="h-5 w-5" />
          <span>Gerenciar Regras do Jogador</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Torneios Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              2 esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72</div>
            <p className="text-xs text-muted-foreground">
              +12 em relação à semana passada
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Concluídos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Comparecimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">31</div>
            <p className="text-xs text-muted-foreground">
              jogadores por evento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Mensal do Torneio</CardTitle>
            <CardDescription>Torneios e participantes ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tournaments" fill="#2d1b69" name="Torneios" />
                <Bar dataKey="participants" fill="#6366f1" name="Participantes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Formatos</CardTitle>
            <CardDescription>Formatos de torneios populares</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tournaments */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Próximos Torneios</CardTitle>
          <CardDescription>Gerencie seus eventos agendados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTournaments.map((tournament) => (
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
                      <span className="text-sm">{tournament.participants}/{tournament.maxParticipants}</span>
                    </div>
                    <Badge 
                      className={tournament.status === 'closed' ? 'bg-gray-100 text-black' : 'bg-purple-100 text-purple-800'}
                    >
                      {tournament.status === 'closed' ? 'Fechado' : 'Aberto'}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate('tournament-details')}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle>Torneios Recentes</CardTitle>
          <CardDescription>Seus últimos eventos concluídos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTournaments.map((tournament) => (
              <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                {/* Coluna da esquerda */}
                <div className="flex items-center gap-4 min-w-0">
                  <Trophy className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{tournament.name}</h3>
                    <p className="text-sm text-muted-foreground">{tournament.date}</p>
                  </div>
                </div>

                {/* Coluna da direita */}
                <div className="flex flex-col items-end gap-1 text-right">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{tournament.participants} jogadores</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Vencedor: {tournament.winner}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog for importing tournament data */}
      {currentUser && (
        <TournamentImport
          isOpen={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
          onNavigate={onNavigate}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
