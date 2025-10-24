import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Switch } from './ui/switch.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Separator } from './ui/separator.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog.tsx';
import { Button } from './ui/button.tsx';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar.tsx';
import { ArrowLeft, Settings, Bell, Trash2, Edit, Save, Camera, Eye, Shield, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface OrganizerProfileProps {
  onNavigate: (page: Page, data?: any) => void;
  onLogout: () => void;
  currentUser: any;
  viewedOrganizerId?: number | null;
}

export function OrganizerProfile({ onNavigate, onLogout, currentUser, viewedOrganizerId }: OrganizerProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [organizerData, setOrganizerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    site: ''
  });
  const [securityData, setSecurityData] = useState({
    email: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [securityEditMode, setSecurityEditMode] = useState(false);
  const [notifications, setNotifications] = useState({ email: true });

  const [profileMessage, setProfileMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  const [securityMessage, setSecurityMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });

  const isPlayer = currentUser?.type === 'player';
  const isViewingOtherOrganizer = viewedOrganizerId && viewedOrganizerId !== currentUser?.id;
  const isOwnProfile = !isViewingOtherOrganizer;
  const canView = isOwnProfile || isPlayer;
  const canEdit = isOwnProfile;
  const showSettings = isOwnProfile;

  const clearProfileMessage = () => {
    setTimeout(() => setProfileMessage({ text: '', type: null }), 5000);
  };

  const clearSecurityMessage = () => {
    setTimeout(() => setSecurityMessage({ text: '', type: null }), 5000);
  };

  const getOrganizerData = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError("Token de autenticação não encontrado.");
      return null;
    }
    try {
      const response = await fetch(`${API_URL}/lojas/usuario/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar dados da Loja.');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar o perfil. Por favor, tente novamente.");
      return null;
    }
  };

  const updateProfileData = async (updatedData: any, scope: "profile" | "security") => {
    if (scope === "profile") setProfileMessage({ text: '', type: null });
    if (scope === "security") setSecurityMessage({ text: '', type: null });

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError("Token de autenticação não encontrado.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/lojas/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar o perfil.');
      }
      const data = await response.json();
      if (scope === "profile") {
        setProfileMessage({ text: "Perfil atualizado com sucesso!", type: 'success' });
        setEditMode(false);
        clearProfileMessage();
      }
      if (scope === "security") {
        setSecurityMessage({ text: "Credenciais atualizadas com sucesso!", type: 'success' });
        setSecurityEditMode(false);
        clearSecurityMessage();
      }

      setOrganizerData(data);
    } catch (err: any) {
      console.error(err);
      if (scope === "profile") {
        setProfileMessage({ text: err.message || "Falha ao salvar alterações do perfil.", type: 'error' });
        clearProfileMessage();
      }
      if (scope === "security") {
        setSecurityMessage({ text: err.message || "Falha ao salvar alterações de segurança.", type: 'error' });
        clearSecurityMessage();
      }
    }
  };

  const deleteAccount = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError("Token de autenticação não encontrado.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/lojas/${currentUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao excluir a conta do organizador.');

      localStorage.removeItem('accessToken');
      setSecurityMessage({ text: "Conta excluída com sucesso!", type: 'success' });
      clearSecurityMessage();
      onLogout();
    } catch (err) {
      console.error(err);
      setSecurityMessage({ text: "Falha ao excluir a conta do organizador. Por favor, tente novamente.", type: 'error' });
      clearSecurityMessage();
    }
  };

  useEffect(() => {
    const fetchOrganizerProfile = async () => {
      setLoading(true);
      setError(null);
      let idToFetch = viewedOrganizerId || currentUser?.id;

      if (!idToFetch) {
          setError("Nenhum ID de organizador/loja para buscar.");
          setLoading(false);
          return;
      }

      const fetchedData = await getOrganizerData(idToFetch);
      if (fetchedData) {
        setOrganizerData(fetchedData);
        setFormData({
          nome: fetchedData.nome || '',
          email: fetchedData.usuario?.email || '',
          telefone: fetchedData.telefone || '',
          endereco: fetchedData.endereco || '',
          site: fetchedData.site || '',
        });
        setSecurityData({
          email: fetchedData.usuario?.email || '',
          novaSenha: '',
          confirmarSenha: '',
        });
        setProfileImage(fetchedData.usuario?.foto || null);
      }
      setLoading(false);
    };
    fetchOrganizerProfile();
  }, [currentUser, viewedOrganizerId]);

  if (!canView) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para visualizar este perfil.
            </p>
            <Button onClick={() => onNavigate(currentUser?.type === 'player' ? 'tournament-details' : 'organizer-dashboard')} variant="outline">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando...</span>
        </div>
      );
    }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  const handleSave = () => {
    if (!formData.nome) {
      setProfileMessage({ text: "O campo Nome Completo é obrigatório.", type: 'error' });
      clearProfileMessage();
      return;
    }
    if (!formData.email) {
      setProfileMessage({ text: "O campo Email é obrigatório.", type: 'error' });
      clearProfileMessage();
      return;
    }
    if (!formData.telefone) {
      setProfileMessage({ text: "O campo de Telefone é obrigatório.", type: 'error' });
      clearProfileMessage();
      return;
    }
    if (!formData.endereco) {
      setProfileMessage({ text: "O campo de Endereço é obrigatório.", type: 'error' });
      clearProfileMessage();
      return;
    }

    const changes: any = {};
    const original = organizerData;
    const current = formData;

    if (current.nome && current.nome !== original.nome) {
      changes.nome = current.nome;
    }
    if (current.email && current.email !== original.usuario.email) {
      changes.email = current.email;
    }
    if (current.telefone !== original.telefone) {
      changes.telefone = current.telefone || null;
    }
    if (current.endereco !== original.endereco) {
      changes.endereco = current.endereco || null;
    }
    if (current.site !== original.site) {
      changes.site = current.site || null;
    }

    if (Object.keys(changes).length === 0) {
      setProfileMessage({ text: "Nenhuma alteração para salvar.", type: 'success' });
      setEditMode(false);
      clearProfileMessage();
      return;
    }

    updateProfileData(changes, "profile");
  };

  const handleSecuritySave = () => {
    if (!securityData.email) {
      setSecurityMessage({ text: "O campo Email é obrigatório.", type: 'error' });
      clearSecurityMessage();
      return;
    }
    if (securityData.novaSenha && securityData.novaSenha !== securityData.confirmarSenha) {
      setSecurityMessage({ text: "As senhas não coincidem!", type: 'error' });
      clearSecurityMessage();
      return;
    }

    const updatedData: any = {};
    if (securityData.email !== organizerData?.usuario?.email) {
      updatedData.email = securityData.email;
    }
    if (securityData.novaSenha) {
      updatedData.senha = securityData.novaSenha;
    }

    if (Object.keys(updatedData).length === 0) {
      setSecurityMessage({ text: "Nenhuma alteração para salvar.", type: 'success' });
      setSecurityEditMode(false);
      clearSecurityMessage();
      return;
    }

    updateProfileData(updatedData, "security");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfileImage(result);
    };
    reader.readAsDataURL(file);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setProfileMessage({ text: "Token de autenticação não encontrado.", type: "error" });
      clearProfileMessage();
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await fetch(`${API_URL}/lojas/upload_foto`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Erro ao enviar a foto.");
      }
  
      const updatedloja = await response.json();
  
      setOrganizerData(updatedloja);
  
      setProfileMessage({ text: "Foto atualizada com sucesso!", type: "success" });
      clearProfileMessage();
    } catch (err) {
      console.error(err);
      setProfileMessage({ text: "Falha ao atualizar a foto.", type: "error" });
      clearProfileMessage();
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  function FormMessage({ message }: { message: { text: string, type: 'success' | 'error' | null } }) {
    if (!message.text) return null;
    return (
      <div className={`mb-4 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
        {message.text}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate(currentUser?.type === 'player' ? 'tournament-details' : 'organizer-dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isViewingOtherOrganizer ? 'Voltar para os detalhes de Torneio' : 'Voltar ao Dashboard'}
        </Button>
        {isViewingOtherOrganizer && organizerData && (
          <div className="mb-4 p-3 bg-secondary rounded-lg">
            <p className="text-sm text-secondary-foreground">
              <Eye className="h-4 w-4 inline mr-2" />
              Você está visualizando o perfil de {organizerData.nome} como jogador
            </p>
          </div>
        )}
      </div>

      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="relative">
              <Avatar className="h-32 w-32">
                {profileImage && (
                  <AvatarImage
                    src={
                      organizerData?.usuario?.foto
                        ? `${API_URL}/uploads/${organizerData.usuario.foto}`
                        : profileImage
                    }
                    alt={organizerData?.nome}
                  />
                )}
                <AvatarFallback className="text-2xl">
                  {organizerData?.nome?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {canEdit && (
                <>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={triggerImageUpload}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-4">{organizerData?.nome}</h1>

              <div className="text-muted-foreground mb-4">
                <p>{organizerData?.usuario?.email}</p>
                <p>Membro desde: {organizerData?.usuario?.data_criacao ? new Date(organizerData.usuario.data_criacao).toLocaleDateString() : 'Data desconhecida'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <FormMessage message={profileMessage} />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Informações do Perfil</span>
            </CardTitle>
            <CardDescription>
              {isViewingOtherOrganizer
                ? `Visualizando informações do perfil de ${organizerData?.nome}`
                : 'Gerencie as informações da sua loja e preferências'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Informações da Loja</h3>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode(!editMode);
                      setProfileMessage({ text: '', type: null });
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {editMode ? 'Cancelar' : 'Editar'}
                  </Button>
                )}
              </div>

              {editMode && canEdit ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome da Loja</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Número de Telefone</Label>
                      <Input
                        id="telefone"
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                        placeholder="123 Main St, City, State 12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site">Site</Label>
                      <Input
                        id="site"
                        value={formData.site}
                        onChange={(e) => setFormData({...formData, site: e.target.value})}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSave} className="w-full md:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome da Loja</Label>
                      <p className="text-sm text-muted-foreground mt-1">{organizerData?.nome}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground mt-1">{organizerData?.usuario?.email}</p>
                    </div>
                    <div>
                      <Label>Número de Telefone</Label>
                      <p className="text-sm text-muted-foreground mt-1">{organizerData?.telefone || 'Não fornecido'}</p>
                    </div>
                    <div>
                      <Label>Endereço</Label>
                      <p className="text-sm text-muted-foreground mt-1">{organizerData?.endereco || 'Não fornecido'}</p>
                    </div>
                    <div>
                      <Label>Site</Label>
                      <p className="text-sm text-muted-foreground mt-1">{organizerData?.site || 'Não fornecido'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showSettings && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Receber notificações por email</Label>
                        <p className="text-sm text-muted-foreground">Seja notificado sobre torneios, resultados e atualizações importantes</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({email: checked})}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <FormMessage message={securityMessage} />
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Segurança e Login</span>
              </CardTitle>
              <CardDescription>
                Gerencie suas credenciais de login e segurança da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Informações de Login</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSecurityEditMode(!securityEditMode);
                      setSecurityMessage({text: '', type: null});
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {securityEditMode ? 'Cancelar' : 'Editar'}
                  </Button>
                </div>

                {securityEditMode ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="securityEmail">Endereço de Email</Label>
                        <Input
                          id="securityEmail"
                          type="email"
                          value={securityData.email}
                          onChange={(e) => setSecurityData({...securityData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="novaSenha">Nova Senha</Label>
                        <Input
                          id="novaSenha"
                          type="password"
                          value={securityData.novaSenha}
                          onChange={(e) => setSecurityData({...securityData, novaSenha: e.target.value})}
                          placeholder="Digite a nova senha"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmarSenha">Confirme a Nova Senha</Label>
                        <Input
                          id="confirmarSenha"
                          type="password"
                          value={securityData.confirmarSenha}
                          onChange={(e) => setSecurityData({...securityData, confirmarSenha: e.target.value})}
                          placeholder="Confirme a nova senha"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSecuritySave} className="w-full md:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações de Segurança
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Endereço de Email</Label>
                      <p className="text-sm text-muted-foreground mt-1">{organizerData?.usuario?.email}</p>
                    </div>
                    <div>
                      <Label>Senha</Label>
                      <p className="text-sm text-muted-foreground mt-1">••••••••••••</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
                <div className="border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-destructive">Excluir Conta</Label>
                      <p className="text-sm text-muted-foreground">
                        Excluir permanentemente sua conta e todos os dados associados
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir Conta
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente sua
                            conta e removerá todos os seus dados de nossos servidores, incluindo seu
                            histórico de torneios, classificações e conquistas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={deleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sim, excluir conta
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}