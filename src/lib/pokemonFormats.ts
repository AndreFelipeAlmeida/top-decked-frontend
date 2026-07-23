export const pokemonFormats = [
  { id: 'PADRAO', name: 'Padrão' },
  { id: 'GLC', name: 'GLC' },
  { id: 'DRAFT', name: 'Draft' },
];

export const nomeDoFormato = (id: string | null | undefined) =>
  pokemonFormats.find((formato) => formato.id === id)?.name ?? id ?? '';
