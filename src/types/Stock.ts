export interface Estoque {
  id: number;
  nome: string;
  categoria: number;
  preco: number;
  quantidade: number;
  min_quantidade: number;
}

export interface EstoqueCadastro {
  nome: string;
  categoria: number;
  preco: number;
  quantidade: number;
  min_quantidade: number;
}

export const TipoMovimentacaoItemUpdate = {
  entrada: 'entrada',
  saida: 'saida',
} as const;

export type TipoMovimentacaoItemUpdate =
  (typeof TipoMovimentacaoItemUpdate)[keyof typeof TipoMovimentacaoItemUpdate];

export interface EstoqueMovimentacao {
  quantidade: number;
  descricao: string;
  tipo: TipoMovimentacaoItemUpdate;
}

export interface Categoria {
  id: number;
  nome: string;
}

export interface CategoriaCadastro {
  nome: string;
}