import React, { useState } from 'react';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
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
  const [loginData, setLoginData] = useState({ 
    email: '', 
    password: '', 
    accountType: 'player' as 'player' | 'organizer' 
  });
  const [registerData, setRegisterData] = useState({ 
    name: '', // This will be 'Full Name' for player, 'Store Name' for organizer
    email: '', 
    password: '', 
    userType: 'player' as 'player' | 'organizer',
    storeAddress: '' // This will be 'Store Address' for organizer, unused for player
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = tournamentStore.authenticateUser(loginData.email, loginData.password);
    
    if (user) {
      // Verify account type matches what user selected
      if (user.type !== loginData.accountType) {
        setMessage({ 
          type: 'error', 
          text: `Este e-mail está registrado como um ${user.type === 'player' ? 'jogador' : 'organizador'}, mas você selecionou ${loginData.accountType === 'player' ? 'jogador' : 'organizador'}. Por favor, verifique o tipo de sua conta.` 
        });
        setIsLoading(false);
        return;
      }
      
      setMessage({ type: 'success', text: 'Login bem-sucedido!' });
      setTimeout(() => {
        onLogin(user);
      }, 500);
    } else {
      setMessage({ type: 'error', text: 'E-mail ou senha inválidos' });
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validation based on account type
    const requiredFields = ['name', 'email', 'password'];
    if (registerData.userType === 'organizer') {
      requiredFields.push('storeAddress');
    }

    const isValid = requiredFields.every(field => registerData[field as keyof typeof registerData]?.trim());

    if (isValid) {
      const newUser = tournamentStore.registerUser({
        name: registerData.name,
        email: registerData.email,
        type: registerData.userType,
        store: registerData.userType === 'organizer' ? registerData.storeAddress : undefined,
        dateOfBirth: '1990-01-01' // Default value since we removed the field
      });
      
      setMessage({ type: 'success', text: 'Cadastro bem-sucedido!' });
      setTimeout(() => {
        onLogin(newUser);
      }, 500);
    } else {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios' });
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = (email: string) => {
    const user = tournamentStore.authenticateUser(email, 'demo');
    if (user) {
      // Auto-set the account type based on the demo user
      setLoginData(prev => ({ ...prev, email, accountType: user.type }));
      onLogin(user);
    }
  };

  const handleAccountTypeSelect = (accountType: 'player' | 'organizer') => {
    if (accountType === 'player') {
      setRegisterData({
        name: 'Alex Chen',
        email: 'alex.chen@example.com',
        password: '',
        userType: 'player',
        storeAddress: ''
      });
    } else {
      setRegisterData({
        name: 'Game Central',
        email: 'sarah.johnson@gamestore.com',
        password: '',
        userType: 'organizer',
        storeAddress: '123 Gaming Street, Downtown'
      });
    }
  };

  const demoAccounts = [
    { email: 'alex.chen@example.com', name: 'Alex Chen', type: 'Jogador', description: 'Jogador de torneios com classificações' },
    { email: 'sarah.johnson@gamestore.com', name: 'Sarah Johnson', type: 'Organizador', description: 'Organizador de torneios na Game Central' }
  ];

  const accountTemplates = [
    { 
      type: 'player' as const, 
      name: 'Conta de Jogador', 
      description: 'Acompanhe seu progresso e classificações',
      icon: Users,
      details: 'Participe de torneios, veja classificações, acompanhe estatísticas'
    },
    { 
      type: 'organizer' as const, 
      name: 'Conta de Organizador', 
      description: 'Gerencie torneios com facilidade',
      icon: Calendar,
      details: 'Crie torneios, gerencie eventos, veja análises'
    }
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
            A plataforma definitiva para gerenciamento de torneios TCG
          </p>
        </div>

        {/* Demo Accounts - Show during login */}
        {activeTab === 'login' && showDemoAccounts && (
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
              <CardDescription>Experimente a plataforma com contas pré-configuradas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoAccounts.map((account) => (
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
                    Login
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Account Type Selection - Show during registration */}
        {activeTab === 'register' && showDemoAccounts && (
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Escolha o Tipo de Conta</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDemoAccounts(false)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Selecione um tipo de conta para personalizar seu cadastro</CardDescription>
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

        {/* Toggle for showing accounts */}
        {!showDemoAccounts && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDemoAccounts(true)}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            {activeTab === 'login' ? 'Mostrar Contas de Demonstração' : 'Mostrar Tipos de Conta'}
          </Button>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Insira suas credenciais para acessar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Insira seu e-mail"
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
                        placeholder="Insira sua senha"
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
                  
                  {/* Account Type Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Tipo de Conta</Label>
                    <Select
                      value={loginData.accountType}
                      onValueChange={(value: 'player' | 'organizer') => 
                        setLoginData({ ...loginData, accountType: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo de conta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="player">Jogador</SelectItem>
                        <SelectItem value="organizer">Organizador</SelectItem>
                      </SelectContent>
                    </Select>
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
                <CardTitle>Cadastro</CardTitle>
                {registerData.userType && (
                  <CardDescription>
                    Criando conta de <Badge variant="outline" className="ml-1">{registerData.userType === 'player' ? 'Jogador' : 'Organizador'}</Badge>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Name field - changes label based on account type */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {registerData.userType === 'organizer' ? 'Nome da Loja' : 'Nome Completo'}
                    </Label>
                    <Input
                      id="name"
                      placeholder={
                        registerData.userType === 'organizer' 
                          ? "Insira o nome da sua loja" 
                          : "Insira seu nome completo"
                      }
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
                      placeholder="Insira seu e-mail"
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
                    <Label htmlFor="userType">Tipo de Conta</Label>
                    <Select
                      value={registerData.userType}
                      onValueChange={(value: 'player' | 'organizer') => 
                        setRegisterData({ ...registerData, userType: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="player">Jogador</SelectItem>
                        <SelectItem value="organizer">Organizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Store Address field - only for organizers */}
                  {registerData.userType === 'organizer' && (
                    <div className="space-y-2">
                      <Label htmlFor="storeAddress">Endereço da Loja</Label>
                      <Input
                        id="storeAddress"
                        placeholder="Insira o endereço da sua loja"
                        value={registerData.storeAddress}
                        onChange={(e) => setRegisterData({ ...registerData, storeAddress: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  
                  {message && (
                    <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                      <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Criando Conta...' : 'Cadastrar'}
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