import { AppCard } from '@/components/ui/AppCard';
import type { CreditoPublico } from '@/types/Credito';
import { Coins, ShoppingCart, User, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import CreditActionsCard from './components/CreditActionsCard';
import PlayerSelect from './components/PlayerSelect';
import PlayerInfoCardContent from './components/PlayerInfoContent';
import { useQuery } from '@tanstack/react-query';
import { getPlayersStoreLink } from '@/services/creditoService';
import { useDebounce } from 'use-debounce';
import StoreProductsCard from './components/StoreProductsCard';
import { usePlayerCart } from './hooks/usePlayerCart';

export default function PlayerCreditsPos() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const { addItem } = usePlayerCart();

  const { data: players = [] } = useQuery<CreditoPublico[]>({
    queryKey: ['creditos-players', debouncedSearch],
    queryFn: () => getPlayersStoreLink({ search: debouncedSearch }),
  });

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId) ?? null,
    [players, selectedPlayerId],
  );
  console.log(selectedPlayer)
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-gray-900">
          Créditos de Jogadores & Vendas
        </h1>
        <p className="text-gray-600">
          Organize os créditos dos seus jogadores e suas vendas
        </p>
      </div>

      {!selectedPlayer && (
        <AppCard title="Selecionar Jogador" icon={<User className="w-5 h-5" />}>
          <PlayerSelect
            value={selectedPlayerId}
            players={players}
            search={search}
            onSearchChange={setSearch}
            onChange={setSelectedPlayerId}
          />
        </AppCard>
      )}

      {selectedPlayer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AppCard
            title="Jogador"
            icon={<User className="w-5 h-5" />}
            action={
              <button
                type="button"
                onClick={() => setSelectedPlayerId(null)}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition"
              >
                <X className="w-3 h-3" />
                Escolher outro jogador
              </button>
            }
          >
            <PlayerInfoCardContent player={selectedPlayer} />
          </AppCard>

          <AppCard
            title="Gerenciar Créditos"
            icon={<Coins className="w-5 h-5" />}
          >
            <CreditActionsCard
              creditId={selectedPlayer.id}
            />
          </AppCard>

          <AppCard title="Em breve" icon={<ShoppingCart className="w-5 h-5" />}>
            <StoreProductsCard
              onAddToCart={addItem}>

            </StoreProductsCard>
          </AppCard>

          <AppCard title="Em breve" icon={<ShoppingCart className="w-5 h-5" />}>
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500">
              Outro card será implementado aqui.
            </div>
          </AppCard>
        </div>
      )}
    </div>
  );
}
