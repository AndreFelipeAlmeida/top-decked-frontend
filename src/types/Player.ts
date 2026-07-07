import type { LojaJogadorLink, LojaJogadorPublico } from './Credito';
import type { GameIDPublico } from './GameID';
import type { JogadorCriadoPublico } from './JogadorCriado';
import type { UsuarioPublico } from './User';

export interface JogadorBase {
  nome: string;
  telefone: string | null;
  data_nascimento: string | Date | null;
}

export type GetPlayersResponse = {
  data: PaginatedJogadorPublico[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export interface PaginatedJogadorPublico extends JogadorPublico {
  lojas: LojaJogadorLink[];
}

export interface JogadorPublico extends JogadorBase {
  id: number;
  usuario: UsuarioPublico | null;
  tcgs: JogadorCriadoPublico[];
}

export interface JogadorLojaPublico {
  id: number;
  nome: string;
  game_id: GameIDPublico;
  creditos: number;
}
export interface JogadorPublicoLoja extends JogadorBase {
  id: number;
  tcgs: JogadorCriadoPublico[] | null;
  tipo_jogador_id: number | null;
}

export interface JogadorCriar {
  nome?: string;
  email?: string;
  senha?: string;
}

export interface JogadorUpdate {
  nome?: string | null;
  senha?: string | null;
  tcgs?: GameIDPublico[] | null;
  telefone?: string | null;
  email?: string | null;
  data_nascimento?: string | null;
}

export interface PlayerTournament {
  jogador_id: string;
  nome: string;
  tipo_jogador_id: number;
  pontuacao: number;
  pontuacao_com_regras: number;
  composicao?: string[];
}

export interface TipoJogadorBase {
  nome: string;
  pt_vitoria: number;
  pt_derrota: number;
  pt_empate: number;
  pt_oponente_perde?: number;
  pt_oponente_ganha?: number;
  pt_oponente_empate?: number;
  tcg: string;
}

export interface TipoJogadorPublico extends TipoJogadorBase {
  id: number;
}

export interface LojaCriarJogador {
  apelido: string;
  game_id: GameIDPublico;
}

export interface JogadorCompleto extends JogadorPublico {
  lojas: LojaJogadorPublico[]
}

export interface ImpactoTrocaGameId {
  tcg: string;
  game_id_atual: string | null;
  torneios_importados: number;
}