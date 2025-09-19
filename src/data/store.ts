export interface User {
  id: string;
  name: string;
  email: string;
  type: 'player' | 'organizer';
  phone?: string;
  store?: string;
  dateOfBirth?: string;
  avatar?: string;
  address?: string;
  website?: string;
  gameIds?: Array<{
    game: string;
    id: string;
  }>;
  stats?: {
    totalPoints: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    tournaments: number;
    rank: number;
  };
}

export interface Tournament {
  id: string;
  name: string;
  organizerId: string;
  organizerName: string;
  organizerUserId: string;
  date: string;
  time: string;
  format: string;
  store: string;
  description: string;
  prizes: string;
  maxParticipants: number;
  entryFee: string;
  structure: string;
  rounds: number;
  status: "open" | "in-progress" | "finished";
  currentRound: number;
  participants: TournamentParticipant[];
  matches: Match[];
  bracket?: BracketMatch[];
  createdAt: string;
  hasImportedResults?: boolean;
}

export interface TournamentParticipant {
  id: string;
  userId: string;
  userName: string;
  registeredAt: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  currentStanding: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  table: number;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  winnerId?: string;
  winnerName?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  player1?: { id: string; name: string };
  player2?: { id: string; name: string };
  winner?: { id: string; name: string };
  score?: string;
}

export interface PlayerRule {
  id: string;
  typeName: string;
  pointsForWin: number;
  pointsForLoss: number;
  pointsGivenToOpponent: number;
  pointsLostByOpponent: number;
  organizerId: string;
  createdAt: string;
}

export interface PlayerRuleAssignment {
  id: string;
  playerId: string;
  playerName: string;
  ruleId: string;
  ruleName: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'player-1',
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    type: 'player',
    store: 'Downtown Comics',
    dateOfBirth: '1995-03-15',
    stats: {
      totalPoints: 1680,
      wins: 89,
      losses: 23,
      draws: 5,
      winRate: 76,
      tournaments: 42,
      rank: 12
    }
  },
  {
    id: 'organizer-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@gamestore.com',
    type: 'organizer',
    store: 'Game Central',
    stats: {
      totalPoints: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      tournaments: 85, // tournaments organized
      rank: 0
    }
  },
  {
    id: 'player-2',
    name: 'Mike Rodriguez',
    email: 'mike.rodriguez@example.com',
    type: 'player',
    store: 'Magic Emporium',
    stats: {
      totalPoints: 2250,
      wins: 85,
      losses: 45,
      draws: 12,
      winRate: 60,
      tournaments: 45,
      rank: 3
    }
  },
  {
    id: 'player-3',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    type: 'player',
    store: 'Card Kingdom',
    stats: {
      totalPoints: 2180,
      wins: 67,
      losses: 28,
      draws: 7,
      winRate: 66,
      tournaments: 34,
      rank: 4
    }
  }
];

// Mock Tournaments
export const mockTournaments: Tournament[] = [
  {
    id: 'tournament-1',
    name: 'Weekly Modern Championship',
    organizerId: 'organizer-1',
    organizerName: 'Sarah Johnson',
    date: '2024-12-25',
    time: '18:00',
    format: 'Modern',
    store: 'Game Central',
    description: 'Weekly modern tournament with great prizes!',
    prizes: '1st: $100, 2nd: $50, 3rd: $25',
    maxParticipants: 32,
    entryFee: '$15',
    structure: 'Swiss',
    rounds: 5,
    status: 'open',
    currentRound: 0,
    participants: [
      {
        id: 'part-1',
        userId: 'player-1',
        userName: 'Alex Chen',
        registeredAt: '2024-12-18T10:00:00Z',
        points: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        currentStanding: 1
      },
      {
        id: 'part-2',
        userId: 'player-2',
        userName: 'Mike Rodriguez',
        registeredAt: '2024-12-18T11:30:00Z',
        points: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        currentStanding: 2
      }
    ],
    matches: [],
    createdAt: '2024-12-15T09:00:00Z',
    hasImportedResults: false
  },
  {
    id: 'tournament-2',
    name: 'Standard Showdown',
    organizerId: 'organizer-1',
    organizerName: 'Sarah Johnson',
    date: '2024-12-22',
    time: '14:00',
    format: 'Standard',
    store: 'Game Central',
    description: 'Competitive standard format tournament',
    prizes: '1st: $75, 2nd: $40, 3rd: $20',
    maxParticipants: 24,
    entryFee: '$12',
    structure: 'Swiss',
    rounds: 4,
    status: 'open',
    currentRound: 0,
    participants: [],
    matches: [],
    createdAt: '2024-12-10T14:00:00Z',
    hasImportedResults: false
  },
  {
    id: 'tournament-3',
    name: 'Friday Night Magic',
    organizerId: 'organizer-1',
    organizerName: 'Sarah Johnson',
    date: '2024-12-15',
    time: '19:00',
    format: 'Modern',
    store: 'Game Central',
    description: 'Casual Friday night tournament',
    prizes: '1st: $60, 2nd: $30, 3rd: $15',
    maxParticipants: 16,
    entryFee: '$10',
    structure: 'Single Elimination',
    rounds: 4,
    status: 'finished',
    currentRound: 4,
    participants: [
      {
        id: 'part-3',
        userId: 'player-1',
        userName: 'Alex Chen',
        registeredAt: '2024-12-14T10:00:00Z',
        points: 12,
        wins: 4,
        losses: 0,
        draws: 0,
        currentStanding: 1
      },
      {
        id: 'part-4',
        userId: 'player-2',
        userName: 'Mike Rodriguez',
        registeredAt: '2024-12-14T11:00:00Z',
        points: 9,
        wins: 3,
        losses: 1,
        draws: 0,
        currentStanding: 2
      },
      {
        id: 'part-5',
        userId: 'player-3',
        userName: 'Emma Davis',
        registeredAt: '2024-12-14T12:00:00Z',
        points: 6,
        wins: 2,
        losses: 2,
        draws: 0,
        currentStanding: 3
      }
    ],
    matches: [
      {
        id: 'match-1',
        tournamentId: 'tournament-3',
        round: 1,
        table: 1,
        player1Id: 'player-1',
        player1Name: 'Alex Chen',
        player2Id: 'player-2',
        player2Name: 'Mike Rodriguez',
        player1Score: 2,
        player2Score: 1,
        winnerId: 'player-1',
        winnerName: 'Alex Chen',
        status: 'completed'
      }
    ],
    bracket: [
      {
        id: 'bracket-1',
        round: 1,
        matchNumber: 1,
        player1: { id: 'player-1', name: 'Alex Chen' },
        player2: { id: 'player-2', name: 'Mike Rodriguez' },
        winner: { id: 'player-1', name: 'Alex Chen' },
        score: '2-1'
      }
    ],
    createdAt: '2024-12-10T09:00:00Z',
    hasImportedResults: true
  }
];

// Mock Player Rules
export const mockPlayerRules: PlayerRule[] = [
  {
    id: 'rule-1',
    typeName: 'Normal Player',
    pointsForWin: 3,
    pointsForLoss: 0,
    pointsGivenToOpponent: 0,
    pointsLostByOpponent: 0,
    organizerId: 'organizer-1',
    createdAt: '2024-12-01T09:00:00Z'
  },
  {
    id: 'rule-2',
    typeName: 'Team Rocket',
    pointsForWin: 3,
    pointsForLoss: 0,
    pointsGivenToOpponent: 0,
    pointsLostByOpponent: 0.5,
    organizerId: 'organizer-1',
    createdAt: '2024-12-01T10:00:00Z'
  },
  {
    id: 'rule-3',
    typeName: 'Lucky Player',
    pointsForWin: 4,
    pointsForLoss: 1,
    pointsGivenToOpponent: 0.5,
    pointsLostByOpponent: 0,
    organizerId: 'organizer-1',
    createdAt: '2024-12-01T11:00:00Z'
  }
];

// Store class for managing state
class TournamentStore {
  private users: User[] = [...mockUsers];
  private tournaments: Tournament[] = [...mockTournaments];
  private playerRules: PlayerRule[] = [...mockPlayerRules];
  private currentUser: User | null = null;

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }
  

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): User[] {
    return this.users;
  }

  authenticateUser(email: string, password: string): User | null {
    const user = this.users.find(u => u.email === email);
    return user || null; // In real app, would verify password
  }

  registerUser(userData: Omit<User, 'id' | 'stats'>): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      stats: {
        totalPoints: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
        tournaments: 0,
        rank: 999
      }
    };
    this.users.push(newUser);
    return newUser;
  }

  // Tournament management
  getAllTournaments(): Tournament[] {
    return this.tournaments;
  }

  getTournamentById(id: string): Tournament | undefined {
    return this.tournaments.find(t => t.id === id);
  }

  getTournamentsByOrganizer(organizerId: string): Tournament[] {
    return this.tournaments.filter(t => t.organizerId === organizerId);
  }

  getTournamentsByPlayer(playerId: string): Tournament[] {
    return this.tournaments.filter(t => 
      t.participants.some(p => p.userId === playerId)
    );
  }

  createTournament(tournamentData: Omit<Tournament, 'id' | 'participants' | 'matches' | 'createdAt' | 'status' | 'currentRound' | 'hasImportedResults'>): Tournament {
    const newTournament: Tournament = {
      ...tournamentData,
      id: `tournament-${Date.now()}`,
      status: 'open',
      currentRound: 0,
      participants: [],
      matches: [],
      createdAt: new Date().toISOString(),
      hasImportedResults: false
    };
    this.tournaments.push(newTournament);
    return newTournament;
  }

  registerPlayerForTournament(tournamentId: string, playerId: string): boolean {
    const tournament = this.getTournamentById(tournamentId);
    const player = this.getUserById(playerId);
    
    if (!tournament || !player || tournament.participants.length >= tournament.maxParticipants) {
      return false;
    }

    const isAlreadyRegistered = tournament.participants.some(p => p.userId === playerId);
    if (isAlreadyRegistered) {
      return false;
    }

    const participant: TournamentParticipant = {
      id: `participant-${Date.now()}`,
      userId: playerId,
      userName: player.name,
      registeredAt: new Date().toISOString(),
      points: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      currentStanding: tournament.participants.length + 1
    };

    tournament.participants.push(participant);
    return true;
  }

  unregisterPlayerFromTournament(tournamentId: string, playerId: string): boolean {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return false;

    const participantIndex = tournament.participants.findIndex(p => p.userId === playerId);
    if (participantIndex === -1) return false;

    tournament.participants.splice(participantIndex, 1);
    return true;
  }

  updateTournamentStatus(tournamentId: string, status: Tournament['status']): boolean {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return false;

    tournament.status = status;
    return true;
  }

  updateTournament(tournamentId: string, updates: Partial<Pick<Tournament, 'name' | 'date' | 'time' | 'format' | 'description' | 'prizes' | 'maxParticipants' | 'entryFee' | 'structure' | 'rounds'>>): Tournament | null {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return null;

    // Apply updates
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof typeof updates;
      if (updates[typedKey] !== undefined) {
        (tournament as any)[typedKey] = updates[typedKey];
      }
    });

    return tournament;
  }

  markTournamentAsImported(tournamentId: string): boolean {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return false;

    tournament.hasImportedResults = true;
    return true;
  }

  // Rankings
  getPlayerRankings(): User[] {
    return this.users
      .filter(u => u.type === 'player' && u.stats)
      .sort((a, b) => (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0));
  }

  getRankingsByOrganizer(organizerId: string): User[] {
    const organizerTournaments = this.getTournamentsByOrganizer(organizerId);
    const playerStats = new Map<string, { points: number; tournaments: number; wins: number; losses: number; draws: number }>();

    // Calculate stats for players who participated in this organizer's tournaments
    organizerTournaments.forEach(tournament => {
      tournament.participants.forEach(participant => {
        const existing = playerStats.get(participant.userId) || { points: 0, tournaments: 0, wins: 0, losses: 0, draws: 0 };
        existing.points += participant.points;
        existing.tournaments += 1;
        existing.wins += participant.wins;
        existing.losses += participant.losses;
        existing.draws += participant.draws;
        playerStats.set(participant.userId, existing);
      });
    });

    // Create ranking list
    const rankings: (User & { organizerStats: any })[] = [];
    playerStats.forEach((stats, userId) => {
      const user = this.getUserById(userId);
      if (user) {
        rankings.push({
          ...user,
          organizerStats: stats
        });
      }
    });

    return rankings.sort((a, b) => b.organizerStats.points - a.organizerStats.points);
  }

  // Player Rules management
  getPlayerRulesByOrganizer(organizerId: string): PlayerRule[] {
    return this.playerRules.filter(rule => rule.organizerId === organizerId);
  }

  getPlayerRuleById(ruleId: string): PlayerRule | undefined {
    return this.playerRules.find(rule => rule.id === ruleId);
  }

  createPlayerRule(ruleData: Omit<PlayerRule, 'id' | 'createdAt'>): PlayerRule {
    const newRule: PlayerRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.playerRules.push(newRule);
    return newRule;
  }

  updatePlayerRule(ruleId: string, updates: Partial<Omit<PlayerRule, 'id' | 'organizerId' | 'createdAt'>>): PlayerRule | null {
    const rule = this.getPlayerRuleById(ruleId);
    if (!rule) return null;

    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof typeof updates;
      if (updates[typedKey] !== undefined) {
        (rule as any)[typedKey] = updates[typedKey];
      }
    });

    return rule;
  }

  deletePlayerRule(ruleId: string): boolean {
    const ruleIndex = this.playerRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) return false;

    this.playerRules.splice(ruleIndex, 1);
    return true;
  }
}

export const tournamentStore = new TournamentStore();