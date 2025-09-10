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
  playerStats: any; // Dados das estatísticas do jogador
  recentTournaments: any[]; // Dados dos torneios recentes
}

export function MainDashboard({ onNavigate, onNavigateToTournament, playerStats, recentTournaments }: MainDashboardProps) {

  // Remova a verificação inicial para não renderizar nada.
  // if (!playerStats) {
  //   return null; 
  // }

  const stats = playerStats || {};

  // Helper function to get ranking badge styles
  const getRankingBadgeStyles = (placement: number) => {
    switch (placement) {
      case 1:
        return {
          className: 'text-white bg-yellow-500 hover:bg-yellow-500 border-yellow-500',
          variant: 'default' as const
        };
      case 2:
        return {
          className: 'text-white bg-gray-400 hover:bg-gray-400 border-gray-400',
          variant: 'default' as const
        };
      case 3:
        return {
          className: 'text-white bg-amber-600 hover:bg-amber-600 border-amber-600',
          variant: 'default' as const
        };
      default:
        return {
          className: 'text-muted-foreground bg-secondary hover:bg-secondary border-border',
          variant: 'outline' as const
        };
    }
  };

  // Use dados padrão caso playerStats não exista
  const winRate = stats.taxa_vitoria || 0;
  const gamesPlayed = (stats.vitorias || 0) + (stats.derrotas || 0) + (stats.empates || 0);

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
            <div className="text-2xl font-bold">{stats.torneio_totais || 0}</div>
            <p className="text-xs text-muted-foreground">
              Participados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pontos_totais || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total de pontos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recorde V-D-E</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vitorias || 0}-{stats.derrotas || 0}-{stats.empates || 0}</div>
            <p className="text-xs text-muted-foreground">
              Vitória-Derrota-Empate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle>Torneios Recentes</CardTitle>
          <CardDescription>Seus últimos resultados em torneios</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTournaments && recentTournaments.length > 0 ? (
            <div className="space-y-4">
              {recentTournaments.map((tournament) => {
                const badgeStyles = getRankingBadgeStyles(tournament.placement);
                return (
                  <div
                    key={tournament.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => onNavigateToTournament(tournament.id)}
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum torneio recente encontrado.
            </div>
          )}
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
              <p className="text-3xl font-bold text-primary">#{stats.rank_mensal || '-'}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Anual</h3>
              <p className="text-3xl font-bold text-primary">#{stats.rank_anual || '-'}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Geral</h3>
              <p className="text-3xl font-bold text-primary">#{stats.rank_geral || '-'}</p>
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