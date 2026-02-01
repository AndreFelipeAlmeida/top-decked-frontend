import type { UsuarioPublico } from './User';

export type MesEnum = 
    | "Jan" | "Fev" | "Mar" | "Abr" | "Mai" | "Jun" 
    | "Jul" | "Ago" | "Set" | "Out" | "Nov" | "Dez";

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

export interface JogadorLojaPublico extends JogadorPublico {
    creditos: number
}
export interface JogadorPublicoLoja extends JogadorBase {
    id: number
    pokemon_id: string | null
    tipo_jogador_id: number | null
}

export interface JogadorCriar extends JogadorBase {
    email: string
    senha: string
    pokemon_id?: string | null
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

export interface TipoJogador {
  id: number;
  nome: string;
  bonus_pontuacao: number;
  loja_id: number;
}