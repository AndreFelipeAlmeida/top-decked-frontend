import type { UsuarioPublico } from './User';

export interface JogadorBase {
    nome: string
    telefone: string | null
    data_nascimento: string | Date | null
}

export interface JogadorPublico extends JogadorBase {
    id: number
    usuario: UsuarioPublico | null
    pokemon_id: string | null
}

export interface JogadorLojaPublico {
    id: number
    nome: string
    pokemon_id: string | null
    creditos: number
}
export interface JogadorPublicoLoja extends JogadorBase {
    id: number
    pokemon_id: string | null
    tipo_jogador_id: number | null
}

export interface JogadorCriar {
    nome: string
    email: string
    senha: string
}

export type JogadorUpdate = Partial<JogadorCriar>

export interface PlayerTournament {
    jogador_id: string;
    nome: string;
    tipo_jogador_id: number;
    pontuacao: number;
    pontuacao_com_regras: number;
    deck?: string[];
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
  loja: number;
}

export interface LojaCriarJogador {
    nome: string
    pokemon_id: string
}