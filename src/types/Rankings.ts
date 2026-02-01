export interface Ranking {
    jogador_id: number
    nome: string
    pontos: number
    vitorias: number
    derrotas: number
    empates: number
    win_rate: number
    torneios_jogados: number
}

export interface RankingPorLoja extends Ranking {
    loja_id: number
    nome_loja: string
}

export interface RankingPorFormato {
    formato: string
    vitorias: number
    derrotas: number
    pontos: number
    win_rate: number
}