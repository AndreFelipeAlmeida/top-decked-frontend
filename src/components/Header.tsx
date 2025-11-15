import React from 'react';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Trophy, Calendar, BarChart3, User, CreditCard, LogOut, List } from 'lucide-react';
import { User as UserType } from '../data/store.ts';
import logo from '../images/logo.png';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'subscription' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface HeaderProps {
  userType: UserType['type'] | null;
  onNavigate: (page: Page, data?: any) => void;
  onLogout: () => void;
  currentPage: Page;
  currentUser: UserType | null;
}

export function Header({ userType, onNavigate, onLogout, currentPage, currentUser }: HeaderProps) {
  const isActive = (page: Page) => currentPage === page;

  return (
    <header className="fixed top-0 w-full bg-white border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-10">

        {/* LOGO */}
        <div className="flex items-center shrink-0 cursor-pointer"
             onClick={() => onNavigate(userType === 'player' ? 'player-dashboard' : 'organizer-dashboard')}>
          <img
            src={logo}
            alt="TopDecked Logo"
            className="h-8 md:h-10 lg:h-12 w-auto object-contain transition-transform hover:scale-105"
          />
        </div>

        {/* NAV MENU */}
        <nav className="flex items-center gap-4 lg:gap-6 xl:gap-8 text-sm md:text-base whitespace-nowrap">
          <Button
            variant={isActive(userType === 'player' ? 'player-dashboard' : 'organizer-dashboard') ? 'default' : 'ghost'}
            onClick={() => onNavigate(userType === 'player' ? 'player-dashboard' : 'organizer-dashboard')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Painel</span>
          </Button>

          <Button
            variant={isActive('tournament-list') ? 'default' : 'ghost'}
            onClick={() => onNavigate('tournament-list')}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            <span>Torneios</span>
          </Button>

          <Button
            variant={isActive('ranking') ? 'default' : 'ghost'}
            onClick={() => onNavigate('ranking')}
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            <span>Classificação</span>
          </Button>
          
          {userType === 'organizer' && (
            <>
              <Button
                variant={isActive('tournament-creation') ? 'default' : 'ghost'}
                onClick={() => onNavigate('tournament-creation')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Criar Torneio</span>
              </Button>

              <Button
                variant={isActive('subscription') ? 'default' : 'ghost'}
                onClick={() => onNavigate('subscription')}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Assinatura</span>
              </Button>
            </>
          )}
        </nav>
        
        {/* USER ACTIONS */}
        <div className="ml-auto flex items-center gap-4 text-sm md:text-base shrink-0">
          <Badge variant="secondary" className="hidden sm:flex">
            {userType === 'player' ? 'Jogador' : 'Organizador'}
          </Badge>
          
          <Button
            variant="ghost"
            onClick={() => onNavigate(userType === 'player' ? 'player-profile' : 'organizer-profile')}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{currentUser?.name}</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
