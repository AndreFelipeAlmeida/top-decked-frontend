import { StatusTorneio } from "./Enums";

export interface TorneioBase {
  nome: string;
  descricao?: string | null;
  cidade: string;
  estado: string;
  data_inicio: string;
  vagas: number;
  hora?: string | null;
  formato?: string | null;
  tipo?: string | null;
  taxa: number;
  premio?: string | null;
  n_rodadas: number;
  tempo_por_rodada: number;
  regra_basica_id?: number;
}

export interface TorneioPublico extends TorneioBase {
  id: string;
  status: StatusTorneio;
  rodada_atual: number;
  jogadores: any[];
  rodadas?: any[];
  loja?: any;
}

export interface TorneioJogadorPublico extends TorneioBase {
  id: string;
  pontuacao: number;
  status: StatusTorneio;
  colocacao: number;
  participantes: number;
}

export interface TorneioAtualizar extends Partial<TorneioBase> {
  regra_basica_id?: number;
  regras_adicionais?: Record<string, number>;
}