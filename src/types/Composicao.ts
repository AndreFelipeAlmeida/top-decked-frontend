export interface Unidade {
  id: number;
  tcg: string;
  external_id: number;
  nome: string;
}

export interface RepresentacaoComposicao {
  id: number;
  tcg: string;
  nome: string;
  unidades: Unidade[];
}

export interface ComposicaoUnidade {
  unidade_catalogo_id: number;
  unidade: Unidade;
  quantidade: number;
}

export interface ComposicaoPartidaPublico {
  id: number;
  unidades: ComposicaoUnidade[];
}
