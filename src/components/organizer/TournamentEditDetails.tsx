import { ArrowLeft, Users, Trophy, Edit, Save, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTorneioById, atualizarTorneio, importarResultadosTorneio } from '@/services/lojasTorneiosService';
import Spinner from '@/components/ui/Spinner';

export default function TournamentEditDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    data_inicio: '',
    hora: '',
    formato: '',
    vagas: 0,
    taxa: 0,
    premio: '',
    descricao: '',
  });

  const { data: torneio, isLoading } = useQuery({
    queryKey: ['torneio', id],
    queryFn: () => getTorneioById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (torneio) {
      setFormData({
        nome: torneio.nome || '',
        data_inicio: torneio.data_inicio || '',
        hora: torneio.hora || '',
        formato: torneio.formato || '',
        vagas: torneio.vagas || 0,
        taxa: torneio.taxa || 0,
        premio: torneio.premio || '',
        descricao: torneio.descricao || '',
      });
    }
  }, [torneio]);

  const updateMutation = useMutation({
    mutationFn: (dados: any) => atualizarTorneio(id!, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['torneio', id] });
      setIsEditing(false);
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => importarResultadosTorneio(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['torneio', id] });
      setShowImportModal(false);
      alert("Resultados importados com sucesso!");
    },
  });

  if (isLoading) return <Spinner />;

  return (
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <Link to="/loja/torneios" className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para Torneios</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl mb-2 text-gray-900">Detalhes do Torneio</h1>
              <p className="text-gray-600">Gerencie as informações e jogadores inscritos</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Editar Torneio</span>
                </button>
              ) : (
                <button onClick={() => updateMutation.mutate(formData)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              )}
              <button onClick={() => setShowImportModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Importar XML</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h2 className="text-xl mb-4 text-gray-900 font-bold">Informações Gerais</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Nome do Torneio</label>
                  {isEditing ? (
                    <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none" />
                  ) : <p className="text-gray-900 font-medium">{formData.nome}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Data</label>
                    {isEditing ? (
                      <input type="date" value={formData.data_inicio} onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
                    ) : <p className="text-gray-900">{new Date(formData.data_inicio).toLocaleDateString('pt-BR')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Horário</label>
                    {isEditing ? (
                      <input type="time" value={formData.hora} onChange={(e) => setFormData({ ...formData, hora: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
                    ) : <p className="text-gray-900">{formData.hora || '--:--'}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Formato</label>
                    {isEditing ? (
                      <select value={formData.formato} onChange={(e) => setFormData({ ...formData, formato: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none">
                        <option value="Standard">Standard</option>
                        <option value="Modern">Modern</option>
                        <option value="Commander">Commander</option>
                        <option value="Pauper">Pauper</option>
                      </select>
                    ) : <p className="text-gray-900">{formData.formato}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Vagas Máximas</label>
                    {isEditing ? (
                      <input type="number" value={formData.vagas} onChange={(e) => setFormData({ ...formData, vagas: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
                    ) : <p className="text-gray-900">{formData.vagas} jogadores</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Taxa de Inscrição</label>
                    {isEditing ? (
                      <input type="number" value={formData.taxa} onChange={(e) => setFormData({ ...formData, taxa: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
                    ) : <p className="text-gray-900">R$ {formData.taxa.toFixed(2)}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Premiação</label>
                    {isEditing ? (
                      <input type="text" value={formData.premio} onChange={(e) => setFormData({ ...formData, premio: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
                    ) : <p className="text-gray-900">{formData.premio || 'Não informada'}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Descrição</label>
                  {isEditing ? (
                    <textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
                  ) : <p className="text-gray-900 text-sm">{formData.descricao || 'Sem descrição.'}</p>}
                </div>
              </div>
            </div>

            {/* Jogadores Inscritos */}
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl text-gray-900 font-bold">Jogadores Inscritos</h2>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {torneio?.jogadores?.length || 0} / {formData.vagas}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Jogador</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pokémon ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pontos</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {torneio?.jogadores?.map((link) => (
                      <tr key={link.jogador_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{link.nome || link.jogador_id}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{link.jogador_id}</td>
                        <td className="px-4 py-3 text-sm font-bold text-purple-600">{link.pontuacao}</td>
                        <td className="px-4 py-3">
                          <button className="text-red-600 hover:text-red-700 text-xs font-bold">Remover</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h3 className="text-lg mb-4 text-gray-900 font-bold">Estatísticas Rápidas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold">{torneio?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Receita Total</span>
                  <span className="text-gray-900 font-bold">R$ {((torneio?.jogadores?.length || 0) * formData.taxa).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link to={`/loja/torneio/${id}/console`} className="block bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow p-6 text-white hover:opacity-90 transition-opacity">
              <div className="flex items-center space-x-3 mb-2">
                <Trophy className="w-6 h-6" />
                <h3 className="text-lg font-bold">Console do Torneio</h3>
              </div>
              <p className="text-purple-100 text-sm">Gerenciar rodadas, emparceiramentos e resultados em tempo real.</p>
            </Link>
          </div>
        </div>

        {/* Modal de Importação */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl text-gray-900 font-bold mb-4">Importar Resultados (XML)</h3>
              <p className="text-sm text-gray-600 mb-6">Selecione o arquivo XML exportado do software de torneios para atualizar os dados automaticamente.</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <input type="file" accept=".xml" className="hidden" id="xml-upload" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                <label htmlFor="xml-upload" className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors text-sm font-bold inline-block">
                  {selectedFile ? selectedFile.name : 'Selecionar Arquivo'}
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-gray-700 font-bold">Cancelar</button>
                <button 
                  onClick={() => selectedFile && importMutation.mutate(selectedFile)}
                  disabled={!selectedFile || importMutation.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 font-bold"
                >
                  {importMutation.isPending ? 'Importando...' : 'Confirmar Importação'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}