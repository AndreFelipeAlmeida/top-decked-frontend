import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTournaments } from '@/services/lojasTorneiosService';
import Spinner from '@/components/ui/Spinner';
import { StatusTorneio } from '@/types/Enums';

export default function OrganizerTournaments() {
  const { data: torneios, isLoading } = useQuery({
    queryKey: ['torneios-loja'],
    queryFn: getTournaments,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case StatusTorneio.ABERTO: return 'bg-green-100 text-green-800 border-green-300';
      case StatusTorneio.EM_ANDAMENTO: return 'bg-purple-100 text-purple-800 border-purple-300';
      case StatusTorneio.FINALIZADO: return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) return <Spinner />;

  return (
      <div className="p-8">
        {/* Cabeçalho */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 text-gray-900">Torneios</h1>
            <p className="text-gray-600">Gerencie seus eventos e competições</p>
          </div>
          <Link 
            to="/loja/criar-torneio"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Torneio</span>
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option value="">Todos os Status</option>
              <option value="ABERTO">Aberto</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option value="">Todos os Formatos</option>
              <option value="Standard">Standard</option>
              <option value="Modern">Modern</option>
              <option value="Commander">Commander</option>
            </select>
          </div>
        </div>

        {/* Listagem de Torneios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {torneios?.map((torneio) => (
            <div 
              key={torneio.id} 
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-200"
            >
              <div className={`rounded-t-lg p-4 ${
                torneio.status === 'ABERTO' ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                torneio.status === 'EM_ANDAMENTO' ? 'bg-gradient-to-r from-purple-50 to-pink-50' :
                'bg-gradient-to-r from-blue-50 to-cyan-50'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{torneio.nome}</h3>
                  <span className={`px-2 py-1 text-xs rounded border font-medium ${getStatusColor(torneio.status)}`}>
                    {torneio.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(torneio.data_inicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Formato:</span>
                    <p className="text-gray-900 font-medium">{torneio.formato}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Jogadores:</span>
                    <p className="text-gray-900 font-medium">{torneio.jogadores?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rodadas:</span>
                    <p className="text-gray-900 font-medium">
                      {torneio.rodada_atual > 0 ? `${torneio.rodada_atual} de ${torneio.n_rodadas}` : torneio.n_rodadas}
                    </p>
                  </div>
                </div>
                
                <Link 
                  to={torneio.status === StatusTorneio.FINALIZADO 
                    ? `/loja/torneio/${torneio.id}/resultados`
                    : torneio.status === StatusTorneio.EM_ANDAMENTO
                    ? `/loja/torneio/${torneio.id}/console`
                    : `/loja/torneio/${torneio.id}/configurar`
                  }
                  className={`block w-full text-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    torneio.status === StatusTorneio.FINALIZADO 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {torneio.status === StatusTorneio.FINALIZADO ? 'Ver Resultados' : 
                   torneio.status === StatusTorneio.EM_ANDAMENTO ? 'Console do Torneio' : 'Gerenciar'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}