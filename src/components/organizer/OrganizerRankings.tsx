import { useState } from 'react';
import { Download, Trophy, Award, Medal, Star, Crown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getRankingMinhaLoja } from '@/services/rankingService';
import Spinner from '@/components/ui/Spinner';

type PeriodoTempo = 'semanal' | 'mensal' | 'anual' | 'personalizado';

const DistintivoRank = ({ rank }: { rank: number }) => {
  const baseClass = "flex items-center justify-center w-6 h-6 rounded-full shadow-md text-white";
  if (rank === 1) return <div className={`${baseClass} bg-gradient-to-br from-yellow-400 to-yellow-600`}><Crown className="w-3.5 h-3.5" /></div>;
  if (rank === 2) return <div className={`${baseClass} bg-gradient-to-br from-gray-300 to-gray-500`}><Medal className="w-3.5 h-3.5" /></div>;
  if (rank === 3) return <div className={`${baseClass} bg-gradient-to-br from-amber-600 to-amber-800`}><Award className="w-3.5 h-3.5" /></div>;
  if (rank <= 8) return <div className={`${baseClass} bg-gradient-to-br from-purple-400 to-purple-600`}><Star className="w-3 h-3" /></div>;
  return null;
};

export default function OrganizerRankings() {
  const [periodo, setPeriodo] = useState<PeriodoTempo>('mensal');
  const [, setShowDatePicker] = useState(false);

  // Integração com o Backend
  const { data: rankingData, isLoading } = useQuery({
    queryKey: ['ranking-loja', periodo],
    queryFn: () => getRankingMinhaLoja(periodo === 'mensal' ? new Date().getMonth() + 1 : undefined),
  });

  const handleExportarCSV = () => {
    if (!rankingData) return;
    const cabecalhos = ['Posicao', 'Jogador', 'Pontos', 'Torneios', 'Vitorias', 'Derrotas', 'Empates', 'Taxa de Vitoria'];
    const conteudo = [
      cabecalhos.join(','),
      ...rankingData.map((r, i) => 
        [i + 1, `"${r.nome_jogador}"`, r.pontos, r.torneios, r.vitorias, r.derrotas, r.empates, `${r.taxa_vitoria}%`].join(',')
      )
    ].join('\n');

    const blob = new Blob([conteudo], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranking-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) return <Spinner />;

  return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl mb-2 text-gray-900">Rankings e Classificações</h1>
              <p className="text-gray-600">Acompanhe o desempenho dos jogadores da sua loja</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleExportarCSV} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Download className="w-4 h-4" /> Exportar CSV
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg shadow p-1 w-fit">
            {(['semanal', 'mensal', 'anual', 'personalizado'] as PeriodoTempo[]).map((p) => (
              <button
                key={p}
                onClick={() => { setPeriodo(p); setShowDatePicker(p === 'personalizado'); }}
                className={`px-4 py-2 rounded-md transition-colors capitalize ${periodo === p ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Destaques Top 8 */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl text-gray-900">Top 8 Jogadores</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rankingData?.slice(0, 8).map((player, index) => (
              <div key={player.nome_jogador} className="bg-white rounded-lg p-4 shadow-md border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <DistintivoRank rank={index + 1} />
                  <div className="text-2xl text-purple-600">#{index + 1}</div>
                </div>
                <div className="text-sm font-bold text-gray-900 mb-2 truncate">{player.nome_jogador}</div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Pontos:</span>
                  <span className="font-bold text-purple-600">{player.pontos}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Vitórias:</span>
                  <span className="font-bold text-green-600">{player.vitorias}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela Completa */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase">Jogador</th>
                <th className="px-6 py-3 text-center font-bold text-gray-500 uppercase">Pontos</th>
                <th className="px-6 py-3 text-center font-bold text-gray-500 uppercase">Torneios</th>
                <th className="px-6 py-3 text-center font-bold text-gray-500 uppercase">V/D/E</th>
                <th className="px-6 py-3 text-center font-bold text-gray-500 uppercase">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rankingData?.map((player, index) => (
                <tr key={player.nome_jogador} className={`hover:bg-gray-50 ${index < 8 ? 'bg-purple-50/30' : ''}`}>
                  <td className="px-6 py-4 flex items-center gap-3">
                    {index < 8 && <DistintivoRank rank={index + 1} />}
                    <span className={index < 3 ? 'font-bold text-purple-600' : ''}>#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{player.nome_jogador}</td>
                  <td className="px-6 py-4 text-center text-purple-600 font-bold">{player.pontos}</td>
                  <td className="px-6 py-4 text-center">{player.torneios}</td>
                  <td className="px-6 py-4 text-center text-xs text-gray-500">
                    {player.vitorias}V - {player.derrotas}D - {player.empates}E
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                      {player.taxa_vitoria}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}