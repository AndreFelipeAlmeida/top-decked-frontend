import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.tsx';
import { ArrowLeft, Calendar, Users, Trophy, MapPin, DollarSign, UserPlus, UserMinus, Upload, Settings } from 'lucide-react';
import { Tournament, User, PlayerRule, PlayerRuleAssignment } from '../data/store.ts';
import { TournamentImport } from './TournamentImport.tsx';
import { toast } from 'sonner';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

interface TournamentDetailsProps {
  onNavigate: (page: Page, data?: any) => void;
  tournamentId: string | null;
  currentUser: User | null;
}

interface LojaPublico {
    id: number;
    nome: string;
    email: string;
}

interface JogadorPublico {
  id: number;
  nome: string;
}

interface JogadorTorneioLinkPublico {
  jogador_id: number;
  torneio_id: string;
  nome: string;
  ponto: number;
  jogador?: JogadorPublico;
}

interface RodadaBase {
  id: string;
  numero: number;
  data: string;
}

interface TipoJogadorPublico {
  id: number;
  nome: string;
  pt_vitoria: number;
  pt_derrota: number;
  pt_empate: number;
  pt_oponente_perde: number;
  pt_oponente_ganha: number;
  pt_oponente_empate: number;
  loja: number;
  tcg: string;
}

interface TorneioRegraAdicionalPublico {
  tipo_jogador: TipoJogadorPublico;
  jogadores: JogadorPublico[];
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
  finalizado: boolean;
  jogadores: JogadorTorneioLinkPublico[];
  rodadas: RodadaBase[];
  regras_adicionais: TorneioRegraAdicionalPublico[];
}

interface TournamentResult {
  id: string;
  userId: string;
  userName: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  currentStanding: number;
}

const mapBackendToFrontend = (backendData: BackendTournament): Tournament => {
    return {
        id: backendData.id,
        name: backendData.nome,
        organizerId: backendData.loja_id,
        organizerName: backendData.loja?.nome || "Organizador não informado",
        date: backendData.data_inicio,
        time: "Horário não informado",
        format: backendData.formato || 'Formato não informado',
        store: backendData.cidade || 'Local não informado',
        description: backendData.descricao || '',
        prizes: backendData.premios || '',
        maxParticipants: backendData.vagas,
        entryFee: `$${backendData.taxa}`,
        structure: backendData.estrutura || '',
        rounds: backendData.rodadas?.length || 0,
        status: backendData.finalizado ? 'closed' : 'open',
        currentRound: backendData.rodadas?.length || 0,
        participants: backendData.jogadores.map(p => ({
            id: p.jogador_id.toString(),
            userId: p.jogador_id,
            userName: p.nome || 'Nome indisponível',
            registeredAt: new Date().toISOString(),
            points: p.ponto,
            wins: 0, losses: 0, draws: 0, currentStanding: 0
        })),
        matches: [],
        bracket: [],
        createdAt: new Date().toISOString(),
        hasImportedResults: !!backendData.rodadas?.length,
    };
};

export function TournamentDetails({ onNavigate, tournamentId, currentUser }: TournamentDetailsProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  const [playerRuleAssignments, setPlayerRuleAssignments] = useState<PlayerRuleAssignment[]>([]);
  const [availableRules, setAvailableRules] = useState<PlayerRule[]>([]);
  const [tournamentResults, setTournamentResults] = useState<TournamentResult[]>([]);
  
  const fetchTournamentDetails = useCallback(async () => {
    if (!tournamentId) return;

    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      toast.error('Token de acesso não encontrado. Faça o login novamente.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/lojas/torneios/${tournamentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Falha ao buscar detalhes do torneio.");
      }

      const backendData: BackendTournament = await response.json();
      const mappedTournament = mapBackendToFrontend(backendData);

      const mappedRules: PlayerRuleAssignment[] = backendData.regras_adicionais?.flatMap(rule => 
        rule.jogadores.map(player => ({
          id: `${rule.tipo_jogador.id}-${player.id}`,
          playerId: player.id.toString(),
          playerName: player.nome,
          ruleId: rule.tipo_jogador.id.toString(),
          ruleName: rule.tipo_jogador.nome,
        }))
      ) || [];
      setPlayerRuleAssignments(mappedRules);
      
      const mappedResults: TournamentResult[] = mappedTournament.participants
        .sort((a, b) => b.points - a.points)
        .map((p, index) => ({
          id: p.id.toString(),
          userId: p.userId.toString(),
          userName: p.userName,
          points: p.points,
          wins: 0,
          losses: 0,
          draws: 0,
          currentStanding: index + 1,
        }));
      setTournamentResults(mappedResults);

      const availableRulesFromBackend = backendData.regras_adicionais?.map(rule => ({
        id: rule.tipo_jogador.id.toString(),
        typeName: rule.tipo_jogador.nome,
        pointsForWin: rule.tipo_jogador.pt_vitoria,
        pointsForLoss: rule.tipo_jogador.pt_derrota,
        pointsForDraw: rule.tipo_jogador.pt_empate,
        pointsGivenToOpponent: rule.tipo_jogador.pt_oponente_ganha,
        pointsLostByOpponent: rule.tipo_jogador.pt_oponente_perde,
        pointsGivenToOpponentOnDraw: rule.tipo_jogador.pt_oponente_empate,
        tcg: rule.tipo_jogador.tcg,
        organizerId: rule.tipo_jogador.loja.toString(),
        createdAt: new Date().toISOString()
      })) || [];
      setAvailableRules(availableRulesFromBackend);
      
      setTournament(mappedTournament);
    
    } catch (error) {
      console.error("Erro ao buscar detalhes do torneio:", error);
      toast.error((error as Error).message);
      setTournament(null);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTournamentDetails();
  }, [fetchTournamentDetails]);

  const handleRegistration = async () => {
    if (!tournament || !currentUser || currentUser.type !== 'player') return;

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8000/lojas/torneios/${tournament.id}/inscricao`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Falha ao se inscrever.');
        }
        
        toast.success('Inscrição para o torneio realizada com sucesso!');
        fetchTournamentDetails();
    } catch (err: any) {
        console.error("Erro na inscrição:", err.message);
        toast.error(err.message || 'Falha ao se inscrever. O torneio pode estar lotado ou você precisa de um Pokémon ID.');
    }
  };

  const handleUnregistration = async () => {
    if (!tournament || !currentUser || currentUser.type !== 'player') return;

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8000/lojas/torneios/${tournament.id}/inscricao`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Falha ao remover a inscrição.');
        }

        toast.success('Inscrição no torneio removida com sucesso.');
        fetchTournamentDetails();
    } catch (err: any) {
        console.error("Erro ao remover inscrição:", err.message);
        toast.error(err.message || 'Falha ao remover a inscrição.');
    }
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

  const getRulePointsDescription = (ruleId: string) => {
    const rule = availableRules.find(r => r.id === ruleId);
    if (!rule) return 'Regra não encontrada.';
    return `Vitória: ${rule.pointsForWin}pts, Derrota: ${rule.pointsForLoss}pts, Empate: ${rule.pointsForDraw}pts`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Carregando detalhes do torneio...</p>
      </div>
    );
  }

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

  const isOrganizer = currentUser?.type === 'organizer';
  const isPlayer = currentUser?.type === 'player';
  
  const hasSpecificRules = playerRuleAssignments.length > 0;

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
              <p className="text-muted-foreground">Organizado por {tournament.organizerName}</p>
            </div>
            <div className="flex space-x-2">
            {isPlayer && (
                <>
                  {isRegistered ? (
                    <Button 
                      variant="outline" 
                      onClick={handleUnregistration} 
                      className="flex items-center space-x-2"
                    >
                      <UserMinus className="h-4 w-4" />
                      <span>Remover Inscrição</span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleRegistration} 
                      className="flex items-center space-x-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Inscrever-se</span>
                    </Button>
                  )}
                </>
              )}
              {isOrganizer && (
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

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="player-rules">Regras de Jogador Utilizadas</TabsTrigger>
          <TabsTrigger value="tournament-results">Resultados do Torneio</TabsTrigger>
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
                    <div>Rodada: <span className="font-medium">{tournament.currentRound}</span></div>
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
                  <div>
                    <h4 className="font-medium mb-3">Regra Padrão</h4>
                    <Card className="p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Jogador Normal</span>
                          <div className="text-sm text-muted-foreground">
                            Vitória: 3pts, Derrota: 0pts, Empate: 1pt
                          </div>
                        </div>
                        <Badge variant="secondary">Aplicado a todos os jogadores por padrão</Badge>
                      </div>
                    </Card>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Regras Específicas de Jogador</h4>
                    <div className="space-y-3">
                      {hasSpecificRules ? (
                        playerRuleAssignments.map((assignment, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{assignment.playerName}</span>
                                <div className="text-sm text-muted-foreground">
                                  Regra: {assignment.ruleName}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span>
                                  {getRulePointsDescription(assignment.ruleId)}
                                </span>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Nenhuma regra específica aplicada.</p>
                      )}
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
                      {tournamentResults.map((participant) => (
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
      </Tabs>

      {tournament && (
        <TournamentImport
          isOpen={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onNavigate={onNavigate}
          targetTournamentId={tournament.id.toString()}
          targetTournamentName={tournament.name}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}