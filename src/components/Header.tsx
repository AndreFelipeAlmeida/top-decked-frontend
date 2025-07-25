import React from 'react';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Trophy, BarChart3, LogOut, List, Calendar, CreditCard } from 'lucide-react';
import { User as UserType } from '../data/store';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard';

interface HeaderProps {
  userType: UserType['type'] | null;
  onNavigate: (page: Page, data?: any) => void;
  onLogout: () => void;
  currentPage: Page;
  currentUser: UserType | null;
}

export function Header({ userType, onNavigate, onLogout, currentPage, currentUser }: HeaderProps) {
  const isActive = (page: Page) => currentPage === page;

  const navigateToDashboard = () => {
    const targetPage: Page = userType === 'player' ? 'player-dashboard' : 'organizer-dashboard';
    onNavigate(targetPage);
  };

  return (
    <header className="fixed top-0 w-full bg-white border-b border-border z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo do Aplicativo */}
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">TopDecked</span>
          </div>
          <nav className="flex items-center space-x-2 md:space-x-6">
            {/* Botão Painel */}
            <Button
              variant={isActive(userType === 'player' ? 'player-dashboard' : 'organizer-dashboard') ? 'default' : 'ghost'}
              onClick={() => onNavigate(userType === 'player' ? 'player-dashboard' : 'organizer-dashboard')}
              className="p-2 md:px-4 md:py-2 flex items-center justify-center md:justify-start md:space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Painel</span>
              <span className="sr-only md:hidden">Painel</span>
            </Button>

            {/* Botão Torneios */}
            <Button
              variant="ghost"
              onClick={navigateToDashboard}
              className="p-2 md:px-4 md:py-2 flex items-center justify-center md:justify-start md:space-x-2"
            >
              <List className="h-4 w-4" />
              <span className="hidden md:inline">Torneios</span>
              <span className="sr-only md:hidden">Torneios</span>
            </Button>

            {/* Botão Rankings */}
            <Button
              variant="ghost"
              onClick={navigateToDashboard}
              className="p-2 md:px-4 md:py-2 flex items-center justify-center md:justify-start md:space-x-2"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden md:inline">Rankings</span>
              <span className="sr-only md:hidden">Rankings</span>
            </Button>

            {/* Botão Criar Torneio (para organizadores) */}
            {userType === 'organizer' && (
              <Button
                variant="ghost"
                onClick={navigateToDashboard}
                className="p-2 md:px-4 md:py-2 flex items-center justify-center md:justify-start md:space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">Criar Torneio</span>
                <span className="sr-only md:hidden">Criar Torneio</span>
              </Button>
            )}

            {/* Botão Assinatura (para organizadores) */}
            {userType === 'organizer' && (
              <Button
                variant="ghost"
                onClick={navigateToDashboard}
                className="p-2 md:px-4 md:py-2 flex items-center justify-center md:justify-start md:space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden md:inline">Assinatura</span>
                <span className="sr-only md:hidden">Assinatura</span>
              </Button>
            )}
          </nav>
        </div>

        {/* Informações do Usuário e Logout */}
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="hidden sm:flex">
            {userType === 'player' ? 'Jogador' : 'Organizador'}
          </Badge>

          {/* Botão de Sair (Logout)*/}
          <Button
            variant="ghost"
            onClick={onLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
