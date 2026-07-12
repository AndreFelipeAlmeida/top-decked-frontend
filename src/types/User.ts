export type UserRole = 'loja' | 'jogador' | 'admin'

export type User = {
    id: number
    tipo: UserRole
    nome: string
    email: string
    usuario_id: number
    endereco?: string | null
}

export interface UsuarioPublico {
    id: number
    nome: string
    email: string
    foto?: string | null
}