import './App.css'
import { Routes, Route } from 'react-router-dom'
import PublicRoutes from '@/routes/PublicRoutes'
import ProtectedRoutes from '@/routes/ProtectedRoutes'
import LandingPage from '@/components/LandingPage'
import LoginPage from './components/LoginPage'
import OrganizerDashboard from './components/organizer/OrganizerDashboard'
import StockInventory from './components/organizer/StockInventory'


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
      </Route>
    </Routes>
  );
}

export default App
