export const StatusTorneio = {
  ABERTO: "ABERTO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  FINALIZADO: "FINALIZADO",
} as const;

export type StatusTorneio = typeof StatusTorneio[keyof typeof StatusTorneio];

export const CategoriaItem = {
  CANTINA: "CANTINA",
  GERAIS: "GERAIS",
} as const;

export type CategoriaItem = typeof CategoriaItem[keyof typeof CategoriaItem];

export const MesEnum = {
  Janeiro: "Jan",
  Fevereiro: "Fev",
  Marco: "Mar",
  Abril: "Abr",
  Maio: "Mai",
  Junho: "Jun",
  Julho: "Jul",
  Agosto: "Ago",
  Setembro: "Set",
  Outubro: "Out",
  Novembro: "Nov",
  Dezembro: "Dez",
} as const;

export type MesEnum = typeof MesEnum[keyof typeof MesEnum];

export const getMesAbreviado = (mes: number): string => {
  const meses: Record<number, string> = {
    1: MesEnum.Janeiro,
    2: MesEnum.Fevereiro,
    3: MesEnum.Marco,
    4: MesEnum.Abril,
    5: MesEnum.Maio,
    6: MesEnum.Junho,
    7: MesEnum.Julho,
    8: MesEnum.Agosto,
    9: MesEnum.Setembro,
    10: MesEnum.Outubro,
    11: MesEnum.Novembro,
    12: MesEnum.Dezembro,
  };
  return meses[mes] || "Desconhecido";
};