// Sprites vêm direto do repositório oficial da PokeAPI — sem precisar guardar
// URL nenhuma no backend, só o external_id (número da pokedex) já resolve.
export const pokemonSpriteUrl = (externalId: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${externalId}.png`;
