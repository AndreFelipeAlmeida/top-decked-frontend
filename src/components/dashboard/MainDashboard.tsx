import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Progress } from '../ui/progress.tsx';
import { Trophy, TrendingUp, Calendar, Target, Medal, Users, BarChart3 } from 'lucide-react';
import { User } from '../../data/store.ts';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface MainDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
  onNavigateToTournament: (tournamentId: string) => void;
  currentUser: User | null;
}

const recentTournaments = [
  { id: 1, name: 'Weekly Modern', date: '2024-12-15', placement: 2, participants: 32, points: 180 },
  { id: 2, name: 'Standard Showdown', date: '2024-12-10', placement: 5, participants: 24, points: 120 },
  { id: 3, name: 'Friday Night Magic', date: '2024-12-08', placement: 1, participants: 16, points: 200 },
  { id: 4, name: 'Commander Night', date: '2024-12-05', placement: 3, participants: 12, points: 100 },
];

// Player statistics
const playerStats = {
  tournaments: 42,
  gamesPlayed: 186,
  wins: 124,
  losses: 45,
  draws: 17,
  placements: {
    first: 8,
    second: 12,
    topFour: 18,
    topEight: 28
  }
};

export function MainDashboard({ onNavigate, onNavigateToTournament, currentUser }: MainDashboardProps) {
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

  // Calculate win rate
  const winRate = Math.round((playerStats.wins / playerStats.gamesPlayed) * 100);

  return (
    <div className="space-y-8">
      {/* General Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Vitória</CardTitle>
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
            <div className="text-2xl font-bold">{playerStats.tournaments}</div>
            <p className="text-xs text-muted-foreground">
              Participados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partidas Jogadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerStats.gamesPlayed}</div>
            <p className="text-xs text-muted-foreground">
              Total de partidas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recorde V-D-E</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerStats.wins}-{playerStats.losses}-{playerStats.draws}</div>
            <p className="text-xs text-muted-foreground">
              Vitória-Derrota-Empate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placement Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Classificações em Torneios</CardTitle>
          <CardDescription>Suas posições finais nos torneios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="font-semibold text-lg">1º Lugar</h3>
              <p className="text-3xl font-bold text-primary">{playerStats.placements.first}</p>
              <p className="text-sm text-muted-foreground">Campeão</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Medal className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg">2º Lugar</h3>
              <p className="text-3xl font-bold text-primary">{playerStats.placements.second}</p>
              <p className="text-sm text-muted-foreground">Vice-campeão</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Medal className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg">TOP 4</h3>
              <p className="text-3xl font-bold text-primary">{playerStats.placements.topFour}</p>
              <p className="text-sm text-muted-foreground">Semifinalista</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Medal className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg flex items-center justify-center space-x-2">
                <span>TOP 8</span>
              </h3>
              <p className="text-3xl font-bold text-primary">{playerStats.placements.topEight}</p>
              <p className="text-sm text-muted-foreground">Quartas de Final</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tournaments */}
      <Card>
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

      {/* Current Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Classificações Atuais</CardTitle>
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
              <span>Ver Classificações Completas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}