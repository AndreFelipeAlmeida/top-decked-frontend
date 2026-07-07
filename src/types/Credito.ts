import type { LojaPublico } from "./Store";
import type { JogadorCriadoPublico } from "./JogadorCriado";

// game_id/tcg são só informativos agora (o primeiro Game ID que a conta
// reivindicou, em qualquer TCG) — LojaJogadorLink só guarda jogador_id (conta
// real cadastrada na plataforma), nunca mais um game_id/JogadorCriado sem
// conta (ver docs/JOGADORES.md).
export interface JogadorComTcgs {
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