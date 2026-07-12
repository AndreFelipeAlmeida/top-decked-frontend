export interface EntidadeInfo {
  nome: string;
  label: string;
}

export type TipoColunaEntidade = "integer" | "float" | "boolean" | "date" | "datetime" | "enum" | "string";

export interface ChaveEstrangeiraColuna {
  tabela: string;
  coluna: string;
}

export interface ColunaEntidade {
  nome: string;
  tipo: TipoColunaEntidade;
  nullable: boolean;
  chave_primaria: boolean;
  enum_valores: string[] | null;
  chave_estrangeira: ChaveEstrangeiraColuna | null;
}

// Um registro genérico de qualquer entidade administrável — o valor de cada
// campo depende da coluna (ver ColunaEntidade.tipo), por isso `unknown` em
// vez de tentar tipar estruturalmente uma tabela que só existe em runtime.
export type RegistroEntidade = Record<string, unknown>;
