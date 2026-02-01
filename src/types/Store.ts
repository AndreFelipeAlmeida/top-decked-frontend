import type { UsuarioPublico } from "./User";

export interface LojaBase {
  nome: string;
  endereco: string;
  telefone?: string | null;
  site?: string | null;
  banner?: string | null;
}

export interface Loja extends LojaBase {
  id: number;
  usuario: UsuarioPublico;
}

export interface LojaPublicoTorneios extends Loja {
  n_torneios: number;
}

export interface LojaCriar extends LojaBase {
  email: string;
  senha: string;
}

export interface LojaAtualizar extends Partial<LojaBase> {
  email?: string;
  senha?: string;
}