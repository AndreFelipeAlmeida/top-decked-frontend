import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockKeys } from '@/keys/stock.keys';
import { getVendableStock } from '@/services/product.service';
import type { Estoque } from '@/types/Stock';

export function useStoreProducts(search: string) {
  const query = useQuery<Estoque[]>({
    queryKey: stockKeys.vendaveis,
    queryFn: getVendableStock,
  });

  const produtos = useMemo(() => {
    const termo = search.trim().toLowerCase();
    const itens = query.data ?? [];
    if (!termo) return itens;
    return itens.filter((item) => item.nome.toLowerCase().includes(termo));
  }, [query.data, search]);

  return { ...query, data: produtos };
}
