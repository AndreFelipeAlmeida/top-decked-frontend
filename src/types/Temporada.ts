export interface TemporadaPublico {
  id: number;
  loja_id: number;
  tcg: string;
  nome?: string | null;
  ano_inicio: number;
  mes_inicio: number;
  ano_fim: number;
  mes_fim: number;
}

export interface TemporadaCriar {
  tcg: string;
  nome?: string | null;
  ano_inicio: number;
  mes_inicio: number;
  ano_fim: number;
  mes_fim: number;
}
