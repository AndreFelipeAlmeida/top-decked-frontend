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

/** Composição efetivamente usada numa partida específica — ver
 * docs/COMPOSICAO.md seção 9. Só editável (PATCH) pra Pokémon GO; pra
 * TCG/VGC é sempre uma cópia fiel da composição completa do jogador. */
export interface ComposicaoPartidaPublico {
  id: number;
  unidades: ComposicaoUnidade[];
}
