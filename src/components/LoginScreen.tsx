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
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    userType: 'player' as 'player' | 'organizer',
    store: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = tournamentStore.authenticateUser(loginData.email, loginData.password);

    if (user) {
      setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
      setTimeout(() => {
        onLogin(user);
      }, 500);
    } else {
      setMessage({ type: 'error', text: 'E-mail ou senha inválidos.' });
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (registerData.name && registerData.email && registerData.password && registerData.dateOfBirth) {
      const newUser = tournamentStore.registerUser({
        name: registerData.name,
        email: registerData.email,
        type: registerData.userType,
        store: registerData.store || undefined,
        dateOfBirth: registerData.dateOfBirth
      });

      setMessage({ type: 'success', text: 'Registro realizado com sucesso!' });
      setTimeout(() => {
        onLogin(newUser);
      }, 500);
    } else {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (email: string) => {
    setLoginData({ email, password: 'demo' });
    const user = tournamentStore.authenticateUser(email, 'demo');
    if (user) {
      onLogin(user);
    }
  };

  const mockAccounts = [
    { email: 'alex.chen@example.com', name: 'Alex Chen', type: 'Jogador', description: 'Jogador de torneios com rankings' },
    { email: 'sarah.johnson@gamestore.com', name: 'Sarah Johnson', type: 'Organizador', description: 'Organizador de torneios na Game Central' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Bem-vindo ao TopDecked</h1>
          <p className="text-muted-foreground mt-2">
            A plataforma definitiva para gerenciamento de torneios de TCG.
          </p>
        </div>

        {/* Contas de Demonstração */}
        {showDemoAccounts && (
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Contas de Demonstração</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDemoAccounts(false)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Experimente a plataforma com contas pré-configuradas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAccounts.map((account) => (
                <div key={account.email} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{account.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {account.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{account.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDemoLogin(account.email)}
                  >
                    Entrar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!showDemoAccounts && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDemoAccounts(true)}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Mostrar Contas de Demonstração
          </Button>
        )}

        {/* Seções "Para Jogadores" e "Para Organizadores"*/}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold">Para Jogadores</h3>
            <p className="text-sm text-muted-foreground">Acompanhe seu progresso e rankings</p>
          </Card>
          <Card className="p-4 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold">Para Organizadores</h3>
            <p className="text-sm text-muted-foreground">Gerencie torneios com facilidade</p>
          </Card>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>
                  Insira suas credenciais para acessar sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Seu e-mail"
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
                        placeholder="Sua senha"
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
                  Crie uma nova conta para começar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Seu e-mail"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Crie uma senha"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Data de Nascimento</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={registerData.dateOfBirth}
                      onChange={(e) => setRegisterData({ ...registerData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userType">Tipo de Conta</Label>
                    <select
                      id="userType"
                      value={registerData.userType}
                      onChange={(e) => setRegisterData({ ...registerData, userType: e.target.value as 'player' | 'organizer' })}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="player">Jogador</option>
                      <option value="organizer">Organizador de Torneios</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store">Loja/Local (Opcional)</Label>
                    <Input
                      id="store"
                      placeholder="Sua loja de jogos local"
                      value={registerData.store}
                      onChange={(e) => setRegisterData({ ...registerData, store: e.target.value })}
                    />
                  </div>

                  {message && (
                    <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                      <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Criando Conta...' : 'Registrar'}
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
