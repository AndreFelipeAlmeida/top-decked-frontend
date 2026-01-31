export type UserRole = 'loja' | 'jogador'

export type User = {
    id : number
    tipo: UserRole  
    nome: string
    email: string
    usuario_id: number
    endereco: string
}