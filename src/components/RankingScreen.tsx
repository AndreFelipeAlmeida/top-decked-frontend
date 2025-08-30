import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Input } from './ui/input.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Avatar, AvatarFallback } from './ui/avatar.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { Trophy, Medal, Crown, Search, Filter, Users, Star, ArrowLeft, Plus } from 'lucide-react';
import { tournamentStore, User } from '../data/store.ts';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface RankingScreenProps {
  onNavigate: (page: Page, data?: any) => void;
  currentUser: User | null;
}

export function RankingScreen({ onNavigate, currentUser }: RankingScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState('all');
  const [globalRankings, setGlobalRankings] = useState<User[]>([]);
  const [organizerRankings, setOrganizerRankings] = useState<any[]>([]);
  const [organizers, setOrganizers] = useState<User[]>([]);
  const isOrganizer = currentUser?.type === 'organizer';

  useEffect(() => {
    // Get global rankings
    const rankings = tournamentStore.getPlayerRankings();
    setGlobalRankings(rankings);

    // Get all organizers
    const allUsers = tournamentStore.getAllUsers();
    const organizerUsers = allUsers.filter(u => u.type === 'organizer');
    setOrganizers(organizerUsers);

    // Set default organizer
    if (organizerUsers.length > 0 && selectedOrganizer === 'all') {
      setSelectedOrganizer(organizerUsers[0].id);
    }
  }, [selectedOrganizer]);

  useEffect(() => {
    if (selectedOrganizer !== 'all') {
      const rankings = tournamentStore.getRankingsByOrganizer(selectedOrganizer);
      setOrganizerRankings(rankings);
    }
  }, [selectedOrganizer]);

  const filteredGlobalRankings = globalRankings.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.store && player.store.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredOrganizerRankings = organizerRankings.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.store && player.store.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground">#{rank}</span>;
    }
  };

  const renderPlayerRow = (player: any, index: number, isOrganizerRanking = false) => {
    const stats = isOrganizerRanking ? player.organizerStats : player.stats;
    const rank = index + 1;

    const handlePlayerClick = () => {
      if (isOrganizer) {
        onNavigate('player-profile', { playerId: player.id });
      } else if (currentUser?.id === player.id) {
        onNavigate('player-profile');
      }
    };

    return (
      <div 
        key={player.id} 
        className={`flex items-center justify-between p-4 border rounded-lg ${
          (isOrganizer || currentUser?.id === player.id) 
            ? 'hover:bg-secondary/50 cursor-pointer' 
            : 'cursor-default'
        }`}
        onClick={handlePlayerClick}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 text-center">
            {getRankIcon(rank)}
          </div>
          <Avatar className="h-10 w-10">
            <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{player.name}</div>
            <div className="text-sm text-muted-foreground">{player.store}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <div className="font-bold">{stats?.totalPoints || stats?.points || 0}</div>
            <div className="text-sm text-muted-foreground">Pontos</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{stats?.winRate || 0}%</div>
            <div className="text-sm text-muted-foreground">Taxa de Vitórias</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{stats?.tournaments || 0}</div>
            <div className="text-sm text-muted-foreground">Eventos</div>
          </div>
          <div className="text-center">
            <div className="font-bold">
              {stats?.wins || 0}-{stats?.losses || 0}-{stats?.draws || 0}
            </div>
            <div className="text-sm text-muted-foreground">V-D-E</div>
          </div>
        </div>
      </div>
    );
  };

  const topGlobalPlayers = filteredGlobalRankings.slice(0, 3);
  const topOrganizerPlayers = filteredOrganizerRankings.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate(currentUser?.type === 'player' ? 'player-dashboard' : 'organizer-dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o Painel
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Torneios</h1>
            <p className="text-muted-foreground">
              {currentUser?.type === 'player' ? 'Descubra e participe de torneios' : 'Gerencie seus torneios'}
            </p>
          </div>
          {currentUser?.type === 'organizer' && (
            <Button onClick={() => onNavigate('tournament-creation')} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Criar Torneio</span>
            </Button>
          )}
        </div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Classificação de Jogadores</h1>
        <p className="text-muted-foreground">Rankings globais e estatísticas de torneios</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Jogadores</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou loja..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Loja (para rankings da loja)</label>
              <Select value={selectedOrganizer} onValueChange={setSelectedOrganizer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Organizadores</SelectItem>
                  {organizers.map(organizer => (
                    <SelectItem key={organizer.id} value={organizer.id}>
                      {organizer.name} ({organizer.store})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">Rankings Globais</TabsTrigger>
          <TabsTrigger value="organizer">Por Loja</TabsTrigger>
          <TabsTrigger value="highlights">Destaques do Mês</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-6">
          {/* Top 3 Players */}
          <Card>
            <CardHeader>
              <CardTitle>Melhores Jogadores</CardTitle>
              <CardDescription>Líderes globais de torneios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topGlobalPlayers.map((player, index) => (
                  <Card key={player.id} className="relative overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="mb-4">
                        {getRankIcon(index + 1)}
                      </div>
                      <Avatar className="h-16 w-16 mx-auto mb-4">
                        <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold mb-2">{player.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{player.store}</p>
                      <div className="text-2xl font-bold text-primary mb-2">{player.stats?.totalPoints || 0}</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {player.stats?.wins || 0}-{player.stats?.losses || 0}-{player.stats?.draws || 0} ({player.stats?.winRate || 0}%)
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full Rankings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Rankings Globais Completos</CardTitle>
              <CardDescription>Classificação completa em todos os torneios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredGlobalRankings.map((player, index) => 
                  renderPlayerRow(player, index)
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizer" className="space-y-6">
          {selectedOrganizer === 'all' ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Selecione um Organizador</h3>
                <p className="text-muted-foreground mb-4">
                  Escolha um organizador no filtro acima para ver os rankings de seus torneios
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Organizer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Rankings por {organizers.find(o => o.id === selectedOrganizer)?.name}
                  </CardTitle>
                  <CardDescription>
                    Desempenho dos jogadores nos torneios de {organizers.find(o => o.id === selectedOrganizer)?.store}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Top 3 for this organizer */}
              {topOrganizerPlayers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Melhores Desempenhos</CardTitle>
                    <CardDescription>Melhores jogadores nos torneios deste organizador</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {topOrganizerPlayers.map((player, index) => (
                        <Card key={player.id} className="relative overflow-hidden">
                          <CardContent className="p-6 text-center">
                            <div className="mb-4">
                              {getRankIcon(index + 1)}
                            </div>
                            <Avatar className="h-16 w-16 mx-auto mb-4">
                              <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-bold mb-2">{player.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{player.store}</p>
                            <div className="text-2xl font-bold text-primary mb-2">{player.organizerStats.points}</div>
                            <div className="text-sm text-muted-foreground mb-4">
                              {player.organizerStats.wins}-{player.organizerStats.losses}-{player.organizerStats.draws}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {player.organizerStats.tournaments} torneios
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Full organizer rankings */}
              <Card>
                <CardHeader>
                  <CardTitle>Rankings Completos</CardTitle>
                  <CardDescription>Todos os jogadores que participaram desses torneios</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredOrganizerRankings.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum dado de jogador disponível para este organizador</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredOrganizerRankings.map((player, index) => 
                        renderPlayerRow(player, index, true)
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="highlights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Jogador do Mês</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold mb-2">Alex Chen</h3>
                  <p className="text-sm text-muted-foreground mb-4">15 vitórias em torneios</p>
                  <Badge variant="default">Campeão</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-blue-500" />
                  <span>Maior Evolução</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold mb-2">Mike Rodriguez</h3>
                  <p className="text-sm text-muted-foreground mb-4">+450 pontos ganhos</p>
                  <Badge variant="secondary">Estrela em Ascensão</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <span>Mais Ativo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarFallback>ED</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold mb-2">Emma Davis</h3>
                  <p className="text-sm text-muted-foreground mb-4">28 torneios jogados</p>
                  <Badge variant="outline">Dedicação</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
