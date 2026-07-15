import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, Plus, Settings, Package,
  DollarSign, User, Sparkles, Flame, Zap, TrendingUp,
  Menu,
  X,
  User2,
  Award,
  CalendarRange,
  Star,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import { useAuthContext } from '../hooks/authContext.hooks';
import { useTcgSelection } from '@/hooks/tcgSelectionContext.hooks';
import { useViewMode } from '@/hooks/viewModeContext.hooks';
import { useMe } from '@/hooks/auth.hooks';
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

// Rota dinâmica (tem :id) não cabe no includes() acima. Editar Torneio
// também mostra a barra, mas trocar de jogo ali é uma interrupção de
// fluxo (BRK-301): o torneio em edição é de um TCG fixo, então o clique
// não filtra nada in-place — ele te tira da tela e te leva pra listagem
// geral do jogo escolhido.
const ROTA_EDITAR_TORNEIO = '/loja/torneio/:id/editar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { selectedTcg, setSelectedTcg } = useTcgSelection();
  const { user, handleLogout } = useAuthContext();
  const { viewMode } = useViewMode();
  const { data: jogador } = useMe(user?.tipo === 'jogador');
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const estaEditandoTorneio = matchPath(ROTA_EDITAR_TORNEIO, location.pathname) !== null;
  const mostrarBarraDeJogos = PAGINAS_COM_BARRA_DE_JOGOS.includes(location.pathname) || estaEditandoTorneio;

  // Um jogador que também organiza torneios para alguma loja pode alternar
  // para a "visão de organizador" (OrganizerViewSwitch) no seu próprio
  // dashboard. Usuários do tipo "loja" já são organizadores por definição.
  const lojasOrganizador = jogador?.lojas?.filter((loja) => loja.organizacoes.length > 0) ?? [];
  const isOrganizadorJogador = user?.tipo === 'jogador' && viewMode === 'organizador' && lojasOrganizador.length > 0;
  const roleLabel =
    user?.tipo === 'admin' ? 'Administrador'
      : user?.tipo === 'loja' ? 'Loja'
        : isOrganizadorJogador ? 'Organizador' : 'Jogador';

  const organizerNav = [
    { path: '/loja/dashboard', icon: LayoutDashboard, label: 'Dashboard', disabled: false },
    { path: '/rankings', icon: TrendingUp, label: 'Rankings', disabled: false },
    { path: '/torneios', icon: Trophy, label: 'Torneios', disabled: false },
    { path: '/eventos', icon: Gift, label: 'Eventos', disabled: false },
    { path: '/loja/criar-torneio', icon: Plus, label: 'Criar Torneio', disabled: false },
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
      {/* Left Sidebar - Game Selector (só nas telas que ela filtra) */}
      {mostrarBarraDeJogos && (
        <div className="w-20 bg-brand-gradient flex flex-col items-center py-4 space-y-3 shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]">
          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {tcgGames.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                if (game.disabled) return;
                setSelectedTcg(game.id);
                // Interrompe a edição em vez de deixar o torneio de um TCG
                // renderizado no contexto de outro — manda pra listagem
                // geral do jogo recém-selecionado.
                if (estaEditandoTorneio) {
                  navigate('/torneios');
                }
              }}
              disabled={game.disabled}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-center text-white text-[9px] font-bold leading-tight px-1 transition-all ${
                selectedTcg === game.id
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
      <div className="hidden md:flex w-64 border-r border-border">
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