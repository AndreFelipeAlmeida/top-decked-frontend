import { StatusTorneio } from "./Enums";
import type { LojaPublico } from "./Store";
import type { ComposicaoUnidade, RepresentacaoComposicao } from "./Composicao";

export interface JogadorTorneioLinkPublico {
  id?: number | null;
  jogador_criado_id: number;
  jogador_id?: number | null;
  tipo?: 'JOGADOR' | 'JUIZ' | 'JOGADOR_E_JUIZ';
  regra_extra_id?: number | null;
  pontuacao: number;
  pontuacao_com_regras: number;
  apelido?: string | null;
  game_id?: string | null;
  composicao_representacao_id?: number | null;
  composicao_representacao?: RepresentacaoComposicao | null;
  composicao_unidades?: ComposicaoUnidade[];
  vitorias?: number;
  derrotas?: number;
  empates?: number;
  byes?: number;
  porcentagem_vitorias_oponentes?: number | null;
  porcentagem_vitorias_oponentes_oponentes?: number | null;
  classificacao_oficial?: number | null;
  categoria?: string | null;
  posicao_ranking?: number | null;
}

export interface RodadaPublico {
  id: number;
  jogador1_id?: number | null;
  jogador2_id?: number | null;
  vencedor_id?: number | null;
  num_rodada: number;
  mesa?: number | null;
  data_de_inicio?: string | null;
  finalizada?: boolean;
}

export interface TorneioBase {
  nome?: string | null;
  descricao?: string | null;
  cidade?: string | null;
  estado?: string | null;
  tempo_por_rodada: number;
  data_planejada: string;
  vagas: number;
  hora_planejada?: string | null;
  formato?: string | null;
  melhor_de?: string | null;
  jogo?: string | null;
  tipo?: string | null;
  taxa: number;
  premio?: string | null;
  n_rodadas: number;
  rodada_atual: number;
  regra_basica_id?: number | null;
  pontuacao_de_participacao: number;
  /** Momento real (não planejado) de início/fim do torneio — usado para calcular horas jogadas. */
  inicio_real?: string | null;
  fim_real?: string | null;
  /** Se este torneio conta pontos automáticos nos Eventos ativos do período dele. Default true. */
  conta_em_eventos: boolean;
}

export interface TorneioPublico extends TorneioBase {
  id: string;
  status: StatusTorneio;
  jogadores: JogadorTorneioLinkPublico[];
  rodadas?: RodadaPublico[];
  loja?: LojaPublico;
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