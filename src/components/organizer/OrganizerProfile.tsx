import { useState, useEffect } from 'react';
import { Save, Upload, CreditCard, Download, Store, MapPin, Phone, Mail, ImageIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@/hooks/useAuthContext';
import { atualizarLoja, uploadBannerLoja } from '@/services/lojasService'; 
import Spinner from '../ui/Spinner';
import type { LojaPublico, LojaAtualizar } from '@/types/Store';

export default function OrganizerProfile() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  const { data: loja, isLoading } = useQuery<LojaPublico>({
    queryKey: ['minha-loja', user?.id],
    queryFn: () => atualizarLoja({}),
    enabled: !!user?.id,
  });

  const [formData, setFormData] = useState<LojaAtualizar>({});

  useEffect(() => {
    if (loja) {
      setFormData({
        nome: loja.nome,
        endereco: loja.endereco,
        telefone: loja.telefone,
        site: loja.site,
      });
    }
  }, [loja]);

  // Mutation para Dados Cadastrais
  const updateMutation = useMutation({
    mutationFn: (data: LojaAtualizar) => atualizarLoja(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-loja'] });
      alert('Perfil atualizado!');
    },
  });

  // Mutation para Banner/Logo
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadBannerLoja(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-loja'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-8">
    <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações da Loja</h1>
        <p className="text-gray-600">Gerencie a identidade visual e informações da sua unidade no TopDecked</p>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
        
        {/* Seção de Branding */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" /> Identidade Visual
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-purple-400">
                {loja?.banner ? (
                    <img src={loja.banner} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                    <Store className="w-12 h-12 text-gray-300" />
                )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2 bg-purple-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-purple-700 transition-colors">
                <Upload className="w-4 h-4" />
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
            </div>
            
            <div className="flex-1 space-y-2">
                <h4 className="font-bold text-gray-900">Banner da Loja</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                Esta imagem aparecerá no topo da sua página pública e nos cards de torneios. 
                Recomendamos imagens de alta resolução (min. 800x800px).
                </p>
                {uploadMutation.isPending && <p className="text-xs text-purple-600 font-bold animate-pulse">Enviando imagem...</p>}
            </div>
            </div>
        </section>

        {/* Seção de Dados */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Nome da Loja</label>
                <input 
                type="text" 
                value={formData.nome || ''} 
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Telefone</label>
                <input 
                type="text" 
                value={formData.telefone || ''} 
                onChange={e => setFormData({...formData, telefone: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
            </div>
            <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-bold text-gray-700">Endereço</label>
                <input 
                type="text" 
                value={formData.endereco || ''} 
                onChange={e => setFormData({...formData, endereco: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
            </div>
            </div>

            <button 
            onClick={() => updateMutation.mutate(formData)}
            disabled={updateMutation.isPending}
            className="mt-8 flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all disabled:bg-purple-300"
            >
            <Save className="w-5 h-5" />
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </section>
        </div>

        <aside className="space-y-6">
            <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Assinatura Atual</h3>
                <div className="mb-6">
                  <div className="text-3xl font-black italic tracking-tight">PRO PLAN</div>
                  <p className="text-purple-100 text-xs mt-1 font-medium">Próximo faturamento: 01/03/2026</p>
                </div>
                <button className="w-full bg-white text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-xl active:scale-[0.98]">
                  Gerenciar Plano
                </button>
              </div>
              {/* Efeito Visual de Fundo */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Card de Método de Pagamento */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Pagamento
              </h3>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">•••• 4242</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Expira em 12/27</p>
                  </div>
                  <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
                    <span className="text-[8px] font-black text-blue-800 italic">VISA</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-purple-600 transition-all">
                Atualizar Cartão
              </button>
            </div>

            {/* Dica de Suporte ou Status */}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
              <p className="text-xs text-purple-700 leading-relaxed font-medium">
                Precisando de ajuda com as configurações da sua loja? 
                <a href="#" className="block mt-1 underline hover:text-purple-900 text-[10px] font-black uppercase">
                  Acesse nossa central de ajuda
                </a>
              </p>
            </div>
          </aside>
        </div>
    </div>
  );
}