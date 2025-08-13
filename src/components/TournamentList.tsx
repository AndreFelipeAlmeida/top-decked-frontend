import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Input } from './ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { Calendar, Users, Trophy, MapPin, Search, Filter, Plus, ArrowLeft } from 'lucide-react';
import { tournamentStore, Tournament, User } from '../data/store.ts';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

interface TournamentListProps {
  onNavigate: (page: Page, data?: any) => void;
  onNavigateToTournament: (tournamentId: string) => void;
  currentUser: User | null;
}

export function TournamentList({ onNavigate, onNavigateToTournament, currentUser }: TournamentListProps) {
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [playerTournaments, setPlayerTournaments] = useState<Tournament[]>([]);
  const [organizerTournaments, setOrganizerTournaments] = useState<Tournament[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');

  useEffect(() => {
    const tournaments = tournamentStore.getAllTournaments();
    setAllTournaments(tournaments);

    if (currentUser) {
      if (currentUser.type === 'player') {
        const playerTourns = tournamentStore.getTournamentsByPlayer(currentUser.id);
        setPlayerTournaments(playerTourns);
      } else if (currentUser.type === 'organizer') {
        const organizerTourns = tournamentStore.getTournamentsByOrganizer(currentUser.id);
        setOrganizerTournaments(organizerTourns);
      }
    }
  }, [currentUser]);

  const getStatusStyle = (status: Tournament['status']) => {
    // Determine if tournament is "Open" (upcoming, registration, in-progress) or "Closed" (completed)
    const isOpen = status === 'open';
    
    if (isOpen) {
      return 'bg-purple-100 text-purple-800';
    } else {
      return 'bg-gray-100 text-black';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    // Simplified status text: only "Open" or "Closed"
    const isOpen = status === 'open';
    return isOpen ? 'Aberto' : 'Fechado';
  };

  const filterTournaments = (tournaments: Tournament[]) => {
    return tournaments.filter(tournament => {
      const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tournament.organizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tournament.store.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Updated status filtering logic for "open"/"closed" filter
      let matchesStatus = true;
      if (statusFilter === 'open') {
        matchesStatus = tournament.status === 'open';
      } else if (statusFilter === 'closed') {
        matchesStatus = tournament.status === 'closed';
      }
      // If statusFilter is 'all', matchesStatus remains true
      
      const matchesFormat = formatFilter === 'all' || tournament.format.toLowerCase() === formatFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesFormat;
    });
  };

  const renderTournamentCard = (tournament: Tournament, showRegistrationButton = false) => {
    const isRegistered = currentUser?.type === 'player' && 
                        tournament.participants.some(p => p.userId === currentUser.id);
    const canRegister = currentUser?.type === 'player' && 
                       !isRegistered && 
                       tournament.status === 'open' &&
                       tournament.participants.length < tournament.maxParticipants;

    return (
      <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg">{tournament.name}</CardTitle>
              <CardDescription>Organizado por {tournament.organizerName}</CardDescription>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className={getStatusStyle(tournament.status)}>
                {getStatusText(tournament.status)}
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
              <span>{new Date(tournament.date).toLocaleDateString()}</span>
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
              {canRegister && showRegistrationButton && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToTournament(tournament.id);
                  }}
                >
                  Inscrever-se
                </Button>
              )}
              <Button 
                size="sm"
                onClick={() => onNavigateToTournament(tournament.id)}
              >
                Ver Detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const filteredAllTournaments = filterTournaments(allTournaments);
  const filteredPlayerTournaments = filterTournaments(playerTournaments);
  const filteredOrganizerTournaments = filterTournaments(organizerTournaments);

  const availableFormats = ['all', ...Array.from(new Set(allTournaments.map(t => t.format)))];
  const availableStatuses = ['all', 'open', 'closed'];

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

      {/* Filters */}
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
                      {status === 'all' ? 'Todos os Status' : status === 'open' ? 'Abertos' : status === 'closed' ? 'Fechados' : status}
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
            {currentUser?.type === 'player' ? (
              filteredPlayerTournaments.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Você ainda não participou de nenhum torneio</p>
                  <Button 
                    className="mt-4"
                    onClick={() => onNavigate('tournament-list')}
                  >
                    Navegar Torneios
                  </Button>
                </div>
              ) : (
                filteredPlayerTournaments.map(tournament => renderTournamentCard(tournament))
              )
            ) : (
              filteredOrganizerTournaments.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Você ainda não criou nenhum torneio</p>
                  <Button 
                    className="mt-4"
                    onClick={() => onNavigate('tournament-creation')}
                  >
                    Criar Seu Primeiro Torneio
                  </Button>
                </div>
              ) : (
                filteredOrganizerTournaments.map(tournament => renderTournamentCard(tournament))
              )
            )}
          </div>
        </TabsContent>

        {currentUser?.type === 'player' && (
          <TabsContent value="available" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAllTournaments
                .filter(t => 
                  t.status === 'open' && 
                  !t.participants.some(p => p.userId === currentUser.id) &&
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
