export type PlayerTournament = {
    jogador_id: string
    nome: string
    tipo_jogador_id: number
    pontuacao: number
    pontuacao_com_regras: number
    deck?: string[]
}