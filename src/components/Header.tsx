import React, { useState } from 'react';
import { Button } from './ui/button.tsx';
import { Badge } from './ui/badge.tsx';
import { Trophy, Calendar, BarChart3, User, CreditCard, LogOut, List, Menu, X } from 'lucide-react';
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
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavigate = (page: Page, data?: any) => {
    onNavigate(page, data);
    setIsMobileMenuOpen(false);
  };

  const handleMobileLogout = () => {
    onLogout();
    setIsMobileMenuOpen(false);
  };

  const dashboardPage = userType === 'player' ? 'player-dashboard' : 'organizer-dashboard';
  const profilePage = userType === 'player' ? 'player-profile' : 'organizer-profile';

  return (
    // [ALTERADO] Adicionado 'relative' para ser a âncora do menu absoluto
    <header className="fixed top-0 w-full bg-white border-b border-border z-50">
      {/* [ALTERADO] Removido 'lg:justify-center lg:gap-16' 
        Mantido 'justify-between' para todas as telas.
        Adicionado 'relative' para o posicionamento absoluto do menu.
      */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">

        {/* LOGO (Permanece igual) */}
        <div className="flex items-center shrink-0 cursor-pointer"
             onClick={() => onNavigate(dashboardPage)}>
          <img
            src={logo}
            alt="TopDecked Logo"
            className="h-9 md:h-10 lg:h-12 w-auto object-contain transition-transform hover:scale-105"
          />
        </div>

        {/* [ALTERADO] NAV MENU (Desktop) 
          Agora está fora do "container da direita" e posicionado de forma absoluta
          para garantir a centralização.
        */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-sm md:text-base absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Button
            variant={isActive(dashboardPage) ? 'default' : 'ghost'}
            onClick={() => onNavigate(dashboardPage)}
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
        
        {/* [ALTERADO] Este container agora agrupa APENAS 
          as ações de usuário (desktop) e o botão hamburger (mobile).
          Eles são mutuamente exclusivos (um aparece em 'lg', outro some).
        */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* USER ACTIONS (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 md:gap-4 text-sm md:text-base shrink-0">
            <Badge variant="secondary" className="hidden lg:flex">
              {userType === 'player' ? 'Jogador' : 'Organizador'}
            </Badge>
            
            <Button
              variant="ghost"
              onClick={() => onNavigate(profilePage)}
              className="flex items-center gap-2"
              title={currentUser?.name}
            >
              <User className="h-4 w-4" />
              <span className="hidden xl:inline">{currentUser?.name}</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={onLogout}
              className="flex items-center gap-2"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xl:inline">Sair</span>
            </Button>
          </div>

          {/* Botão Hamburger (Móvel) */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </Button>
          </div>

        </div> {/* Fim do container da direita */}
      </div>

      {/* Menu Suspenso Móvel (Permanece o mesmo) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b z-40 p-4 shadow-md">
          <nav className="flex flex-col gap-2">
            {/* ... (todo o conteúdo do menu móvel permanece igual) ... */}
            <Button
              variant={isActive(dashboardPage) ? 'secondary' : 'ghost'}
              onClick={() => handleMobileNavigate(dashboardPage)}
              className="w-full flex justify-start gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Painel</span>
            </Button>
            <Button
              variant={isActive('tournament-list') ? 'secondary' : 'ghost'}
              onClick={() => handleMobileNavigate('tournament-list')}
              className="w-full flex justify-start gap-2"
            >
              <List className="h-4 w-4" />
              <span>Torneios</span>
            </Button>
            <Button
              variant={isActive('ranking') ? 'secondary' : 'ghost'}
              onClick={() => handleMobileNavigate('ranking')}
              className="w-full flex justify-start gap-2"
            >
              <Trophy className="h-4 w-4" />
              <span>Classificação</span>
            </Button>
            
            {userType === 'organizer' && (
              <>
                <Button
                  variant={isActive('tournament-creation') ? 'secondary' : 'ghost'}
                  onClick={() => handleMobileNavigate('tournament-creation')}
                  className="w-full flex justify-start gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Criar Torneio</span>
                </Button>
                <Button
                  variant={isActive('subscription') ? 'secondary' : 'ghost'}
                  onClick={() => handleMobileNavigate('subscription')}
                  className="w-full flex justify-start gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Assinatura</span>
                </Button>
              </>
            )}

            <hr className="my-2" />

            <Button
              variant={isActive(profilePage) ? 'secondary' : 'ghost'}
              onClick={() => handleMobileNavigate(profilePage)}
              className="w-full flex justify-start gap-2"
            >
              <User className="h-4 w-4" />
              <span>{currentUser?.name}</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleMobileLogout}
              className="w-full flex justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}