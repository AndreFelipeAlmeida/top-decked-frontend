import type { UsuarioPublico } from "./User";

export type StatusAprovacaoLoja = "PENDENTE" | "APROVADA" | "REJEITADA";

export interface LojaBase {
  nome: string;
  endereco?: string | null;
  telefone?: string | null;
  site?: string | null;
  banner?: string | null;
}

export interface LojaPublico extends LojaBase {
  id: number;
  usuario: UsuarioPublico;
  status: StatusAprovacaoLoja;
  slug: string;
}

export interface LojaPublicoTorneios extends LojaPublico {
  n_torneios: number;
}

export interface LojaCriar extends LojaBase {
  email?: string;
  senha?: string;
}

export interface LojaAtualizar {
  nome?: string;
  endereco?: string;
  email?: string;
  senha?: string;
  telefone?: string;
  site?: string;
}