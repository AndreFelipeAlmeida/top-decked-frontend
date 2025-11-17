import React, { useState } from 'react';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Badge } from './ui/badge.tsx';
import { Trophy, Eye, EyeOff, Users, Calendar } from 'lucide-react';
import { User } from '../data/store.ts';
import logo from '../images/logo.png';
const API_URL = process.env.REACT_APP_BACKEND_API_URL;

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const MIN_PASSWORD_LENGTH = 6;
  const PHONE_LENGTH = 11;

  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    accountType: 'player' as 'player' | 'organizer',
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'player' as 'player' | 'organizer',
    storeAddress: '',
    telefone: '',
    data_nascimento: '',
    site: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleTabChange = (tabValue: string) => {
    setMessage(null); 
    setActiveTab(tabValue); 
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null); 

    const formData = new URLSearchParams();
    formData.append('username', loginData.email);
    formData.append('password', loginData.password);

    try {
      const response = await fetch(`${API_URL}/login/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('accessToken', data.access_token);

        const userProfileResponse = await fetch(`${API_URL}/login/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
          },
        });

        if (userProfileResponse.ok) {
          const userProfile = await userProfileResponse.json();
          const userType = userProfile.tipo === 'loja' ? 'organizer' : 'player';

          if (userType !== loginData.accountType) {
            setMessage({
              type: 'error',
              text: `Este e-mail está registrado como um ${userProfile.tipo}, mas você selecionou ${
                loginData.accountType === 'player' ? 'jogador' : 'loja'
              }. Por favor, verifique o tipo de sua conta.`,
            });
            localStorage.removeItem('accessToken');
          } else {
            setMessage({ type: 'success', text: 'Login bem-sucedido!' });
            setTimeout(() => {
              onLogin({
                email: userProfile.email,
                name: userProfile.nome,
                type: userType,
                id: userProfile.usuario_id,
              });
            }, 500);
          }
        } else {
          setMessage({ type: 'error', text: 'Não foi possível buscar os dados do usuário.' });
          localStorage.removeItem('accessToken');
        }
      } else {
        setMessage({ type: 'error', text: data.detail || 'E-mail ou senha inválidos' });
      }
    } catch (error) {
      console.error('Erro de login:', error);
      setMessage({ type: 'error', text: 'Falha na conexão com o servidor. Tente novamente mais tarde.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null); 
  
    let requiredFields: (keyof typeof registerData)[] = ['name', 'email', 'password'];
    if (registerData.userType === 'organizer') {
      requiredFields = [...requiredFields, 'storeAddress', 'telefone'];
    } else {
      requiredFields = [...requiredFields, 'telefone', 'data_nascimento'];
    }
  
    const isValid = requiredFields.every(
      (field) => registerData[field]?.trim()
    );
  
    if (!isValid) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios marcados com *.' });
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < MIN_PASSWORD_LENGTH) {
      setMessage({ type: 'error', text: `A senha deve ter, no mínimo, ${MIN_PASSWORD_LENGTH} caracteres.` });
      setIsLoading(false);
      return;
    }

    if (registerData.telefone.length != PHONE_LENGTH) {
      setMessage({ type: 'error', text: `Telefone inválido. Por favor, tente novamente.` });
      setIsLoading(false);
      return;
    }
  
    let endpoint = '';
    let payload = {};
  
    if (registerData.userType === 'player') {
      endpoint = `${API_URL}/jogadores/`;
      payload = {
        nome: registerData.name,
        email: registerData.email,
        senha: registerData.password,
        telefone: registerData.telefone,
        data_nascimento: registerData.data_nascimento,
      };
    } else if (registerData.userType === 'organizer') {
      endpoint = `${API_URL}/lojas/`;
      payload = {
        nome: registerData.name,
        email: registerData.email,
        senha: registerData.password,
        endereco: registerData.storeAddress,
        site: registerData.site,
        telefone: registerData.telefone,
      };
    }
  
    try {
      // Cria o usuário
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setMessage({ type: 'error', text: data.detail || 'Erro no cadastro. Por favor, tente novamente.' });
        return;
      }
  
      const loginForm = new URLSearchParams();
      loginForm.append('username', registerData.email);
      loginForm.append('password', registerData.password);
  
      const loginResponse = await fetch(`${API_URL}/login/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginForm.toString(),
      });
  
      const loginData = await loginResponse.json();
  
      if (!loginResponse.ok) {
        setMessage({ type: 'error', text: 'Cadastro realizado, mas falha ao logar automaticamente.' });
        return;
      }
  
      localStorage.setItem('accessToken', loginData.access_token);
      const userProfileResponse = await fetch(`${API_URL}/login/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${loginData.access_token}` },
      });
  
      if (!userProfileResponse.ok) {
        setMessage({ type: 'error', text: 'Cadastro realizado, mas falha ao buscar perfil do usuário.' });
        return;
      }
  
      const userProfile = await userProfileResponse.json();
      const userType = userProfile.tipo === 'loja' ? 'organizer' : 'player';
  
      setMessage({ type: 'success', text: 'Cadastro e login bem-sucedidos!' });
      setTimeout(() => {
        onLogin({
          email: userProfile.email,
          name: userProfile.nome,
          type: userType,
          id: userProfile.usuario_id,
        });
      }, 500);
  
    } catch (error) {
      console.error('Erro de cadastro:', error);
      setMessage({ type: 'error', text: 'Falha na conexão com o servidor. Tente novamente mais tarde.' });
    } finally {
      setIsLoading(false);
    }
  };    

  const handleAccountTypeSelect = (accountType: 'player' | 'organizer') => {
    setRegisterData((prev) => ({
      ...prev,
      userType: accountType,
      name: '',
      email: '',
      password: '',
      storeAddress: '',
      telefone: '',
      data_nascimento: '',
      site: '',
    }));
  };

  const accountTemplates = [
    {
      type: 'player' as const,
      name: 'Conta de Jogador',
      description: 'Acompanhe seu progresso e classificações',
      icon: Users,
      details: 'Participe de torneios, veja classificações, acompanhe estatísticas',
    },
    {
      type: 'organizer' as const,
      name: 'Conta de Loja',
      description: 'Gerencie torneios com facilidade',
      icon: Calendar,
      details: 'Crie torneios, gerencie eventos, veja análises',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
                src={logo} 
                alt="TopDecked Logo" 
                className="h-40 w-auto object-contain"
              />
          </div>
          <h1 className="text-3xl font-bold text-primary">Bem-vindo ao TopDecked</h1>
          <p className="text-muted-foreground mt-2">A plataforma definitiva para gerenciamento de torneios TCG</p>
        </div>

        {activeTab === 'register' && (
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Escolha o Tipo de Conta</CardTitle>
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
                      isSelected ? 'bg-primary/10 border-primary shadow-sm' : 'bg-white hover:bg-secondary/50 hover:shadow-sm'
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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Insira suas credenciais para acessar sua conta</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4" noValidate>
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

                  <div className="space-y-2">
                    <Label htmlFor="accountType">Tipo de Conta</Label>
                    <Select
                      value={loginData.accountType}
                      onValueChange={(value: 'player' | 'organizer') => setLoginData({ ...loginData, accountType: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo de conta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="player">Jogador</SelectItem>
                        <SelectItem value="organizer">Loja</SelectItem>
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
                    Criando conta de{' '}
                    <Badge variant="outline" className="ml-1">
                      {registerData.userType === 'player' ? 'Jogador' : 'Loja'}
                    </Badge>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {registerData.userType === 'organizer' ? 'Nome da Loja *' : 'Nome Completo *'}
                    </Label>
                    <Input
                      id="name"
                      placeholder={registerData.userType === 'organizer' ? 'Insira o nome da sua loja' : 'Insira seu nome completo'}
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail *</Label>
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
                    <Label htmlFor="register-password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
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
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mínimo de {MIN_PASSWORD_LENGTH} caracteres.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType">Tipo de Conta *</Label>
                    <Select
                      value={registerData.userType}
                      onValueChange={(value: 'player' | 'organizer') => setRegisterData({ ...registerData, userType: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="player">Jogador</SelectItem>
                        <SelectItem value="organizer">Loja</SelectItem>
                      </SelectContent> {/* [CORREÇÃO APLICADA AQUI] */}
                    </Select>
                  </div>

                  {registerData.userType === 'player' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone *</Label>
                        <Input
                          id="telefone"
                          type="tel"
                          placeholder="Ex: 83912345678"
                          value={registerData.telefone}
                          onChange={(e) => setRegisterData({ ...registerData, telefone: e.target.value })}
                          maxLength={11}
                          minLength={PHONE_LENGTH}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Quantidade de {PHONE_LENGTH} dígitos, incluindo DDD.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                        <Input
                          id="data_nascimento"
                          type="date"
                          value={registerData.data_nascimento?.split("T")[0] || ""}
                          onChange={(e) => setRegisterData({ ...registerData, data_nascimento: e.target.value })}
                          required
                        />
                      </div>
                    </>
                  )}

                  {registerData.userType === 'organizer' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="storeAddress">Endereço da Loja *</Label>
                        <Input
                          id="storeAddress"
                          placeholder="Insira o endereço da sua loja"
                          value={registerData.storeAddress}
                          onChange={(e) => setRegisterData({ ...registerData, storeAddress: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="site">Site</Label>
                        <Input
                          id="site"
                          type="url"
                          placeholder="Ex: www.minhaloja.com.br"
                          value={registerData.site}
                          onChange={(e) => setRegisterData({ ...registerData, site: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone *</Label> {/* [CORREÇÃO APLICADA AQUI] */}
                        <Input
                          id="telefone"
                          type="tel"
                          placeholder="Ex: 83912345678"
                          value={registerData.telefone}
                          onChange={(e) => setRegisterData({ ...registerData, telefone: e.target.value })}
                          maxLength={11}
                          minLength={PHONE_LENGTH}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Quantidade de {PHONE_LENGTH} dígitos, incluindo DDD.
                        </p>
                      </div>
                    </>
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