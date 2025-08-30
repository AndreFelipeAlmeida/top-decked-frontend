import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Switch } from './ui/switch.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { Separator } from './ui/separator.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog.tsx';
import { Button } from './ui/button.tsx';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar.tsx';
import { ArrowLeft, Settings, Bell, Trash2, Edit, Save, Plus, X, Camera, Eye, Shield } from 'lucide-react';
import { tournamentStore } from '../data/store.ts';

type Page = 'login' | 'player-dashboard' | 'organizer-dashboard' | 'tournament-creation' | 'ranking' | 'tournament-details' | 'tournament-list' | 'tournament-edit' | 'player-rules' | 'player-profile' | 'organizer-profile';

interface PlayerProfileProps {
  onNavigate: (page: Page, data?: any) => void;
  currentUser: any;
  viewedPlayerId?: string | null;
}

const initialPlayerData = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  gameIds: [
    { game: 'Magic: The Gathering', id: 'MTG12345' },
    { game: 'Yu-Gi-Oh!', id: 'YGO67890' }
  ],
  phone: '(555) 123-4567',
  dateOfBirth: '1995-06-15',
  joinDate: '2023-01-15',
  avatar: null
};

export function PlayerProfile({ onNavigate, currentUser, viewedPlayerId }: PlayerProfileProps) {
  const [playerData, setPlayerData] = useState(initialPlayerData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gameIds: [],
  });
  const [securityData, setSecurityData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [securityEditMode, setSecurityEditMode] = useState(false);
  const [notifications, setNotifications] = useState({ email: true });

  const isOrganizer = currentUser?.type === 'organizer';
  const isViewingOtherPlayer = viewedPlayerId && viewedPlayerId !== currentUser?.id;
  
  const isOwnProfile = !isViewingOtherPlayer;
  const canView = isOwnProfile || isOrganizer;
  const canEdit = isOwnProfile;
  const showSettings = isOwnProfile;

  const profileData = useMemo(() => {
    if (isViewingOtherPlayer) {
      const viewedPlayer = tournamentStore.getUserById(viewedPlayerId);
      return {
        ...initialPlayerData,
        id: viewedPlayer?.id || initialPlayerData.id,
        name: viewedPlayer?.name || initialPlayerData.name,
        email: viewedPlayer?.email || initialPlayerData.email,
        phone: viewedPlayer?.phone || initialPlayerData.phone,
        dateOfBirth: viewedPlayer?.dateOfBirth || initialPlayerData.dateOfBirth,
        gameIds: viewedPlayer?.gameIds || initialPlayerData.gameIds,
        avatar: viewedPlayer?.avatar || initialPlayerData.avatar
      };
    } else {
      return playerData;
    }
  }, [isViewingOtherPlayer, viewedPlayerId, playerData]);

  useEffect(() => {
    setProfileImage(profileData.avatar);
    setFormData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      dateOfBirth: profileData.dateOfBirth,
      gameIds: [...profileData.gameIds],
    });
    setSecurityData({
      email: profileData.email,
      newPassword: '',
      confirmPassword: '',
    });
  }, [profileData]);

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
            <Button onClick={() => onNavigate(currentUser?.type === 'organizer' ? 'ranking' : 'player-dashboard')} variant="outline">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    setPlayerData({
      ...playerData,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gameIds: formData.gameIds
    });
    setEditMode(false);
  };

  const handleSecuritySave = () => {
    setPlayerData({
      ...playerData,
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
        setPlayerData({
          ...playerData,
          avatar: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const addGameId = () => {
    setFormData({
      ...formData,
      gameIds: [...formData.gameIds, { game: '', id: '' }]
    });
  };

  const removeGameId = (index: number) => {
    setFormData({
      ...formData,
      gameIds: formData.gameIds.filter((_, i) => i !== index)
    });
  };

  const updateGameId = (index: number, field: 'game' | 'id', value: string) => {
    const updatedGameIds = [...formData.gameIds];
    updatedGameIds[index][field] = value;
    setFormData({
      ...formData,
      gameIds: updatedGameIds
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate(currentUser?.type === 'organizer' ? 'ranking' : 'player-dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isViewingOtherPlayer ? 'Voltar para o Ranking' : 'Voltar ao Dashboard'}
        </Button>
        {isViewingOtherPlayer && (
          <div className="mb-4 p-3 bg-secondary rounded-lg">
            <p className="text-sm text-secondary-foreground">
              <Eye className="h-4 w-4 inline mr-2" />
              Você está visualizando o perfil de {profileData.name} como organizador
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
                  <AvatarImage src={profileImage} alt={profileData.name} />
                )}
                <AvatarFallback className="text-2xl">
                  {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
              <h1 className="text-3xl font-bold mb-4">{profileData.name}</h1>
              
              <div className="text-muted-foreground mb-4">
                <p>{profileData.email}</p>
                <p>Membro desde: {new Date(profileData.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Informações do Perfil</span>
            </CardTitle>
            <CardDescription>
              {isViewingOtherPlayer 
                ? `Visualizando informações do perfil de ${profileData.name}`
                : 'Gerencie suas informações de conta e preferências'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Informações do Usuário</h3>
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
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                      <Label htmlFor="phone">Número de Telefone (Opcional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Data de Nascimento (Opcional)</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>IDs de Jogo</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addGameId}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar ID de Jogo
                      </Button>
                    </div>
                    
                    {formData.gameIds.map((gameId, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <div className="space-y-2">
                          <Input
                            placeholder="Jogo (e.g., Magic: The Gathering)"
                            value={gameId.game}
                            onChange={(e) => updateGameId(index, 'game', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 flex items-center space-x-2">
                          <Input
                            placeholder="ID do Jogador"
                            value={gameId.id}
                            onChange={(e) => updateGameId(index, 'id', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeGameId(index)}
                            disabled={formData.gameIds.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
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
                      <Label>Nome Completa</Label>
                      <p className="text-sm text-muted-foreground mt-1">{profileData.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground mt-1">{profileData.email}</p>
                    </div>
                    <div>
                      <Label>Número de Telefone</Label>
                      <p className="text-sm text-muted-foreground mt-1">{profileData.phone || 'Não fornecido'}</p>
                    </div>
                    <div>
                      <Label>Data de Nascimento</Label>
                      <p className="text-sm text-muted-foreground mt-1">{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Não fornecido'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>IDs de Jogo</Label>
                    {profileData.gameIds.length > 0 ? (
                      <div className="space-y-2">
                        {profileData.gameIds.map((gameId, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{gameId.game}</p>
                              <p className="text-sm text-muted-foreground">{gameId.id}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">Nenhum ID de jogo adicionado</p>
                    )}
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
                      <p className="text-sm text-muted-foreground mt-1">{playerData.email}</p>
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