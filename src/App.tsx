import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { PlayerDashboard } from './components/PlayerDashboard.tsx';
import { OrganizerDashboard } from './components/OrganizerDashboard.tsx';
import { TournamentCreation } from './components/TournamentCreation.tsx';
import { RankingScreen } from './components/RankingScreen.tsx';
import { TournamentDetails } from './components/TournamentDetails.tsx';
import { TournamentList } from './components/TournamentList.tsx';
import { TournamentEdit } from './components/TournamentEdit.tsx';
import { PlayerRules } from './components/PlayerRules.tsx';
import { PlayerProfile } from './components/PlayerProfile.tsx';
import { OrganizerProfile } from './components/OrganizerProfile.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import { tournamentStore, User } from './data/store.ts';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [viewedPlayerId, setViewedPlayerId] = useState<string | null>(null);
  const [viewedOrganizerId, setViewedOrganizerId] = useState<string | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    tournamentStore.setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentPage(user.type === 'player' ? 'player-dashboard' : 'organizer-dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    tournamentStore.setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
    setSelectedTournamentId(null);
    setViewedPlayerId(null);
    setViewedOrganizerId(null);
  };

  const handleNavigateToTournament = (tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
    setCurrentPage('tournament-details');
  };

  const handleNavigate = (page: Page, data?: any) => {
    if ((page === 'tournament-details' || page === 'tournament-edit') && data?.tournamentId) {
      setSelectedTournamentId(data.tournamentId);
    }
    if (page === 'player-profile' && data?.playerId) {
      setViewedPlayerId(data.playerId);
    } else if (page === 'player-profile' && !data?.playerId) {
      setViewedPlayerId(null);
    }
    if (page === 'organizer-profile' && data?.organizerId) {
      setViewedOrganizerId(data.organizerId);
    } else if (page === 'organizer-profile' && !data?.organizerId) {
      setViewedOrganizerId(null);
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'player-dashboard':
        return (
          <PlayerDashboard 
            onNavigate={handleNavigate}
            onNavigateToTournament={handleNavigateToTournament}
            currentUser={currentUser}
          />
        );
      case 'organizer-dashboard':
        return (
          <OrganizerDashboard 
            onNavigate={handleNavigate}
          />
        );
      case 'tournament-creation':
        return (
          <TournamentCreation 
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        );
      case 'ranking':
        return <RankingScreen onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'player-profile':
        return (
          <PlayerProfile 
            onNavigate={handleNavigate}
            currentUser={currentUser}
            viewedPlayerId={viewedPlayerId}
          />
        );
      case 'organizer-profile':
        return (
          <OrganizerProfile 
            onNavigate={handleNavigate}
            currentUser={currentUser}
            viewedOrganizerId={viewedOrganizerId}
          />
        );
      case 'tournament-details':
        return (
          <TournamentDetails
            onNavigate={handleNavigate}
            tournamentId={selectedTournamentId}
            currentUser={currentUser}
          />
        );
      case 'tournament-list':
        return (
          <TournamentList
            onNavigate={handleNavigate}
            onNavigateToTournament={handleNavigateToTournament}
            currentUser={currentUser}
          />
        );
      case 'tournament-edit':
        return (
          <TournamentEdit
            onNavigate={handleNavigate}
            tournamentId={selectedTournamentId}
            currentUser={currentUser}
          />
        );
      case 'player-rules':
        return (
          <PlayerRules
            onNavigate={handleNavigate}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && (
        <Header 
          userType={currentUser?.type || null} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout}
          currentPage={currentPage}
          currentUser={currentUser}
        />
      )}
      <main className={isAuthenticated ? 'pt-16' : ''}>
        {renderPage()}
      </main>
      <Toaster />
    </div>
  );
}