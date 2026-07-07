// Siglas dos jogos suportados pela sidebar (ver AppLayout.tsx) — extraído pra
// cá porque outras telas (ex.: Ranking) também precisam mapear o id
// selecionado pra um nome de exibição.
export const tcgGames = [
  { id: 'POKEMON', name: 'PKMN TCG', color: 'bg-gold', disabled: false },
  { id: 'ONEPIECE', name: 'OPTCG', color: 'bg-destructive', disabled: true },
  { id: 'POKEMON_VGC', name: 'PKMN VGC', color: 'bg-primary', disabled: false },
  { id: 'POKEMON_GO', name: 'PKMN GO', color: 'bg-info', disabled: false },
];

export const nomeDoJogo = (id: string | undefined) =>
  tcgGames.find((game) => game.id === id)?.name ?? id ?? '';
