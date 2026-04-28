import { useQueries } from '@tanstack/react-query';
import { getCategories } from '../service/category.service';
import { getStock } from '../service/product.service';

export function useStockData() {
  const [productsQuery, categoriesQuery] = useQueries({
    queries: [
      {
        queryKey: ['products'],
        queryFn: getStock,
      },
      {
        queryKey: ['categories'],
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
