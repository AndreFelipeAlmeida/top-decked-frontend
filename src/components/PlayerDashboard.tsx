import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { UserCheck, Activity, History } from 'lucide-react';
import { MainDashboard } from './dashboard/MainDashboard.tsx';
import { DetailedStatistics } from './dashboard/DetailedStatistics.tsx';
import { MatchHistory } from './dashboard/MatchHistory.tsx';
import { User } from '../data/store.ts';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface PlayerDashboardProps {
  onNavigate: (page: Page, data?: any) => void;
  onNavigateToTournament: (tournamentId: string) => void;
  currentUser: User | null;
}

export function PlayerDashboard({ onNavigate, onNavigateToTournament, currentUser }: PlayerDashboardProps) {
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
            currentUser={currentUser} 
          />
        </TabsContent>

        <TabsContent value="statistics">
          <DetailedStatistics currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="history">
          <MatchHistory currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}