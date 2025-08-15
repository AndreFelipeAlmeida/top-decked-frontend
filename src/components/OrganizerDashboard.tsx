import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Calendar, Users, Trophy, Plus, Upload, TrendingUp, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TournamentImport } from './TournamentImport.tsx';
import { tournamentStore } from '../data/store.ts';
import { useMemo } from 'react';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

interface OrganizerDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
}

export function OrganizerDashboard({ onNavigate }: OrganizerDashboardProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const currentUser = tournamentStore.getCurrentUser();

const [torneiosAtivos, setTorneiosAtivos] = useState(0);
const [torneiosFinalizados, setTorneiosFinalizados] = useState(0);
const [totalParticipantes, setTotalParticipantes] = useState(0);
const [mediaParticipantes, setMediaParticipantes] = useState(0);
const [torneiosFuturos, setTorneiosFuturos] = useState<any[]>([]);
const [torneiosUltimaSemana, setTorneiosUltimaSemana] = useState(0);
const [torneiosFinalizadosMes, setTorneiosFinalizadosMes] = useState(0);
const [participantesSemana, setParticipantesSemana] = useState(0);
const [torneiosSemana, setTorneiosSemana] = useState(0);
const [monthlyData, setMonthlyData] = useState<{ month: string; tournaments: number; participants: number }[]>([]);
const [data, setData] = useState<any[]>([]);
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

const formatData = useMemo(() => {
  if (data.length === 0) {
    return [{ name: 'Sem dados', value: 1, color: '#ccc' }];
  }

  const counts: Record<string, number> = {};
  data.forEach((t) => {
    counts[t.formato] = (counts[t.formato] || 0) + 1;
  });

  return Object.entries(counts).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  }));
}, [data]);
const [lastWeekTournaments, setLastWeekTournaments] = useState<any[]>([]);

const ultimos3Concluidos = data
  .filter(torneio => torneio.finalizado)
  .sort((a, b) => new Date(b.dataTorneio).getTime() - new Date(a.dataTorneio).getTime())
  .slice(0, 3);

useEffect(() => {
  async function fetchOrganizerTournaments() {
    const token = localStorage.getItem('accessToken');
    try {
      const organizerResponse = await fetch(
        'http://localhost:8000/lojas/torneios/loja',
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!organizerResponse.ok) throw new Error('Erro ao buscar torneios');

      const data = await organizerResponse.json();
      setData(data)
      const hoje = new Date();
      const umaSemanaAtras = new Date();
      const mesAtual = hoje.getMonth(); // 0-11
      const anoAtual = hoje.getFullYear();
      umaSemanaAtras.setDate(hoje.getDate() - 7);

      // Quantidade de torneios ativos e finalizados
      const ativos = data.filter((t: any) => t.finalizado === false).length;
      const finalizados = data.filter((t: any) => t.finalizado === true).length;

      // Total de participantes
      const participantes = data.reduce(
        (acc: number, torneio: any) => acc + (torneio.jogadores?.length || 0),
        0
      );

      // Média de participantes por torneio
      const media = data.length > 0 ? (participantes / data.length).toFixed(2) : 0;

      // Torneios com datas futuras
      const hj = new Date();
      hj.setHours(0, 0, 0, 0); // zera horas, minutos, segundos, ms

      const futuros = data.filter((t: any) => {
        const tData = new Date(t.data_inicio);
        tData.setHours(0, 0, 0, 0); // zera também a hora do torneio
        return tData > hoje;
      });
      
      console.log(futuros)
      console.log("teste")
      // Torneios da última semana
      const ultimaSemana = data.filter(
        (t: any) => {
          const dataT = new Date(t.data_inicio);
          return dataT >= umaSemanaAtras && dataT <= hoje;
        }
      ).length;

      const finalizadosMes = data.filter((t: any) => {
        if (!t.finalizado) return false;
        const dataTorneio = new Date(t.data_inicio);
        return dataTorneio.getMonth() === mesAtual && dataTorneio.getFullYear() === anoAtual;
      }).length;

      const primeiroDiaSemana = new Date(hoje);
      primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay()); // domingo
      primeiroDiaSemana.setHours(0, 0, 0, 0);

      const ultimoDiaSemana = new Date(primeiroDiaSemana);
      ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6); // sábado
      ultimoDiaSemana.setHours(23, 59, 59, 999);

      // Filtra torneios desta semana
      const torneiosEstaSemana = data.filter((t: any) => {
        const dataTorneio = new Date(t.data_inicio);
        return dataTorneio >= primeiroDiaSemana && dataTorneio <= ultimoDiaSemana;
      });
      
      // Soma participantes
      const totalParticipantes = torneiosEstaSemana.reduce((acc: number, t: any) => {
        return acc + (t.jogadores?.length || 0);
      }, 0);

      // Processa os dados por mês
      const monthly = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthTournaments = data.filter((tournament: any) => {
          const date = new Date(tournament.data_inicio);
          return date.getMonth() + 1 === month;
        });

        const totalParticipants = monthTournaments.reduce((acc, t: any) => acc + (t.jogadores?.length || 0), 0);

        return {
          month: new Date(0, i).toLocaleString('pt-BR', { month: 'short' }),
          tournaments: monthTournaments.length,
          participants: totalParticipants,
        };
      });

      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);

      const lastWeek = data.filter((tournament: any) => {
        const tournamentDate = new Date(tournament.data_inicio);
        return tournamentDate >= sevenDaysAgo && tournamentDate <= today;
      });

      setLastWeekTournaments(lastWeek);
      setMonthlyData(monthly);
      setTorneiosSemana(torneiosEstaSemana.length);
      setParticipantesSemana(totalParticipantes);
      setTorneiosFinalizadosMes(finalizadosMes);
      setTorneiosAtivos(ativos);
      setTorneiosFinalizados(finalizados);
      setTotalParticipantes(participantes);
      setMediaParticipantes(media);
      setTorneiosFuturos(futuros);
      setTorneiosUltimaSemana(ultimaSemana);

    } catch (err) {
      console.error(err);
    }
  }

  fetchOrganizerTournaments();
}, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel do Organizador</h1>
        <p className="text-muted-foreground">Bem-vindo de volta! Gerencie seus torneios e acompanhe o desempenho.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-8">
        <Button 
          onClick={() => onNavigate('tournament-creation')}
          className="h-16 flex items-center space-x-3"
        >
          <Plus className="h-5 w-5" />
          <span>Criar Novo Torneio</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-16 w-full flex items-center space-x-3"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload className="h-5 w-5" />
          <span>Importar Dados do Torneio</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => onNavigate('player-rules')}
          className="h-16 flex items-center space-x-3"
        >
          <FileText className="h-5 w-5" />
          <span>Gerenciar Regras do Jogador</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Torneios Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{torneiosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              {torneiosSemana} esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipantes}</div>
            <p className="text-xs text-muted-foreground">
              +{participantesSemana} em relação à semana passada
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Concluídos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{torneiosFinalizados}</div>
            <p className="text-xs text-muted-foreground">
            este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Comparecimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaParticipantes}</div>
            <p className="text-xs text-muted-foreground">
              jogadores por torneio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Mensal do Torneio</CardTitle>
            <CardDescription>Torneios e participantes ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tournaments" fill="#2d1b69" name="Torneios" />
                <Bar dataKey="participants" fill="#6366f1" name="Participantes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Formatos</CardTitle>
            <CardDescription>Formatos de torneios populares</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tournaments */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Próximos Torneios</CardTitle>
          <CardDescription>Gerencie seus eventos agendados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {torneiosFuturos.map((tournament) => (
              <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{tournament.nome}</h3>
                    <p className="text-sm text-muted-foreground">{tournament.data}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{tournament.jogadores.length}/{tournament.vagas}</span>
                    </div>
                    <Badge 
                      className={tournament.finalizado ? 'bg-gray-100 text-black' : 'bg-purple-100 text-purple-800'}
                    >
                      {tournament.status === 'closed' ? 'Fechado' : 'Aberto'}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigate('tournament-details')}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle>Torneios Recentes</CardTitle>
          <CardDescription>Seus últimos eventos concluídos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ultimos3Concluidos.map((tournament) => (
            <div
              key={tournament.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4 min-w-0">
                <Trophy className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{tournament.nome}</h3>
                  <p className="text-sm text-muted-foreground"></p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 text-right">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {tournament.jogadores?.length || 0} jogadores
                  </span>
                </div>
              </div>
            </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Importar Torneio */}
      {currentUser && (
        <TournamentImport
          isOpen={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
          onNavigate={onNavigate}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}