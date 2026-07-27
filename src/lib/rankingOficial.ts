export const CATEGORIAS_OFICIAIS = ['Junior', 'Senior', 'Master'] as const;
export type CategoriaFiltro = 'todos' | (typeof CATEGORIAS_OFICIAIS)[number];

type LinkComRanking = {
  categoria?: string | null;
  classificacao_oficial?: number | null;
  posicao_ranking?: number | null;
};

/**
 * "Todos": usa a posição já calculada pelo backend (pontos -> OMW% -> OOMW%
 * -> confronto direto -> sorteio). Categoria específica: mostra só quem tem
 * aquela categoria e ordena pela colocação estática trazida da importação
 * (classificacao_oficial), sem recalcular nada — quem não tem colocação
 * pra essa categoria (torneio nunca importado) fica ao final.
 */
export function ordenarPorRankingOficial<T extends LinkComRanking>(
  links: T[],
  categoriaFiltro: CategoriaFiltro,
): T[] {
  if (categoriaFiltro === 'todos') {
    return [...links].sort(
      (a, b) => (a.posicao_ranking ?? Number.MAX_SAFE_INTEGER) - (b.posicao_ranking ?? Number.MAX_SAFE_INTEGER),
    );
  }

  return links
    .filter((link) => link.categoria === categoriaFiltro)
    .sort(
      (a, b) => (a.classificacao_oficial ?? Number.MAX_SAFE_INTEGER) - (b.classificacao_oficial ?? Number.MAX_SAFE_INTEGER),
    );
}
