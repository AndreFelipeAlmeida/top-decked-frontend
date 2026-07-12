import type { LojaPublico } from './Store';

export type TipoRegraPontuacaoEvento = 'VITORIA' | 'DERROTA' | 'EMPATE' | 'PARTICIPACAO';
export type StatusEvento = 'AGENDADO' | 'ATIVO' | 'ENCERRADO';

export interface MetaEventoPublico {
  id: number;
  evento_id: number;
  pontos_necessarios: number;
  recompensa_descricao?: string | null;
  recompensa_imagem_url?: string | null;
}

export interface MetaEventoCriar {
  pontos_necessarios: number;
  recompensa_descricao?: string | null;
  recompensa_imagem_url?: string | null;
}

export interface RegraPontuacaoEventoPublico {
  id: number;
  evento_id: number;
  tipo: TipoRegraPontuacaoEvento;
  pontos: number;
}

export interface RegraPontuacaoEventoCriar {
  tipo: TipoRegraPontuacaoEvento;
  pontos: number;
}

export interface RegraPontuacaoManualEventoPublico {
  id: number;
  evento_id: number;
  descricao: string;
  pontos: number;
}

export interface RegraPontuacaoManualEventoCriar {
  descricao: string;
  pontos: number;
}

export interface ComposicaoPontoPublico {
  motivo: string;
  pontos: number;
}

export interface ParticipanteEventoPublico {
  id: number;
  jogador_criado_id: number;
  apelido?: string | null;
  game_id?: string | null;
  foto?: string | null;
  pontos_automaticos: number;
  pontos_manuais: number;
  pontos_total: number;
  composicao_pontos: ComposicaoPontoPublico[];
}

export interface PontosManualEventoCriar {
  jogador_criado_id: number;
  descricao: string;
  pontos: number;
}

export interface EventoPublico {
  id: number;
  loja_id: number;
  loja?: LojaPublico | null;
  tcg: string;
  nome: string;
  descricao?: string | null;
  data_inicio: string;
  data_fim: string;
  status: StatusEvento;
}

export interface EventoCompletoPublico extends EventoPublico {
  metas: MetaEventoPublico[];
  regras: RegraPontuacaoEventoPublico[];
  regras_manuais: RegraPontuacaoManualEventoPublico[];
  participantes: ParticipanteEventoPublico[];
}

export interface EventoCriar {
  tcg: string;
  nome: string;
  descricao?: string | null;
  data_inicio: string;
  data_fim: string;
}

export interface EventoAtualizar {
  nome?: string;
  descricao?: string | null;
  data_inicio?: string;
  data_fim?: string;
}
