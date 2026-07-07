import { categoryKeys, stockKeys } from '@/keys/stock.keys';
import { getCategories } from '@/services/category.service';
import { getStock } from '@/services/product.service';
import { useQueries } from '@tanstack/react-query';

export function useStockData() {
  const [productsQuery, categoriesQuery] = useQueries({
    queries: [
      {
        queryKey: stockKeys.all,
        queryFn: getStock,
      },
      {
        queryKey: categoryKeys.all,
        queryFn: getCategories,
      },
    ],
  });

  return {
    products: productsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
    isError: productsQuery.isError || categoriesQuery.isError,
  };
}
