import { Save, Upload, CreditCard, Download } from 'lucide-react';
import { useAuthContext } from '@/hooks/authContext.hooks';
import {
  useMyStore,
  useUpdateMyStore,
  useUpdateStoreForm,
  useUploadStorePhoto,
} from '@/hooks/store.hooks';
import type { UpdateStoreForm } from '@/schemas/store.schemas';
import Spinner from '@/components/ui/spinner';

const historicoFaturas = [
  { id: 'FAT-2026-001', data: '01/01/2026', valor: 'R$ 79,00', status: 'Pago', plano: 'Plano Pro' },
  { id: 'FAT-2025-012', data: '01/12/2025', valor: 'R$ 79,00', status: 'Pago', plano: 'Plano Pro' },
];

export default function OrganizerProfile() {
  const { user } = useAuthContext();

  const { data: loja, isLoading } = useMyStore(user?.id);

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
          <p className="text-muted-foreground">Gerencie as informações da sua loja, faturamento e preferências</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
                        <img src={`${import.meta.env.VITE_API_URL}/uploads/${loja.usuario.foto}`} alt="Logo" className="w-full h-full object-cover" />
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
          </div>

          <div className="space-y-8">
            <div className="bg-brand-gradient rounded-lg shadow p-6 text-white">
              <h2 className="text-xl mb-4">Plano Atual</h2>
              <div className="mb-4">
                <div className="text-3xl mb-1">Plano Pro</div>
                <div className="text-primary-foreground">R$ 79,00 / mês</div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start space-x-2">
                  <span>✓</span>
                  <span>Jogadores ilimitados</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>✓</span>
                  <span>Estoque avançado e PDV</span>
                </li>
              </ul>
              <button className="w-full bg-card text-primary py-2 rounded-lg hover:bg-primary/10 transition-colors">
                Mudar de Plano
              </button>
            </div>

            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-xl mb-4 text-foreground">Método de Pagamento</h2>
              <div className="flex items-center space-x-3 mb-4 p-4 border border-border rounded-lg">
                <CreditCard className="w-8 h-8 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-foreground">•••• •••• •••• 4242</div>
                  <div className="text-xs text-muted-foreground">Expira em 12/2027</div>
                </div>
              </div>
              <button className="w-full px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors">
                Atualizar Cartão
              </button>
            </div>

            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-xl mb-4 text-foreground">Histórico de Faturas</h2>
              <div className="space-y-3">
                {historicoFaturas.map((fatura) => (
                  <div key={fatura.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="text-sm text-foreground">{fatura.id}</div>
                      <div className="text-xs text-muted-foreground">{fatura.data}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-foreground">{fatura.valor}</div>
                      <button className="text-xs text-primary hover:text-primary flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>Baixar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}