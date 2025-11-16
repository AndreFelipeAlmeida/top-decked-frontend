import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { Progress } from '../ui/progress.tsx';
import { Trophy, TrendingUp, Calendar, Target, Medal, Users, BarChart3, Store } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel.tsx';
import { ImageWithFallback } from '../../figma/ImageWithFallback.tsx';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

export interface StoreTCG {
  foto?: string;
}

export interface Organizer {
  id: number
  nome: string;
  endereco: string;
  banner?: string;
  usuario: StoreTCG;
  n_torneios: number;
}

interface MainDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
  onNavigateToTournament: (tournamentId: string) => void;
  playerStats: any;
  recentTournaments: any[];
  // Nova prop para as estatísticas de colocação
  placementStats: {
    firstPlace: number;
    secondPlace: number;
    topFour: number;
    topEight: number;
  };
  organizers: Organizer[]
}


export function MainDashboard({ onNavigate, onNavigateToTournament, playerStats, recentTournaments, placementStats, organizers }: MainDashboardProps) {
  console.log(organizers)
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const stats = playerStats || {};

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

  const winRate = stats.taxa_vitoria || 0;
  const gamesPlayed = (stats.vitorias || 0) + (stats.derrotas || 0) + (stats.empates || 0);
  return (
    <div className="space-y-8">
      {/* Store Advertisement Carousel */}
      {organizers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <span>Featured Stores</span>
            </CardTitle>
            <CardDescription>Discover stores hosting tournaments in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel 
              className="w-full"
              plugins={[autoplayPlugin.current]}
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {organizers.map((organizer) => (
                  <CarouselItem key={organizer.id}>
                    <div className="p-1">
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-purple-100 to-indigo-100">
                          <ImageWithFallback 
                            src={organizer.banner} 
                            alt={organizer.nome}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-center space-x-3">
                              {organizer.usuario.foto && (
                                <div className="flex-shrink-0">
                                  <div className="h-12 w-12 rounded-full border-2 border-white overflow-hidden bg-white">
                                    <ImageWithFallback 
                                      src={organizer.usuario.foto} 
                                      alt={organizer.nome}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-white">{organizer.nome}</h3>
                                <p className="text-sm text-white/90">{organizer.n_torneios || 0} tournaments hosted</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            {organizer.endereco && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{organizer.endereco}</p>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => onNavigate('tournament-list')}
                            >
                              View Tournaments
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      )}
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
            <CardTitle className="text-sm font-medium">Partidas Jogadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gamesPlayed}</div>
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
            <div className="text-2xl font-bold">{stats.vitorias || 0}-{stats.derrotas || 0}-{stats.empates || 0}</div>
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
              <p className="text-3xl font-bold text-primary">{placementStats.firstPlace}</p>
              <p className="text-sm text-muted-foreground">Campeão</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Medal className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg">2º Lugar</h3>
              <p className="text-3xl font-bold text-primary">{placementStats.secondPlace}</p>
              <p className="text-sm text-muted-foreground">Vice-campeão</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Medal className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg">TOP 4</h3>
              <p className="text-3xl font-bold text-primary">{placementStats.topFour}</p>
              <p className="text-sm text-muted-foreground">Semifinalista</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Medal className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg flex items-center justify-center space-x-2">
                <span>TOP 8</span>
              </h3>
              <p className="text-3xl font-bold text-primary">{placementStats.topEight}</p>
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
