import { useState } from 'react';
import { Eye, EyeOff, Swords, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLogin, useRegister } from '@/hooks/login.hooks';
import { useAuthContext } from '@/hooks/authContext.hooks';
import { useLocation } from 'react-router-dom'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState("");
  const { handleLogin } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/login";

  const { mutate: mutateLogin, isPending: isLoginPending } = useLogin();
  const { mutate: mutateRegistration, isPending: isRegisterPending } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "login") {
      mutateLogin({ email, password }, {
        onSuccess: (data) => {
          handleLogin(data.access_token)
          navigate(from, { replace: true })
        },
        onError: () => console.error('Erro ao fazer login'),
      });
    } else {
      mutateRegistration({ nome: name, email, senha: password }, {
        onSuccess: () => navigate("/jogador/confirmar-email"),
        onError: () => console.error('Erro ao fazer Registro'),
      });
    }
  };

  const handleBack = () => navigate("/")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center space-x-2 text-primary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Início</span>
          </button>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-2 text-foreground">Brickei</h1>
          <p className="text-muted-foreground">A plataforma amiga de gerenciamento de torneios.</p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                activeTab === 'login'
                  ? 'bg-card text-primary border-b-2 border-primary'
                  : 'bg-muted/40 text-muted-foreground hover:bg-accent'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                activeTab === 'register'
                  ? 'bg-card text-primary border-b-2 border-primary'
                  : 'bg-muted/40 text-muted-foreground hover:bg-accent'
              }`}
            >
              Cadastre-se
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              { activeTab === "register" && <div className="mb-4">
                <label className="block text-sm mb-2 text-muted-foreground">Nome</label>
                <input
                  type="string"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite seu nome"
                  required
                />
              </div>}
              <div className="mb-4">
                <label className="block text-sm mb-2 text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite seu e-mail"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-muted-foreground">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {activeTab === 'login' && (
                <div className="mb-6">
                  <a href="#" className="text-sm text-primary hover:text-primary">
                    Esqueceu a senha?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoginPending || isRegisterPending}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded transition-colors ${
                  isLoginPending || isRegisterPending
                    ? 'bg-primary cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-white'
                }`}
              >
                {isLoginPending || isRegisterPending && (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}

                <span>
                  {activeTab === 'login'
                    ? isLoginPending ? 'Entrando...' : 'Login'
                    : isRegisterPending ? 'Cadastrando...' : 'Cadastre-se'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
