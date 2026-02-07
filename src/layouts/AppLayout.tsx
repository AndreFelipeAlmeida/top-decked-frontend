import { useState, type ReactNode } from 'react';
import { 
  LayoutDashboard, Trophy, Plus, Settings, Package, 
  DollarSign, User, Sparkles, Flame, Zap, TrendingUp,
  Menu,
  X
} from 'lucide-react';
import { useAuthContext } from '../hooks/useAuthContext';
import { Sidebar } from './components/Sidebar';

const tcgGames = [
  { id: 'pokemon', name: 'Pokémon', icon: '⚡', color: 'bg-yellow-500', disabled: false },
  { id: 'yugioh', name: 'Yu-Gi-Oh!', icon: '👁️', color: 'bg-purple-500', disabled: true },
  { id: 'magic', name: 'Magic', icon: '🔮', color: 'bg-blue-500', disabled: true },
  { id: 'onepiece', name: 'One Piece', icon: '🏴‍☠️', color: 'bg-red-500', disabled: true },
  { id: 'vtes', name: 'VTES', icon: '🧛', color: 'bg-gray-700', disabled: true },
  { id: 'riftbound', name: 'Riftbound', icon: '🌀', color: 'bg-cyan-500', disabled: true },
  { id: 'fab', name: 'F&B', icon: '⚔️', color: 'bg-orange-500', disabled: true },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [selectedGame, setSelectedGame] = useState('pokemon');
  const { user, handleLogout } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);

  const organizerNav = [
    { path: '/loja/dashboard', icon: LayoutDashboard, label: 'Dashboard', disabled: false },
    { path: '/loja/rankings', icon: TrendingUp, label: 'Rankings', disabled: false },
    { path: '/loja/torneios', icon: Trophy, label: 'Tournaments', disabled: false },
    { path: '/loja/criar-torneio', icon: Plus, label: 'Create Tournament', disabled: false },
    { path: '/loja/regras-jogadores', icon: Settings, label: 'Player Rules', disabled: false },
    { path: '/loja/estoque', icon: Package, label: 'Stock/Inventory', disabled: false },
    { path: '/loja/creditos', icon: DollarSign, label: 'Credits/POS', disabled: false },
  ];

  const playerNav = [
    { path: '/jogador/dashboard', icon: User, label: 'Perfil & Carteira', disabled: false },
    { path: '/jogador/estatisticas', icon: Sparkles, label: 'Statistics', disabled: true},
    { path: '/jogador/historico', icon: Flame, label: 'Match History', disabled: true },
    { path: '/jogador/torneios', icon: Trophy, label: 'Tournaments', disabled: true },
    { path: '/jogador/perfil', icon: User, label: 'Profile & Wallet', disabled: true },
  ];

  const navItems = user?.tipo === 'loja' ? organizerNav : playerNav;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Game Selector */}
      <div className="w-20 bg-gray-900 flex flex-col items-center py-4 space-y-3">
        <div className="mb-4">
          <Zap className="w-8 h-8 text-purple-400" />
        </div>
        {tcgGames.map((game) => (
          <button
            key={game.id}
            onClick={() => !game.disabled && setSelectedGame(game.id)}
            disabled={game.disabled}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all ${
              selectedGame === game.id
                ? `${game.color} shadow-lg scale-110`
                  : 'bg-gray-800 hover:bg-gray-700'}
                ${game.disabled ? 'opacity-40 cursor-not-allowed hover:bg-gray-800' : ''}
                `}
            title={game.name}
          >
            {game.icon}
          </button>
        ))}
      </div>

      {/* Main Navigation Sidebar */}
      <div className="hidden md:flex w-64 border-r border-gray-200">
        <Sidebar
          user={user}
          navItems={navItems}
          handleLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          <span className="font-semibold text-gray-900">
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
          <div className="relative w-64 bg-white h-full shadow-xl">
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aqui você pode extrair sua sidebar para um componente */}
            <div className="relative w-64 h-screen shadow-xl">
              <Sidebar
                user={user}
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