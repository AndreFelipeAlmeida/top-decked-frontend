import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Badge } from './ui/badge.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { ArrowLeft, Play, Pause, RotateCcw, Users, Trophy, Clock, CheckCircle, AlertTriangle, Maximize, Minimize, Edit2 } from 'lucide-react';
import { tournamentStore, Tournament, Match, User, TournamentParticipant, PlayerRuleAssignment, PlayerRule } from '../data/store.ts';
import { toast } from "sonner";

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'player-profile' | 'organizer-profile' | 'subscription' | 'tournament-details' | 'tournament-list' | 'tournament-edit'  | 'pairings';

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

interface PairingsPageProps {
  onNavigate: (page: Page, data?: any) => void;
  tournamentId: string | null;
  currentUser: User | null;
}
interface TournamentDetailsProps {
  onNavigate: (page: Page, data?: any) => void;
  tournamentId: string | null;
  currentUser: User | null;
}

interface LojaPublico {
    id: number;
    nome: string;
    email: string;
    usuario: UsuarioPublico;
}

interface UsuarioPublico {
    id: number;
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
  regra_basica_id: number;
  regras_adicionais: TorneioRegraAdicionalPublico[];
}


const mapBackendToFrontend = (backendData: BackendTournament): Tournament => {
  let status: 'open' | 'in-progress' | 'finished';
  if (backendData.finalizado) {
    status = 'finished';
  } else if (backendData.rodadas && backendData.rodadas.length > 0) {
    status = 'in-progress';
  } else {
    status = 'open';
  }
  
  return {
      id: backendData.id,
      name: backendData.nome,
      organizerId: (backendData.loja_id ?? backendData.loja?.id)?.toString() || "0",
      organizerUserId: (backendData.loja?.usuario?.id)?.toString() || "0",
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
      status: status,
      currentRound: backendData.rodadas?.length || 0,
      participants: backendData.jogadores.map(p => ({
          id: p.jogador_id.toString(),
          userId: p.jogador_id.toString(),
          userName: p.nome || 'Nome indisponível',
          registeredAt: new Date().toISOString(),
          points: p.ponto,
          wins: 0, losses: 0, draws: 0, currentStanding: 0
      })),
      matches: [],
      bracket: [],
      createdAt: new Date().toISOString(),
      hasImportedResults: !!backendData.rodadas?.length,
      ruleId: backendData.regra_basica_id
  };
};

export function PairingsPage({ onNavigate, tournamentId, currentUser }: PairingsPageProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasPairingsGenerated, setHasPairingsGenerated] = useState(false);
  const [isTimerFullscreen, setIsTimerFullscreen] = useState(false);
  const [isTableFullscreen, setIsTableFullscreen] = useState(false);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [newDuration, setNewDuration] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    format: "",
    prizes: "",
    description: "",
    entryFee: "",
    structure: "",
    rounds: "",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  // Player Rules state
  const [defaultRuleId, setDefaultRuleId] =
    useState<string>("");
  const [additionalRuleId, setAdditionalRuleId] =
    useState<string>("");
  const [selectedPlayerId, setSelectedPlayerId] =
    useState<string>("");
  const [playerRuleAssignments, setPlayerRuleAssignments] =
    useState<PlayerRuleAssignment[]>([]);
  const [applyAdditionalRules, setApplyAdditionalRules] =
    useState<boolean>(false);

  const [availableRules, setAvailableRules] = useState<
    PlayerRule[]
  >([]);
  const [availablePlayers, setAvailablePlayers] = useState<
    User[]
  >([]);

  const [rulePopoverOpen, setRulePopoverOpen] =
    useState<boolean>(false);
  const [playerPopoverOpen, setPlayerPopoverOpen] =
    useState<boolean>(false);

  const [editingScores, setEditingScores] = useState<
    Record<string, string>
  >({});

  const [mockTournamentResults, setMockTournamentResults] =
    useState<TournamentParticipant[]>([]);


  const fetchTournamentData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!tournamentId || !token) {
      setHasAccess(false);
      return;
    }

    try {
      const tournamentResponse = await fetch(`${API_URL}/lojas/torneios/${tournamentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (tournamentResponse.ok) {
        const tournamentData = await tournamentResponse.json();
        
        setTournament(mapBackendToFrontend(tournamentData));
        setFormData({
            name: tournamentData.nome,
            date: tournamentData.data_inicio,
            time: tournamentData.hora || "",
            format: tournamentData.formato || "",
            prizes: tournamentData.premio || "",
            description: tournamentData.descricao || "",
            entryFee: tournamentData.taxa?.toString() || "",
            structure: "Swiss", 
            rounds: tournamentData.n_rodadas?.toString() || "",
        });

        const hasImportedResults = tournamentData.jogadores && tournamentData.jogadores.length > 0;
            setTournament((prev: Tournament | null) => prev ? { ...prev, hasImportedResults: hasImportedResults } : prev);

        const playersFromBackend = tournamentData.jogadores.map((player: any) => ({
          id: player.jogador_id.toString(),
          name: player.nome,
          email: '',
          type: 'player', 
        }));
        setAvailablePlayers(playersFromBackend);
        
        const resultsFromBackend = tournamentData.jogadores.map((player: any) => ({
          id: `part-${player.jogador_id}`,
          userId: player.jogador_id.toString(),
          userName: player.nome,
          registeredAt: "",
          points: player.pontuacao,
          wins: 0,
          losses: 0,
          draws: 0,
          currentStanding: 0,
        }));
        
        const sortedResults = resultsFromBackend.sort((a: any, b: any) => b.points - a.points);
        const finalResults = sortedResults.map((result: any, index: number) => ({
          ...result,
          currentStanding: index + 1,
        }));

        setMockTournamentResults(finalResults);

        const initialScores: Record<string, string> = {};
        finalResults.forEach((participant: any) => {
          initialScores[participant.id] = participant.points.toString();
        });
        setEditingScores(initialScores);
        if (tournamentData.regra_basica_id) {
          setDefaultRuleId(tournamentData.regra_basica_id.toString());
        }

        const rulesResponse = await fetch(`${API_URL}/lojas/tipoJogador/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (rulesResponse.ok) {
          const rulesData = await rulesResponse.json();
          setAvailableRules(rulesData.map((rule: any) => ({
            id: rule.id.toString(),
            typeName: rule.nome,
            pointsForWin: rule.pt_vitoria,
            pointsForLoss: rule.pt_derrota,
          })));

          const defaultRule = rulesData.find((rule: any) => rule.nome === "Normal Player") || rulesData[0];
          if (defaultRule) {
            setDefaultRuleId(defaultRule.id.toString());
          }
        } else {
          console.error('Erro ao buscar tipos de jogador.');
          toast.error('Não foi possível carregar as regras de jogador.');
        }
        
        setHasAccess(true);
      } else {
        setHasAccess(false);
        const errorData = await tournamentResponse.json();
        console.error('Erro ao buscar torneio:', errorData.detail);
        toast.error(errorData.detail || 'Falha ao buscar o torneio.');
      }
    } catch (error) {
      console.error('Erro ao buscar torneio:', error);
      toast.error('Falha ao buscar torneio. Verifique a conexão.');
      setHasAccess(false);
    }
  };

  const fetchNextRound = async () => {
    if (!tournamentId) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
    toast.error("Sem token de acesso.");
    return;
  }
    setIsLoading(true);
    try {
    const response = await fetch(
      `${API_URL}/lojas/torneios/${tournamentId}/rodada`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.detail || "Erro ao gerar rodada.");
      setIsLoading(false);
      return;
    }

    const data = await response.json();

    // transforma { "2": [{},{}], "3": [{},{}] } em lista de matches
    const matches: Match[] = Object.entries(data).map(([mesa, players]) => {
      const [p1, p2] = players as any[];

    const vdeDefault = { vitorias: 0, derrotas: 0, empates: 0 };

    const p1Vde = p1?.vde || vdeDefault;
    const p2Vde = p2?.vde || vdeDefault;
    
      return {
        id: `match-${mesa}`,
        tableNumber: parseInt(mesa, 10),
        player1Id: p1?.jogador_id || "",
        player1Name: p1?.jogador_nome || "TBD",
        player2Id: p2?.jogador_id || "bye",
        player2Name: p2?.jogador_nome || "BYE",
        status: false,
        player1Score: 0,
        player2Score: 0,
        player1Vde: p1Vde,   // adiciona vde ao jogador 1
        player2Vde: p2Vde,   // adiciona vde ao jogador 2
      };
    });

    setCurrentMatches(matches);
    setHasPairingsGenerated(true);
    toast.success("Nova rodada gerada!");
  } catch (err) {
    console.error("Erro ao gerar próxima rodada:", err);
    toast.error("Falha na comunicação com servidor.");
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    if (currentUser?.type === "organizer") {
      fetchTournamentData();
    } else {
        setHasAccess(false);
    }
  }, [tournamentId, currentUser]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => setIsTimerRunning(true);
  const handlePauseTimer = () => setIsTimerRunning(false);
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    const duration = tournament?.roundDuration || 60;
    setTimeLeft(duration * 60);
  };

  const handleEditDuration = () => {
    if (isEditingDuration && newDuration) {
      const minutes = parseInt(newDuration);
      if (minutes > 0) {
        setTimeLeft(minutes * 60);
        setIsTimerRunning(false);
        // TODO: Update tournament duration in store if needed
        toast.success(`Timer duration updated to ${minutes} minutes`);
      } else {
        toast.error('Duration must be a positive number');
      }
      setIsEditingDuration(false);
      setNewDuration('');
    } else {
      setIsEditingDuration(true);
      setNewDuration(Math.floor(timeLeft / 60).toString());
    }
  };

  const toggleTimerFullscreen = () => {
    setIsTimerFullscreen(!isTimerFullscreen);
  };

  const toggleTableFullscreen = () => {
    setIsTableFullscreen(!isTableFullscreen);
  };


  const handleMatchResult = (matchId: string, winnerId: string, player1Score: number, player2Score: number) => {
    const success = tournamentStore.updateMatchResult(matchId, winnerId, player1Score, player2Score);
    
    if (success) {
      // Refresh current matches
      if (tournament) {
        const updatedMatches = tournamentStore.getCurrentRoundMatches(tournament.id);
        setCurrentMatches(updatedMatches);
      }
      toast.success('Match result updated');
    } else {
      toast.error('Failed to update match result');
    }
  };

  const handleFinalizeRound = () => {
    if (!tournament) return;

    const success = tournamentStore.finalizeRound(tournament.id);
    
    if (success) {
      // Refresh tournament and matches
      const updatedTournament = tournamentStore.getTournamentById(tournament.id);
      setTournament(updatedTournament || null);
      
      // Clear current matches to force regeneration for next round
      setCurrentMatches([]);
      setHasPairingsGenerated(false);
      
      toast.success(`Round ${tournament.currentRound - 1} finalized`);
    } else {
      toast.error('Cannot finalize round. Please ensure all matches have results.');
    }
  };

  const handleEndTournament = () => {
    if (!tournament) return;

    const success = tournamentStore.endTournament(tournament.id);
    
    if (success) {
      toast.success('Tournament completed!');
      onNavigate('tournament-details', { tournamentId: tournament.id });
    } else {
      toast.error('Failed to end tournament');
    }
  };

  const getMatchStatusBadge = (match: Match) => {
    if (match.player2Id === 'bye') {
      return <Badge variant="default" className="bg-green-600 text-white">Auto Win</Badge>;
    }
    
    if (match.status) {
        return <Badge variant="Finalizado">In Progress</Badge>;
    } else {
        return <Badge variant="Em Andamento">In Progress</Badge>;
    }
  };

  const allMatchesCompleted = currentMatches.length > 0 && currentMatches.every(m => m.status === 'completed');
  const isFinalRound = tournament && tournament.currentRound >= tournament.rounds;

  // Fullscreen Timer Component
  if (isTimerFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold">{tournament?.name}</h1>
          <p className="text-xl text-muted-foreground">
            Round {tournament?.currentRound} of {tournament?.rounds}
          </p>
          <div className="text-9xl font-mono font-bold">
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={handleStartTimer}
              disabled={isTimerRunning}
              size="lg"
            >
              <Play className="h-6 w-6 mr-2" />
              Start
            </Button>
            <Button
              onClick={handlePauseTimer}
              disabled={!isTimerRunning}
              variant="outline"
              size="lg"
            >
              <Pause className="h-6 w-6 mr-2" />
              Pause
            </Button>
            <Button
              onClick={handleResetTimer}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="h-6 w-6 mr-2" />
              Reset
            </Button>
            <Button
              onClick={toggleTimerFullscreen}
              variant="outline"
              size="lg"
            >
              <Minimize className="h-6 w-6 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen Table Component
  if (isTableFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-8 overflow-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{tournament?.name}</h1>
            <p className="text-muted-foreground">
              Round {tournament?.currentRound} Pairings - Fullscreen View
            </p>
          </div>
          <Button
            onClick={toggleTableFullscreen}
            variant="outline"
          >
            <Minimize className="h-4 w-4 mr-2" />
            Exit Fullscreen
          </Button>
        </div>
        
        {hasPairingsGenerated && currentMatches.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg">Table</TableHead>
                  <TableHead className="text-lg">Player 1</TableHead>
                  <TableHead className="text-lg">VS</TableHead>
                  <TableHead className="text-lg">Player 2</TableHead>
                  <TableHead className="text-lg">Status</TableHead>
                  <TableHead className="text-lg">Result</TableHead>
                  <TableHead className="text-lg">Edit Winner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMatches.map((match) => {
                  const player1Stats = tournament?.participants.find(p => p.userId === match.player1Id);
                  const player2Stats = match.player2Id !== 'bye' ? tournament?.participants.find(p => p.userId === match.player2Id) : null;
                  
                  return (
                    <TableRow key={match.id} className="text-lg hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {match.table === 0 ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300 text-lg">
                            BYE
                          </Badge>
                        ) : (
                          <div className="flex items-center justify-center w-20 h-10 bg-primary/10 rounded-lg font-bold text-primary text-xl">
                            {match.table}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="font-bold text-foreground text-xl">{match.player1Name}</div>
                          <div className="text-base text-muted-foreground">
                            {player1Stats ? (
                              <span className="inline-flex items-center space-x-2">
                                <span className="text-green-600 font-semibold">{player1Stats.wins}W</span>
                                <span>-</span>
                                <span className="text-red-600 font-semibold">{player1Stats.losses}L</span>
                                <span>-</span>
                                <span className="text-yellow-600 font-semibold">{player1Stats.draws}D</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0W-0L-0D</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-black text-muted-foreground text-2xl">VS</div>
                      </TableCell>
                      <TableCell>
                        {match.player2Id === 'bye' ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300 text-lg">
                            BYE
                          </Badge>
                        ) : (
                          <div className="space-y-2">
                            <div className="font-bold text-foreground text-xl">{match.player2Name}</div>
                            <div className="text-base text-muted-foreground">
                              {player2Stats ? (
                                <span className="inline-flex items-center space-x-2">
                                  <span className="text-green-600 font-semibold">{player2Stats.wins}W</span>
                                  <span>-</span>
                                  <span className="text-red-600 font-semibold">{player2Stats.losses}L</span>
                                  <span>-</span>
                                  <span className="text-yellow-600 font-semibold">{player2Stats.draws}D</span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">0W-0L-0D</span>
                              )}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getMatchStatusBadge(match)}
                      </TableCell>
                      <TableCell>
                        {match.status === 'completed' ? (
                          <div className="font-bold text-primary text-xl">
                            🏆 {match.winnerName}
                          </div>
                        ) : match.player2Id === 'bye' ? (
                          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300 text-lg">
                            Auto Win
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground italic text-lg">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {match.player2Id === 'bye' ? (
                          <span className="text-muted-foreground text-base">N/A</span>
                        ) : (
                          <Select
                            key={`${match.id}-${match.winnerId || 'no-winner'}`}
                            value={match.winnerId || ''}
                            onValueChange={(winnerId) => {
                              const scores = winnerId === match.player1Id ? [2, 0] : [0, 2];
                              handleMatchResult(match.id, winnerId, scores[0], scores[1]);
                            }}
                          >
                            <SelectTrigger className="w-48 h-12 text-base">
                              <SelectValue placeholder="Select winner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={match.player1Id} className="text-base">
                                {match.player1Name}
                              </SelectItem>
                              <SelectItem value={match.player2Id} className="text-base">
                                {match.player2Name}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <Button onClick={() => onNavigate('tournament-list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </div>
      </div>
    );
  }

  const canManage = currentUser?.type === 'organizer' && currentUser.id.toString() === tournament.organizerUserId.toString();
  console.log(tournament.organizerUserId)
  console.log(currentUser?.id)
  if (!canManage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => onNavigate('tournament-details', { tournamentId: tournament.id })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournament
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('tournament-details', { tournamentId: tournament.id })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournament
        </Button>
      </div>

      {/* Tournament Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{tournament.name}</h1>
              <p className="text-muted-foreground">
                Round {tournament.currentRound} of {tournament.rounds}
              </p>
            </div>
            <Badge variant="default">In Progress</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{tournament.participants.length} Players</div>
                <div className="text-sm text-muted-foreground">Participating</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{tournament.format}</div>
                <div className="text-sm text-muted-foreground">Format</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{formatTime(timeLeft)}</div>
                <div className="text-sm text-muted-foreground">Time Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Round Timer</span>
          </CardTitle>
          <CardDescription>
            Control the round timer for this tournament
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-3xl font-mono font-bold">
              {formatTime(timeLeft)}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleStartTimer}
                disabled={isTimerRunning}
                variant="default"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
              <Button
                onClick={handlePauseTimer}
                disabled={!isTimerRunning}
                variant="outline"
                size="sm"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button
                onClick={handleResetTimer}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={toggleTimerFullscreen}
                variant="outline"
                size="sm"
              >
                <Maximize className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="duration">Duration:</Label>
              {isEditingDuration ? (
                <div className="flex items-center space-x-2">
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={newDuration}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || parseInt(value) > 0) {
                        setNewDuration(value);
                      }
                    }}
                    className="w-20"
                    placeholder="60"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                  <Button size="sm" onClick={handleEditDuration}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{Math.floor(timeLeft / 60)} minutes</span>
                  <Button size="sm" variant="ghost" onClick={handleEditDuration}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-8">
        <Button
          onClick={fetchNextRound}
          disabled={hasPairingsGenerated}
          className="flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>Generate Pairings</span>
        </Button>
        
        {allMatchesCompleted && (
          <Button
            onClick={handleFinalizeRound}
            disabled={!allMatchesCompleted}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Finalize Round</span>
          </Button>
        )}

        <Button
          onClick={handleEndTournament}
          variant="destructive"
          className="flex items-center space-x-2"
        >
          <Trophy className="h-4 w-4" />
          <span>End Tournament</span>
        </Button>
      </div>

      {/* Match Results */}
      {hasPairingsGenerated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Round {tournament.currentRound} Pairings</span>
              </div>
              <Button
                onClick={toggleTableFullscreen}
                variant="outline"
                size="sm"
              >
                <Maximize className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
            </CardTitle>
            <CardDescription>
              Record match results for the current round
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentMatches.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pairings generated yet</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Player 1</TableHead>
                      <TableHead>VS</TableHead>
                      <TableHead>Player 2</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Edit Winner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMatches.map((match) => {
                      const player1Stats = tournament.participants.find(p => p.userId === match.player1Id);
                      const player2Stats = match.player2Id !== 'bye' ? tournament.participants.find(p => p.userId === match.player2Id) : null;
                      
                      return (
                        <TableRow key={match.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {match.table === 0 ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                                BYE
                              </Badge>
                            ) : (
                              <div className="flex items-center justify-center w-16 h-8 bg-primary/10 rounded-md font-semibold text-primary">
                                {match.table}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-semibold text-foreground">{match.player1Name}</div>
                              <div className="text-sm text-muted-foreground">
                                {player1Stats ? (
                                  <span className="inline-flex items-center space-x-1">
                                    <span className="text-green-600 font-medium">{player1Stats.wins}W</span>
                                    <span>-</span>
                                    <span className="text-red-600 font-medium">{player1Stats.losses}L</span>
                                    <span>-</span>
                                    <span className="text-yellow-600 font-medium">{player1Stats.draws}D</span>
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">0W-0L-0D</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-bold text-muted-foreground text-lg">VS</div>
                          </TableCell>
                          <TableCell>
                            {match.player2Id === 'bye' ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                                BYE
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                <div className="font-semibold text-foreground">{match.player2Name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {player2Stats ? (
                                    <span className="inline-flex items-center space-x-1">
                                      <span className="text-green-600 font-medium">{player2Stats.wins}W</span>
                                      <span>-</span>
                                      <span className="text-red-600 font-medium">{player2Stats.losses}L</span>
                                      <span>-</span>
                                      <span className="text-yellow-600 font-medium">{player2Stats.draws}D</span>
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">0W-0L-0D</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {getMatchStatusBadge(match)}
                          </TableCell>
                          <TableCell>
                            {match.status === 'completed' ? (
                              <div className="font-bold text-primary">
                                🏆 {match.winnerName}
                              </div>
                            ) : match.player2Id === 'bye' ? (
                              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
                                Auto Win
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground italic">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {match.player2Id === 'bye' ? (
                              <span className="text-muted-foreground">N/A</span>
                            ) : (
                              <Select
                                key={`${match.id}-${match.winnerId || 'no-winner'}`}
                                value={match.winnerId || ''}
                                onValueChange={(winnerId) => {
                                  const scores = winnerId === match.player1Id ? [2, 0] : [0, 2];
                                  handleMatchResult(match.id, winnerId, scores[0], scores[1]);
                                }}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Select winner" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={match.player1Id}>
                                    {match.player1Name}
                                  </SelectItem>
                                  <SelectItem value={match.player2Id}>
                                    {match.player2Name}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}