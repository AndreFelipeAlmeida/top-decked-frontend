export interface Credito {
    jogador_id: number
    loja_id: number
    quantidade: number
}

export interface CreditoUpdate {
    quantidade: number
}

export interface CreditoJogador {
  id: number
  jogador_id: number
  loja_id: number
  quantidade: number
  nome_loja: string
  endereco: string
}
