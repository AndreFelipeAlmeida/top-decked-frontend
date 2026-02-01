import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Calendar, Users, Swords, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getTournaments } from '@/services/lojasTorneiosService';
import Spinner from '../ui/Spinner';
import type { Tournament, StatusTorneio } from '@/types/Tournaments';

export default function OrganizerTournaments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusTorneio | ''>('');
  const [formatFilter, setFormatFilter] = useState('');

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: getTournaments,
    retry: false
  });

  const getStatusStyles = (status: StatusTorneio) => {
    switch (status) {
      case 'ABERTO': 
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EM_ANDAMENTO': 
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FINALIZADO': 
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || t.status === statusFilter;
    const matchesFormat = formatFilter === '' || t.formato.toLowerCase() === formatFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesFormat;
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-gray-900 font-medium">Torneios</h1>
          <p className="text-gray-600">Gerencie seus eventos e acompanhe as inscrições</p>
        </div>
        <Link 
          to="/organizer/create-tournament"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center space-x-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Novo Torneio</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusTorneio | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none bg-white"
          >
            <option value="">Todos os Status</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="FINALIZADO">Finalizado</option>
          </select>
          <select 
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none bg-white"
          >
            <option value="">Todos os Formatos</option>
            <option value="Standard">Standard</option>
            <option value="Modern">Modern</option>
            <option value="Pioneer">Pioneer</option>
            <option value="Commander">Commander</option>
            <option value="Pauper">Pauper</option>
          </select>
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament) => (
          <div 
            key={tournament.id} 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-full overflow-hidden group"
          >
            {/* Top Card Decorator */}
            <div className={`h-1.5 w-full ${
              tournament.status === 'ABERTO' ? 'bg-green-500' :
              tournament.status === 'EM_ANDAMENTO' ? 'bg-purple-500' : 'bg-blue-500'
            }`} />

            <div className="p-5 flex-grow">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2 py-1 text-[10px] font-bold rounded border ${getStatusStyles(tournament.status)}`}>
                  {tournament.status}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(tournament.data_inicio).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                {tournament.nome}
              </h3>
              
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                <MapPin className="w-3 h-3" />
                <span>{tournament.cidade}, {tournament.estado}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-gray-50 pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Formato</p>
                  <p className="text-sm font-semibold text-gray-700">{tournament.formato}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Jogadores</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <Users className="w-4 h-4 text-purple-400" />
                    {tournament.jogadores?.length || 0} / {tournament.vagas}
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Progresso</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <Swords className="w-4 h-4 text-purple-400" />
                    {tournament.status === 'ABERTO' 
                      ? `${tournament.n_rodadas} Rodadas previstas`
                      : `Rodada ${tournament.rodada_atual} de ${tournament.n_rodadas}`}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 pt-0">
              <Link 
                key={tournament.id}
                to={`/loja/editar-torneio/${tournament.id}`}
                className={`block w-full text-center py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
                  tournament.status === 'FINALIZADO' 
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                    : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.98]'
                }`}
              >
                {tournament.status === 'FINALIZADO' ? 'Ver Resultados' : 
                 tournament.status === 'EM_ANDAMENTO' ? 'Console de Gerenciamento' : 'Gerenciar Evento'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
}