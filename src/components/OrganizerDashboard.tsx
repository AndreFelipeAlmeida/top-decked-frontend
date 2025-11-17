import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Badge } from './ui/badge.tsx';
import { Button } from './ui/button.tsx';
import { Calendar, Users, Trophy, Plus, Upload, TrendingUp, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TournamentImport } from './TournamentImport.tsx';
import { tournamentStore, Tournament } from '../data/store.ts';
import { useMemo } from 'react';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules';

interface OrganizerDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
  onNavigateToTournament: (tournamentId: string) => void;
}

interface LojaPublico {
    id: number;
    nome: string;
    email: string;
}

interface JogadorTorneioLinkPublico {
  jogador_id: number; 
  torneio_id: string;
  ponto: number;
}

interface RodadaBase {
  id: string;
  numero: number;
  data: string;
}

interface BackendTournament {
  id: string;
  nome: string;
  descricao: string | null;
  cidade: string | null;
  data_inicio: string;
  loja_id: number;
  loja?: LojaPublico;
  formato: string | null;
  taxa: number;
  premios: string | null;
  estrutura: string | null;
  vagas: number;
  status: string;
  jogadores: JogadorTorneioLinkPublico[];
  rodadas: RodadaBase[];
  regras_adicionais: any[];
}

// NOTE: Removi a interface duplicada 'BackendTournament'

const mapBackendToFrontend = (backendData: BackendTournament[]): Tournament[] => {
  if (!backendData || !Array.isArray(backendData)) {
      console.error("Dados de backend inválidos. Esperado um array.");
      return [];
  }

  return backendData.map(t => {
      let status: 'open' | 'in-progress' | 'finished';
      if (t.status === "FINALIZADO") {
        status = 'finished';
      } else if (t.status === "EM_ANDAMENTO") {
        status = 'in-progress';
      } else {
        status = 'open';
      }

    return {
      id: t.id ? t.id.toString() : "",
      organizerUserId: t.loja_id?.toString() || "0",
      ruleId: 0, 
      name: t.nome || "Torneio sem nome",
      organizerId: (t.loja_id ?? t.loja?.id)?.toString() || "0",
      organizerName: t.loja?.nome || "Organizador não informado",
      date: t.data_inicio || new Date().toISOString(),
      time: "Horário não informado",
      format: t.formato || 'Formato não informado',
      store: t.cidade || 'Local não informado',
      description: t.descricao || '',
      prizes: t.premios || '',
      maxParticipants: t.vagas ?? 0,
      entryFee: `R$${t.taxa ?? 0}`,
      structure: t.estrutura || '',
      rounds: t.rodadas?.length || 0,
      status: status,
      currentRound: t.rodadas?.length || 0,
      participants: t.jogadores?.map(p => ({ 
        id: p.jogador_id?.toString() || "", 
        userId: p.jogador_id?.toString() || "",
        userName: "Nome não disponível",
        registeredAt: new Date().toISOString(),
        points: p.ponto ?? 0,
        wins: 0, losses: 0, draws: 0, currentStanding: 0
      })) || [],
      matches: [],
      bracket: [],
      createdAt: new Date().toISOString(),
      hasImportedResults: false,
    };
  });
};

/**
 * Um componente reutilizável para exibir quando
 * uma seção (gráficos, listas) não tem dados.
 */
const EmptyStateMessage = () => (
  <div className="w-full h-full flex flex-col justify-center items-center text-center text-gray-500 p-4">
    <Trophy className="h-10 w-10 text-gray-300 mb-3" />
    <p className="font-medium text-sm">Ainda sem dados por aqui :(</p>
    <p className="text-xs max-w-xs mt-1">
      Crie ou importe seus torneios para aproveitar o melhor do TopDecked!
    </p>
  </div>
);

const EmptyStateMessageRecents = () => (
  <div className="w-full h-full flex flex-col justify-center items-center text-center text-gray-500 p-4">
    <Trophy className="h-10 w-10 text-gray-300 mb-3" />
    <p className="font-medium text-sm">Sem torneios próximos por aqui :(</p>
    <p className="text-xs max-w-xs mt-1">
      Crie seus próximos torneios e começe a acompanhá-los!
    </p>
  </div>
);

const EmptyStateMessageLasts = () => (
  <div className="w-full h-full flex flex-col justify-center items-center text-center text-gray-500 p-4">
    <Trophy className="h-10 w-10 text-gray-300 mb-3" />
    <p className="font-medium text-sm">Sem torneios há uma semana :(</p>
    <p className="text-xs max-w-xs mt-1">
      Importe seus torneios da última semana!
    </p>
  </div>
);


export function OrganizerDashboard({ onNavigate, onNavigateToTournament }: OrganizerDashboardProps) {
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
  const [ultimos3Concluidos, setUltimos3Concluidos] = useState<Tournament[]>([]);
  const [lastWeekTournaments, setLastWeekTournaments] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; tournaments: number; participants: number }[]>([]);
  const [data, setData] = useState<any[]>([]);
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];
  const API_URL = process.env.REACT_APP_BACKEND_API_URL;
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);

  const formatData = useMemo(() => {
    // [CORREÇÃO APLICADA AQUI]
    // Agora retorna [] se 'data' estiver vazio,
    // o que permite ao Card "Distribuição de Formatos" mostrar o EmptyStateMessage
    if (data.length === 0) {
      return [];
    }

    const counts: Record<string, number> = {};
    data.forEach((t) => {
      // Garante que 'formato' não seja nulo ou indefinido
      const formato = t.formato || 'Não informado';
      counts[formato] = (counts[formato] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [data]);

  useEffect(() => {
    async function fetchOrganizerTournaments() {
      const token = localStorage.getItem('accessToken');
      try {
        const organizerResponse = await fetch(
          `${API_URL}/lojas/torneios/loja`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );

        if (!organizerResponse.ok) throw new Error('Erro ao buscar torneios');

        const specificData: BackendTournament[] = await organizerResponse.json();
        const mappedOrganizerTournaments = mapBackendToFrontend(specificData);
        // TODO: Separar onde tiver mappedOrganizerTournaments por outros useEffect, igual o de baixo
        setMyTournaments(mappedOrganizerTournaments);
        setData(specificData)
        const hoje = new Date();
        const umaSemanaAtras = new Date();
        const mesAtual = hoje.getMonth(); // 0-11
        const anoAtual = hoje.getFullYear();
        umaSemanaAtras.setDate(hoje.getDate() - 7);

        // Total de participantes
        const participantes = specificData.reduce(
          (acc: number, torneio: any) => acc + (torneio.jogadores?.length || 0),
          0
        );

        // Média de participantes por torneio
        const media = mappedOrganizerTournaments.length > 0 ? (participantes / mappedOrganizerTournaments.length).toFixed(2) : "0";

        // Torneios com datas futuras
        const hj = new Date();
        hj.setHours(0, 0, 0, 0); // zera horas, minutos, segundos, ms
        const ultimos3Concluidos = mappedOrganizerTournaments
          .filter(torneio => torneio.status === "finished")
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);

        const futuros = mappedOrganizerTournaments.filter((t: Tournament) => {
          const tData = new Date(t.date);
          tData.setHours(0, 0, 0, 0); // zera também a hora do torneio
          return tData > hoje;
        });
        
        // Torneios da última semana
        const ultimaSemana = specificData.filter(
          (t: any) => {
            const dataT = new Date(t.data_inicio);
            return dataT >= umaSemanaAtras && dataT <= hoje;
          }
        ).length;

        const finalizadosMes = specificData.filter((t: any) => {
          console.log(t)
          console.log("aqui")
          if (t.status !== 'finished') return false;
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
        const torneiosEstaSemana = specificData.filter((t: any) => {
          const dataTorneio = new Date(t.data_inicio);
          return dataTorneio >= primeiroDiaSemana && dataTorneio <= ultimoDiaSemana;
        });
        console.log(torneiosEstaSemana)
        // Soma participantes
        const totalParticipantes = torneiosEstaSemana.reduce((acc: number, t: any) => {
          return acc + (t.jogadores?.length || 0);
        }, 0);

        // Processa os dados por mês
        const monthly = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const monthTournaments = specificData.filter((tournament: any) => {
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

        const lastWeek = specificData.filter((tournament: any) => {
          const tournamentDate = new Date(tournament.data_inicio);
          return tournamentDate >= sevenDaysAgo && tournamentDate <= today;
        });

        setLastWeekTournaments(lastWeek);
        setMonthlyData(monthly);
        setTorneiosSemana(torneiosEstaSemana.length);
        setUltimos3Concluidos(ultimos3Concluidos)
        setParticipantesSemana(totalParticipantes);
        setTorneiosFinalizadosMes(finalizadosMes);
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

  useEffect(() => {
    if (myTournaments.length === 0) return;

    const ativos = myTournaments.filter((t: any) => t.status !== 'finished').length;
    const finalizados = myTournaments.filter((t: any) => t.status === 'finished').length;

    setTorneiosAtivos(ativos);
    setTorneiosFinalizados(finalizados);
  }, [myTournaments]);

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
            <div className="text-2xl font-bold">{torneiosFinalizadosMes}</div>
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
          {/* [ALTERAÇÃO APLICADA AQUI] */}
          <CardContent className="h-80">
            {myTournaments.length === 0 ? (
              <EmptyStateMessage />
            ) : (
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Formatos</CardTitle>
            <CardDescription>Formatos de torneios populares</CardDescription>
          </CardHeader>

          {/* [ALTERAÇÃO APLICADA AQUI] */}
          <CardContent className="h-80">
            {formatData.length === 0 ? (
              <EmptyStateMessage />
            ) : (
              // ESTADO: Com Dados
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    stroke="none"
                  >
                    {formatData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tournaments */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Próximos Torneios</CardTitle>
          <CardDescription>Gerencie seus eventos agendados</CardDescription>
        </CardHeader>
        {/* [ALTERAÇÃO APLICADA AQUI] */}
        <CardContent>
          <div className="space-y-4">
            {torneiosFuturos.map((tournament: Tournament) => (
              <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{tournament.name}</h3>
                    <p className="text-sm text-muted-foreground">{new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })
                  .format(new Date(`${tournament.date}T00:00:00Z`))}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {tournament.participants.length} {tournament.maxParticipants > 0 ? ` / ${tournament.maxParticipants}`: ''}
                        </span>
                    </div>
                    <Badge 
                        className={tournament.status === "finished" ? 'bg-gray-100 text-black' : 'bg-purple-100 text-purple-800'}
                      >
                        {tournament.status === 'finished' ? 'Fechado' : 'Aberto'}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onNavigateToTournament(tournament.id.toString())}
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
        {/* [ALTERAÇÃO APLICADA AQUI] */}
        <CardContent>
          {ultimos3Concluidos.length === 0 ? (
            <EmptyStateMessageLasts />
          ) : (
            <div className="space-y-4">
              {ultimos3Concluidos.map((tournament) => (
              <div
                key={tournament.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Trophy className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{tournament.name}</h3>
                    <p className="text-sm text-muted-foreground"></p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-right">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {tournament.participants?.length || 0} jogadores
                    </span>
                  </div>
                </div>
              </div>
                ))}
            </div>
          )}
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