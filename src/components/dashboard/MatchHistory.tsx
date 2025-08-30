import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Input } from '../ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.tsx';
import { CheckCircle, XCircle, Minus, Search, Filter } from 'lucide-react';
import { User } from '../../data/store.ts';

interface MatchHistoryProps {
  currentUser: User | null;
}

// Comprehensive match history data
const matchHistory = [
  {
    id: 1,
    date: '2024-12-15',
    store: 'Downtown Comics',
    tournamentRound: 4,
    tableNumber: 3,
    result: 'Win',
    opponent: 'Marcus Rodriguez',
    winner: 'Alex Chen',
    loser: 'Marcus Rodriguez'
  },
  {
    id: 2,
    date: '2024-12-15',
    store: 'Downtown Comics',
    tournamentRound: 3,
    tableNumber: 5,
    result: 'Win',
    opponent: 'Sarah Kim',
    winner: 'Alex Chen',
    loser: 'Sarah Kim'
  },
  {
    id: 3,
    date: '2024-12-15',
    store: 'Downtown Comics',
    tournamentRound: 2,
    tableNumber: 7,
    result: 'Loss',
    opponent: 'David Thompson',
    winner: 'David Thompson',
    loser: 'Alex Chen'
  },
  {
    id: 4,
    date: '2024-12-15',
    store: 'Downtown Comics',
    tournamentRound: 1,
    tableNumber: 2,
    result: 'Win',
    opponent: 'Lisa Chen',
    winner: 'Alex Chen',
    loser: 'Lisa Chen'
  },
  {
    id: 5,
    date: '2024-12-10',
    store: 'GameZone',
    tournamentRound: 5,
    tableNumber: 1,
    result: 'Loss',
    opponent: 'Michael Johnson',
    winner: 'Michael Johnson',
    loser: 'Alex Chen'
  },
  {
    id: 6,
    date: '2024-12-10',
    store: 'GameZone',
    tournamentRound: 4,
    tableNumber: 4,
    result: 'Win',
    opponent: 'Emma Wilson',
    winner: 'Alex Chen',
    loser: 'Emma Wilson'
  },
  {
    id: 7,
    date: '2024-12-10',
    store: 'GameZone',
    tournamentRound: 3,
    tableNumber: 6,
    result: 'Draw',
    opponent: 'Ryan O\'Connor',
    winner: '',
    loser: ''
  },
  {
    id: 8,
    date: '2024-12-10',
    store: 'GameZone',
    tournamentRound: 2,
    tableNumber: 3,
    result: 'Win',
    opponent: 'Jessica Park',
    winner: 'Alex Chen',
    loser: 'Jessica Park'
  },
  {
    id: 9,
    date: '2024-12-10',
    store: 'GameZone',
    tournamentRound: 1,
    tableNumber: 8,
    result: 'Win',
    opponent: 'Tom Anderson',
    winner: 'Alex Chen',
    loser: 'Tom Anderson'
  },
  {
    id: 10,
    date: '2024-12-08',
    store: 'Card Kingdom',
    tournamentRound: 3,
    tableNumber: 2,
    result: 'Win',
    opponent: 'Kevin Lee',
    winner: 'Alex Chen',
    loser: 'Kevin Lee'
  },
  {
    id: 11,
    date: '2024-12-08',
    store: 'Card Kingdom',
    tournamentRound: 2,
    tableNumber: 4,
    result: 'Win',
    opponent: 'Amanda Davis',
    winner: 'Alex Chen',
    loser: 'Amanda Davis'
  },
  {
    id: 12,
    date: '2024-12-08',
    store: 'Card Kingdom',
    tournamentRound: 1,
    tableNumber: 1,
    result: 'Win',
    opponent: 'Carlos Martinez',
    winner: 'Alex Chen',
    loser: 'Carlos Martinez'
  },
  {
    id: 13,
    date: '2024-12-05',
    store: 'Magic Emporium',
    tournamentRound: 4,
    tableNumber: 3,
    result: 'Loss',
    opponent: 'Nicole Brown',
    winner: 'Nicole Brown',
    loser: 'Alex Chen'
  },
  {
    id: 14,
    date: '2024-12-05',
    store: 'Magic Emporium',
    tournamentRound: 3,
    tableNumber: 2,
    result: 'Win',
    opponent: 'Brandon Miller',
    winner: 'Alex Chen',
    loser: 'Brandon Miller'
  },
  {
    id: 15,
    date: '2024-12-05',
    store: 'Magic Emporium',
    tournamentRound: 2,
    tableNumber: 5,
    result: 'Draw',
    opponent: 'Rachel Green',
    winner: '',
    loser: ''
  },
  {
    id: 16,
    date: '2024-12-05',
    store: 'Magic Emporium',
    tournamentRound: 1,
    tableNumber: 7,
    result: 'Win',
    opponent: 'James Wilson',
    winner: 'Alex Chen',
    loser: 'James Wilson'
  },
  {
    id: 17,
    date: '2024-12-01',
    store: 'The Game Store',
    tournamentRound: 4,
    tableNumber: 4,
    result: 'Loss',
    opponent: 'Stephanie Clark',
    winner: 'Stephanie Clark',
    loser: 'Alex Chen'
  },
  {
    id: 18,
    date: '2024-12-01',
    store: 'The Game Store',
    tournamentRound: 3,
    tableNumber: 1,
    result: 'Win',
    opponent: 'Eric Rodriguez',
    winner: 'Alex Chen',
    loser: 'Eric Rodriguez'
  },
  {
    id: 19,
    date: '2024-12-01',
    store: 'The Game Store',
    tournamentRound: 2,
    tableNumber: 6,
    result: 'Win',
    opponent: 'Megan Taylor',
    winner: 'Alex Chen',
    loser: 'Megan Taylor'
  },
  {
    id: 20,
    date: '2024-12-01',
    store: 'The Game Store',
    tournamentRound: 1,
    tableNumber: 2,
    result: 'Win',
    opponent: 'Jason White',
    winner: 'Alex Chen',
    loser: 'Jason White'
  }
];

export function MatchHistory({ currentUser }: MatchHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');

  // Get unique stores for filter
  const uniqueStores = Array.from(new Set(matchHistory.map(match => match.store)));

  // Filter matches based on search term and filters
  const filteredMatches = matchHistory.filter(match => {
    const matchesSearch = searchTerm === '' || match.opponent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === '' || match.date === dateFilter;
    const matchesResult = resultFilter === 'all' || match.result.toLowerCase() === resultFilter;
    const matchesStore = storeFilter === 'all' || match.store === storeFilter;
    
    return matchesSearch && matchesDate && matchesResult && matchesStore;
  });

  const getResultIcon = (result: string) => {
    switch (result.toLowerCase()) {
      case 'win':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'loss':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'draw':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result.toLowerCase()) {
      case 'win':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Vitória</Badge>;
      case 'loss':
        return <Badge variant="destructive">Derrota</Badge>;
      case 'draw':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Empate</Badge>;
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };

  const formatMatchResult = (match: any) => {
    if (match.result.toLowerCase() === 'draw') {
      return 'Empate';
    }
    return `${match.winner} venceu ${match.loser}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtrar Histórico de Partidas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar por Oponente</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nome do oponente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Data</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filtrar por data"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Resultado</label>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Resultados</SelectItem>
                  <SelectItem value="win">Vitórias</SelectItem>
                  <SelectItem value="loss">Derrotas</SelectItem>
                  <SelectItem value="draw">Empates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Loja</label>
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Lojas</SelectItem>
                  {uniqueStores.map(store => (
                    <SelectItem key={store} value={store}>{store}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Partidas</CardTitle>
          <CardDescription>
            Registro completo de todas as suas partidas em torneios
            {filteredMatches.length !== matchHistory.length && ` (exibindo ${filteredMatches.length} de ${matchHistory.length} partidas)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Loja/Local</TableHead>
                  <TableHead className="text-center">Rodada</TableHead>
                  <TableHead className="text-center">Mesa</TableHead>
                  <TableHead className="text-center">Resultado</TableHead>
                  <TableHead>Oponente</TableHead>
                  <TableHead>Resultado da Partida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">
                      {new Date(match.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{match.store}</TableCell>
                    <TableCell className="text-center">R{match.tournamentRound}</TableCell>
                    <TableCell className="text-center">#{match.tableNumber}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getResultIcon(match.result)}
                        {getResultBadge(match.result)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{match.opponent}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatMatchResult(match)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredMatches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma partida encontrada para os critérios de busca.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}