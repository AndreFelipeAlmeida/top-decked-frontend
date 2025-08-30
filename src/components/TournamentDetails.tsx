import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.tsx';
import { ArrowLeft, Calendar, Users, Trophy, MapPin, DollarSign, CheckCircle, UserPlus, UserMinus, Upload, Settings } from 'lucide-react';
import { tournamentStore, Tournament, User, PlayerRule } from '../data/store.ts';
import { TournamentImport } from './TournamentImport.tsx';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface TournamentDetailsProps {
  onNavigate: (page: Page, data?: any) => void;
  tournamentId: string | null;
  currentUser: User | null;
}

interface PlayerRuleAssignment {
  id: string;
  playerId: string;
  playerName: string;
  ruleId: string;
  ruleName: string;
}

export function TournamentDetails({ onNavigate, tournamentId, currentUser }: TournamentDetailsProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<'loading' | 'registered' | 'not-registered' | 'full'>('loading');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Mock data for player rules and results (in real app this would come from the tournament data)
  const [playerRuleAssignments] = useState<PlayerRuleAssignment[]>([
    {
      id: 'assignment-1',
      playerId: 'player-1',
      playerName: 'Alex Chen',
      ruleId: 'rule-3',
      ruleName: 'Jogador de Sorte'
    },
    {
      id: 'assignment-2',
      playerId: 'player-2',
      playerName: 'Mike Rodriguez',
      ruleId: 'rule-2',
      ruleName: 'Time Rocket'
    }
  ]);

  const [availableRules] = useState<PlayerRule[]>([
    {
      id: 'rule-1',
      typeName: 'Jogador Normal',
      pointsForWin: 3,
      pointsForLoss: 0,
      pointsGivenToOpponent: 0,
      pointsLostByOpponent: 0,
      organizerId: 'organizer-1',
      createdAt: '2024-12-01T09:00:00Z'
    },
    {
      id: 'rule-2',
      typeName: 'Time Rocket',
      pointsForWin: 3,
      pointsForLoss: 0,
      pointsGivenToOpponent: 0,
      pointsLostByOpponent: 0.5,
      organizerId: 'organizer-1',
      createdAt: '2024-12-01T10:00:00Z'
    },
    {
      id: 'rule-3',
      typeName: 'Jogador de Sorte',
      pointsForWin: 4,
      pointsForLoss: 1,
      pointsGivenToOpponent: 0.5,
      pointsLostByOpponent: 0,
      organizerId: 'organizer-1',
      createdAt: '2024-12-01T11:00:00Z'
    }
  ]);

  // Mock tournament results
  const mockTournamentResults = [
    {
      id: 'part-1',
      userId: 'player-1',
      userName: 'Alex Chen',
      points: 12,
      wins: 4,
      losses: 1,
      draws: 0,
      currentStanding: 1,
    },
    {
      id: 'part-2',
      userId: 'player-2',
      userName: 'Mike Rodriguez',
      points: 9,
      wins: 3,
      losses: 2,
      draws: 0,
      currentStanding: 2,
    },
    {
      id: 'part-3',
      userId: 'player-3',
      userName: 'Emma Davis',
      points: 6,
      wins: 2,
      losses: 3,
      draws: 0,
      currentStanding: 3,
    },
  ];

  // Mock monthly results
  const mockMonthlyResults = [
    {
      playerId: 'player-1',
      playerName: 'Alex Chen',
      totalPoints: 45,
      tournaments: 4,
      avgPlacement: 1.8,
    },
    {
      playerId: 'player-2',
      playerName: 'Mike Rodriguez',
      totalPoints: 38,
      tournaments: 3,
      avgPlacement: 2.3,
    },
    {
      playerId: 'player-3',
      playerName: 'Emma Davis',
      totalPoints: 32,
      tournaments: 5,
      avgPlacement: 2.8,
    },
  ];

  useEffect(() => {
    if (tournamentId) {
      const foundTournament = tournamentStore.getTournamentById(tournamentId);
      setTournament(foundTournament || null);
      
      if (foundTournament && currentUser?.type === 'player') {
        const isRegistered = foundTournament.participants.some(p => p.userId === currentUser.id);
        const isFull = foundTournament.participants.length >= foundTournament.maxParticipants;
        
        if (isRegistered) {
          setRegistrationStatus('registered');
        } else if (isFull) {
          setRegistrationStatus('full');
        } else {
          setRegistrationStatus('not-registered');
        }
      }
    }
  }, [tournamentId, currentUser]);

  const handleRegistration = () => {
    if (!tournament || !currentUser || currentUser.type !== 'player') return;

    const success = tournamentStore.registerPlayerForTournament(tournament.id, currentUser.id);
    
    if (success) {
      setMessage({ type: 'success', text: 'Inscrição para o torneio realizada com sucesso!' });
      setRegistrationStatus('registered');
      // Refresh tournament data
      const updatedTournament = tournamentStore.getTournamentById(tournament.id);
      setTournament(updatedTournament || null);
    } else {
      setMessage({ type: 'error', text: 'Falha ao se inscrever. O torneio pode estar lotado.' });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUnregistration = () => {
    if (!tournament || !currentUser || currentUser.type !== 'player') return;

    const success = tournamentStore.unregisterPlayerFromTournament(tournament.id, currentUser.id);
    
    if (success) {
      setMessage({ type: 'success', text: 'Inscrição no torneio removida com sucesso.' });
      setRegistrationStatus('not-registered');
      // Refresh tournament data
      const updatedTournament = tournamentStore.getTournamentById(tournament.id);
      setTournament(updatedTournament || null);
    } else {
      setMessage({ type: 'error', text: 'Falha ao remover a inscrição.' });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'closed': return 'bg-gray-100 text-black';
      case 'open': return 'bg-purple-100 text-purple-800';
      default: return 'outline';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'closed': return 'Fechado';
      case 'open': return 'Aberto';
      default: return 'Desconhecido';
    }
  };

  const getPositionBadgeStyle = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-amber-700 text-white";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Torneio Não Encontrado</h1>
          <Button onClick={() => onNavigate('tournament-list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Torneios
          </Button>
        </div>
      </div>
    );
  }

  const canManage = currentUser?.type === 'organizer' && currentUser.id === tournament.organizerId;
  const canRegister = currentUser?.type === 'player' && registrationStatus === 'not-registered' && tournament.status === 'open';
  const canUnregister = currentUser?.type === 'player' && registrationStatus === 'registered' && tournament.status === 'open';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('tournament-list')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Torneios
        </Button>
      </div>

      {/* Tournament Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold">{tournament.name}</h1>
                <Badge className={getStatusColor(tournament.status)}>
                  {getStatusText(tournament.status)}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Organizado por {currentUser?.type === 'player' ? (
                  <button 
                    onClick={() => onNavigate('organizer-profile', { organizerId: tournament.organizerId })}
                    className="text-primary hover:underline font-medium cursor-pointer"
                  >
                    {tournament.organizerName}
                  </button>
                ) : (
                  <span>{tournament.organizerName}</span>
                )}
              </p>
            </div>
            <div className="flex space-x-2">
              {canRegister && (
                <Button onClick={handleRegistration} className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Inscrever-se</span>
                </Button>
              )}
              {canUnregister && (
                <Button variant="outline" onClick={handleUnregistration} className="flex items-center space-x-2">
                  <UserMinus className="h-4 w-4" />
                  <span>Remover Inscrição</span>
                </Button>
              )}
              {canManage && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => onNavigate('tournament-edit', { tournamentId: tournament.id })}
                    className="flex items-center space-x-2 bg-white border-gray-300 text-gray-900 hover:bg-yellow-400 hover:text-gray-900 hover:border-gray-300"
                  >
                    <span>Editar</span>
                  </Button>
                  <Button 
                    onClick={() => setImportDialogOpen(true)}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Importar</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{new Date(tournament.date).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">{tournament.time}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{tournament.store}</div>
                <div className="text-sm text-muted-foreground">{tournament.format}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{tournament.participants.length}/{tournament.maxParticipants}</div>
                <div className="text-sm text-muted-foreground">Participantes</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{tournament.entryFee}</div>
                <div className="text-sm text-muted-foreground">Taxa de Inscrição</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
          <AlertDescription className="flex items-center space-x-2">
            {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
            <span>{message.text}</span>
          </AlertDescription>
        </Alert>
      )}

      {registrationStatus === 'registered' && currentUser?.type === 'player' && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Você está inscrito neste torneio!
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="player-rules">Regras de Jogador Utilizadas</TabsTrigger>
          <TabsTrigger value="tournament-results">Resultados do Torneio</TabsTrigger>
          <TabsTrigger value="monthly-results">Resultados Mensais</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Torneio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Descrição</h4>
                <p className="text-muted-foreground">{tournament.description || 'Nenhuma descrição fornecida.'}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Estrutura de Prêmios</h4>
                <p className="text-muted-foreground">{tournament.prizes || 'Prêmios a serem definidos'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Detalhes do Formato</h4>
                  <div className="space-y-1 text-sm">
                    <div>Formato: <span className="font-medium">{tournament.format}</span></div>
                    <div>Estrutura: <span className="font-medium">{tournament.structure}</span></div>
                    <div>Rodadas: <span className="font-medium">{tournament.rounds}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Status Atual</h4>
                  <div className="space-y-1 text-sm">
                    <div>Rodada: <span className="font-medium">{tournament.currentRound}/{tournament.rounds}</span></div>
                    <div>Status: <span className="font-medium">{getStatusText(tournament.status)}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="player-rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Regras de Jogador Utilizadas</span>
              </CardTitle>
              <CardDescription>
                Regras de pontuação aplicadas aos jogadores neste torneio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!tournament.hasImportedResults ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">As regras de jogador aparecerão após a importação dos resultados do torneio</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Default Rule */}
                  <div>
                    <h4 className="font-medium mb-3">Regra Padrão</h4>
                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Jogador Normal</span>
                          <div className="text-sm text-muted-foreground">
                            Vitória: 3pts, Derrota: 0pts
                          </div>
                        </div>
                        <Badge variant="secondary">Aplicado a todos os jogadores por padrão</Badge>
                      </div>
                    </Card>
                  </div>

                  {/* Specific Rules */}
                  <div>
                    <h4 className="font-medium mb-3">Regras Específicas de Jogador</h4>
                    <div className="space-y-3">
                      {playerRuleAssignments.map((assignment) => (
                        <Card key={assignment.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{assignment.playerName}</span>
                              <div className="text-sm text-muted-foreground">
                                Regra: {assignment.ruleName}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {availableRules.find(r => r.id === assignment.ruleId) && (
                                <span>
                                  Vitória: {availableRules.find(r => r.id === assignment.ruleId)?.pointsForWin}pts, 
                                  Derrota: {availableRules.find(r => r.id === assignment.ruleId)?.pointsForLoss}pts
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournament-results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Resultados do Torneio</span>
              </CardTitle>
              <CardDescription>
                Classificação final deste torneio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!tournament.hasImportedResults ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Os resultados do torneio aparecerão após a importação dos dados do torneio</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Posição</TableHead>
                        <TableHead>Jogador</TableHead>
                        <TableHead>Pontos</TableHead>
                        <TableHead>Histórico</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTournamentResults.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={getPositionBadgeStyle(participant.currentStanding)}
                            >
                              {participant.currentStanding}
                            </Badge>
                          </TableCell>
                          <TableCell>{participant.userName}</TableCell>
                          <TableCell>{participant.points}</TableCell>
                          <TableCell>
                            {participant.wins}-{participant.losses}-{participant.draws}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly-results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Resultados Mensais</span>
              </CardTitle>
              <CardDescription>
                Dados agregados de desempenho mensal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!tournament.hasImportedResults ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Os resultados mensais aparecerão após a importação dos dados do torneio</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jogador</TableHead>
                        <TableHead>Pontos</TableHead>
                        <TableHead>Torneios</TableHead>
                        <TableHead>Colocação Média</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockMonthlyResults.map((result) => (
                        <TableRow key={result.playerId}>
                          <TableCell>{result.playerName}</TableCell>
                          <TableCell>{result.totalPoints}</TableCell>
                          <TableCell>{result.tournaments}</TableCell>
                          <TableCell>{result.avgPlacement.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for importing tournament data */}
      {tournament && (
        <TournamentImport
          isOpen={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onNavigate={onNavigate}
          targetTournamentId={tournament.id}
          targetTournamentName={tournament.name}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
