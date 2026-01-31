import type { PlayerTournament } from "./Players"
import type { Round } from "./Round"

export type StatusTorneio = "ABERTO" | "EM_ANDAMENTO" | "FINALIZADO"

export type Tournament = {
  nome: string
  descricao: string
  cidade: string
  estado: string
  tempo_por_rodada: number
  data_inicio: Date
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
  id: string
  status: StatusTorneio
  jogadores: PlayerTournament[]
  rodadas: Round[]
}