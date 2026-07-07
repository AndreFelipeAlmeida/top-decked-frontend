export interface JogadorCriadoPublico {
  id: number;
  game_id: string;
  tcg: string;
  apelido?: string | null;
  jogador_id?: number | null;
}
