import { Routes, Route } from 'react-router-dom'
import PublicRoutes from '@/routes/PublicRoutes'
import ProtectedRoutes from '@/routes/ProtectedRoutes'
import LandingPage from '@/components/LandingPage'
import LoginPage from './components/LoginPage'
import OrganizerDashboard from './components/organizer/OrganizerDashboard'
import StockInventory from './components/organizer/StockInventory'
import OrganizerRankings from './components/organizer/OrganizerRankings'
import CreateTournament from './components/organizer/CreateTournament'
import OrganizerProfile from './components/organizer/OrganizerProfile'
import OrganizerTournaments from './components/organizer/OrganizerTournaments'
import PlayerCreditsPos from './components/organizer/PlayerCreditsPos'
import PlayerRules from './components/organizer/PlayerRules'
import TournamentEditDetails from './components/organizer/TournamentEditDetails'


function App() {
  return (
    <Routes>
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoutes allowedRoles={["jogador"]} />}>
      </Route>

      <Route element={<ProtectedRoutes allowedRoles={["loja"]} />}>
        <Route path="/loja/dashboard" element={<OrganizerDashboard />} />
        <Route path="/loja/estoque" element={<StockInventory />} />
        <Route path="/loja/rankings" element={<OrganizerRankings />} />
        <Route path="/loja/criar-torneio" element={<CreateTournament />} />
        <Route path="/loja/perfil" element={<OrganizerProfile />} />
        <Route path="/loja/torneios" element={<OrganizerTournaments />} />
        <Route path="/loja/creditos" element={<PlayerCreditsPos />} />
        <Route path="/loja/regras-jogadores" element={<PlayerRules />} />
        <Route path="/loja/torneio/:id/configurar" element={<TournamentEditDetails />} />
        {/* <Route path="/loja/editar-torneio/:id" element={<EditTournament />} /> */}
      </Route>
    </Routes>
  );
}

export default App
