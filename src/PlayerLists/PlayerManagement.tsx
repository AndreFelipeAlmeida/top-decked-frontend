import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePlayers } from '@/hooks/players.hooks';
import { useTcgs } from '@/hooks/tcg.hooks';
import PlayersTable from './components/PlayersTable';
import { useDebounce } from 'use-debounce';
import { AppCard } from '@/components/ui/app-card';
import { User } from 'lucide-react';
import type { PaginatedJogadorPublico } from '@/types/Player';
import LinkPlayerToStoreModal from './components/LinkPlayerModal';
import UnlinkPlayerToStoreModal from './components/UnlinkPlayerModal';
import PromoteOrganizerModal from './components/PromoteOrganizerModal';

export default function PlayerManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);
  const [selectedPlayer, setSelectedPlayer] =
    useState<PaginatedJogadorPublico | null>(null);
  const [isLinkPlayerOpen, setIsLinkPlayerOpen] = useState(false);
  const [isUnlinkPlayerOpen, setIsUnlinkPlayerOpen] = useState(false);
  const [organizerAction, setOrganizerAction] = useState<{
    player: PaginatedJogadorPublico;
    tcg: string;
    action: 'promover' | 'despromover';
  } | null>(null);

  const { isLoading, data } = usePlayers(page, debouncedSearch);

  const { isLoading: isTCGLoading, data: tcgs = [] } = useTcgs();

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

  const handlePromoteOrganizer = (player: PaginatedJogadorPublico, tcg: string) => {
    setOrganizerAction({ player, tcg, action: 'promover' });
  };

  const handleDemoteOrganizer = (player: PaginatedJogadorPublico, tcg: string) => {
    setOrganizerAction({ player, tcg, action: 'despromover' });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-foreground">Gerenciar Jogadores</h1>
        <p className="text-muted-foreground">
          Visualize todos os jogadores cadastrados na plataforma e vincule-os à
          sua loja para registrar créditos.
        </p>
      </div>
      <div className="space-y-10">
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
            onPromoteOrganizer={handlePromoteOrganizer}
            onDemoteOrganizer={handleDemoteOrganizer}
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
          <PromoteOrganizerModal
            open={organizerAction !== null}
            onClose={() => setOrganizerAction(null)}
            player={organizerAction?.player ?? null}
            tcg={organizerAction?.tcg ?? null}
            action={organizerAction?.action ?? null}
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

            <span className="text-sm text-muted-foreground">
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
