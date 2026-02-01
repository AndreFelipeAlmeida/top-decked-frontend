import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Calendar, Award, Settings } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTournament } from '@/services/lojasTorneiosService';
import Spinner from '../ui/Spinner';

export default function CreateTournament() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nome: '',
    formato: 'Standard',
    data_inicio: '',
    n_rodadas: 5,
    tempo_por_rodada: 50,
    premio: '',
    taxa: 15,
    vagas: 32,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
        return createTournament(formData)},
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tournaments"] });
        navigate('/loja/dashboard');
    },
    onError: (error) => {
        alert(`Erro: ${error}`);
    }
});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  if (isPending) return <Spinner />;

  return (
    <div className="p-8">
    <div className="mb-8">
        <h1 className="text-3xl mb-2 text-gray-900 font-medium">Novo Torneio</h1>
        <p className="text-gray-600">Configure as regras e detalhes do evento</p>
    </div>

    <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
            {/* Informações Básicas */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl text-gray-900 font-semibold">Informações Gerais</h2>
            </div>

            <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Nome do Torneio</label>
                <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    placeholder="Ex: PPTQ Modern"
                    required
                />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Formato</label>
                    <select
                    value={formData.formato}
                    onChange={(e) => handleInputChange('formato', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    >
                    <option value="Standard">Standard</option>
                    <option value="Modern">Modern</option>
                    <option value="Pioneer">Pioneer</option>
                    <option value="Commander">Commander</option>
                    <option value="Pauper">Pauper</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Data</label>
                    <input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    required
                    />
                </div>
                </div>
            </div>
            </section>

            {/* Estrutura */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl text-gray-900 font-semibold">Estrutura de Rodadas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Rodadas</label>
                <input
                    type="number"
                    value={formData.n_rodadas}
                    onChange={(e) => handleInputChange('n_rodadas', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    min={1}
                />
                </div>
                <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tempo (min)</label>
                <input
                    type="number"
                    value={formData.tempo_por_rodada}
                    onChange={(e) => handleInputChange('tempo_por_rodada', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
                </div>
                {/* <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Corte para Top</label>
                <select
                    value={formData.cutToTop}
                    onChange={(e) => handleInputChange('cutToTop', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                >
                    <option value={0}>Sem Corte (Suíço Direto)</option>
                    <option value={4}>Top 4</option>
                    <option value={8}>Top 8</option>
                </select>
                </div> */}
            </div>
            </section>

            {/* Premiação */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
                <Award className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl text-gray-900 font-semibold">Premiação</h2>
            </div>
            <textarea
                value={formData.premio}
                onChange={(e) => handleInputChange('premio', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none min-h-[100px]"
                placeholder="Descreva os prêmios por posição..."
            />
            </section>
        </div>

        {/* Sidebar de Ações */}
        <div className="space-y-6">
            <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Inscrição</h2>
            <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Valor (R$)</label>
                <input
                    type="number"
                    value={formData.taxa}
                    onChange={(e) => handleInputChange('taxa', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    step="0.01"
                />
                </div>
                <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Capacidade Máxima</label>
                <input
                    type="number"
                    value={formData.vagas}
                    onChange={(e) => handleInputChange('vagas', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                />
                </div>
            </div>
            </section>

            <div className="flex flex-col gap-3">
            <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-sm font-medium disabled:bg-purple-400"
            >
                <Save className="w-5 h-5" />
                <span>{isPending ? 'Criando...' : 'Publicar Torneio'}</span>
            </button>
            </div>
        </div>

        </div>
    </form>
    </div>
  );
}