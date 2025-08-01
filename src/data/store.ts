export interface User {
  id: string;
  name: string;
  email: string;
  type: 'player' | 'organizer';
  store?: string;
  stats: {
    totalPoints: number;
    winRate: number;
    tournaments: number;
    rank: string;
  };
}

export interface Tournament {
  id: string;
  name: string;
  organizerId: string;
  organizerName: string;
  date: string;
  time: string;
  format: string;
  store: string;
  description: string;
  prizes: string;
  totalVagas: number;
  entryFee: string;
  structure: string;
  rounds: number;
  status: 'upcoming' | 'registration' | 'in-progress' | 'completed';
  participants: { userId: string; userName: string; }[];
}

// --- Dados Mock ---

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    type: 'player',
    stats: { totalPoints: 1500, winRate: 65, tournaments: 10, rank: 'Top 100' },
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@gamestore.com',
    type: 'organizer',
    store: 'Game Central',
    stats: { totalPoints: 0, winRate: 0, tournaments: 0, rank: 'N/A' },
  },
];

const initialTournaments: Tournament[] = [
  {
    id: 'tournament-1',
    name: 'Weekly Modern Championship',
    organizerId: '2',
    organizerName: 'Sarah Johnson',
    date: '2024-12-25',
    time: '18:00',
    format: 'Modern',
    store: 'Game Central',
    description: 'Weekly modern tournament with great prizes!',
    prizes: '1st: $100, 2nd: $50, 3rd: $25',
    totalVagas: 32,
    entryFee: '$15',
    structure: 'Swiss',
    rounds: 5,
    status: 'registration',
    participants: [
      { userId: '1', userName: 'Alex Chen' },
    ],
  },
  {
    id: 'tournament-2',
    name: 'Standard Showdown',
    organizerId: '2',
    organizerName: 'Sarah Johnson',
    date: '2024-12-22',
    time: '14:00',
    format: 'Standard',
    store: 'Game Central',
    description: 'Competitive standard format tournament',
    prizes: '1st: $75, 2nd: $40, 3rd: $20',
    totalVagas: 24,
    entryFee: '$12',
    structure: 'Swiss',
    rounds: 4,
    status: 'upcoming',
    participants: [],
  },
];

// --- Classe para gerenciar o estado da aplicação ---

class TournamentStore {
  private users: User[] = [...initialUsers];
  private tournaments: Tournament[] = [...initialTournaments];
  private _currentUser: User | null = null;

  get currentUser(): User | null {
    return this._currentUser;
  }

  setCurrentUser(user: User | null) {
    this._currentUser = user;
  }

  // --- Gerenciamento de Usuários ---

  authenticateUser(email: string, password: string, userType: 'player' | 'organizer'): User | null {
    const foundUser = this.users.find(
      (user) => user.email === email && password === 'demo' && user.type === userType
    );

    if (foundUser) {
      this.setCurrentUser(foundUser);
    } else {
      this.setCurrentUser(null);
    }
    return foundUser || null;
  }

  registerUser(userData: Omit<User, 'id' | 'stats'>): User {
    if (this.users.some(user => user.email === userData.email)) {
      throw new Error('Email já registrado. Por favor, use outro email.');
    }

    const newId = (this.users.length + 1).toString();

    const newUser: User = {
      id: newId,
      name: userData.name,
      email: userData.email,
      type: userData.type,
      store: userData.store,
      stats: {
        totalPoints: 0,
        winRate: 0,
        tournaments: 0,
        rank: 'N/A',
      },
    };

    this.users.push(newUser);
    this.setCurrentUser(newUser);
    return newUser;
  }
  
  // --- Gerenciamento de Torneios ---

  getTournamentsByOrganizer(organizerId: string): Tournament[] {
    return this.tournaments.filter(t => t.organizerId === organizerId);
  }

  getTournamentsByPlayer(playerId: string): Tournament[] {
    return this.tournaments.filter(t => 
      t.participants.some(p => p.userId === playerId)
    );
  }

  createTournament(tournamentData: Omit<Tournament, 'id' | 'participants' | 'status'>): Tournament {
    const newTournament: Tournament = {
      ...tournamentData,
      id: `tournament-${this.tournaments.length + 1}`,
      participants: [],
      status: 'registration',
    };

    this.tournaments.push(newTournament);
    return newTournament;
  }

  updateTournamentStatus(tournamentId: string, status: Tournament['status']) {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    if (tournament) {
      tournament.status = status;
    }
  }

  getTournamentById(id: string): Tournament | undefined {
    return this.tournaments.find(t => t.id === id);
  }
}

export const tournamentStore = new TournamentStore();
