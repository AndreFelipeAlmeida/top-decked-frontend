import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, Store, Gamepad2, User as UserIcon, Upload } from 'lucide-react';

import { AppCard } from '@/components/ui/app-card';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { useMe } from '@/hooks/auth.hooks';
import { usePlayerCredits } from '@/hooks/credits.hooks';
import {
  useImpactoTrocaGameId,
  useUpdatePlayer,
  useUpdatePlayerGameId,
  useUpdatePlayerProfileForm,
  useUploadPlayerPhoto,
} from '@/hooks/players.hooks';
import { updateGameIdSchema, type UpdateGameIdForm } from '@/schemas/player.schemas';
import type { ApiErrorDetail } from '@/types/Error';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

const toDateInputValue = (value: string | Date | null | undefined) => {
  if (!value) return '';
  const data = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(data.getTime())) return '';
  return data.toISOString().slice(0, 10);
};

export default function PlayerProfileWallet() {
  const { data: player } = useMe(true);
  const { data: stores = [] } = usePlayerCredits();

  const [pendingGameId, setPendingGameId] = useState<string | null>(null);

  const pokemonId = player?.tcgs?.find((t) => t.tcg === 'POKEMON')?.game_id ?? '';
  const totalCredits = stores.reduce((sum, store) => sum + store.creditos, 0);

  const {
    register: registerPerfil,
    handleSubmit: handleSubmitPerfil,
    formState: { errors: errosPerfil },
  } = useUpdatePlayerProfileForm({
    nome: player?.nome ?? '',
    telefone: player?.telefone ?? '',
    data_nascimento: toDateInputValue(player?.data_nascimento),
    email: player?.usuario?.email ?? '',
  });

  const {
    register: registerGameId,
    handleSubmit: handleSubmitGameId,
  } = useForm<UpdateGameIdForm>({
    resolver: zodResolver(updateGameIdSchema),
    values: { game_id: pokemonId },
  });

  const updatePerfilMutation = useUpdatePlayer(player?.id);
  const updateGameIdMutation = useUpdatePlayerGameId(player?.id);
  const uploadPhotoMutation = useUploadPlayerPhoto(player?.id);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadPhotoMutation.mutate(e.target.files[0], {
        onSuccess: () => toast.success('Foto de perfil atualizada com sucesso!'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao atualizar a foto de perfil.')),
      });
    }
  };

  // Só busca o impacto (torneios/créditos perdidos) quando é de fato uma
  // TROCA (já existia um ID antes) — no primeiro cadastro não há nada a
  // perder, então nem faz sentido consultar.
  const trocandoGameIdExistente = pendingGameId !== null && pokemonId !== '';
  const { data: impacto, isLoading: isImpactoLoading } = useImpactoTrocaGameId('POKEMON', trocandoGameIdExistente);

  const onSubmitPerfil = handleSubmitPerfil((data) => {
    updatePerfilMutation.mutate(
      {
        nome: data.nome,
        telefone: data.telefone || null,
        data_nascimento: data.data_nascimento || null,
        email: data.email || null,
      },
      {
        onSuccess: () => toast.success('Perfil atualizado com sucesso!'),
        onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao atualizar perfil.')),
      },
    );
  });

  const onSubmitGameId = handleSubmitGameId((data) => {
    if (data.game_id === pokemonId) return;
    setPendingGameId(data.game_id);
  });

  const confirmarTrocaGameId = () => {
    if (pendingGameId === null) return;
    updateGameIdMutation.mutate(pendingGameId, {
      onSuccess: () => {
        toast.success('ID do jogador atualizado com sucesso!');
        setPendingGameId(null);
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error, 'Erro ao atualizar o ID do jogador.'));
        setPendingGameId(null);
      },
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-foreground">Perfil &amp; Carteira</h1>
        <p className="text-muted-foreground">Organize suas informações pessoais e os seus créditos em múltiplas lojas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column - Profile */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Informações Pessoais */}
          <AppCard title="Informações Pessoais" icon={<UserIcon className="w-5 h-5" />}>
            <form onSubmit={onSubmitPerfil} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Foto de Perfil</label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    {player?.usuario?.foto ? (
                      <img
                        src={`/uploads/${player.usuario.foto}`}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="player-photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <label
                      htmlFor="player-photo-upload"
                      className="inline-flex items-center space-x-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">
                        {uploadPhotoMutation.isPending ? 'Enviando...' : 'Enviar Nova Foto'}
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG de até 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Nome</label>
                  <input
                    type="text"
                    {...registerPerfil('nome')}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errosPerfil.nome && (
                    <p className="text-destructive text-xs mt-1">{errosPerfil.nome.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Telefone</label>
                  <input
                    type="text"
                    {...registerPerfil('telefone')}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">Data de Nascimento</label>
                  <input
                    type="date"
                    {...registerPerfil('data_nascimento')}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">E-mail</label>
                  <input
                    type="email"
                    {...registerPerfil('email')}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errosPerfil.email && (
                    <p className="text-destructive text-xs mt-1">{errosPerfil.email.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <Button type="submit" disabled={updatePerfilMutation.isPending}>
                  {updatePerfilMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </AppCard>

          {/* IDs dos Jogos */}
          <AppCard
            title="IDs dos Jogos"
            icon={<Gamepad2 className="w-5 h-5" />}
            description="Seu ID vincula seus resultados de torneios importados e créditos a esta conta."
          >
            <form onSubmit={onSubmitGameId} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">ID do Jogador (Pokémon TCG)</label>
                  <input
                    type="text"
                    {...registerGameId('game_id')}
                    className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <Button type="submit" disabled={updateGameIdMutation.isPending}>
                  {updateGameIdMutation.isPending ? 'Salvando...' : 'Salvar ID'}
                </Button>
              </div>
            </form>
          </AppCard>
        </div>

        {/* Right Column - Wallet */}
        <div className="space-y-6 md:space-y-8">
          <AppCard title="Carteira de Créditos" icon={<Wallet className="w-5 h-5" />}>
            <div className="space-y-6">
              <div className="rounded-xl bg-brand-gradient p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-primary-foreground/80">Créditos Totais</span>
                  <Wallet className="w-5 h-5 text-primary-foreground/80" />
                </div>
                <p className="text-4xl font-bold mb-1">R$ {totalCredits.toFixed(2)}</p>
                <p className="text-primary-foreground/80 text-sm">
                  Somando {stores.length} {stores.length === 1 ? 'loja' : 'lojas'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Registro por Loja</h3>

                {stores.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Você ainda não tem créditos em nenhuma loja.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stores.map((store) => (
                      <div
                        key={store.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Store className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{store.nome_loja}</p>
                            <p className="text-xs text-muted-foreground truncate">{store.endereco}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary shrink-0">
                          R$ {store.creditos.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={pendingGameId !== null}
        onClose={() => setPendingGameId(null)}
        onConfirm={confirmarTrocaGameId}
        title={trocandoGameIdExistente ? 'Trocar ID do Jogador?' : 'Cadastrar ID do Jogador?'}
        description={
          trocandoGameIdExistente
            ? isImpactoLoading || !impacto
              ? 'Calculando o que será perdido com a troca...'
              : `Ao trocar de "${impacto.game_id_atual}" para o novo ID, você perde a atribuição de ${impacto.torneios_importados} ${impacto.torneios_importados === 1 ? 'torneio importado' : 'torneios importados'} vinculados ao ID atual (seus créditos de loja não são afetados — eles ficam com a sua conta, não com o ID). O histórico em si não é apagado, mas deixa de estar associado a esta conta. Essa ação não pode ser desfeita.`
            : 'Você é totalmente responsável por inserir corretamente o seu ID de jogador (Pokémon TCG). Se o ID informado pertencer a outra pessoa, você pode ser penalizado.'
        }
        isLoading={updateGameIdMutation.isPending || (trocandoGameIdExistente && isImpactoLoading)}
        variant="default"
        confirmLabel="Confirmar"
        loadingLabel={updateGameIdMutation.isPending ? 'Salvando...' : 'Aguarde...'}
      />
    </div>
  );
}
