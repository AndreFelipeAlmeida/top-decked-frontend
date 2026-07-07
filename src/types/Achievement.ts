export interface ConquistaNivel {
  nivel: number;
  nome_nivel: string;
  meta: number;
}

export interface Conquista {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: string;
  icone: string;
  tcg?: string | null;
  niveis: ConquistaNivel[];
}

export interface JogadorConquista {
  conquista: Conquista;
  progresso_atual: number;
  nivel_atual: number;
  nivel_atual_em?: string | null;
}

export interface HistoricoConquista {
  conquista_codigo: string;
  conquista_nome: string;
  conquista_icone: string;
  categoria: string;
  nivel: number;
  nome_nivel: string;
  conquistado_em: string;
}
