import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { UserCheck, Activity, History } from 'lucide-react';
import { MainDashboard } from './dashboard/MainDashboard.tsx';
import { DetailedStatistics } from './dashboard/DetailedStatistics.tsx';
import { MatchHistory } from './dashboard/MatchHistory.tsx';
import { User } from '../data/store.ts';

const API_URL = process.env.BACKEND_API_URL;

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface PlayerDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
  onNavigateToTournament: (tournamentId: string) => void;
  currentUser: User | null;
}

export function PlayerDashboard({ onNavigate, onNavigateToTournament, currentUser }: PlayerDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<any | null>(null);
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [yearlyProgressionData, setYearlyProgressionData] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [performanceByFormatData, setPerformanceByFormatData] = useState<any[]>([]);
  const [frequentOpponentsData, setFrequentOpponentsData] = useState<any[]>([]);
  
  // Novo estado para as estatísticas de colocação
  const [placementStats, setPlacementStats] = useState({
    firstPlace: 0,
    secondPlace: 0,
    topFour: 0,
    topEight: 0
  });

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch estatísticas gerais e histórico de torneios
        const statsRes = await fetch(`${API_URL}/jogadores/estatisticas`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!statsRes.ok) throw new Error('Erro ao buscar estatísticas');
        const statsData = await statsRes.json();

        setPlayerStats(statsData);

        // Calcular as estatísticas de colocação
        let firstPlaceCount = 0;
        let secondPlaceCount = 0;
        let topFourCount = 0;
        let topEightCount = 0;
        
        if (statsData.historico) {
          statsData.historico.forEach((item: any) => {
            if (item.colocacao === 1) {
              firstPlaceCount++;
            }
            if (item.colocacao === 2) {
              secondPlaceCount++;
            }
            if (item.colocacao <= 4) {
              topFourCount++;
            }
            if (item.colocacao <= 8) {
              topEightCount++;
            }
          });
        }
        
        setPlacementStats({
          firstPlace: firstPlaceCount,
          secondPlace: secondPlaceCount,
          topFour: topFourCount,
          topEight: topEightCount,
        });

        const formattedRecentTournaments = statsData.historico?.slice(0, 4).map((item: any) => ({
          id: item.id,
          name: item.nome,
          date: new Date(item.data_inicio).toLocaleDateString('pt-BR'),
          placement: item.colocacao,
          participants: item.participantes,
          points: item.pontuacao,
        })) || [];
        setRecentTournaments(formattedRecentTournaments);

        setYearlyProgressionData(statsData.estatisticas_anuais || []);
        const uniqueYears = Array.from(new Set<number>((statsData.estatisticas_anuais || []).map((d: any) => d.ano)))
          .sort((a, b) => b - a)
          .map(y => y.toString());
        setAvailableYears(uniqueYears);

        // Fetch dados para o desempenho por formato (gráfico de pizza/radar)
        const performanceRes = await fetch(`${API_URL}/ranking/desempenho`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!performanceRes.ok) throw new Error('Erro ao buscar desempenho por formatos');
        const performanceApiData = await performanceRes.json();
        setPerformanceByFormatData(performanceApiData);

        // Fetch dados para oponentes frequentes e histórico de partidas
        const opponentsRes = await fetch(`${API_URL}/jogadores/historico`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!opponentsRes.ok) throw new Error('Erro ao buscar histórico de partidas');
        const opponentsData = await opponentsRes.json();

        setFrequentOpponentsData(opponentsData);

        const formattedMatchHistory = opponentsData.map((item: any) => ({
          id: item.id,
          opponent: item.nome,
          wins: item.vitorias,
          losses: item.derrotas,
          draws: item.empates
        }));
        setMatchHistory(formattedMatchHistory);

      } catch (err) {
        console.error("Erro na integração do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel do Jogador</h1>
        <p className="text-muted-foreground">Bem-vindo de volta, {currentUser?.name || 'Jogador'}! Aqui está seu progresso em torneios.</p>
      </div>

      <Tabs defaultValue="main" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Painel principal</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Estatísticas detalhadas</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Histórico de partidas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main">
          <MainDashboard
            onNavigate={onNavigate}
            onNavigateToTournament={onNavigateToTournament}
            playerStats={playerStats}
            recentTournaments={recentTournaments}
            placementStats={placementStats} // Passando as novas estatísticas
          />
        </TabsContent>

        <TabsContent value="statistics">
          <DetailedStatistics
            yearlyProgressionData={yearlyProgressionData}
            availableYears={availableYears}
            frequentOpponentsData={frequentOpponentsData}
            performanceByFormatData={performanceByFormatData}
          />
        </TabsContent>

        <TabsContent value="history">
          <MatchHistory matchHistory={matchHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
