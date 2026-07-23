import type { TorneioJogadorPublico } from './Tournaments';
import type { MesEnum} from './Enums'
    
export interface EstatisticasAnuais {
    mes: MesEnum;
    ano: number;
    pontos: number;
    vitorias: number;
    derrotas: number;
    empates: number;
}

export interface JogadorEstatisticas {
    torneio_totais: number;
    taxa_vitoria: number;
    rank_geral: number | null;
    rank_mensal: number | null;
    rank_anual: number | null;
    estatisticas_anuais: EstatisticasAnuais[];
    historico: TorneioJogadorPublico[];
    vitorias: number;
    derrotas: number;
    empates: number;
}