export type MotivoPontuacaoExtra = 'NOVATO' | 'JUIZ' | 'OUTROS';

export interface PontuacaoExtraCriar {
  jogador_criado_id: number;
  motivo: MotivoPontuacaoExtra;
  descricao?: string | null;
  pontos: number;
}

export interface PontuacaoExtraPublico extends PontuacaoExtraCriar {
  id: number;
  torneio_id: string;
  criado_em: string;
  apelido?: string | null;
  game_id?: string | null;
  torneio_nome?: string | null;
  jogo?: string | null;
}
