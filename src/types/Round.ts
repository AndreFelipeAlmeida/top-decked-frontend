export interface Round {
    jogador1_id?: string | null
    jogador2_id?: string | null
    vencedor?: string | null
    num_rodada: number
    mesa?: number | null
    data_de_inicio?: string | null
    finalizada?: boolean
}