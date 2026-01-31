import type { UsuarioPublico } from './User';

export interface LojaBase {
    nome: string
    endereco: string | null
    telefone: string | null
    site: string | null
    banner?: string | null
}

export interface LojaPublico extends LojaBase {
    id: number
    usuario: UsuarioPublico
}

export interface LojaPublicoTorneios extends LojaPublico {
    n_torneios: number
}

export interface LojaCriar extends LojaBase {
    email: string
    senha: string
}

export type LojaAtualizar = Partial<LojaCriar>;