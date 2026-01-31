import './App.css'
import { Routes, Route } from 'react-router-dom'
import PublicRoutes from '@/routes/PublicRoutes'
import ProtectedRoutes from '@/routes/ProtectedRoutes'
import LandingPage from '@/components/LandingPage'
import LoginPage from './components/LoginPage'


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
      </Route>
    </Routes>
  );
}

export default App
