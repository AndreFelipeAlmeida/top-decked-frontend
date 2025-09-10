import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Input } from '../ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.tsx';
import { CheckCircle, XCircle, Minus, Search, Filter } from 'lucide-react';

interface MatchHistoryProps {
  matchHistory: any[]; // Espera a lista de históricos de partidas
}

export function MatchHistory({ matchHistory }: MatchHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');

  // Extrair lojas únicas dos dados de matchHistory
  // Assumindo que cada item em matchHistory tem uma propriedade 'store'
  const uniqueStores = Array.from(new Set(matchHistory.map(match => match.store)));

  // Filtra matches baseados nos termos e filtros
  const filteredMatches = matchHistory.filter(match => {
    // Ajustes para lidar com possiveis valores nulos ou indefinidos
    const matchesSearch = searchTerm === '' || (match.opponent && match.opponent.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = dateFilter === '' || (match.date === dateFilter);
    const matchesResult = resultFilter === 'all' || (match.result && match.result.toLowerCase() === resultFilter);
    const matchesStore = storeFilter === 'all' || (match.store && match.store === storeFilter);
    
    return matchesSearch && matchesDate && matchesResult && matchesStore;
  });

  const getResultIcon = (result: string | undefined) => {
    switch (result?.toLowerCase()) {
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

  const getResultBadge = (result: string | undefined) => {
    switch (result?.toLowerCase()) {
      case 'win':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Vitória</Badge>;
      case 'loss':
        return <Badge variant="destructive">Derrota</Badge>;
      case 'draw':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Empate</Badge>;
      default:
        return <Badge variant="outline">{result || 'N/A'}</Badge>;
    }
  };

  // Adaptação para mostrar resultado da partida com base nos campos que o backend retorna
  const formatMatchResult = (match: any) => {
    if (match.result?.toLowerCase() === 'draw') {
      return 'Empate';
    }
    // Verificando se winner e loser existem, caso contrário, pode ser um 'bye' ou outra situação
    const winnerName = match.winner ? match.winner : 'Ninguém'; // Precisa do nome do jogador aqui, não apenas ID.
    const loserName = match.loser ? match.loser : 'Ninguém'; // Precisa do nome do jogador aqui, não apenas ID.

    // Se você tiver os nomes dos jogadores em `matchHistory` ou puder buscá-los:
    // return `${winnerName} venceu ${loserName}`;

    // Se o backend não retorna os nomes diretamente para matchHistory,
    // podemos apenas retornar o resultado e o oponente.
    if (match.result?.toLowerCase() === 'win') {
        return `Vitória contra ${match.opponent || 'Desconhecido'}`;
    } else if (match.result?.toLowerCase() === 'loss') {
        return `Derrota contra ${match.opponent || 'Desconhecido'}`;
    }
    return 'Resultado Indisponível';
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
                {filteredMatches.length > 0 ? (
                  filteredMatches.map((match) => (
                    <TableRow key={match.id}> {/* Usando match.id como key */}
                      <TableCell className="font-medium">
                        {match.date}
                      </TableCell>
                      <TableCell>{match.store}</TableCell>
                      <TableCell className="text-center">{match.tournamentRound !== undefined && match.tournamentRound !== null ? `R${match.tournamentRound}` : 'N/A'}</TableCell>
                      <TableCell className="text-center">{match.tableNumber !== undefined && match.tableNumber !== null ? `#${match.tableNumber}` : 'N/A'}</TableCell>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma partida encontrada para os critérios de busca.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}