export interface Ranking {
  jogador_id: string | null;
  nome_jogador: string;
  pontos: number;
  torneios: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  taxa_vitoria: number;
}

export interface RankingPorLoja extends Ranking {
  nome_loja: string;
}