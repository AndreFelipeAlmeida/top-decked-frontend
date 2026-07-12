export const tournamentsKeys = {
  all: ["tournaments"],

  // Precisa ser diferenciada por papel: jogador busca todos os torneios
  // (getTournaments) e loja busca só os seus (getTournamentsByStore) — usar
  // a mesma chave pras duas fazia o React Query servir cache de uma consulta
  // pra outra ao trocar de papel/conta, mostrando lista errada ou vazia.
  list: (type: string) => [
    ...tournamentsKeys.all,
    'list',
    type,
  ],

  detail: (id: string | undefined) => [
    ...tournamentsKeys.all,
    'detail',
    id,
  ],

  organizadoresDisponiveisJuiz: (id: string | undefined) => [
    ...tournamentsKeys.all,
    'organizadores-disponiveis-juiz',
    id,
  ],
}