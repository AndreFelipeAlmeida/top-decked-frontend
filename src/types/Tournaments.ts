import type { PlayerTournament } from "./Players"
import type { Round } from "./Round"

export type StatusTorneio = "ABERTO" | "EM_ANDAMENTO" | "FINALIZADO"

export interface Tournament {
    id: string
    nome: string
    descricao: string
    cidade: string
    estado: string
    tempo_por_rodada: number
    data_inicio: Date | string
    vagas: number
    hora: string
    formato: string
    tipo: string
    taxa: number
    premio: string
    n_rodadas: number
    rodada_atual: number
    regra_basica_id: number
    pontuacao_de_participacao: number
    status: StatusTorneio
    jogadores: PlayerTournament[]
    rodadas: Round[]
}

export interface TorneioJogadorPublico extends Omit<Tournament, 'jogadores' | 'rodadas'> {
    colocacao: number
    participantes: number
    pontuacao: number
}