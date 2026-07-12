export const temporadasKeys = {
  all: ["temporadas"] as const,
  list: (tcg: string | undefined) => [...temporadasKeys.all, "list", tcg] as const,
  listLoja: (lojaId: number | undefined, tcg: string | undefined) =>
    [...temporadasKeys.all, "list-loja", lojaId, tcg] as const,
};
