import { useState } from 'react';

import logo from '../assets/logo.png';
import { Trophy, Calendar, BarChart3, User, CreditCard, LogOut, List, Menu, X } from 'lucide-react';
import NavbarLink  from '@/components/NavbarLink'
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  currentUser: any;
  onLogout: () => void;
}

const Navbar = ({ currentUser, onLogout }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dashboardPage = currentUser.userType === 'player' ? 'player-dashboard' : 'organizer-dashboard';
  const profilePage = currentUser.userType === 'player' ? 'player-profile' : 'organizer-profile';

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const handleMobileLogout = () => {
    onLogout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-white border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        <NavbarLink to="/">
          <img
            src={logo}
            alt="TopDecked Logo"
            className="h-9 md:h-10 lg:h-12 w-auto object-contain transition-transform hover:scale-105"
          />
        </NavbarLink>

        <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-sm md:text-base absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <NavbarLink to="/" icon={BarChart3}>
            Painel
          </NavbarLink>

          <NavbarLink to="/tournament-list" icon={List}>
            Torneios
          </NavbarLink>

          <NavbarLink to="/ranking" icon={Trophy}>
            Classificação
          </NavbarLink>

          {currentUser.userType === "organizer" && (
            <>
              <NavbarLink to="/tournament-creation" icon={Calendar}>
                Criar Torneio
              </NavbarLink>

              <NavbarLink to="/subscription" icon={CreditCard}>
                Assinatura
              </NavbarLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-2 md:gap-4 text-sm md:text-base shrink-0">
            <Badge variant="secondary" className="hidden lg:flex">
              {currentUser.userType === "player" ? "Jogador" : "Organizador"}
            </Badge>

            <NavbarLink
              to={profilePage}
              icon={User}
            >
              <span className="hidden xl:inline">{currentUser?.name}</span>
            </NavbarLink>

            {/* Logout é ação, continua sendo Button */}
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
              {isMobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b z-40 p-4 shadow-md">
          <nav className="flex flex-col gap-2">
            <NavbarLink to={dashboardPage} icon={BarChart3} onClick={closeMobileMenu}>
              Painel
            </NavbarLink>

            <NavbarLink to="/tournament-list" icon={List} onClick={closeMobileMenu}>
              Torneios
            </NavbarLink>

            <NavbarLink to="/ranking" icon={Trophy} onClick={closeMobileMenu}>
              Classificação
            </NavbarLink>

            {currentUser.userType === "organizer" && (
              <>
                <NavbarLink
                  to="/tournament-creation"
                  icon={Calendar}
                  onClick={closeMobileMenu}
                >
                  Criar Torneio
                </NavbarLink>

                <NavbarLink
                  to="/subscription"
                  icon={CreditCard}
                  onClick={closeMobileMenu}
                >
                  Assinatura
                </NavbarLink>
              </>
            )}

            <hr className="my-2" />

            <NavbarLink
              to={profilePage}
              icon={User}
              onClick={closeMobileMenu}
            >
              {currentUser?.name}
            </NavbarLink>

            {/* Logout continua Button */}
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

export default Navbar;
