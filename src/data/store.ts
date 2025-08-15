export interface User {
  id: number;
  name: string;
  email: string;
  type: 'player' | 'organizer';
  store?: string;
  dateOfBirth?: string;
  avatar?: string;
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
  organizerId: number;
  organizerName: string;
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
  status: 'open' | 'closed';
  currentRound: number;
  participants: TournamentParticipant[];
  matches: Match[];
  bracket?: BracketMatch[];
  createdAt: string;
  hasImportedResults?: boolean;
}

export interface TournamentParticipant {
  id: number;
  userId: number;
  userName: string;
  registeredAt: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  currentStanding: number;
}

export interface Match {
  id: number;
  tournamentId: number;
  round: number;
  table: number;
  player1Id: number;
  player1Name: string;
  player2Id: number;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  winnerId?: number;
  winnerName?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface BracketMatch {
  id: number;
  round: number;
  matchNumber: number;
  player1?: { id: number; name: string };
  player2?: { id: number; name: string };
  winner?: { id: number; name: string };
  score?: string;
}

export interface PlayerRule {
  id: number;
  typeName: string;
  pointsForWin: number;
  pointsForLoss: number;
  pointsGivenToOpponent: number;
  pointsLostByOpponent: number;
  organizerId: number;
  createdAt: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
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
    id: 2,
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
      tournaments: 85,
      rank: 0
    }
  },
  {
    id: 3,
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
    id: 4,
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
    id: "1",
    name: 'Weekly Modern Championship',
    organizerId: 2,
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
        id: 1,
        userId: 1,
        userName: 'Alex Chen',
        registeredAt: '2024-12-18T10:00:00Z',
        points: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        currentStanding: 1
      },
      {
        id: 2,
        userId: 3,
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
    id: "2",
    name: 'Standard Showdown',
    organizerId: 2,
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
    id: "3",
    name: 'Friday Night Magic',
    organizerId: 2,
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
    status: 'closed',
    currentRound: 4,
    participants: [
      {
        id: 3,
        userId: 1,
        userName: 'Alex Chen',
        registeredAt: '2024-12-14T10:00:00Z',
        points: 12,
        wins: 4,
        losses: 0,
        draws: 0,
        currentStanding: 1
      },
      {
        id: 4,
        userId: 3,
        userName: 'Mike Rodriguez',
        registeredAt: '2024-12-14T11:00:00Z',
        points: 9,
        wins: 3,
        losses: 1,
        draws: 0,
        currentStanding: 2
      },
      {
        id: 5,
        userId: 4,
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
        id: 1,
        tournamentId: 3,
        round: 1,
        table: 1,
        player1Id: 1,
        player1Name: 'Alex Chen',
        player2Id: 3,
        player2Name: 'Mike Rodriguez',
        player1Score: 2,
        player2Score: 1,
        winnerId: 1,
        winnerName: 'Alex Chen',
        status: 'completed'
      }
    ],
    bracket: [
      {
        id: 1,
        round: 1,
        matchNumber: 1,
        player1: { id: 1, name: 'Alex Chen' },
        player2: { id: 3, name: 'Mike Rodriguez' },
        winner: { id: 1, name: 'Alex Chen' },
        score: '2-1'
      }
    ],
    createdAt: '2024-12-10T09:00:00Z',
    hasImportedResults: true
  }
];

export const mockPlayerRules: PlayerRule[] = [
  {
    id: 1,
    typeName: 'Normal Player',
    pointsForWin: 3,
    pointsForLoss: 0,
    pointsGivenToOpponent: 0,
    pointsLostByOpponent: 0,
    organizerId: 2,
    createdAt: '2024-12-01T09:00:00Z'
  },
  {
    id: 2,
    typeName: 'Team Rocket',
    pointsForWin: 3,
    pointsForLoss: 0,
    pointsGivenToOpponent: 0,
    pointsLostByOpponent: 0.5,
    organizerId: 2,
    createdAt: '2024-12-01T10:00:00Z'
  },
  {
    id: 3,
    typeName: 'Lucky Player',
    pointsForWin: 4,
    pointsForLoss: 1,
    pointsGivenToOpponent: 0.5,
    pointsLostByOpponent: 0,
    organizerId: 2,
    createdAt: '2024-12-01T11:00:00Z'
  }
];

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

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): User[] {
    return this.users;
  }

  authenticateUser(email: string, password: string): User | null {
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  registerUser(userData: Omit<User, 'id' | 'stats'>): User {
    const newUser: User = {
      ...userData,
      id: Date.now(),
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

  getAllTournaments(): Tournament[] {
    return this.tournaments;
  }

  getTournamentById(id: string): Tournament | undefined {
    return this.tournaments.find(t => t.id === id);
  }

  getTournamentsByOrganizer(organizerId: number): Tournament[] {
    return this.tournaments.filter(t => t.organizerId === organizerId);
  }

  getTournamentsByPlayer(playerId: number): Tournament[] {
    return this.tournaments.filter(t => 
      t.participants.some(p => p.userId === playerId)
    );
  }

  createTournament(tournamentData: Omit<Tournament, 'id' | 'participants' | 'matches' | 'createdAt' | 'status' | 'currentRound' | 'hasImportedResults'>): Tournament {
    const newTournament: Tournament = {
      ...tournamentData,
      id: Date.now().toString(),
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

  registerPlayerForTournament(tournamentId: string, playerId: number): boolean {
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
      id: Date.now(),
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

  unregisterPlayerFromTournament(tournamentId: string, playerId: number): boolean {
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

  updateTournament(tournamentId: string, updates: Partial<Pick<Tournament, 'name' | 'date' | 'time' | 'format' | 'description' | 'prizes' | 'maxParticipants' | 'entryFee' | 'structure' | 'rounds'>>): Tournament | null { // Alterado de string para number
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return null;

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

  getPlayerRankings(): User[] {
    return this.users
      .filter(u => u.type === 'player' && u.stats)
      .sort((a, b) => (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0));
  }

  getRankingsByOrganizer(organizerId: number): User[] {
    const organizerTournaments = this.getTournamentsByOrganizer(organizerId);
    const playerStats = new Map<number, { points: number; tournaments: number; wins: number; losses: number; draws: number }>(); // Alterado de string para number

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

  getPlayerRulesByOrganizer(organizerId: number): PlayerRule[] {
    return this.playerRules.filter(rule => rule.organizerId === organizerId);
  }

  getPlayerRuleById(ruleId: number): PlayerRule | undefined {
    return this.playerRules.find(rule => rule.id === ruleId);
  }

  createPlayerRule(ruleData: Omit<PlayerRule, 'id' | 'createdAt'>): PlayerRule {
    const newRule: PlayerRule = {
      ...ruleData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    this.playerRules.push(newRule);
    return newRule;
  }

  updatePlayerRule(ruleId: number, updates: Partial<Omit<PlayerRule, 'id' | 'organizerId' | 'createdAt'>>): PlayerRule | null {
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

  deletePlayerRule(ruleId: number): boolean {
    const ruleIndex = this.playerRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) return false;

    this.playerRules.splice(ruleIndex, 1);
    return true;
  }
}

export const tournamentStore = new TournamentStore();