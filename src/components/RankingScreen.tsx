import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Input } from './ui/input.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Avatar, AvatarFallback } from './ui/avatar.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { Trophy, Medal, Crown, Search, Filter, Users, Star, ArrowLeft, Plus } from 'lucide-react';

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
  const [selectedOrganizer, setSelectedOrganizer] = useState('');
  const [globalRankings, setGlobalRankings] = useState<PlayerRanking[]>([]);
  const [organizerRankings, setOrganizerRankings] = useState<PlayerRanking[]>([]);
  const [organizers, setOrganizers] = useState<string[]>([]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch('http://localhost:8000/ranking/lojas');
        if (!response.ok) {
          console.error('Erro ao buscar rankings:', response.status, response.statusText);
          return;
        }
        const data: PlayerRanking[] = await response.json();
        setGlobalRankings(data);

        // Lista de lojas únicas
        const uniqueOrganizers = Array.from(new Set(data.map(p => p.nome_loja)));
        setOrganizers(uniqueOrganizers);

        // Seleciona primeira loja como default
        if (uniqueOrganizers.length > 0 && !selectedOrganizer) {
          setSelectedOrganizer(uniqueOrganizers[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar rankings:', error);
      }
    };

    fetchRankings();
  }, []);

  useEffect(() => {
    if (selectedOrganizer) {
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
        onClick={(e) => e.preventDefault()}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 text-center">
            {getRankIcon(rank)}
          </div>
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

      {/* Filtros */}
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
                  {organizers.map((nome_loja) => (
                    <SelectItem key={nome_loja} value={nome_loja}>
                      {nome_loja}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings */}
      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">Rankings Gerais</TabsTrigger>
          <TabsTrigger value="organizer">Rankings Mensal</TabsTrigger>
          <TabsTrigger value="highlights">Destaques do Mês</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Melhores Jogadores</CardTitle>
              <CardDescription>Líderes gerais da loja selecionada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topGlobalPlayers.map((player, index) => renderPlayerRow(player, index))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rankings Completos</CardTitle>
              <CardDescription>Todos os jogadores da loja selecionada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">{filteredGlobalRankings.map(renderPlayerRow)}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizer" className="space-y-6">
          {selectedOrganizer ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Rankings Mensal</CardTitle>
                  <CardDescription>Desempenho dos jogadores neste mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">{filteredOrganizerRankings.map(renderPlayerRow)}</div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Selecione uma loja</h3>
                <p className="text-muted-foreground mb-4">Escolha uma loja no filtro acima para ver os rankings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="highlights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Destaques podem ser preenchidos manualmente */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}