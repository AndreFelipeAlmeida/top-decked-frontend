import React from 'react';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Trophy, Calendar, BarChart3, User, CreditCard, LogOut, List } from 'lucide-react';
import { User as UserType } from '../data/store.ts';


type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

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
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">TopDecked</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button
              variant={isActive(userType === 'player' ? 'player-dashboard' : 'organizer-dashboard') ? 'default' : 'ghost'}
              onClick={() => onNavigate(userType === 'player' ? 'player-dashboard' : 'organizer-dashboard')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Painel</span>
            </Button>
            
            <Button
              variant={isActive('tournament-list') ? 'default' : 'ghost'}
              onClick={() => onNavigate('tournament-list')}
              className="flex items-center space-x-2"
            >
              <List className="h-4 w-4" />
              <span>Torneios</span>
            </Button>
            
            <Button
              variant={isActive('ranking') ? 'default' : 'ghost'}
              onClick={() => onNavigate('ranking')}
              className="flex items-center space-x-2"
            >
              <Trophy className="h-4 w-4" />
              <span>Classificação</span>
            </Button>
            
            {userType === 'organizer' && (
              <Button
                variant={isActive('tournament-creation') ? 'default' : 'ghost'}
                onClick={() => onNavigate('tournament-creation')}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Criar Torneio</span>
              </Button>
            )}
            
            {userType === 'organizer' && (
              <Button
                variant="ghost"
                onClick={(e) => e.preventDefault()}
                className="flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Assinatura</span>
              </Button>
            )}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="hidden sm:flex">
            {userType === 'player' ? 'Jogador' : 'Organizador'}
          </Badge>
          
          <Button
            variant="ghost"
            onClick={() => onNavigate(userType === 'player' ? 'player-profile' : 'organizer-profile')}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{currentUser?.name}</span>
          </Button>
          
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
