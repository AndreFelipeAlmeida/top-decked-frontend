import { Save, Calendar, Users, Award, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getTiposJogador } from '@/services/tipoJogadorService';
import { criarTorneio } from '@/services/lojasTorneiosService';
import Spinner from '@/components/ui/Spinner';

export default function CreateTournament() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    formato: 'Standard',
    data_inicio: '',
    hora: '',
    n_rodadas: 5,
    vagas: 32,
    taxa: 0,
    premio: '',
    descricao: '',
    regra_basica_id: undefined as number | undefined,
    tempo_por_rodada: 30,
    cidade: '',
    estado: ''
  });

  const { data: regras, isLoading: isLoadingRegras } = useQuery({
    queryKey: ['tipos-jogador'],
    queryFn: getTiposJogador
  });

  const mutation = useMutation({
    mutationFn: criarTorneio,
    onSuccess: (novoTorneio) => {
      alert("Torneio criado com sucesso!");
      navigate(`/loja/torneio/${novoTorneio.id}/configurar`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "Erro ao criar torneio");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validação básica conforme models.py
    if (!formData.nome || !formData.data_inicio) return;
    mutation.mutate(formData as any);
  };

  if (isLoadingRegras) return <Spinner />;

  return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900 font-bold">Criar Novo Torneio</h1>
          <p className="text-gray-600">Configure os detalhes e as regras da sua competição</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl text-gray-900 font-bold">Informações Básicas</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">Nome do Torneio</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    placeholder="Ex: Campeonato Modern Semanal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Formato</label>
                    <select
                      value={formData.formato}
                      onChange={(e) => setFormData({ ...formData, formato: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Modern">Modern</option>
                      <option value="Commander">Commander</option>
                      <option value="Pauper">Pauper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Vagas</label>
                    <input
                      type="number"
                      value={formData.vagas}
                      onChange={(e) => setFormData({ ...formData, vagas: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Cidade</label>
                    <input
                      type="text"
                      required
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Estado (UF)</label>
                    <input
                      type="text"
                      maxLength={2}
                      required
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                      placeholder="Ex: SP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Agendamento e Estrutura */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl text-gray-900 font-bold">Agendamento</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">Data de Início</label>
                  <input
                    type="date"
                    required
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">Horário</label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">Número de Rodadas</label>
                  <input
                    type="number"
                    value={formData.n_rodadas}
                    onChange={(e) => setFormData({ ...formData, n_rodadas: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">Tempo por Rodada (min)</label>
                  <input
                    type="number"
                    value={formData.tempo_por_rodada}
                    onChange={(e) => setFormData({ ...formData, tempo_por_rodada: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Regras e Pontuação */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg text-gray-900 font-bold">Regras de Pontuação</h2>
              </div>
              <select
                required
                value={formData.regra_basica_id}
                onChange={(e) => setFormData({ ...formData, regra_basica_id: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none mb-4"
              >
                <option value="">Selecione um conjunto de regras</option>
                {regras?.map((regra) => (
                  <option key={regra.id} value={regra.id}>{regra.nome}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Estas regras definem quantos pontos um jogador ganha por vitória, empate ou derrota.
              </p>
            </div>

            {/* Inscrição e Prêmios */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg text-gray-900 font-bold">Inscrição e Prêmios</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700 font-medium">Taxa de Inscrição (R$)</label>
                  <input
                    type="number"
                    value={formData.taxa}
                    onChange={(e) => setFormData({ ...formData, taxa: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 font-medium">Premiação</label>
                  <textarea
                    value={formData.premio}
                    onChange={(e) => setFormData({ ...formData, premio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    rows={3}
                    placeholder="Descreva a premiação do torneio..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center space-x-2 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:bg-purple-300"
            >
              <Save className="w-5 h-5" />
              <span>{mutation.isPending ? 'Criando...' : 'Criar Torneio'}</span>
            </button>
          </div>
        </form>
      </div>
  );
}