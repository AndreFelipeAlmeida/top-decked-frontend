import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Store, TriangleAlert, User as UserIcon } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin, useRegister, useRegisterLoja } from '@/hooks/login.hooks';
import { useAuthContext } from '@/hooks/authContext.hooks';
import { useTenant } from '@/hooks/tenantContext.hooks';
import AuthLayout from '@/components/AuthLayout';
import Spinner from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ROOT_DOMAIN, ROOT_DOMAIN_PROTOCOLO } from '@/lib/rootDomain';
import { validarReturnUrl } from '@/lib/returnUrl';
import {
  loginSchema,
  registerSchema,
  registerLojaSchema,
  type LoginForm,
  type RegisterForm,
  type RegisterLojaForm,
} from '@/schemas/login.schemas';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  // BRK-312: sub-aba dentro de "Cadastre-se" — jogador é o cadastro comum
  // (ativa direto após confirmar e-mail); loja é um pré-registro que só
  // fica utilizável depois que um administrador aprova (ver Alert abaixo).
  const [registerType, setRegisterType] = useState<'jogador' | 'loja'>('jogador');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { handleLogin } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { isTenant, isLoading: isTenantLoading } = useTenant();

  const from = location.state?.from?.pathname || '/login';

  // BRK-404/BRK-405: o formulário de login só existe no domínio raiz — sem
  // isso o cookie de sessão compartilhado (BRK-309) não teria como
  // funcionar de forma previsível (o Set-Cookie viria de um host diferente
  // a cada subdomínio). Alguém acessando {slug}.brickei.com.br/login é
  // mandado de volta pro domínio raiz.
  //
  // returnUrl só é anexado quando existe uma intenção EXPLÍCITA de
  // subdomínio — ou seja, quando um ProtectedRoute de verdade mandou pra cá
  // guardando de onde o usuário veio (location.state.from, ver
  // ProtectedRoutes.tsx). window.location.href (a URL atual, crua) nunca é
  // usado como base do returnUrl: ela já É a própria página de /login
  // nesse ponto (é ela que está montando agora), então "voltar" pra ela não
  // significa nada — foi exatamente isso que causava o "redirecionamento
  // fantasma" (BRK-405): um jogador que logava LOGO DEPOIS de alguém sair
  // de um subdomínio (ex.: um logout que não limpava a URL, já corrigido
  // em AuthProvider) acabava sendo devolvido pro /login daquele mesmo
  // subdomínio, e dali pro dashboard errado.
  useEffect(() => {
    if (isTenantLoading || !isTenant) return;

    const porta = window.location.port ? `:${window.location.port}` : '';
    const destinoOriginal = location.state?.from?.pathname
      ? `${window.location.protocol}//${window.location.host}${location.state.from.pathname}${location.state.from.search ?? ''}`
      : null;

    const query = destinoOriginal ? `?returnUrl=${encodeURIComponent(destinoOriginal)}` : '';
    window.location.href = `${ROOT_DOMAIN_PROTOCOLO}://${ROOT_DOMAIN}${porta}/login${query}`;
  }, [isTenant, isTenantLoading, location.state]);

  const { mutate: mutateLogin, isPending: isLoginPending } = useLogin();
  const { mutate: mutateRegistration, isPending: isRegisterPending } = useRegister();
  const { mutate: mutateRegistrationLoja, isPending: isRegisterLojaPending } = useRegisterLoja();

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerCadastro,
    handleSubmit: handleSubmitCadastro,
    formState: { errors: cadastroErrors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const {
    register: registerCadastroLoja,
    handleSubmit: handleSubmitCadastroLoja,
    formState: { errors: cadastroLojaErrors },
  } = useForm<RegisterLojaForm>({ resolver: zodResolver(registerLojaSchema) });

  const onSubmitLogin = handleSubmitLogin((data) => {
    mutateLogin(
      { email: data.email, password: data.senha },
      {
        onSuccess: async (res) => {
          // BRK-314: aguarda o refetch da sessão terminar antes de navegar
          // — sem isso, ProtectedRoute podia renderizar com o
          // isAuthenticated ainda da sessão anterior (deslogada) e mandar
          // de volta pro login antes da nova sessão chegar.
          await handleLogin();

          // BRK-404: ?returnUrl tem prioridade sobre qualquer destino
          // padrão — representa a página exata que o usuário queria ver
          // antes de ser mandado pro login (ex.: veio de {slug}.brickei.
          // com.br/login, ver useEffect acima). Sempre validado (nunca é
          // um Open Redirect: só aceita o próprio domínio raiz ou um
          // subdomínio genuíno dele, ver lib/returnUrl.ts) — se inválido ou
          // ausente, cai pro comportamento de sempre.
          const params = new URLSearchParams(location.search);
          const returnUrl = validarReturnUrl(params.get('returnUrl'));
          if (returnUrl) {
            window.location.href = returnUrl;
            return;
          }

          // BRK-308: Dono de Loja sempre entra pelo subdomínio dela —
          // window.location.href (não navigate) de propósito, é uma troca
          // de domínio de verdade, não uma navegação client-side dentro
          // da mesma SPA.
          if (res.tipo === 'loja' && res.slug) {
            // Preserva a porta atual (ex.: :5173 no Vite dev server) — em
            // produção window.location.port já vem vazio, então isso não
            // afeta a URL final lá.
            const porta = window.location.port ? `:${window.location.port}` : '';
            window.location.href = `${ROOT_DOMAIN_PROTOCOLO}://${res.slug}.${ROOT_DOMAIN}${porta}/loja/dashboard`;
            return;
          }

          navigate(from, { replace: true });
        },
      },
    );
  });

  const onSubmitCadastro = handleSubmitCadastro((data) => {
    mutateRegistration(
      { nome: data.nome, email: data.email, senha: data.senha },
      { onSuccess: () => navigate('/jogador/confirmar-email') },
    );
  });

  const onSubmitCadastroLoja = handleSubmitCadastroLoja((data) => {
    mutateRegistrationLoja(
      { nome: data.nome, email: data.email, senha: data.senha },
      { onSuccess: () => navigate('/jogador/confirmar-email') },
    );
  });

  // BRK-404: nunca renderiza o formulário enquanto o subdomínio ainda está
  // sendo resolvido, nem depois de confirmado que estamos num tenant (nesse
  // caso o useEffect acima já está redirecionando pro domínio raiz) — evita
  // o "flash" do form de login por uma fração de segundo num subdomínio
  // onde ele não deveria nem aparecer.
  if (isTenantLoading || isTenant) {
    return <Spinner />;
  }

  return (
    <AuthLayout>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="h-1.5 bg-brand-gradient" />

        {/* Tabs em pílula */}
        <div className="flex gap-1 p-1.5 m-4 mb-0 rounded-lg bg-muted/40">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'login'
                ? 'bg-primary text-white shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'register'
                ? 'bg-primary text-white shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cadastre-se
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'login' ? (
            <form key="login" onSubmit={onSubmitLogin} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...registerLogin('email')}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite seu e-mail"
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-destructive text-xs mt-1">{loginErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...registerLogin('senha')}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginErrors.senha && (
                  <p className="text-destructive text-xs mt-1">{loginErrors.senha.message}</p>
                )}
              </div>

              <div className="text-right">
                <Link to="/esqueci-senha" className="text-sm text-primary hover:text-primary">
                  Esqueceu a senha?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoginPending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {isLoginPending && (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isLoginPending ? 'Entrando...' : 'Login'}</span>
              </button>
            </form>
          ) : (
            <>
              {/* Sub-abas do cadastro (BRK-312): Jogador é o cadastro comum;
                  Loja é um pré-registro sujeito a aprovação (Alert abaixo). */}
              <div className="flex gap-1 p-1 mb-4 rounded-lg bg-muted/40 text-sm">
                <button
                  type="button"
                  onClick={() => setRegisterType('jogador')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                    registerType === 'jogador'
                      ? 'bg-card text-foreground shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  Jogador
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterType('loja')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                    registerType === 'loja'
                      ? 'bg-card text-foreground shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Loja
                </button>
              </div>

              {registerType === 'jogador' ? (
            <form key="register" onSubmit={onSubmitCadastro} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Nome</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    {...registerCadastro('nome')}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite seu nome"
                  />
                </div>
                {cadastroErrors.nome && (
                  <p className="text-destructive text-xs mt-1">{cadastroErrors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...registerCadastro('email')}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite seu e-mail"
                  />
                </div>
                {cadastroErrors.email && (
                  <p className="text-destructive text-xs mt-1">{cadastroErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...registerCadastro('senha')}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {cadastroErrors.senha && (
                  <p className="text-destructive text-xs mt-1">{cadastroErrors.senha.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerCadastro('confirmarSenha')}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite sua senha novamente"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {cadastroErrors.confirmarSenha && (
                  <p className="text-destructive text-xs mt-1">{cadastroErrors.confirmarSenha.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isRegisterPending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {isRegisterPending && (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isRegisterPending ? 'Cadastrando...' : 'Cadastre-se'}</span>
              </button>
            </form>
              ) : (
            <form key="register-loja" onSubmit={onSubmitCadastroLoja} className="space-y-4">
              <Alert>
                <TriangleAlert />
                <AlertTitle>Isto é um pré-registro</AlertTitle>
                <AlertDescription>
                  Sua loja ficará com o cadastro pendente até que um administrador da
                  plataforma avalie e aprove o acesso, após entrarmos em contato. Você
                  também vai precisar confirmar o e-mail informado abaixo.
                </AlertDescription>
              </Alert>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Nome da loja</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    {...registerCadastroLoja('nome')}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite o nome da loja"
                  />
                </div>
                {cadastroLojaErrors.nome && (
                  <p className="text-destructive text-xs mt-1">{cadastroLojaErrors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...registerCadastroLoja('email')}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite o e-mail da loja"
                  />
                </div>
                {cadastroLojaErrors.email && (
                  <p className="text-destructive text-xs mt-1">{cadastroLojaErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...registerCadastroLoja('senha')}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {cadastroLojaErrors.senha && (
                  <p className="text-destructive text-xs mt-1">{cadastroLojaErrors.senha.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerCadastroLoja('confirmarSenha')}
                    className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite sua senha novamente"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {cadastroLojaErrors.confirmarSenha && (
                  <p className="text-destructive text-xs mt-1">
                    {cadastroLojaErrors.confirmarSenha.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isRegisterLojaPending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {isRegisterLojaPending && (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isRegisterLojaPending ? 'Enviando...' : 'Enviar pré-registro'}</span>
              </button>
            </form>
              )}
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
