import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Trophy, Plus, Settings, Package, 
  DollarSign, LogOut, User, Sparkles, Flame, Zap
} from 'lucide-react';
import { useAuthContext } from '../hooks/useAuthContext';

const tcgGames = [
  { id: 'pokemon', name: 'Pokémon', icon: '⚡', color: 'bg-yellow-500' },
  { id: 'yugioh', name: 'Yu-Gi-Oh!', icon: '👁️', color: 'bg-purple-500' },
  { id: 'magic', name: 'Magic', icon: '🔮', color: 'bg-blue-500' },
  { id: 'onepiece', name: 'One Piece', icon: '🏴‍☠️', color: 'bg-red-500' },
  { id: 'vtes', name: 'VTES', icon: '🧛', color: 'bg-gray-700' },
  { id: 'riftbound', name: 'Riftbound', icon: '🌀', color: 'bg-cyan-500' },
  { id: 'fab', name: 'F&B', icon: '⚔️', color: 'bg-orange-500' },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [selectedGame, setSelectedGame] = useState('magic');
  const location = useLocation();
  const { user, handleLogout } = useAuthContext();

  const organizerNav = [
    { path: '/loja/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/loja/torneios', icon: Trophy, label: 'Tournaments' },
    { path: '/loja/criar-torneio', icon: Plus, label: 'Create Tournament' },
    { path: '/loja/regras-jogadores', icon: Settings, label: 'Player Rules' },
    { path: '/loja/estoque', icon: Package, label: 'Stock/Inventory' },
    { path: '/loja/creditos', icon: DollarSign, label: 'Credits/POS' },
  ];

  const playerNav = [
    { path: '/jogador/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/jogador/estatisticas', icon: Sparkles, label: 'Statistics' },
    { path: '/jogador/historico', icon: Flame, label: 'Match History' },
    { path: '/jogador/torneios', icon: Trophy, label: 'Tournaments' },
    { path: '/jogador/perfil', icon: User, label: 'Profile & Wallet' },
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
            onClick={() => setSelectedGame(game.id)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all ${
              selectedGame === game.id
                ? `${game.color} shadow-lg scale-110`
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title={game.name}
          >
            {game.icon}
          </button>
        ))}
      </div>

      {/* Main Navigation Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-900">{user?.nome}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.tipo}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-1">
          {user?.tipo === 'loja' && (
            <Link
              to="/loja/perfil"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/loja/perfil"
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm">Profile</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}