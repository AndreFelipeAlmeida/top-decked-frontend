import { Routes, Route } from 'react-router-dom';
import PublicRoutes from '@/routes/PublicRoutes';
import ProtectedRoutes from '@/routes/ProtectedRoutes';
import LandingPage from '@/components/LandingPage';
import LoginPage from './components/LoginPage';
import OrganizerDashboard from './components/organizer/OrganizerDashboard';
import StockInventory from './stocks/StockInventory';
import OrganizerRankings from './components/organizer/OrganizerRankings';
import CreateTournament from './components/organizer/CreateTournament';
import OrganizerProfile from './components/organizer/OrganizerProfile';
import PlayerCreditsPos from './PlayerCredits/PlayerCreditsPos';
import PlayerRules from './components/organizer/PlayerRules';
import TournamentEditDetails from './components/organizer/TournamentEditDetails';
import TournamentView from './components/organizer/TournamentView';
import PlayerProfileWallet from './components/player/PlayerProfileWallet';
import PlayerDashboard from './components/player/PlayerDashboard';
import PlayerAchievements from './components/player/PlayerAchievements';
import ConfirmEmailPage from './components/ConfirmEmailPage';
import PlayerManagement from './PlayerLists/PlayerManagement';
import { Toaster } from './components/ui/sonner';
import Tournaments from './components/organizer/Tournaments';
import CreateOrganizerTournament from './components/player/CreateOrganizerTournament';

function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/jogador/confirmar-email"
            element={<ConfirmEmailPage />}
          />
        </Route>

        <Route element={<ProtectedRoutes allowedRoles={['jogador']} />}>
          <Route path="/jogador/dashboard" element={<PlayerDashboard />} />
          <Route path="/jogador/perfil" element={<PlayerProfileWallet />} />
          <Route path="/jogador/conquistas" element={<PlayerAchievements />} />
          <Route path="/jogador/criar-torneio" element={<CreateOrganizerTournament />} />
        </Route>

        <Route element={<ProtectedRoutes allowedRoles={['loja']} />}>
          <Route path="/loja/dashboard" element={<OrganizerDashboard />} />
          <Route path="/loja/estoque" element={<StockInventory />} />
          <Route path="/loja/criar-torneio" element={<CreateTournament />} />
          <Route path="/loja/perfil" element={<OrganizerProfile />} />

          <Route path="/loja/jogadores" element={<PlayerManagement />} />
          <Route path="/loja/creditos" element={<PlayerCreditsPos />} />
          <Route path="/loja/regras-jogadores" element={<PlayerRules />} />
        </Route>
        <Route element={<ProtectedRoutes allowedRoles={['loja', 'jogador']} />}>
          <Route path="/torneios" element={<Tournaments />} />
          <Route path="/rankings" element={<OrganizerRankings />} />
          <Route
            path="/loja/torneio/:id/editar"
            element={<TournamentEditDetails />}
          />
          <Route
            path="/loja/torneio/:id/visualizar"
            element={<TournamentView />}
          />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
