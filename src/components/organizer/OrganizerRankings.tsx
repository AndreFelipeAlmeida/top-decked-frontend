import { useState } from 'react';
import { Download, Trophy, TrendingUp, Calendar, Image as ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getRankingGeral, getRankingPorLoja } from '@/services/rankingService';
import type { Ranking } from '@/types/Rankings';
import { RankBadge } from '@/components/RankBadge';
import Spinner from '@/components/ui/Spinner';

type TimePeriod = 'geral' | number;

export default function OrganizerRankings() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('geral');

  const { data: rankings = [], isLoading } = useQuery<Ranking[]>({
      queryKey: ["rankings", timePeriod],
      queryFn: () => timePeriod === 'geral' 
        ? getRankingGeral() 
        : getRankingPorLoja(timePeriod as number),
      retry: false
    });

  const handleExportCSV = () => {
    if (rankings.length === 0) return;

    const headers = ['Rank', 'Jogador', 'Pontos', 'Vitórias', 'Derrotas', 'Empates', 'Win Rate %', 'Torneios'];
    const csvContent = [
      headers.join(','),
      ...rankings.map((r: Ranking, i: number) => 
        [i + 1, `"${r.nome}"`, r.pontos, r.vitorias, r.derrotas, r.empates, `${r.win_rate}%`, r.torneios_jogados].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rankings-topdecked-${timePeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading && rankings.length === 0) return <Spinner />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl mb-2 text-gray-900">Rankings & Leaderboard</h1>
            <p className="text-gray-600">
              Acompanhe a performance dos jogadores na rede <span className="font-semibold text-purple-600">TopDecked</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm">
              <ImageIcon className="w-4 h-4" />
              <span>Exportar Imagem</span>
            </button>
          </div>
        </div>

        {/* Filtros de Período */}
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1 w-fit">
          <button
            onClick={() => setTimePeriod('geral')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              timePeriod === 'geral' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Geral
          </button>
          {[1, 2, 3, 4, 5, 6].map((mes: number) => (
            <button
              key={mes}
              onClick={() => setTimePeriod(mes)}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                timePeriod === mes ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Mês {mes}
            </button>
          ))}
          <button className="px-4 py-2 rounded-md text-sm text-gray-400 cursor-not-allowed flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Custom
          </button>
        </div>
      </div>

      {/* Top 8 Destaques */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-100">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Destaques Top 8</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rankings.slice(0, 8).map((player: Ranking, index: number) => (
            <div
              key={player.jogador_id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-purple-100"
            >
              <div className="flex items-center justify-between mb-3">
                <RankBadge rank={index + 1} />
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  #{index + 1}
                </span>
              </div>
              <div className="text-sm font-bold text-gray-900 mb-3 truncate">
                {player.nome}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Pontos</span>
                  <span className="font-bold text-purple-600">{player.pontos}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Win Rate</span>
                  <span className="font-bold text-green-600">{player.win_rate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de Ranking Completa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Jogador</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Pontos</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Torneios</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Recorde (V-D-E)</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rankings.map((player: Ranking, index: number) => (
                <tr
                  key={player.jogador_id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index < 8 ? 'bg-purple-50/30' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <RankBadge rank={index + 1} />
                      <span className={`text-sm font-medium ${index < 3 ? 'text-purple-600 font-bold' : 'text-gray-900'}`}>
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{player.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-bold text-purple-600">{player.pontos}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {player.torneios_jogados}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-xs font-medium text-gray-500">
                      {player.vitorias}V - {player.derrotas}L - {player.empates}E
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      player.win_rate >= 75 ? 'bg-green-100 text-green-700' : 
                      player.win_rate >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {player.win_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}