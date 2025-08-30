import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Switch } from './ui/switch.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Separator } from './ui/separator.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog.tsx';
import { Button } from './ui/button.tsx';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar.tsx';
import { ArrowLeft, Settings, Bell, Trash2, Edit, Save, Camera, Eye, Shield } from 'lucide-react';
import { tournamentStore, User } from '../data/store.ts';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface OrganizerProfileProps {
  onNavigate: (page: Page, data?: any) => void;
  currentUser: User | null;
  viewedOrganizerId?: string | null;
}

const initialStoreData = {
  id: '1',
  name: 'Downtown Comics',
  email: 'info@downtowncomics.com',
  phone: '(555) 123-4567',
  address: '123 Main Street, City, State 12345',
  website: 'https://downtowncomics.com',
  joinDate: '2022-03-15',
  avatar: null
};

export function OrganizerProfile({ onNavigate, currentUser, viewedOrganizerId }: OrganizerProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storeData, setStoreData] = useState(initialStoreData);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(storeData.avatar);
  const [formData, setFormData] = useState({
    name: storeData.name,
    email: storeData.email,
    phone: storeData.phone,
    address: storeData.address,
    website: storeData.website,
  });
  const [notifications, setNotifications] = useState({
    email: true,
  });
  
  const [securityData, setSecurityData] = useState({
    email: storeData.email,
    newPassword: '',
    confirmPassword: '',
  });
  const [securityEditMode, setSecurityEditMode] = useState(false);
  
  const [viewedOrganizer, setViewedOrganizer] = useState<User | null>(null);

  const isViewingOtherOrganizer = viewedOrganizerId && viewedOrganizerId !== currentUser?.id;
  const displayedOrganizer = isViewingOtherOrganizer ? viewedOrganizer : currentUser;

  useEffect(() => {
    if (viewedOrganizerId && viewedOrganizerId !== currentUser?.id) {
      const organizer = tournamentStore.getUserById(viewedOrganizerId);
      setViewedOrganizer(organizer || null);
    }
  }, [viewedOrganizerId, currentUser?.id]);

  useEffect(() => {
    setFormData({
      name: storeData.name,
      email: storeData.email,
      phone: storeData.phone,
      address: storeData.address,
      website: storeData.website,
    });
    setSecurityData({
      email: storeData.email,
      newPassword: '',
      confirmPassword: '',
    });
  }, [storeData]);

  const handleSave = () => {
    setStoreData({
      ...storeData,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      website: formData.website
    });
    setEditMode(false);
  };

  const handleSecuritySave = () => {
    setStoreData({
      ...storeData,
      email: securityData.email
    });
    setSecurityData({
      email: securityData.email,
      newPassword: '',
      confirmPassword: '',
    });
    setSecurityEditMode(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        setStoreData({
          ...storeData,
          avatar: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const getBackNavigation = () => {
    if (currentUser?.type === 'player') {
      return { page: 'player-dashboard', label: 'Voltar ao Painel' };
    } else {
      return { page: 'organizer-dashboard', label: 'Voltar ao Painel' };
    }
  };

  const backNav = getBackNavigation();

  if (isViewingOtherOrganizer && !viewedOrganizer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Organizador Não Encontrado</h1>
          <Button onClick={() => onNavigate(backNav.page as Page)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backNav.label}
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = !isViewingOtherOrganizer;
  const showSettings = !isViewingOtherOrganizer;

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
              Você está visualizando o perfil de {displayedOrganizer?.name || displayedOrganizer?.store || 'um organizador'}
            </p>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="relative">
              <Avatar className="h-32 w-32">
                {profileImage && (
                  <AvatarImage src={profileImage} alt={displayedOrganizer?.name || displayedOrganizer?.store || 'Organizador'} />
                )}
                <AvatarFallback className="text-2xl">
                  {(displayedOrganizer?.name || displayedOrganizer?.store || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
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
              <h1 className="text-3xl font-bold mb-4">{isViewingOtherOrganizer ? (displayedOrganizer?.name || displayedOrganizer?.store || 'Organizador Desconhecido') : storeData.name}</h1>
              
              <div className="text-muted-foreground mb-4">
                <p>{isViewingOtherOrganizer ? displayedOrganizer?.email : storeData.email}</p>
                <p>Membro desde: {new Date(storeData.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                ? `Visualizar as informações de perfil de ${displayedOrganizer?.name || displayedOrganizer?.store || 'organizador'}`
                : 'Gerenciar as informações e preferências da sua loja'
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
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeEmail">Email</Label>
                      <Input
                        id="storeEmail"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storePhone">Número de Telefone (Opcional)</Label>
                      <Input
                        id="storePhone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeWebsite">Site (Opcional)</Label>
                      <Input
                        id="storeWebsite"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="storeAddress">Endereço (Opcional)</Label>
                      <Input
                        id="storeAddress"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="123 Main St, City, State 12345"
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
                      <p className="text-sm text-muted-foreground mt-1">{isViewingOtherOrganizer ? (displayedOrganizer?.name || displayedOrganizer?.store) : storeData.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground mt-1">{isViewingOtherOrganizer ? displayedOrganizer?.email : storeData.email}</p>
                    </div>
                    <div>
                      <Label>Número de Telefone</Label>
                      <p className="text-sm text-muted-foreground mt-1">{isViewingOtherOrganizer ? (displayedOrganizer?.phone || 'Não fornecido') : (storeData.phone || 'Não fornecido')}</p>
                    </div>
                    <div>
                      <Label>Site</Label>
                      <p className="text-sm text-muted-foreground mt-1">{isViewingOtherOrganizer ? (displayedOrganizer?.website || 'Não fornecido') : (storeData.website || 'Não fornecido')}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Endereço</Label>
                      <p className="text-sm text-muted-foreground mt-1">{isViewingOtherOrganizer ? (displayedOrganizer?.address || 'Não fornecido') : (storeData.address || 'Não fornecido')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showSettings && (
              <>
                <Separator />

                {/* Notification Settings */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Receber notificações por email</Label>
                        <p className="text-sm text-muted-foreground">Seja notificado sobre torneios, registros e atualizações importantes</p>
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

        {/* Security Section - Only visible to profile owner */}
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
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                          placeholder="Digite a nova senha"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
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
                      <p className="text-sm text-muted-foreground mt-1">{storeData.email}</p>
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
                            histórico de torneios, informações da loja e todos os torneios associados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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