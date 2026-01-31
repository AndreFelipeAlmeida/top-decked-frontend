import { useState, useEffect } from 'react';
import { Eye, EyeOff, Swords, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/loginService'
import { useMutation } from '@tanstack/react-query'
import { useAuthContext } from '@/hooks/useAuthContext';
import { useLocation } from 'react-router-dom'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'organizer' | 'player'>('player');
  const { user, isAuthenticated,  handleLogin } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const defaultRedirect =
  user?.tipo === 'loja'
  ? '/organizer/dashboard'
  : '/player/dashboard'
  
  const { mutate } = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      handleLogin(data.access_token)
      navigate(from || defaultRedirect, { replace: true })
    },
    onError: () => console.error('Erro ao fazer login')
  });
  
  useEffect(() => {
  if (isAuthenticated && user) {
    navigate(
      user.tipo === 'loja'
        ? '/loja/dashboard'
        : '/jogador/dashboard',
      { replace: true }
    )
  }
}, [isAuthenticated, user, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate()
  };

  const handleBack = () => navigate("/")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Início</span>
          </button>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-2 text-gray-900">TopDecked</h1>
          <p className="text-gray-600">A plataforma amiga de gerenciamento de torneios.</p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                activeTab === 'login'
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                activeTab === 'register'
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            {activeTab === 'register' && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
                <strong>Note:</strong> Registration is exclusive for Stores/Organizers. Players are manually registered by stores.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-700">Account Type</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as 'organizer' | 'player')}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="jogador">Jogador</option>
                  <option value="loja">Loja</option>
                </select>
              </div>

              {activeTab === 'login' && (
                <div className="mb-6">
                  <a href="#" className="text-sm text-purple-600 hover:text-purple-700">
                    Forgot Password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 transition-colors"
              >
                {activeTab === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}