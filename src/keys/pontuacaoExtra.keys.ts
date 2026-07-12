export const pontuacaoExtraKeys = {
  all: ["pontuacaoExtra"] as const,
  porTorneio: (torneioId: string | undefined) => [...pontuacaoExtraKeys.all, "torneio", torneioId] as const,
  jogadoresDisponiveis: (torneioId: string | undefined, motivo: string | undefined) =>
    [...pontuacaoExtraKeys.all, "jogadores-disponiveis", torneioId, motivo] as const,
  historico: (tcg: string | undefined) => [...pontuacaoExtraKeys.all, "historico", tcg] as const,
  historicoOrganizador: (lojaId: number | undefined, tcg: string | undefined) =>
    [...pontuacaoExtraKeys.all, "historico-organizador", lojaId, tcg] as const,
};
