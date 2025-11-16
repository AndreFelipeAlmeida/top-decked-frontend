import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Switch } from './ui/switch.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Separator } from './ui/separator.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog.tsx';
import { Button } from './ui/button.tsx';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar.tsx';
import { ArrowLeft, Settings, Bell, Trash2, Edit, Save, Camera, Eye, Shield, Loader2, Store } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface OrganizerProfileProps {
  onNavigate: (page: Page, data?: any) => void;
  onLogout: () => void;
  currentUser: any;
  viewedOrganizerId?: number | null;
}

// 💡 HELPER: Função para construir a URL da imagem corretamente (Base64 ou caminho do servidor)
const getImageUrl = (filename: string | null) => {
    if (!filename) return undefined;
    // Se for Base64 (upload local temporário)
    if (filename.startsWith('data:')) return filename;
    // Se for o nome do arquivo do backend, constrói a URL completa
    return `${API_URL}/uploads/${filename}`;
};


export function OrganizerProfile({ onNavigate, onLogout, currentUser, viewedOrganizerId }: OrganizerProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [organizerData, setOrganizerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
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
  const [securityMessage, setSecurityDataMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });

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
    setTimeout(() => setSecurityDataMessage({ text: '', type: null }), 5000);
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
    if (scope === "security") setSecurityDataMessage({ text: '', type: null });

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
        setSecurityDataMessage({ text: "Credenciais atualizadas com sucesso!", type: 'success' });
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
        setSecurityDataMessage({ text: err.message || "Falha ao salvar alterações de segurança.", type: 'error' });
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
      setSecurityDataMessage({ text: "Conta excluída com sucesso!", type: 'success' });
      clearSecurityMessage();
      onLogout();
    } catch (err) {
      console.error(err);
      setSecurityDataMessage({ text: "Falha ao excluir a conta do organizador. Por favor, tente novamente.", type: 'error' });
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
        // ✅ CORREÇÃO 1: Inicializa o estado com o nome do arquivo do servidor
        setProfileImage(fetchedData.usuario?.foto || null);
        setBannerImage(fetchedData.banner || null);
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
            <Button onClick={() => onNavigate(currentUser?.type === 'player' ? 'tournament-list' : 'organizer-dashboard')} variant="outline">
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

  // ✅ CORREÇÃO 2: Funções de upload com sincronização com o servidor

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Visualização local imediata (Base64)
    const reader = new FileReader();
    reader.onload = (e) => setBannerImage(e.target?.result as string);
    reader.readAsDataURL(file);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setProfileMessage({ text: "Token de autenticação não encontrado.", type: "error" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/lojas/upload_banner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar o banner.");
      }

      const updatedLoja = await response.json();

      // 2. SINCRONIZAÇÃO: Atualiza com o nome do arquivo retornado pelo servidor
      setOrganizerData(updatedLoja);
      setBannerImage(updatedLoja.banner || null);

      setProfileMessage({ text: "Banner atualizado com sucesso!", type: "success" });
      clearProfileMessage();
    } catch (err) {
      console.error(err);
      setProfileMessage({ text: "Falha ao atualizar o banner.", type: "error" });
      clearProfileMessage();
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Visualização local imediata (Base64)
    const reader = new FileReader();
    reader.onload = (e) => setProfileImage(e.target?.result as string);
    reader.readAsDataURL(file);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setProfileMessage({ text: "Token de autenticação não encontrado.", type: "error" });
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
        throw new Error("Erro ao enviar a foto de perfil.");
      }

      const updatedLoja = await response.json();

      // 2. SINCRONIZAÇÃO: Atualiza com o nome do arquivo retornado pelo servidor
      setOrganizerData(updatedLoja);
      setProfileImage(updatedLoja.usuario.foto || null);

      setProfileMessage({ text: "Foto de perfil atualizada com sucesso!", type: "success" });
      clearProfileMessage();
    } catch (err) {
      console.error(err);
      setProfileMessage({ text: "Falha ao atualizar a foto de perfil.", type: "error" });
      clearProfileMessage();
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerBannerUpload = () => {
    bannerInputRef.current?.click();
  };

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

    const dataToUpdate = {
      ...organizerData,
      nome: formData.nome,
      telefone: formData.telefone,
      endereco: formData.endereco,
      site: formData.site,
    };

    updateProfileData(dataToUpdate, "profile");
  };

  const handleSecuritySave = () => {
    if (securityData.novaSenha && securityData.novaSenha !== securityData.confirmarSenha) {
      setSecurityDataMessage({ text: "As novas senhas não coincidem.", type: 'error' });
      clearSecurityMessage();
      return;
    }

    const securityDataToUpdate = {
      email: securityData.email,
      senha: securityData.novaSenha || undefined,
    };

    updateProfileData(securityDataToUpdate, "security");
    // Se updateProfileData for bem-sucedido, ele atualiza a mensagem e o modo de edição
  };


  const getBackNavigation = () => {
    if (currentUser?.tipo === 'player' || isViewingOtherOrganizer) {
      return { page: 'tournament-list', label: 'Voltar para Torneios' };
    } else {
      return { page: 'organizer-dashboard', label: 'Voltar ao Dashboard' };
    }
  };

  const backNav = getBackNavigation();
  const displayedName = organizerData?.nome || organizerData?.usuario?.nome || 'Organizador Desconhecido';
  const displayedEmail = organizerData?.usuario?.email || '';


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate(backNav.page as Page)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backNav.label}
        </Button>

        {isViewingOtherOrganizer && (
          <div className="mb-4 p-3 bg-secondary rounded-lg">
            <p className="text-sm text-secondary-foreground">
              <Eye className="h-4 w-4 inline mr-2" />
              Você está visualizando o perfil de **{displayedName}**
            </p>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <Card className="mb-8 overflow-hidden">
        {(bannerImage || canEdit) && (
          <div className="relative h-48 w-full overflow-hidden bg-white">
            {bannerImage ? (
              // ✅ CORREÇÃO 3A: Usa getImageUrl para o Banner
              <img
                src={getImageUrl(bannerImage)}
                alt="Store banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="h-16 w-16 text-gray-400" />
              </div>
            )}

            {canEdit && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-4 right-4 bg-white/90 text-foreground"
                  onClick={triggerBannerUpload}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {bannerImage ? 'Mudar Banner' : 'Carregar Banner'}
                </Button>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </>
            )}
          </div>
        )}
        <CardContent className="p-8">
          <div
            className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8"
            style={{ marginTop: bannerImage || canEdit ? '-4rem' : '0' }}
          >
            <div className="relative">
              <Avatar
                className={`${bannerImage || canEdit ? 'h-32 w-32 border-2 border-white' : 'h-32 w-32'}`}
              >
                {profileImage ? (
                  // ✅ CORREÇÃO 3B: Usa getImageUrl para o Avatar
                  <AvatarImage src={getImageUrl(profileImage)} alt={displayedName} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {(organizerData?.nome || organizerData?.usuario?.nome || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                )}
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

            <div className="flex-1 text-center md:text-left mt-4">
              <h1 className="text-3xl font-bold mb-4 mt-4">{displayedName}</h1>

              <div className="text-muted-foreground mb-4">
                <p>{displayedEmail}</p>
                <p>Membro desde: {organizerData?.data_criacao ? new Date(organizerData.data_criacao).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exibição de Mensagens de Perfil */}
      {profileMessage.text && (
        <div className={`p-3 mb-4 rounded-lg ${profileMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {profileMessage.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Information - Always visible */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Informações do Perfil</span>
            </CardTitle>
            <CardDescription>
              {isViewingOtherOrganizer
                ? `Visualizar as informações da loja ${displayedName}`
                : 'Gerencie as informações e preferências da sua loja'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Store Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Informações da Loja</h3>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
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
                      <Label htmlFor="storeName">Nome da Loja</Label>
                      <Input
                        id="storeName"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeEmail">Email</Label>
                      <Input
                        id="storeEmail"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storePhone">Telefone (Opcional)</Label>
                      <Input
                        id="storePhone"
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                        placeholder="(99) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeWebsite">Website (Opcional)</Label>
                      <Input
                        id="storeWebsite"
                        value={formData.site}
                        onChange={(e) => setFormData({...formData, site: e.target.value})}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="storeAddress">Endereço (Opcional)</Label>
                      <Input
                        id="storeAddress"
                        value={formData.endereco}
                        onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                        placeholder="Rua Principal, 123, Cidade, Estado 12345"
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
                      <p className="text-sm text-muted-foreground mt-1">{organizerData?.nome || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground mt-1">{displayedEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <p className="text-sm text-muted-foreground mt-1">{organizerData?.telefone || 'Não fornecido'}</p>
                    </div>
                    <div>
                      <Label>Website</Label>
                      <p className="text-sm text-muted-foreground mt-1">{organizerData?.site || 'Não fornecido'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Endereço</Label>
                      <p className="text-sm text-muted-foreground mt-1">{organizerData?.endereco || 'Não fornecido'}</p>
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

        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Segurança & Login</span>
              </CardTitle>
              <CardDescription>
                Gerencie suas credenciais de login e segurança da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {securityMessage.text && (
                <div className={`p-3 rounded-lg ${securityMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {securityMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Informações de Login</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSecurityEditMode(!securityEditMode)}
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
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={securityData.novaSenha}
                          onChange={(e) => setSecurityData({...securityData, novaSenha: e.target.value})}
                          placeholder="Digite a nova senha"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
                        <Input
                          id="confirmPassword"
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
                      <p className="text-sm text-muted-foreground mt-1">{displayedEmail}</p>
                    </div>
                    <div>
                      <Label>Senha</Label>
                      <p className="text-sm text-muted-foreground mt-1">••••••••••••</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
                <div className="border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-destructive">Excluir Conta</Label>
                      <p className="text-sm text-muted-foreground">
                        Exclua permanentemente sua conta e todos os dados associados.
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
                          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente sua
                            conta e removerá todos os seus dados de nossos servidores, incluindo seu
                            histórico de torneios, informações da loja e todos os torneios associados.
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