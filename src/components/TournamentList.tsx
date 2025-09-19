import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Input } from './ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { Calendar, Users, Trophy, MapPin, Search, Filter, Plus, ArrowLeft } from 'lucide-react';
import { User, Tournament } from '../data/store.ts';

interface JogadorTorneioLinkPublico {
  jogador_id: number; 
  torneio_id: string;
  ponto: number;
}

interface RodadaBase {
  id: string;
  numero: number;
  data: string;
}

interface LojaPublico {
    id: number;
    nome: string;
    email: string;
}

interface BackendTournament {
  id: string;
  nome: string;
  descricao: string | null;
  cidade: string | null;
  data_inicio: string;
  loja_id: number;
  loja?: LojaPublico;
  formato: string | null;
  taxa: number;
  premios: string | null;
  estrutura: string | null;
  vagas: number;
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'FINALIZADO';
  jogadores: JogadorTorneioLinkPublico[];
  rodadas: RodadaBase[];
  regras_adicionais: any[];
}

interface PlayerTournamentLink {
  torneio_id: string;
}

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

interface TournamentListProps {
  onNavigate: (page: Page, data?: any) => void;
  onNavigateToTournament: (tournamentId: string) => void;
  currentUser: User | null;
}

const mapBackendToFrontend = (backendData: BackendTournament[]): Tournament[] => {
  if (!backendData || !Array.isArray(backendData)) {
      console.error("Dados de backend inválidos. Esperado um array.");
      return [];
  }

  return backendData.map(t => {
      let status: 'open' | 'in-progress' | 'finished';
      if (t.status === "FINALIZADO") {
        status = 'finished';
      } else if (t.status === "EM_ANDAMENTO") {
        status = 'in-progress';
      } else {
        status = 'open';
      }

    return {
      id: t.id ? t.id.toString() : "",
      organizerUserId: t.loja_id?.toString() || "0",
      ruleId: 0, 
      name: t.nome || "Torneio sem nome",
      organizerId: (t.loja_id ?? t.loja?.id)?.toString() || "0",
      organizerName: t.loja?.nome || "Organizador não informado",
      date: t.data_inicio || new Date().toISOString(),
      time: "Horário não informado",
      format: t.formato || 'Formato não informado',
      store: t.cidade || 'Local não informado',
      description: t.descricao || '',
      prizes: t.premios || '',
      maxParticipants: t.vagas ?? 0,
      entryFee: `$${t.taxa ?? 0}`,
      structure: t.estrutura || '',
      rounds: t.rodadas?.length || 0,
      status: status,
      currentRound: t.rodadas?.length || 0,
      participants: t.jogadores?.map(p => ({ 
        id: p.jogador_id?.toString() || "", 
        userId: p.jogador_id?.toString() || "",
        userName: "Nome não disponível",
        registeredAt: new Date().toISOString(),
        points: p.ponto ?? 0,
        wins: 0, losses: 0, draws: 0, currentStanding: 0
      })) || [],
      matches: [],
      bracket: [],
      createdAt: new Date().toISOString(),
      hasImportedResults: false,
    };
  });
};

export function TournamentList({ onNavigate, onNavigateToTournament, currentUser }: TournamentListProps) {
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const allResponse = await fetch(`${API_URL}/lojas/torneios/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!allResponse.ok) {
          throw new Error("Falha ao buscar todos os torneios.");
        }
        const allData: BackendTournament[] = await allResponse.json();
        const mappedAllTournaments = mapBackendToFrontend(allData);
        setAllTournaments(mappedAllTournaments);

        if (currentUser) {
          if (currentUser.type === 'player') {
            try {
              const playerResponse = await fetch(`${API_URL}/jogadores/torneios/inscritos`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (!playerResponse.ok) {
                 if (playerResponse.status !== 404) {
                     console.error("Aviso: Falha ao buscar torneios do jogador.");
                 }
                 setMyTournaments([]);
              } else {
                const specificData: PlayerTournamentLink[] = await playerResponse.json();
                const myTournamentIds = new Set(specificData.map(link => link.torneio_id.toString()));
                const myFilteredTournaments = mappedAllTournaments.filter(t => myTournamentIds.has(t.id));
                setMyTournaments(myFilteredTournaments);
              }
            } catch (playerError: any) {
              console.error("Erro ao buscar torneios do jogador:", playerError.message);
            }
          } else if (currentUser.type === 'organizer') {
            const organizerResponse = await fetch(`${API_URL}/lojas/torneios/loja`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!organizerResponse.ok) {
              if (organizerResponse.status !== 404) {
                  throw new Error("Falha ao buscar torneios do organizador.");
              }
              setMyTournaments([]);
            } else {
              const specificData: BackendTournament[] = await organizerResponse.json();
              const mappedOrganizerTournaments = mapBackendToFrontend(specificData);
              setMyTournaments(mappedOrganizerTournaments);
            }
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, [currentUser]);

  const getStatusStyle = (status: 'open' | 'in-progress' | 'finished') => {
    switch (status) {
      case 'open':
        return 'bg-purple-100 text-purple-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'finished':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-black';
    }
  };

  const getStatusText = (status: 'open' | 'in-progress' | 'finished') => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'in-progress':
        return 'Em Andamento';
      case 'finished':
        return 'Finalizado';
      default:
        return 'Desconhecido';
    }
  };

  const filterTournaments = (tournaments: Tournament[]) => {
    return tournaments.filter(tournament => {
      const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tournament.organizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tournament.store.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'open') {
        matchesStatus = tournament.status === 'open';
      } else if (statusFilter === 'in-progress') {
        matchesStatus = tournament.status === 'in-progress';
      } else if (statusFilter === 'closed') {
        matchesStatus = tournament.status === 'finished';
      }

      const matchesFormat = formatFilter === 'all' || (tournament.format && tournament.format.toLowerCase() === formatFilter.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesFormat;
    });
  };

  const filteredAllTournaments = filterTournaments(allTournaments);
  const filteredMyTournaments = filterTournaments(myTournaments);

  const availableFormats = ['all', ...Array.from(new Set(allTournaments.map(t => t.format)))];
  const availableStatuses = ['all', 'open', 'in-progress', 'finished'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando torneios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Erro ao carregar torneios: {error}</p>
      </div>
    );
  }

  const renderTournamentCard = (tournament: Tournament, showRegistrationButton = false) => {
    const isRegistered = currentUser?.type === 'player' && 
                        myTournaments.some(t => t.id === tournament.id);
    
    return (
      <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg">{tournament.name}</CardTitle>
              <CardDescription>Organizado por {tournament.organizerName}</CardDescription>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className={getStatusStyle(tournament.status as any)}>
                {getStatusText(tournament.status as any)}
              </Badge>
              {isRegistered && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-800 border-green-200 hover:bg-green-50 hover:text-green-800 rounded-md">
                  Inscrito
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{tournament.date
              ? tournament.date.split("T")[0].split("-").reverse().join("/")
              : ""}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{tournament.store}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span>{tournament.format}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{tournament.participants.length}/{tournament.maxParticipants}</span>
            </div>
          </div>
          
          {tournament.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {tournament.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Inscrição:</span> {tournament.entryFee}
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm"
                onClick={() => onNavigateToTournament(tournament.id.toString())}
              >
                Ver Detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar torneios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'Todos os Status' : status === 'open' ? 'Abertos' : status === 'in-progress' ? 'Em Andamento' : 'Finalizados'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Formato</label>
              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFormats.map(format => (
                    <SelectItem key={format} value={format}>
                      {format === 'all' ? 'Todos os Formatos' : format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={currentUser?.type === 'player' ? 'all' : 'my-tournaments'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos os Torneios</TabsTrigger>
          <TabsTrigger value="my-tournaments">
            {currentUser?.type === 'player' ? 'Meus Torneios' : 'Meus Torneios'}
          </TabsTrigger>
          {currentUser?.type === 'player' && (
            <TabsTrigger value="available">Disponíveis para Inscrição</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllTournaments.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum torneio encontrado com os critérios de busca</p>
              </div>
            ) : (
              filteredAllTournaments.map(tournament => 
                renderTournamentCard(tournament, currentUser?.type === 'player')
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-tournaments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMyTournaments.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Você ainda não tem nenhum torneio</p>
                  <Button 
                    className="mt-4"
                    onClick={() => currentUser?.type === 'player' ? onNavigate('tournament-list') : onNavigate('tournament-creation')}
                  >
                    {currentUser?.type === 'player' ? 'Navegar Torneios' : 'Criar Seu Primeiro Torneio'}
                  </Button>
                </div>
              ) : (
                filteredMyTournaments.map(tournament => renderTournamentCard(tournament))
              )
            }
          </div>
        </TabsContent>

        {currentUser?.type === 'player' && (
          <TabsContent value="available" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAllTournaments
                .filter(t => 
                  t.status === 'open' && 
                  !myTournaments.some(mt => mt.id === t.id) &&
                  t.participants.length < t.maxParticipants
                )
                .map(tournament => renderTournamentCard(tournament, true))
              }
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}