import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Badge } from '../ui/badge.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Input } from '../ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.tsx';
import { CheckCircle, XCircle, Minus, Search, Filter } from 'lucide-react';
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

interface History {
  data: string;
  loja: string;
  rodada: string;
  mesa: string;
  resultado: string;
  oponente: string;
}
interface MatchHistoryProps {
  matchHistory: any[];
}

export function MatchHistory({ matchHistory }: MatchHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [history, setHistory] = useState<History[]>([]);

  const uniqueStores = Array.from(new Set(matchHistory.map(match => match.store)));

  const getResultIcon = (result: string | undefined) => {
    switch (result?.toLowerCase()) {
      case 'vitoria':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'derrota':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'empate':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getResultBadge = (result: string | undefined) => {
    switch (result?.toLowerCase()) {
      case 'vitoria':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Vitória</Badge>;
      case 'derrota':
        return <Badge variant="destructive">Derrota</Badge>;
      case 'empate':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Empate</Badge>;
      default:
        return <Badge variant="outline">{result || 'N/A'}</Badge>;
    }
  };

  const formatMatchResult = (match: any) => {
    if (match.resultado?.toLowerCase() === 'empate') {
      return 'Empate';
    }
    if (match.resultado?.toLowerCase() === 'vitoria') {
        return `Vitória contra ${match.oponente || 'Desconhecido'}`;
    } else if (match.resultado?.toLowerCase() === 'derrota') {
        return `Derrota contra ${match.oponente || 'Desconhecido'}`;
    }
    return 'Resultado Indisponível';
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/jogadores/rodadas`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data: History[] = await response.json();
          const formattedData = data.map(match => ({
            ...match,
            data: new Date(match.data).toLocaleDateString('pt-BR'),
          }));
          setHistory(formattedData);
          console.log(formattedData)
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);
  
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
            {history.length !== history.length && ` (exibindo ${history.length} de ${history.length} partidas)`}
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
                {history.length > 0 ? (
                  history.map((match: History) => (
                    <TableRow key={match.rodada}>
                      <TableCell className="font-medium">
                        {match.data}
                      </TableCell>
                      <TableCell>{match.loja}</TableCell>
                      <TableCell className="text-center">{match.rodada !== undefined && match.rodada !== null ? `R${match.rodada}` : 'N/A'}</TableCell>
                      <TableCell className="text-center">{match.mesa !== undefined && match.mesa !== null ? `#${match.mesa}` : 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getResultIcon(match.resultado)}
                          {getResultBadge(match.resultado)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{match.oponente}</TableCell>
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