import type { TorneioJogadorPublico } from './Tournaments';

export type MesEnum = 
    | "Jan" | "Fev" | "Mar" | "Abr" | "Mai" | "Jun" 
    | "Jul" | "Ago" | "Set" | "Out" | "Nov" | "Dez";
    
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
    rank_geral: number;
    rank_mensal: number;
    rank_anual: number;
    estatisticas_anuais: EstatisticasAnuais[];
    historico: TorneioJogadorPublico[];
}