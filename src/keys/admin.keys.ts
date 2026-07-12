export const adminKeys = {
  all: ["admin"] as const,
  lojasPendentes: () => [...adminKeys.all, "lojas-pendentes"] as const,
  entidades: () => [...adminKeys.all, "entidades"] as const,
  colunasEntidade: (nome: string) => [...adminKeys.all, "colunas", nome] as const,
  registrosEntidade: (nome: string) => [...adminKeys.all, "registros", nome] as const,
};
