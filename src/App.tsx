import './App.css'
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


function App() {
  // const { user, handleLogin } = useAuthContext();
  // const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);

  // const handleNavigateToAuth = (userType: 'organizer' | 'player') => {
  //   if (userType === 'organizer') {
  //     setShowAuth('register');
  //   } else {
  //     setShowAuth('login');
  //   }
  // };

  // const handleBackToLanding = () => {
  //   setShowAuth(null);
  // };

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
        {/* <Route path="/loja/editar-torneio/:id" element={<EditTournament />} /> */}
      </Route>
    </Routes>
  );
}

export default App
