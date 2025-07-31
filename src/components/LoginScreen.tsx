import React, { useState } from 'react';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Badge } from './ui/badge.tsx';
import { Trophy, Users, Calendar, Eye, EyeOff } from 'lucide-react';
import { tournamentStore, User } from '../data/store.ts';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '', userType: 'player' as 'player' | 'organizer' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'player' as 'player' | 'organizer',
    address: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Simula chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = tournamentStore.authenticateUser(loginData.email, loginData.password, loginData.userType);

    if (user) {
      setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
      setTimeout(() => {
        onLogin(user);
      }, 500);
    } else {
      setMessage({ type: 'error', text: 'Email, senha ou tipo de conta inválidos.' });
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!registerData.name || !registerData.email || !registerData.password) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
      setIsLoading(false);
      return;
    }

    if (registerData.userType === 'organizer' && (!registerData.name || !registerData.address)) {
      setMessage({ type: 'error', text: 'Para organizadores, o nome da loja e o endereço são obrigatórios.' });
      setIsLoading(false);
      return;
    }

    // Simula chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Tenta registrar o usuário
    try {
      const newUser = tournamentStore.registerUser({
        name: registerData.name,
        email: registerData.email,
        type: registerData.userType,
        store: registerData.userType === 'organizer' ? registerData.address : undefined,
      });

      setMessage({ type: 'success', text: 'Registro realizado com sucesso!' });
      setTimeout(() => {
        onLogin(newUser);
      }, 500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao registrar. Tente novamente.' });
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (email: string, type: 'player' | 'organizer') => {
    const user = tournamentStore.authenticateUser(email, 'demo', type);
    if (user) {
      onLogin(user);
    } else {
      setMessage({ type: 'error', text: 'Erro ao fazer login na conta demo. Tente novamente.' });
    }
  };

  const handleAccountTypeSelect = (accountType: 'player' | 'organizer') => {
    setRegisterData(prevData => ({
      ...prevData,
      userType: accountType,
      name: '',
      email: '',
      password: '',
      address: ''
    }));
  };

  const demoAccounts = [
    { email: 'alex.chen@example.com', name: 'Alex Chen', type: 'player' as 'player' | 'organizer', displayType: 'Jogador', description: 'Jogador de torneios' },
    { email: 'sarah.johnson@gamestore.com', name: 'Sarah Johnson', type: 'organizer' as 'player' | 'organizer', displayType: 'Organizador', description: 'Organizador de torneios' }
  ];

  const accountTemplates = [
    {
      type: 'player' as const,
      name: 'Conta de Jogador',
      description: 'Acompanhe seu progresso e rankings',
      icon: Users,
      details: 'Participe de torneios, visualize rankings, acompanhe estatísticas'
    },
    {
      type: 'organizer' as const,
      name: 'Conta de Organizador',
      description: 'Gerencie torneios com facilidade',
      icon: Calendar,
      details: 'Crie torneios, gerencie eventos, visualize análises'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Bem-vindo(a) ao TopDecked</h1>
          <p className="text-muted-foreground mt-2">
            A plataforma definitiva para gerenciamento de torneios de TCG
          </p>
        </div>

        {/* Contas Demo - Exibir durante o login */}
        {activeTab === 'login' && showDemoAccounts && (
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Contas pré-configuradas</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDemoAccounts(false)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Experimente a plataforma com contas pré-configuradas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoAccounts.map((account) => (
                <div key={account.email} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{account.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {account.displayType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{account.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDemoLogin(account.email, account.type)}
                  >
                    Entrar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Seleção de Tipo de Conta - Exibir durante o registro */}
        {activeTab === 'register' && showDemoAccounts && (
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Escolha seu tipo de conta</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDemoAccounts(false)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Selecione um tipo de conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {accountTemplates.map((template) => {
                const IconComponent = template.icon;
                const isSelected = registerData.userType === template.type;
                return (
                  <div
                    key={template.type}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-sm'
                        : 'bg-white hover:bg-secondary/50 hover:shadow-sm'
                    }`}
                    onClick={() => handleAccountTypeSelect(template.type)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${isSelected ? 'bg-primary/20' : 'bg-secondary'}`}>
                        <IconComponent className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{template.name}</span>
                          {isSelected && <Badge variant="default" className="text-xs">Selecionado</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{template.details}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Botão para mostrar/esconder contas demo/tipos de conta */}
        {!showDemoAccounts && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDemoAccounts(true)}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            {activeTab === 'login' ? 'Mostrar contas pré-cadastradas' : 'Mostrar tipos de conta'}
          </Button>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>
                  Insira suas credenciais para acessar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua senha"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7 w-7 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {/* Campo para Tipo de Conta no Login */}
                  <div className="space-y-2">
                    <Label htmlFor="login-userType">Tipo de conta</Label>
                    <select
                      id="login-userType"
                      value={loginData.userType}
                      onChange={(e) => setLoginData({ ...loginData, userType: e.target.value as 'player' | 'organizer' })}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="player">Jogador</option>
                      <option value="organizer">Organizador</option>
                    </select>
                  </div>

                  {message && (
                    <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                      <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Registrar</CardTitle>
                <CardDescription>
                  {registerData.userType && (
                    <span className="block mt-1">
                      Criando conta de <Badge variant="outline" className="ml-1">{registerData.userType === 'player' ? 'Jogador' : 'Organizador'}</Badge>
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {registerData.userType === 'organizer' ? 'Nome da loja' : 'Nome completo'}
                    </Label>
                    <Input
                      id="name"
                      placeholder={
                        registerData.userType === 'organizer'
                          ? "Digite o nome da sua loja de jogos"
                          : "Digite seu nome completo"
                      }
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Digite seu email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="Crie uma senha"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7 w-7 p-0"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userType">Tipo de conta</Label>
                    <select
                      id="userType"
                      value={registerData.userType}
                      onChange={(e) => handleAccountTypeSelect(e.target.value as 'player' | 'organizer')}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="player">Jogador</option>
                      <option value="organizer">Organizador</option>
                    </select>
                  </div>
                  {registerData.userType === 'organizer' && (
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço da Loja</Label>
                      <Input
                        id="address"
                        placeholder="Digite o endereço completo da loja"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                        required={true}
                      />
                    </div>
                  )}

                  {message && (
                    <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                      <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : 'Registrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
