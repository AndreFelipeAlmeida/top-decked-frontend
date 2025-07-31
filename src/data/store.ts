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

class TournamentStore {
  private users: User[] = [];
  private _currentUser: User | null = null;

  constructor() {
    this.users = [...initialUsers];
  }

  get currentUser(): User | null {
    return this._currentUser;
  }

  setCurrentUser(user: User | null) {
    this._currentUser = user;
  }

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

}

export const tournamentStore = new TournamentStore();
