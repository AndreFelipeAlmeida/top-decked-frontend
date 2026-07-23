import { AppCard } from '@/components/ui/app-card';
import { Coins, Receipt, ShoppingCart, User, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import CreditActionsCard from './components/CreditActionsCard';
import PlayerSelect from './components/PlayerSelect';
import PlayerInfoCardContent from './components/PlayerInfoContent';
import { useStorePlayerLinks } from '@/hooks/credits.hooks';
import { useDebounce } from 'use-debounce';
import StoreProductsCard from './components/StoreProductsCard';
import CheckoutCard from './components/CheckoutCard';
import { usePlayerCart } from './hooks/usePlayerCart';

export default function PlayerCreditsPos() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const cart = usePlayerCart();

  const { data: players = [] } = useStorePlayerLinks(debouncedSearch);

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId) ?? null,
    [players, selectedPlayerId],
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-foreground">
          Créditos de Jogadores & Vendas
        </h1>
        <p className="text-muted-foreground">
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
                onClick={() => {
                  setSelectedPlayerId(null);
                  cart.clearCart();
                }}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/15 transition"
              >
                <X className="w-3 h-3" />
                Trocar Jogador
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

          <AppCard title="Vitrine de Produtos" icon={<ShoppingCart className="w-5 h-5" />}>
            <StoreProductsCard
              onAddToCart={cart.addItem}
              cartItems={cart.items}
            />
          </AppCard>

          <AppCard title="Caixa" icon={<Receipt className="w-5 h-5" />}>
            <CheckoutCard
              player={selectedPlayer}
              items={cart.items}
              total={cart.total}
              removeItem={cart.removeItem}
              clearCart={cart.clearCart}
            />
          </AppCard>
        </div>
      )}
    </div>
  );
}
