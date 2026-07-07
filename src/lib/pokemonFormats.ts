// Formatos de torneio de Pokémon TCG (único jogo implementado ponta a ponta
// hoje — ver docs/COMPOSICAO.md/docs/RANKING.md). Valores em sincronia com o
// enum `FormatoTorneio` do backend (ver docs/DIVIDA_TECNICA.md item 43).
export const pokemonFormats = [
  { id: 'PADRAO', name: 'Padrão' },
  { id: 'GLC', name: 'GLC' },
  { id: 'DRAFT', name: 'Draft' },
];

export const nomeDoFormato = (id: string | null | undefined) =>
  pokemonFormats.find((formato) => formato.id === id)?.name ?? id ?? '';
