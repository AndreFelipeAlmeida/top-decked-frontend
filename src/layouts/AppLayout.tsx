import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, Settings, Package,
  DollarSign, User, Sparkles, Flame, TrendingUp,
  Menu,
  X,
  User2,
  Award,
  CalendarRange,
  Star,
  Gift,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useAuthContext } from '../hooks/authContext.hooks';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import { useViewMode } from '@/hooks/viewModeContext.hooks';
import { useOrganizadorDoTenantAtual } from '@/hooks/organizadorTenant.hooks';
import { useIsTenant } from '@/hooks/tenantContext.hooks';
import { Sidebar } from './components/Sidebar';

import { tcgGames } from '@/lib/tcgGames';

// A barra de jogos só faz sentido nas telas que ela de fato filtra —
// Dashboard, Torneios e Rankings (ver Tournaments.tsx/OrganizerRankings.tsx/
// OrganizerDashboard.tsx). Nas demais telas ela ficaria sem efeito nenhum.
const PAGINAS_COM_BARRA_DE_JOGOS = [
  '/loja/dashboard',
  '/jogador/dashboard',
  '/torneios',
  '/rankings',
  '/eventos',
  '/loja/temporadas',
  '/loja/pontuacao-extra',
  '/jogador/conquistas',
];

const ROTA_EDITAR_TORNEIO = '/loja/torneio/:id/editar';

const PAGINAS_COM_TODOS_OS_JOGOS = ['/loja/dashboard', '/jogador/dashboard'];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { selectedTcg, setSelectedTcg, mostrarTodosOsJogos, setMostrarTodosOsJogos } = useTcgSelection();
  const { user, handleLogout } = useAuthContext();
  const { viewMode, setViewMode } = useViewMode();
  const isTenant = useIsTenant();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const estaEditandoTorneio = matchPath(ROTA_EDITAR_TORNEIO, location.pathname) !== null;
  const mostrarBarraDeJogos = PAGINAS_COM_BARRA_DE_JOGOS.includes(location.pathname) || estaEditandoTorneio;
  const mostrarPillTodos = PAGINAS_COM_TODOS_OS_JOGOS.includes(location.pathname);

  const { isOrganizador: isOrganizadorDoTenant } = useOrganizadorDoTenantAtual();
  const isOrganizadorJogador = user?.tipo === 'jogador' && viewMode === 'organizador' && isOrganizadorDoTenant;

  useEffect(() => {
    if (user?.tipo === 'jogador' && viewMode === 'organizador' && !isOrganizadorDoTenant) {
      setViewMode('jogador');
    }
  }, [user?.tipo, viewMode, isOrganizadorDoTenant, setViewMode]);

  const roleLabel =
    user?.tipo === 'admin' ? 'Administrador'
      : user?.tipo === 'loja' ? 'Loja'
        : isOrganizadorJogador ? 'Organizador' : 'Jogador';

  const organizerNav = [
    { path: '/loja/dashboard', icon: LayoutDashboard, label: 'Dashboard', disabled: false },
    { path: '/rankings', icon: TrendingUp, label: 'Rankings', disabled: false },
    { path: '/torneios', icon: Trophy, label: 'Torneios', disabled: false },
    { path: '/eventos', icon: Gift, label: 'Eventos', disabled: false },
    { path: '/loja/regras-jogadores', icon: Settings, label: 'Regras de Jogos', disabled: false },
    { path: '/loja/temporadas', icon: CalendarRange, label: 'Temporadas', disabled: false },
    { path: '/loja/pontuacao-extra', icon: Star, label: 'Pontuação Extra', disabled: false },
    { path: '/loja/estoque', icon: Package, label: 'Estoque', disabled: false },
    { path: '/loja/jogadores', icon: User2, label: 'Gerenciar Jogadores', disabled: false },
    { path: '/loja/creditos', icon: DollarSign, label: 'Créditos/Vendas', disabled: false },
  ];

  const playerNav = [
    { path: '/jogador/dashboard', icon: User, label: 'Dashboard', disabled: false },
    { path: '/torneios', icon: Trophy, label: 'Torneios', disabled: false },
    { path: '/eventos', icon: Gift, label: 'Eventos', disabled: false },
    { path: '/rankings', icon: TrendingUp, label: 'Rankings', disabled: false },
    ...(!isTenant
      ? [{ path: '/lojas', icon: Store, label: 'Lojas', disabled: false }]
      : []),
    { path: '/jogador/conquistas', icon: Award, label: 'Conquistas', disabled: false },
    { path: '/jogador/estatisticas', icon: Sparkles, label: 'Estatísticas', disabled: true},
    { path: '/jogador/historico', icon: Flame, label: 'Histórico de Partidas', disabled: true },
    { path: '/jogador/torneios', icon: Trophy, label: 'Torneios', disabled: true },
    { path: '/jogador/perfil', icon: User, label: 'Perfil & Carteira', disabled: false },
    ...(isOrganizadorJogador
      ? [{ path: '/loja/temporadas', icon: CalendarRange, label: 'Temporadas', disabled: false }]
      : []),
  ];

  const adminNav = [
    { path: '/admin/dashboard', icon: ShieldCheck, label: 'Painel Admin', disabled: false },
  ];

  const navItems = user?.tipo === 'loja' ? organizerNav : user?.tipo === 'admin' ? adminNav : playerNav;

  return (
    <div className="min-h-screen bg-background flex">
      {mostrarBarraDeJogos && (
        <div className="w-20 h-screen sticky top-0 shrink-0 overflow-y-auto bg-[oklch(0.32_0.15_322)] flex flex-col items-center py-4 space-y-3 shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]">
          {mostrarPillTodos && (
            <button
              onClick={() => setMostrarTodosOsJogos(true)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-center text-white text-[9px] font-bold leading-tight px-1 transition-all ${
                mostrarTodosOsJogos
                  ? 'bg-white/25 shadow-lg scale-110 ring-2 ring-white/50'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title="Todos os jogos"
            >
              Todos
            </button>
          )}

          {tcgGames.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                if (game.disabled) return;
                setSelectedTcg(game.id);
                setMostrarTodosOsJogos(false);
                if (estaEditandoTorneio) {
                  navigate('/torneios');
                }
              }}
              disabled={game.disabled}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-center text-white text-[9px] font-bold leading-tight px-1 transition-all ${
                !mostrarTodosOsJogos && selectedTcg === game.id
                  ? `${game.color} shadow-lg scale-110 ring-2 ring-white/50`
                    : 'bg-white/10 hover:bg-white/20'}
                  ${game.disabled ? 'opacity-40 cursor-not-allowed hover:bg-white/10' : ''}
                  `}
              title={game.name}
            >
              {game.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Navigation Sidebar */}
      <div className="hidden md:flex w-64 h-screen sticky top-0 shrink-0 border-r border-border">
        <Sidebar
          user={user}
          roleLabel={roleLabel}
          navItems={navItems}
          handleLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
          <button onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          <span className="font-semibold text-foreground">
            {user?.nome}
          </span>
        </div>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="relative w-64 bg-card h-full shadow-xl">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <span className="font-semibold text-foreground">Menu</span>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aqui você pode extrair sua sidebar para um componente */}
            <div className="relative w-64 h-screen shadow-xl">
              <Sidebar
                user={user}
                roleLabel={roleLabel}
                navItems={navItems}
                handleLogout={handleLogout}
                onNavigate={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}