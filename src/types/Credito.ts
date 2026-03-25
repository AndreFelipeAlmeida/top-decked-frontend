export interface Credito {
    jogador_id: number;
    loja_id: number;
    creditos: number;
}

export interface CreditoUpdate {
    creditos: number;
}

export interface CreditoJogador {
  id: number
  jogador_id: number
  loja_id: number
  creditos: number
  nome_loja: string
  endereco: string
}
