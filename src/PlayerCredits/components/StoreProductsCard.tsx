import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { type CartItem } from '../hooks/usePlayerCart';
import { useStoreProducts } from '../hooks/useStoreProducts';

type Props = {
  onAddToCart: (item: CartItem) => void;
  cartItems: CartItem[];
};

export default function StoreProductsCard({ onAddToCart, cartItems }: Props) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const { data: products = [], isLoading } = useStoreProducts(debouncedSearch);

  const quantidadeNoCarrinho = (itemId: number) =>
    cartItems.find((item) => item.id === itemId)?.quantidade ?? 0;

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar item..."
          className="w-full rounded-md border border-border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Lista */}
      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <div className="rounded-md border border-border p-6 text-center text-sm text-muted-foreground">
            Carregando produtos...
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum item encontrado.
          </div>
        )}

        {products.map((product) => {
          const disponivel = product.quantidade - quantidadeNoCarrinho(product.id);
          const outOfStock = disponivel < 1;

          return (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {product.nome}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>R$ {product.preco.toFixed(2)}</span>
                  <span>•</span>

                  <span
                    className={outOfStock ? 'text-destructive' : 'text-muted-foreground'}
                  >
                    {outOfStock
                      ? 'Sem estoque'
                      : `${disponivel} disponível${disponivel > 1 ? 'eis' : ''}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() =>
                  onAddToCart({
                    id: product.id,
                    nome: product.nome,
                    categoria: product.categoria,
                    preco: product.preco,
                    quantidade: 1,
                  })
                }
                className="ml-3 inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
