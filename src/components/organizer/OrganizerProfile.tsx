import { Save, Upload, CreditCard, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPerfilLoja, atualizarPerfilLoja, uploadFotoLoja } from '@/services/lojasService';
import Spinner from '@/components/ui/Spinner';

const historicoFaturas = [
  { id: 'FAT-2026-001', data: '01/01/2026', valor: 'R$ 79,00', status: 'Pago', plano: 'Plano Pro' },
  { id: 'FAT-2025-012', data: '01/12/2025', valor: 'R$ 79,00', status: 'Pago', plano: 'Plano Pro' },
];

export default function OrganizerProfile() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    site: '',
    email: ''
  });

  const { data: loja, isLoading } = useQuery({
    queryKey: ['perfil-loja'],
    queryFn: getPerfilLoja
  });

  useEffect(() => {
    if (loja) {
      setFormData({
        nome: loja.nome || '',
        endereco: loja.endereco || '',
        telefone: loja.telefone || '',
        site: loja.site || '',
        email: loja.usuario?.email || ''
      });
    }
  }, [loja]);

  const updateMutation = useMutation({
    mutationFn: atualizarPerfilLoja,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil-loja'] });
      alert("Perfil atualizado com sucesso!");
    }
  });

  const uploadMutation = useMutation({
    mutationFn: uploadFotoLoja,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['perfil-loja'] })
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
          <h1 className="text-3xl mb-2 text-gray-900">Perfil da Loja & Configurações</h1>
          <p className="text-gray-600">Gerencie as informações da sua loja, faturamento e preferências</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl mb-4 text-gray-900">Informações da Loja</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Nome da Loja</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Logo da Loja</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {loja?.usuario?.foto ? (
                        <img src={`${import.meta.env.VITE_API_URL}/uploads/${loja.usuario.foto}`} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🏪</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input type="file" id="logo-upload" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <label htmlFor="logo-upload" className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Enviar Nova Logo</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG de até 5MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Endereço</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Telefone</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">E-mail de Contato</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow p-6 text-white">
              <h2 className="text-xl mb-4">Plano Atual</h2>
              <div className="mb-4">
                <div className="text-3xl mb-1">Plano Pro</div>
                <div className="text-purple-100">R$ 79,00 / mês</div>
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
              <button className="w-full bg-white text-purple-600 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                Mudar de Plano
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl mb-4 text-gray-900">Método de Pagamento</h2>
              <div className="flex items-center space-x-3 mb-4 p-4 border border-gray-200 rounded-lg">
                <CreditCard className="w-8 h-8 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-900">•••• •••• •••• 4242</div>
                  <div className="text-xs text-gray-500">Expira em 12/2027</div>
                </div>
              </div>
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Atualizar Cartão
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl mb-4 text-gray-900">Histórico de Faturas</h2>
              <div className="space-y-3">
                {historicoFaturas.map((fatura) => (
                  <div key={fatura.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-900">{fatura.id}</div>
                      <div className="text-xs text-gray-500">{fatura.data}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">{fatura.valor}</div>
                      <button className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1">
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