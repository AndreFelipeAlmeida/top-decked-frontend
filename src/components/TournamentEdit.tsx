import React, { useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx";
import { Checkbox } from "./ui/checkbox.tsx";
import { Alert, AlertDescription } from "./ui/alert.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx";
import { Badge } from "./ui/badge.tsx";
import { Trophy, ArrowLeft, CheckCircle, Plus, Check, Trash2, Users, Settings, ChevronsUpDown } from "lucide-react";
import { cn } from "./ui/utils.ts";
import { tournamentStore, User, Tournament, PlayerRule, TournamentParticipant } from "../data/store.ts";
import { toast } from "sonner";


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

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

export function TournamentEdit({
  onNavigate,
  currentUser,
  tournamentId,
}: TournamentEditProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
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

  // Player Rules state
  const [defaultRuleId, setDefaultRuleId] = useState<string>("");
  const [additionalRuleId, setAdditionalRuleId] = useState<string>("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [playerRuleAssignments, setPlayerRuleAssignments] = useState<PlayerRuleAssignment[]>([]);
  const [applyAdditionalRules, setApplyAdditionalRules] = useState<boolean>(false);

  const [availableRules, setAvailableRules] = useState<PlayerRule[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);

  // Popover states for searchable dropdowns
  const [rulePopoverOpen, setRulePopoverOpen] = useState<boolean>(false);
  const [playerPopoverOpen, setPlayerPopoverOpen] = useState<boolean>(false);

  // Inline editing state - all participants editable by default
  const [editingScores, setEditingScores] = useState<Record<string, string>>({});

  // Mock tournament results - in real app this would come from the tournament data
  const [mockTournamentResults] = useState<TournamentParticipant[]>([
    {
      id: "part-1",
      userId: "player-1",
      userName: "Alex Chen",
      registeredAt: "2024-12-18T10:00:00Z",
      points: 12,
      wins: 4,
      losses: 1,
      draws: 0,
      currentStanding: 1,
    },
    {
      id: "part-2",
      userId: "player-2",
      userName: "Mike Rodriguez",
      registeredAt: "2024-12-18T11:30:00Z",
      points: 9,
      wins: 3,
      losses: 2,
      draws: 0,
      currentStanding: 2,
    },
    {
      id: "part-3",
      userId: "player-3",
      userName: "Emma Davis",
      registeredAt: "2024-12-18T12:00:00Z",
      points: 6,
      wins: 2,
      losses: 3,
      draws: 0,
      currentStanding: 3,
    },
  ]);

  const calculatePlayerPoints = useCallback((
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
        (assignment) => assignment.playerId === participant.userId,
      );

      const rule = playerAssignment
        ? availableRules.find((r) => r.id === playerAssignment.ruleId)
        : defaultRule;

      if (!rule || rule.pointsForWin == null || rule.pointsForLoss == null) {
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
    }, [
      availableRules,
      defaultRuleId,
      playerRuleAssignments,
      applyAdditionalRules
  ]);

  // Initialize editing scores when results load
  useEffect(() => {
    const initialScores: Record<string, string> = {};
    mockTournamentResults.forEach((participant) => {
      initialScores[participant.id] = calculatePlayerPoints(
        participant,
        true,
      ).toString();
    });
    setEditingScores(initialScores);
  }, [
    mockTournamentResults,
    applyAdditionalRules,
    playerRuleAssignments,
    defaultRuleId,
    calculatePlayerPoints,
  ]);

  const mockMonthlyResults = [
    {
      playerId: "player-1",
      playerName: "Alex Chen",
      totalPoints: 45,
      tournaments: 4,
      avgPlacement: 1.8,
    },
    {
      playerId: "player-2",
      playerName: "Mike Rodriguez",
      totalPoints: 38,
      tournaments: 3,
      avgPlacement: 2.3,
    },
    {
      playerId: "player-3",
      playerName: "Emma Davis",
      totalPoints: 32,
      tournaments: 5,
      avgPlacement: 2.8,
    },
  ];

  useEffect(() => {
    if (tournamentId && currentUser?.type === "organizer") {
      const foundTournament = tournamentStore.getTournamentById(tournamentId);
      if (foundTournament && foundTournament.organizerId === currentUser.id) {
        setTournament(foundTournament);
        setFormData({
          name: foundTournament.name,
          date: foundTournament.date,
          time: foundTournament.time,
          format: foundTournament.format,
          prizes: foundTournament.prizes || "",
          description: foundTournament.description || "",
          entryFee: foundTournament.entryFee,
          structure: foundTournament.structure,
          rounds: foundTournament.rounds.toString(),
        });

        // Load available player rules
        const rules = tournamentStore.getPlayerRulesByOrganizer(currentUser.id);
        setAvailableRules(rules);

        // Set default rule to the first "Normal Player" rule or first available rule
        const defaultRule =
          rules.find((rule) => rule.typeName === "Normal Player") || rules[0];
        if (defaultRule) {
          setDefaultRuleId(defaultRule.id);
        }

        // Load available players (all users with player type)
        const players = tournamentStore
          .getAllUsers()
          .filter((user) => user.type === "player");
        setAvailablePlayers(players);
      }
    }
  }, [tournamentId, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (
      formData.name &&
      formData.date &&
      formData.format &&
      formData.structure &&
      tournament &&
      currentUser
    ) {
      try {
        const updatedTournament = tournamentStore.updateTournament(tournament.id, {
          name: formData.name,
          date: formData.date,
          time: formData.time,
          format: formData.format,
          description: formData.description,
          prizes: formData.prizes,
          entryFee: formData.entryFee,
          structure: formData.structure,
          rounds: parseInt(formData.rounds) || 5,
        });

        if (updatedTournament) {
          setMessage({
            type: "success",
            text: "Torneio atualizado com sucesso!",
          });
          toast.success("Torneio atualizado com sucesso!");
          setTimeout(() => {
            onNavigate("tournament-details", {
              tournamentId: tournament.id,
            });
          }, 1500);
        } else {
          setMessage({
            type: "error",
            text: "Falha ao atualizar o torneio. Por favor, tente novamente.",
          });
          toast.error("Falha ao atualizar o torneio");
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: "Falha ao atualizar o torneio. Por favor, tente novamente.",
        });
        toast.error("Falha ao atualizar o torneio");
      }
    } else {
      setMessage({
        type: "error",
        text: "Por favor, preencha todos os campos obrigatórios",
      });
      toast.error("Por favor, preencha todos os campos obrigatórios");
    }

    setIsLoading(false);
  };

  const handleAddPlayerRule = () => {
    if (!additionalRuleId || !selectedPlayerId) {
      toast.error("Por favor, selecione uma regra e um jogador");
      return;
    }

    const rule = availableRules.find((r) => r.id === additionalRuleId);
    const player = availablePlayers.find((p) => p.id === selectedPlayerId);

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

    setPlayerRuleAssignments([...playerRuleAssignments, newAssignment]);
    setAdditionalRuleId("");
    setSelectedPlayerId("");
    setRulePopoverOpen(false);
    setPlayerPopoverOpen(false);
    toast.success("Regra de jogador adicionada com sucesso");
  };

  const handleRemovePlayerRule = (assignmentId: string) => {
    setPlayerRuleAssignments(
      playerRuleAssignments.filter((assignment) => assignment.id !== assignmentId),
    );
    toast.success("Regra de jogador removida");
  };

  const calculateMonthlyPlayerPoints = (
    playerId: string,
    originalPoints: number,
  ) => {
    if (isNaN(originalPoints) || originalPoints == null) {
      return 0;
    }

    const defaultRule = availableRules.find((rule) => rule.id === defaultRuleId);

    const playerAssignment = playerRuleAssignments.find(
      (assignment) => assignment.playerId === playerId,
    );

    const rule = playerAssignment
      ? availableRules.find((r) => r.id === playerAssignment.ruleId)
      : defaultRule;

    if (!rule) return originalPoints;

    const bonusPoints = playerAssignment ? 5 : 0;

    return originalPoints + bonusPoints;
  };

  const updateEditingScore = (participantId: string, value: string) => {
    setEditingScores((prev) => ({
      ...prev,
      [participantId]: value,
    }));
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
    !tournament ||
    !currentUser ||
    currentUser.type !== "organizer" ||
    currentUser.id !== tournament.organizerId
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
                  value={formData.date}
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

        {/* Player Rules Section - Only show if tournament has imported results */}
        {tournament.hasImportedResults && (
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
        {tournament.hasImportedResults && (
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
                          <TableHead>Torneios</TableHead>
                          <TableHead>Pos. Média</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockMonthlyResults.map((result) => (
                          <TableRow key={result.playerId}>
                            <TableCell>
                              {result.playerName}
                            </TableCell>
                            <TableCell>
                              {calculateMonthlyPlayerPoints(
                                result.playerId,
                                result.totalPoints,
                              )}
                            </TableCell>
                            <TableCell>
                              {result.tournaments}
                            </TableCell>
                            <TableCell>
                              {result.avgPlacement.toFixed(1)}
                            </TableCell>
                          </TableRow>
                        ))}
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
