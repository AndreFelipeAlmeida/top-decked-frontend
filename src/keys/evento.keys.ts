export const eventoKeys = {
  all: ["eventos"] as const,
  list: (tcg: string | undefined) => [...eventoKeys.all, "list", tcg] as const,
  listLoja: (tcg: string | undefined) => [...eventoKeys.all, "list-loja", tcg] as const,
  detail: (eventoId: number | undefined) => [...eventoKeys.all, "detail", eventoId] as const,
  jogadoresDisponiveis: (eventoId: number | undefined) =>
    [...eventoKeys.all, "jogadores-disponiveis", eventoId] as const,
};
