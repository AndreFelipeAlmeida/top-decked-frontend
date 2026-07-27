import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuthContext } from '@/hooks/authContext.hooks';
import {
  useDeleteMyStore,
  useMyStore,
  useUpdateMyStore,
  useUpdateStoreForm,
  useUploadStorePhoto,
} from '@/hooks/store.hooks';
import type { UpdateStoreForm } from '@/schemas/store.schemas';
import type { ApiErrorDetail } from '@/types/Error';
import Spinner from '@/components/ui/spinner';
import { DangerZoneCard } from '@/components/DangerZoneCard';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = axios.isAxiosError<ApiErrorDetail>(error) ? error.response?.data?.detail : undefined;
  return typeof detail === 'string' ? detail : fallback;
};

export default function OrganizerProfile() {
  const { user, handleLogout } = useAuthContext();

  const { data: loja, isLoading } = useMyStore(user?.id);
  const deleteMutation = useDeleteMyStore();

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => handleLogout(),
      onError: (error) => toast.error(extractErrorMessage(error, 'Erro ao excluir a conta da loja.')),
    });
  };

  const { register, handleSubmit } = useUpdateStoreForm({
    nome: loja?.nome ?? '',
    endereco: loja?.endereco ?? '',
    telefone: loja?.telefone ?? '',
    site: loja?.site ?? '',
    email: loja?.usuario?.email ?? '',
  });

  const updateMutation = useUpdateMyStore(user?.id);
  const uploadMutation = useUploadStorePhoto(user?.id);

  const handleSave = (data: UpdateStoreForm) => {
    updateMutation.mutate(data, {
      onSuccess: () => alert("Perfil atualizado com sucesso!"),
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  if (isLoading) return <Spinner />;

  return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-foreground">Perfil da Loja & Configurações</h1>
          <p className="text-muted-foreground">Gerencie as informações e preferências da sua loja</p>
        </div>

        <div className="max-w-2xl">
            <form onSubmit={handleSubmit(handleSave)} className="bg-card rounded-lg shadow p-6">
              <h2 className="text-xl mb-4 text-foreground">Informações da Loja</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">Nome da Loja</label>
                  <input
                    type="text"
                    {...register('nome')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">Logo da Loja</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-primary/15 rounded-lg flex items-center justify-center overflow-hidden">
                      {loja?.usuario?.foto ? (
                        <img src={`/uploads/${loja.usuario.foto}`} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🏪</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input type="file" id="logo-upload" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <label htmlFor="logo-upload" className="inline-flex items-center space-x-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Enviar Nova Logo</span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">PNG, JPG de até 5MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">Endereço</label>
                  <input
                    type="text"
                    {...register('endereco')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">Telefone</label>
                    <input
                      type="tel"
                      {...register('telefone')}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-muted-foreground">E-mail de Contato</label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-primary/40"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>

            <div className="mt-8">
              <DangerZoneCard
                descricao="Excluir a conta da loja é permanente e não pode ser desfeito."
                itensPerdidos={[
                  'Todos os torneios e eventos organizados por esta loja',
                  'Vínculos e créditos de jogadores nesta loja',
                  'Estoque, categorias e histórico de vendas',
                  'Regras de pontuação e temporadas cadastradas',
                ]}
                nomeParaConfirmar={loja?.nome}
                onConfirmar={handleDelete}
                isExcluindo={deleteMutation.isPending}
              />
            </div>
        </div>
      </div>
  );
}