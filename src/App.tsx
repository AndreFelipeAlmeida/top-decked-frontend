import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { PlayerDashboard } from './components/PlayerDashboard.tsx';
import { OrganizerDashboard } from './components/OrganizerDashboard.tsx';
import { tournamentStore, User } from './data/store.ts';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  };

  const handleNavigate = (page: Page, data?: any) => {
    if (page !== 'login' && page !== 'player-dashboard' && page !== 'organizer-dashboard') {
      const targetDashboard: Page = currentUser?.type === 'player' ? 'player-dashboard' : 'organizer-dashboard';
      setCurrentPage(targetDashboard);
    } else {
      setCurrentPage(page);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'player-dashboard':
        return (
          <PlayerDashboard
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        );
      case 'organizer-dashboard':
        return (
          <OrganizerDashboard
            onNavigate={handleNavigate}
            currentUser={currentUser}
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
    </div>
  );
}
