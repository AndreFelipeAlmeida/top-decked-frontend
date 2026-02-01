
export type CategoriaItem = "GERAIS" | "CANTINA"


export interface Estoque {
  id?: number;
  nome: string;
  categoria: CategoriaItem;
  preco: number;
  quantidade: number;
  min_quantidade: number;
}