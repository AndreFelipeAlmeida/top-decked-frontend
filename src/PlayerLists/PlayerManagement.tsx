import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import RegisterPlayerForm from './components/RegisterPlayerForm';
import { Button } from '@/components/ui/button';
import { obterJogadores } from '@/services/jogadoresService';
import { obterTcgs } from '@/services/tcgService';
import PlayersTable from './components/PlayersTable';
import { useDebounce } from 'use-debounce';
import { AppCard } from '@/components/ui/AppCard';
import { User, UserPlus } from 'lucide-react';
import type { PaginatedJogadorPublico } from '@/types/Player';
import LinkPlayerToStoreModal from './components/LinkPlayerModal';
import UnlinkPlayerToStoreModal from './components/UnlinkPlayerModal';

export default function PlayerManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);
  const [selectedPlayer, setSelectedPlayer] =
    useState<PaginatedJogadorPublico | null>(null);
  const [isLinkPlayerOpen, setIsLinkPlayerOpen] = useState(false);
  const [isUnlinkPlayerOpen, setIsUnlinkPlayerOpen] = useState(false);

  const { isLoading, data } = useQuery({
    queryKey: ['players', page, debouncedSearch],
    queryFn: () =>
      obterJogadores({
        page,
        search: debouncedSearch,
      }),
  });

  const { isLoading: isTCGLoading, data: tcgs = [] } = useQuery({
    queryKey: ['tcgs'],
    queryFn: obterTcgs,
    staleTime: Infinity,
  });

  const players = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleLinkPlayer = (player: PaginatedJogadorPublico) => {
    setSelectedPlayer(player);
    setIsLinkPlayerOpen(true);
  };

  const handleUnlinkPlayer = (player: PaginatedJogadorPublico) => {
    setSelectedPlayer(player);
    setIsUnlinkPlayerOpen(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-gray-900">Gerenciar Jogadores</h1>
        <p className="text-gray-600">
          Visualize todos os jogadores cadastrados na plataforma ou cadastre
          novos para vinculá-los à sua loja e registrar créditos posteriormente.
        </p>
      </div>
      <div className="space-y-10">
        <AppCard
          title="Registrar novo jogador"
          icon={<UserPlus className="w-5 h-5" />}
        >
          <RegisterPlayerForm tcgs={tcgs} />
        </AppCard>

        {/* Tabela */}
        <AppCard
          icon={<User className="w-5 h-5" />}
          title="Encontrar Jogadores Existentes"
        >
          <input
            type="text"
            placeholder="Buscar por nome ou ID..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="mb-4 px-3 py-2 border rounded w-full"
          />
          <PlayersTable
            players={players}
            tcgs={tcgs}
            page={page}
            isLoading={isLoading || isTCGLoading}
            onLinkPlayer={handleLinkPlayer}
            onUnlinkPlayer={handleUnlinkPlayer}
          />
          <LinkPlayerToStoreModal
            open={isLinkPlayerOpen}
            onClose={() => setIsLinkPlayerOpen(false)}
            player={selectedPlayer}
          />
          <UnlinkPlayerToStoreModal
            open={isUnlinkPlayerOpen}
            onClose={() => setIsUnlinkPlayerOpen(false)}
            player={selectedPlayer}
          />
          {/* Paginação */}
          <div className="flex items-center justify-between p-4">
            <Button
              variant="outline"
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>

            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => setPage((old) => Math.min(old + 1, totalPages))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
