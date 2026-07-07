import { Package, Plus, Search, Utensils } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { type CartItem } from '../hooks/usePlayerCart';
import { useStoreProducts } from '../hooks/useStoreProducts';

type Category = 'todos' | 'produtos' | 'cantina';

type Props = {
  onAddToCart: (item: CartItem) => void;
};

export default function StoreProductsCard({ onAddToCart }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('todos');

  const [debouncedSearch] = useDebounce(search, 300);

  const { data: products = [], isLoading } = useStoreProducts(debouncedSearch);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (category === 'todos') return true;
      return product.categoria === category;
    });
  }, [products, category]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory('todos')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            category === 'todos'
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          Todos
        </button>

        <button
          type="button"
          onClick={() => setCategory('produtos')}
          className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
            category === 'produtos'
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          <Package className="h-3.5 w-3.5" />
          Produtos
        </button>

        <button
          type="button"
          onClick={() => setCategory('cantina')}
          className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
            category === 'cantina'
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          <Utensils className="h-3.5 w-3.5" />
          Cantina
        </button>
      </div>

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

        {!isLoading && filteredProducts.length === 0 && (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum item encontrado.
          </div>
        )}

        {filteredProducts.map((product) => {
          const outOfStock = product.quantidade < 1;

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
                      : `${product.quantidade} disponível${
                          product.quantidade > 1 ? 'eis' : ''
                        }`}
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
