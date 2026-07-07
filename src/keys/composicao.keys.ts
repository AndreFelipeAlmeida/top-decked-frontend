export const composicaoKeys = {
  all: ["composicoes"],

  unidades: (tcg: string, busca: string) => [
    ...composicaoKeys.all,
    "unidades",
    tcg,
    busca,
  ],

  representacoes: (tcg: string) => [
    ...composicaoKeys.all,
    "representacoes",
    tcg,
  ],

  partida: (rodadaId: number | undefined, linkId: number | undefined | null) => [
    ...composicaoKeys.all,
    "partida",
    rodadaId,
    linkId,
  ],
};
