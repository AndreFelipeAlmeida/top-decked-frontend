import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Textarea } from "./ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover.tsx";
import { Checkbox } from "./ui/checkbox.tsx";
import { Alert, AlertDescription } from "./ui/alert.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table.tsx";
import { Badge } from "./ui/badge.tsx";
import {
  Trophy,
  ArrowLeft,
  CheckCircle,
  Plus,
  Check,
  Trash2,
  Users,
  Settings,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "./ui/utils.ts";
import {
  User,
  Tournament,
  PlayerRule,
  TournamentParticipant,
} from "../data/store.ts";
import { toast } from "sonner";


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

interface TournamentEditProps {
  onNavigate: (page: Page, data?: any) => void;
  currentUser: User | null;
  tournamentId: string | null;
}

interface PlayerRuleAssignment {
  id: string;
  playerId: string;
  playerName: string;
  ruleId: string;
  ruleName: string;
}

interface MonthlyStats {
    mes: string;
    ano: number;
    pontos: number;
    vitorias: number;
    derrotas: number;
    empates: number;
}

export function TournamentEdit({
  onNavigate,
  currentUser,
  tournamentId,
}: TournamentEditProps) {
  const [tournament, setTournament] =
    useState<Tournament | null>(null);
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

  const [monthlyResults, setMonthlyResults] = useState<MonthlyStats[]>([]);

  const fetchMonthlyResults = async (players: User[], token: string) => {
    try {
      const resultsPromises = players.map(async (player) => {
        const response = await fetch(`${API_URL}/jogadores/estatisticas`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
            console.error(`Falha ao buscar estatísticas para o jogador ${player.name}`);
            return null;
        }

        const stats = await response.json();
        return {
            jogador_id: player.id,
            nome_jogador: player.name,
            ...stats
        };
      });

      const allResults = await Promise.all(resultsPromises);
      setMonthlyResults(allResults.filter(result => result !== null));
    } catch (error) {
        console.error('Erro ao buscar resultados mensais:', error);
        toast.error('Falha ao carregar os resultados mensais.');
        setMonthlyResults([]);
    }
  };

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
        
        setTournament(tournamentData);
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
        setTournament(prev => prev ? { ...prev, hasImportedResults: hasImportedResults } : prev);

        const playersFromBackend = tournamentData.jogadores.map((player: any) => ({
          id: player.jogador_id.toString(),
          name: player.nome,
          email: '',
          type: 'player', 
        }));
        setAvailablePlayers(playersFromBackend);
        
        fetchMonthlyResults(playersFromBackend, token);


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

  useEffect(() => {
    if (currentUser?.type === "organizer") {
      fetchTournamentData();
    } else {
        setHasAccess(false);
    }
  }, [tournamentId, currentUser]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!tournamentId || !currentUser) {
      toast.error('Torneio ou usuário não encontrado.');
      setIsLoading(false);
      return;
    }

    if (!formData.name || !formData.date || !formData.format || !formData.structure) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Token de acesso não encontrado. Faça o login novamente.');
      onNavigate('login');
      setIsLoading(false);
      return;
    }

    const regrasAdicionaisDict: { [key: string]: number } = {};
    playerRuleAssignments.forEach(assignment => {
      regrasAdicionaisDict[assignment.playerId] = parseInt(assignment.ruleId, 10);
    });

    const requestBody: any = {
      nome: formData.name,
      data_inicio: formData.date,
      formato: formData.format,
      descricao: formData.description,
      premio: formData.prizes,
      taxa: parseFloat(formData.entryFee) || 0,
      n_rodadadas: parseInt(formData.rounds, 10) || 5, 
      regra_basica_id: defaultRuleId ? parseInt(defaultRuleId, 10) : undefined, 
      regras_adicionais: regrasAdicionaisDict,
      hora: formData.time && formData.time !== "--:--" ? formData.time : null,
    };
    
    Object.keys(requestBody).forEach(key => requestBody[key] === null && delete requestBody[key]);

    try {
      const response = await fetch(`${API_URL}/lojas/torneios/${tournamentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Torneio atualizado com sucesso!",
        });
        toast.success("Torneio atualizado com sucesso!");
        setTimeout(() => {
          onNavigate("tournament-details", {
            tournamentId: tournamentId,
          });
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('Erro de validação do backend:', errorData.detail);
        const errorMessage = Array.isArray(errorData.detail) ? errorData.detail.map((err: any) => err.msg).join(", ") : errorData.detail;
        throw new Error(errorMessage || "Falha ao atualizar o torneio. Por favor, tente novamente.");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: (error as Error).message,
      });
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddPlayerRule = () => {
    if (!additionalRuleId || !selectedPlayerId) {
      toast.error("Por favor, selecione uma regra e um jogador");
      return;
    }

    const rule = availableRules.find(
      (r) => r.id === additionalRuleId,
    );
    const player = availablePlayers.find(
      (p) => p.id === selectedPlayerId,
    );

    if (!rule || !player) {
      toast.error("Seleção de regra ou jogador inválida");
      return;
    }

    const existingAssignment = playerRuleAssignments.find(
      (assignment) => assignment.playerId === selectedPlayerId,
    );
    if (existingAssignment) {
      toast.error("O jogador já tem uma regra atribuída");
      return;
    }

    const newAssignment: PlayerRuleAssignment = {
      id: `assignment-${Date.now()}`,
      playerId: selectedPlayerId,
      playerName: player.name,
      ruleId: additionalRuleId,
      ruleName: rule.typeName,
    };

    setPlayerRuleAssignments([
      ...playerRuleAssignments,
      newAssignment,
    ]);
    setAdditionalRuleId("");
    setSelectedPlayerId("");
    setRulePopoverOpen(false);
    setPlayerPopoverOpen(false);
    toast.success("Regra de jogador adicionada com sucesso");
  };

  const handleRemovePlayerRule = (assignmentId: string) => {
    setPlayerRuleAssignments(
      playerRuleAssignments.filter(
        (assignment) => assignment.id !== assignmentId,
      ),
    );
    toast.success("Regra de jogador removida");
  };

  const calculatePlayerPoints = (
    participant: TournamentParticipant,
    forTournamentResults: boolean = false,
  ) => {
    if (
      !participant ||
      participant.wins == null ||
      participant.losses == null
    ) {
      return participant?.points || 0;
    }

    const defaultRule = availableRules.find(
      (rule) => rule.id === defaultRuleId,
    );

    const playerAssignment = playerRuleAssignments.find(
      (assignment) =>
        assignment.playerId === participant.userId,
    );

    const rule = playerAssignment
      ? availableRules.find(
          (r) => r.id === playerAssignment.ruleId,
        )
      : defaultRule;

    if (
      !rule ||
      rule.pointsForWin == null ||
      rule.pointsForLoss == null
    ) {
      return participant.points || 0;
    }

    if (
      forTournamentResults &&
      playerAssignment &&
      !applyAdditionalRules
    ) {
      return participant.points || 0;
    }

    const calculatedPoints =
      participant.wins * rule.pointsForWin +
      participant.losses * rule.pointsForLoss;

    return isNaN(calculatedPoints)
      ? participant.points || 0
      : calculatedPoints;
  };

  const calculateMonthlyPlayerPoints = (
    playerId: string,
    originalPoints: number,
  ) => {
    if (isNaN(originalPoints) || originalPoints == null) {
      return 0;
    }

    const defaultRule = availableRules.find(
      (rule) => rule.id === defaultRuleId,
    );

    const playerAssignment = playerRuleAssignments.find(
      (assignment) => assignment.playerId === playerId,
    );

    const rule = playerAssignment
      ? availableRules.find(
          (r) => r.id === playerAssignment.ruleId,
        )
      : defaultRule;

    if (!rule) return originalPoints;

    const bonusPoints = playerAssignment ? 5 : 0;

    return originalPoints + bonusPoints;
  };

  const updateEditingScore = (
    participantId: string,
    value: string,
  ) => {
    setEditingScores((prev) => ({
      ...prev,
      [participantId]: value,
    }));
  };

  const adjustScore = (
    participantId: string,
    delta: number,
  ) => {
    const currentScore = parseInt(
      editingScores[participantId] || "0",
    );
    const newScore = Math.max(0, currentScore + delta);
    updateEditingScore(participantId, newScore.toString());
  };

  const confirmEdit = (participantId: string) => {
    const score = parseInt(editingScores[participantId]);
    if (isNaN(score)) {
      toast.error("Por favor, insira uma pontuação válida");
      return;
    }

    setMockTournamentResults((prev) =>
      prev.map((p) =>
        p.id === participantId ? { ...p, points: score } : p,
      ),
    );

    toast.success("Pontuação atualizada com sucesso");
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

  if (
    !hasAccess ||
    !tournament ||
    !currentUser ||
    currentUser.type !== "organizer"
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {!tournament
              ? "Torneio Não Encontrado"
              : "Acesso Não Autorizado"}
          </h1>
          <p className="text-muted-foreground mb-4">
            {!tournament
              ? "O torneio solicitado não pôde ser encontrado ou você não tem acesso a ele."
              : "Esta página de edição de torneio só pode ser acessada após a importação de dados de torneio XML."}
          </p>
          <Button
            onClick={() =>
              onNavigate("tournament-details", { tournamentId })
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Detalhes do Torneio
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
          onClick={() =>
            onNavigate("tournament-details", { tournamentId })
          }
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Detalhes do Torneio
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          Editar Torneio
        </h1>
        <p className="text-muted-foreground">
          Atualizar detalhes do torneio e gerir regras de
          pontuação de jogadores
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tournament Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Informações do Torneio</span>
            </CardTitle>
            <CardDescription>
              Atualize os detalhes básicos para o seu torneio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Torneio *</Label>
                <Input
                  id="name"
                  placeholder="Friday Night Magic"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Formato *</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) =>
                    setFormData({ ...formData, format: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Modern">
                      Modern
                    </SelectItem>
                    <SelectItem value="Standard">
                      Standard
                    </SelectItem>
                    <SelectItem value="Commander">
                      Commander
                    </SelectItem>
                    <SelectItem value="Legacy">
                      Legacy
                    </SelectItem>
                    <SelectItem value="Vintage">
                      Vintage
                    </SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sealed">
                      Sealed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      time: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryFee">
                  Taxa de Inscrição
                </Label>
                <Input
                  id="entryFee"
                  placeholder="$15"
                  value={formData.entryFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      entryFee: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="structure">
                  Estrutura do Torneio *
                </Label>
                <Select
                  value={formData.structure}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      structure: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar estrutura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Swiss">Suíço</SelectItem>
                    <SelectItem value="Single Elimination">
                      Eliminação Simples
                    </SelectItem>
                    <SelectItem value="Double Elimination">
                      Eliminação Dupla
                    </SelectItem>
                    <SelectItem value="Round Robin">
                      Round Robin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rounds">Número de Rondas</Label>
              <Input
                id="rounds"
                type="number"
                placeholder="5"
                value={formData.rounds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rounds: e.target.value,
                  })
                }
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do torneio, regras ou informações adicionais..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizes">Prémios</Label>
              <Textarea
                id="prizes"
                placeholder="1º Lugar: $100 crédito na loja, 2º Lugar: $50 crédito na loja..."
                value={formData.prizes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prizes: e.target.value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {(
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Regras de Jogador</span>
              </CardTitle>
              <CardDescription>
                Configure as regras de pontuação para os
                jogadores neste torneio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Rule */}
              <div className="space-y-2">
                <Label htmlFor="defaultRule">
                  Regra Básica do Jogador
                </Label>
                <Select
                  value={defaultRuleId}
                  onValueChange={setDefaultRuleId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar regra padrão para todos os jogadores" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.typeName} (Vitória:{" "}
                        {rule.pointsForWin}pts, Derrota:{" "}
                        {rule.pointsForLoss}pts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Esta regra será aplicada a todos os jogadores
                  por padrão
                </p>
              </div>

              {/* Additional/Specific Rules */}
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">
                    Regras Adicionais/Específicas
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Atribuir regras de pontuação específicas a
                    jogadores individuais
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Regra Adicional do Jogador</Label>
                      <Popover
                        open={rulePopoverOpen}
                        onOpenChange={setRulePopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={rulePopoverOpen}
                            className="w-full justify-between"
                          >
                            {additionalRuleId
                              ? availableRules.find(
                                  (rule) =>
                                    rule.id ===
                                    additionalRuleId,
                                )?.typeName
                              : "Buscar e selecionar regra..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto min-w-[var(--radix-popover-trigger-width)] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar regras..." />
                            <CommandList>
                              <CommandEmpty>
                                Nenhuma regra encontrada.
                              </CommandEmpty>
                              <CommandGroup>
                                {availableRules.map((rule) => (
                                  <CommandItem
                                    key={rule.id}
                                    value={rule.typeName}
                                    onSelect={() => {
                                      setAdditionalRuleId(
                                        rule.id ===
                                          additionalRuleId
                                          ? ""
                                          : rule.id,
                                      );
                                      setRulePopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        additionalRuleId ===
                                          rule.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>
                                        {rule.typeName}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Vitória:{" "}
                                        {rule.pointsForWin}pts,
                                        Derrota:{" "}
                                        {rule.pointsForLoss}pts
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Nome do Jogador</Label>
                      <Popover
                        open={playerPopoverOpen}
                        onOpenChange={setPlayerPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={playerPopoverOpen}
                            className="w-full justify-between"
                          >
                            {selectedPlayerId
                              ? availablePlayers.find(
                                  (player) =>
                                    player.id ===
                                    selectedPlayerId,
                                )?.name
                              : "Buscar e selecionar jogador..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto min-w-[var(--radix-popover-trigger-width)] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar jogadores..." />
                            <CommandList>
                              <CommandEmpty>
                                Nenhum jogador encontrado.
                              </CommandEmpty>
                              <CommandGroup>
                                {availablePlayers.map(
                                  (player) => (
                                    <CommandItem
                                      key={player.id}
                                      value={player.name}
                                      onSelect={() => {
                                        setSelectedPlayerId(
                                          player.id ===
                                            selectedPlayerId
                                            ? ""
                                            : player.id,
                                        );
                                        setPlayerPopoverOpen(
                                          false,
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedPlayerId ===
                                            player.id
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      <span>{player.name}</span>
                                    </CommandItem>
                                  ),
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddPlayerRule}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>

                  {/* Display assigned rules */}
                  {playerRuleAssignments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className="font-medium">
                        Regras Atribuídas:
                      </h5>
                      {playerRuleAssignments.map(
                        (assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div>
                              <span className="font-medium">
                                {assignment.playerName}
                              </span>
                              <span className="text-muted-foreground ml-2">
                                → {assignment.ruleName}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemovePlayerRule(
                                  assignment.id,
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section - Only show if tournament has imported results */}
        {tournament?.hasImportedResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Resultados</span>
              </CardTitle>
              <CardDescription>
                Visualize e gerencie os resultados do torneio e
                mensais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="tournament"
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tournament">
                    Resultados do Torneio
                  </TabsTrigger>
                  <TabsTrigger value="monthly">
                    Resultados Mensais
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="tournament"
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="applyAdditionalRules"
                      checked={applyAdditionalRules}
                      onCheckedChange={(checked) =>
                        setApplyAdditionalRules(
                          checked as boolean,
                        )
                      }
                    />
                    <Label htmlFor="applyAdditionalRules">
                      Aplicar Regras Adicionais aos Resultados do
                      Torneio
                    </Label>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Jogador</TableHead>
                          <TableHead>Pontos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockTournamentResults.map(
                          (participant) => (
                            <TableRow key={participant.id}>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={getPositionBadgeStyle(
                                    participant.currentStanding,
                                  )}
                                >
                                  {participant.currentStanding}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {participant.userName}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center border rounded-md">
                                    <Input
                                      type="number"
                                      value={
                                        editingScores[
                                          participant.id
                                        ] || "0"
                                      }
                                      onChange={(e) =>
                                        updateEditingScore(
                                          participant.id,
                                          e.target.value,
                                        )
                                      }
                                      className="w-20 border-0 text-center"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent
                  value="monthly"
                  className="space-y-4"
                >
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jogador</TableHead>
                          <TableHead>Pontos</TableHead>
                          <TableHead>Vitórias</TableHead>
                          <TableHead>Derrotas</TableHead>
                          <TableHead>Empates</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyResults.map((result) => {
                          return (
                            <TableRow key={result.jogador_id}>
                              <TableCell>
                                {result.nome_jogador}
                              </TableCell>
                              <TableCell>
                                {result.estatisticas[0]?.pontos ?? 0}
                              </TableCell>
                              <TableCell>
                                {result.estatisticas[0]?.vitorias ?? 0}
                              </TableCell>
                              <TableCell>
                                {result.estatisticas[0]?.derrotas ?? 0}
                              </TableCell>
                              <TableCell>
                                {result.estatisticas[0]?.empates ?? 0}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Success/Error Messages */}
        {message && (
          <Alert
            variant={
              message.type === "error"
                ? "destructive"
                : "default"
            }
          >
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onNavigate("tournament-details", { tournamentId })
            }
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2"
          >
            {isLoading ? "A atualizar..." : "Atualizar Torneio"}
          </Button>
        </div>
      </form>
    </div>
  );
}