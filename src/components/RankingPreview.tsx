interface TournamentResult {
  id: string;
  userId: string;
  userName: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  currentStanding: number;
}

interface RankingPreviewProps {
  tournamentResults: TournamentResult[];
}

export default function RankingPreview({ tournamentResults }: RankingPreviewProps) {
  return (
    <div className="w-full max-w-sm mx-auto bg-[#FAD3EA] border rounded-md shadow-sm overflow-hidden text-[#ED50AB] text-[12px]">
    {/* Cabeçalho */}
        <div className="grid grid-cols-4 bg-[#ED50AB] bg-opacity-90 px-2 py-1 border-b border-[#ED50AB] text-white font-montserrat font-semibold text-[12px]">
            <span>#</span>
            <span>Nome</span>
            <span>Desempenho</span>
            <span>Pontos</span>
        </div>

    {/* Linhas */}
        <div>
            {tournamentResults.map((player, index) => (
            <div
                key={player.id}
                className="grid grid-cols-4 px-2 py-1 border-b border-dashed border-[#ED50AB]"
            >
                <span className="font-semibold">{player.currentStanding}</span>

                {/* Nome compacto */}
                <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[70px]">
                {player.userName}
                </span>

                <span className="font-mono text-[10px]">
                {player.wins}/{player.losses}/{player.draws}
                </span>

                <span className="font-semibold">{player.points}</span>
            </div>
            ))}
        </div>
    </div>
  );
}