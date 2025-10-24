import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Input } from './ui/input.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Avatar, AvatarFallback } from './ui/avatar.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { Trophy, Medal, Crown, Search, Filter, Users, Star, ArrowLeft, Plus } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

interface RankingScreenProps {
  onNavigate: (page: Page, data?: any) => void;
  currentUser: { id: string; type: 'player' | 'organizer'; name: string } | null;
}

interface PlayerRanking {
  nome_jogador: string;
  nome_loja: string;
  pontos: number;
  torneios: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  taxa_vitoria: number;
}

export function RankingScreen({ onNavigate, currentUser }: RankingScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState('all');
  const [globalRankings, setGlobalRankings] = useState<PlayerRanking[]>([]);
  const [organizerRankings, setOrganizerRankings] = useState<PlayerRanking[]>([]);
  const [organizers, setOrganizers] = useState<string[]>([]);

  // Fetch rankings from API
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch(`${API_URL}/ranking/lojas`);
        console.log(response)
        if (!response.ok) {
          console.error('Erro ao buscar rankings:', response.status, response.statusText);
          return;
        }
        const data: PlayerRanking[] = await response.json();
        setGlobalRankings(data);

        // Lista de lojas únicas
        const uniqueOrganizers = Array.from(new Set(data.map(p => p.nome_loja)));
        setOrganizers(uniqueOrganizers);

        if (uniqueOrganizers.length > 0 && selectedOrganizer === 'all') {
          setSelectedOrganizer(uniqueOrganizers[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar rankings:', error);
      }
    };

    fetchRankings();
  }, []);

  // Filtra rankings por loja selecionada
  useEffect(() => {
    if (selectedOrganizer === 'all') {
      setOrganizerRankings([]);
    } else {
      const filtered = globalRankings.filter(p => p.nome_loja === selectedOrganizer);
      setOrganizerRankings(filtered);
    }
  }, [selectedOrganizer, globalRankings]);

  const filteredGlobalRankings = globalRankings.filter(player =>
    player.nome_jogador.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nome_loja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrganizerRankings = organizerRankings.filter(player =>
    player.nome_jogador.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nome_loja.toLowerCase().includes(searchTerm.toLowerCase())
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

  const renderPlayerRow = (player: PlayerRanking, index: number) => {
    const rank = index + 1;
    return (
      <div
        key={player.nome_jogador + player.nome_loja}
        className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 text-center">{getRankIcon(rank)}</div>
          <Avatar className="h-10 w-10">
            <AvatarFallback>{player.nome_jogador.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{player.nome_jogador}</div>
            <div className="text-sm text-muted-foreground">{player.nome_loja}</div>
          </div>
        </div>
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <div className="font-bold">{player.pontos}</div>
            <div className="text-sm text-muted-foreground">Pontos</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{player.taxa_vitoria}%</div>
            <div className="text-sm text-muted-foreground">Taxa de Vitória</div>
          </div>
          <div className="text-center">
            <div className="font-bold">{player.torneios}</div>
            <div className="text-sm text-muted-foreground">Eventos</div>
          </div>
          <div className="text-center">
            <div className="font-bold">
              {player.vitorias}-{player.derrotas}-{player.empates}
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
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate(currentUser?.type === 'player' ? 'player-dashboard' : 'organizer-dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o Painel
        </Button>
      </div>

      {/* Rankings Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Classificação de Jogadores</h1>
        <p className="text-muted-foreground">Rankings e estatísticas de torneios</p>
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
                  <SelectItem value="all">Todas as Lojas</SelectItem>
                  {organizers.map(loja => (
                    <SelectItem key={loja} value={loja}>
                      {loja}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global">Ranking Geral</TabsTrigger>
          <TabsTrigger value="organizer">Ranking Mensal</TabsTrigger>
        </TabsList>

        {/* Global Rankings */}
        <TabsContent value="global" className="space-y-6">
          {/* Top 3 Players */}
          <Card>
            <CardHeader>
              <CardTitle>Melhores Jogadores</CardTitle>
              <CardDescription>Líderes gerais de torneios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {topGlobalPlayers.map((player, index) => (
                  <Card key={player.nome_jogador + player.nome_loja} className="p-6 text-center">
                    <CardContent className="flex flex-col items-center justify-center space-y-2">
                      <div>{getRankIcon(index + 1)}</div>
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>{player.nome_jogador.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold">{player.nome_jogador}</h3>
                      <p className="text-sm text-muted-foreground">{player.nome_loja}</p>
                      <div className="text-2xl font-bold text-primary">{player.pontos}</div>
                      <div className="text-sm text-muted-foreground">
                        {player.vitorias}-{player.derrotas}-{player.empates}
                      </div>
                      <div className="text-xs text-muted-foreground">{player.torneios} torneios</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full Global Rankings */}
          <Card>
            <CardHeader>
              <CardTitle>Rankings Globais Completos</CardTitle>
              <CardDescription>Classificação completa em todos os torneios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredGlobalRankings.map(renderPlayerRow)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizer Rankings */}
        <TabsContent value="organizer" className="space-y-6">
          {selectedOrganizer === 'all' ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Selecione uma Loja</h3>
                <p className="text-muted-foreground mb-4">Escolha uma loja no filtro acima para ver os rankings</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Rankings por {selectedOrganizer}</CardTitle>
                  <CardDescription>Desempenho dos jogadores neste mês</CardDescription>
                </CardHeader>
              </Card>

              {topOrganizerPlayers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Melhores Desempenhos</CardTitle>
                    <CardDescription>Top jogadores da loja selecionada</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {topOrganizerPlayers.map((player, index) => (
                        <Card key={player.nome_jogador + player.nome_loja} className="relative overflow-hidden">
                          <CardContent className="p-6 text-center">
                            <div className="mb-4">{getRankIcon(index + 1)}</div>
                            <Avatar className="h-16 w-16 mx-auto mb-4">
                              <AvatarFallback>{player.nome_jogador.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-bold mb-2">{player.nome_jogador}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{player.nome_loja}</p>
                            <div className="text-2xl font-bold text-primary mb-2">{player.pontos}</div>
                            <div className="text-sm text-muted-foreground mb-4">
                              {player.vitorias}-{player.derrotas}-{player.empates} ({player.taxa_vitoria}%)
                            </div>
                            <div className="text-xs text-muted-foreground">{player.torneios} torneios</div>
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
                  <CardDescription>Todos os jogadores da loja selecionada</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredOrganizerRankings.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum dado de jogador disponível para esta loja</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredOrganizerRankings.map(renderPlayerRow)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Highlights */}
        <TabsContent value="highlights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Destaques fixos ou futuros */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
