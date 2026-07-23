import type { LojaPublico } from "./Store";
import type { JogadorCriadoPublico } from "./JogadorCriado";

export interface JogadorComTcgs {
  nome: string;
  tcgs: JogadorCriadoPublico[];
}

export interface Credito {
    jogador_id: number;
    loja_id: number;
    creditos: number;
}

export interface CreditoPublico {
  id: number;
  jogador_id: number;
  loja_id: number;
  creditos: number;
  apelido: string;
  jogador?: JogadorComTcgs | null;
  game_id?: string | null;
  tcg?: string | null;
}

export interface LojaJogadorLink {
  id: number;
  jogador_id: number;
  loja_id: number;
  creditos: number;
  apelido?: string | null;
  organizacoes?: LojaJogadorOrganizadorTCG[];
}

export interface CreditoJogador {
  id: number
  jogador_id: number
  loja_id: number
  creditos: number
  nome_loja: string
  endereco: string
  jogador?: JogadorComTcgs | null
  game_id?: string | null
  tcg?: string | null
}

export interface LojaJogadorOrganizadorTCG {
  id: number
  loja_jogador_link_id: number
  tcg: string
}

export interface LojaJogadorPublico extends CreditoPublico {
  loja: LojaPublico
  organizacoes: LojaJogadorOrganizadorTCG[]
}