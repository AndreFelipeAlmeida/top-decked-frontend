import { Plus, Edit, Trash2, Save, X, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTiposJogador, criarTipoJogador, atualizarTipoJogador, deletarTipoJogador } from '@/services/tipoJogadorService';
import Spinner from '@/components/ui/Spinner';

export default function PlayerRules() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    pt_vitoria: 2,
    pt_derrota: 0,
    pt_empate: 1,
    pt_oponente_perde: 0,
    pt_oponente_ganha: 0,
    pt_oponente_empate: 0,
    tcg: 'Pokemon'
  });

  const { data: ruleSets, isLoading } = useQuery({
    queryKey: ['tipos-jogador'],
    queryFn: getTiposJogador
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editingId 
      ? atualizarTipoJogador(editingId, data) 
      : criarTipoJogador(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-jogador'] });
      handleCancel();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletarTipoJogador,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tipos-jogador'] })
  });

  const handleEdit = (rule: any) => {
    setFormData({
      nome: rule.nome,
      pt_vitoria: rule.pt_vitoria,
      pt_derrota: rule.pt_derrota,
      pt_empate: rule.pt_empate,
      pt_oponente_perde: rule.pt_oponente_perde || 0,
      pt_oponente_ganha: rule.pt_oponente_ganha || 0,
      pt_oponente_empate: rule.pt_oponente_empate || 0,
      tcg: rule.tcg
    });
    setEditingId(rule.id);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ nome: '', pt_vitoria: 3, pt_derrota: 0, pt_empate: 1, pt_oponente_perde: 0, pt_oponente_ganha: 0, pt_oponente_empate: 0, tcg: 'Magic' });
  };

  if (isLoading) return <Spinner />;

  return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 text-gray-900">Regras de Jogador e Pontuação</h1>
            <p className="text-gray-600">Defina sistemas de pontuação personalizados para seus torneios</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Conjunto de Regras</span>
          </button>
        </div>

        {(isCreating || editingId) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-purple-600">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-900 font-bold">
                {isCreating ? 'Novo Conjunto de Regras' : 'Editar Regras'}
              </h2>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Nome do Conjunto de Regras</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                  placeholder="Ex: Liga Commander, Evento Mensal"
                />
              </div>

              <div>
                <h3 className="text-lg mb-3 text-gray-900 font-bold">Valores de Pontuação</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Vitória</label>
                    <input
                      type="number"
                      value={formData.pt_vitoria}
                      onChange={(e) => setFormData({ ...formData, pt_vitoria: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Derrota</label>
                    <input
                      type="number"
                      value={formData.pt_derrota}
                      onChange={(e) => setFormData({ ...formData, pt_derrota: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Empate</label>
                    <input
                      type="number"
                      value={formData.pt_empate}
                      onChange={(e) => setFormData({ ...formData, pt_empate: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg mb-3 text-gray-900 font-bold">Bônus de Oponente (Especial)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Oponente Ganha</label>
                    <input
                      type="number"
                      value={formData.pt_oponente_ganha}
                      onChange={(e) => setFormData({ ...formData, pt_oponente_ganha: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Oponente Perde</label>
                    <input
                      type="number"
                      value={formData.pt_oponente_perde}
                      onChange={(e) => setFormData({ ...formData, pt_oponente_perde: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Oponente Empata</label>
                    <input
                      type="number"
                      value={formData.pt_oponente_empate}
                      onChange={(e) => setFormData({ ...formData, pt_oponente_empate: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={saveMutation.isPending}
                  className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveMutation.isPending ? 'Salvando...' : 'Salvar Conjunto de Regras'}</span>
                </button>
                <button onClick={handleCancel} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ruleSets?.map((ruleSet) => (
            <div key={ruleSet.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl text-gray-900 font-bold">{ruleSet.nome}</h3>
                  <p className="text-xs text-purple-600 font-semibold">{ruleSet.tcg}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleEdit(ruleSet)} className="text-purple-600 hover:text-purple-700">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => confirm('Excluir esta regra?') && deleteMutation.mutate(ruleSet.id)} 
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl text-green-600 font-bold">{ruleSet.pt_vitoria}</div>
                  <div className="text-xs text-gray-600">Vitória</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl text-gray-600 font-bold">{ruleSet.pt_empate}</div>
                  <div className="text-xs text-gray-600">Empate</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl text-red-600 font-bold">{ruleSet.pt_derrota}</div>
                  <div className="text-xs text-gray-600">Derrota</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}