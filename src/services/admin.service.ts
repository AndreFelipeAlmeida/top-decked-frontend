import { api } from "@/adapters/api";
import type { ColunaEntidade, EntidadeInfo, RegistroEntidade } from "@/types/Admin";
import type { LojaPublico } from "@/types/Store";

const resource = "/admin";

// ---------------------------------- Moderação de Lojas ----------------------------------

export const getLojasPendentes = async () => {
  const response = await api.get<LojaPublico[]>(`${resource}/lojas/pendentes`);
  return response.data;
};

export const aprovarLoja = async (lojaId: number) => {
  const response = await api.put<LojaPublico>(`${resource}/lojas/${lojaId}/aprovar`);
  return response.data;
};

export const rejeitarLoja = async (lojaId: number) => {
  const response = await api.put<LojaPublico>(`${resource}/lojas/${lojaId}/rejeitar`);
  return response.data;
};

// ---------------------------------- CRUD Dinâmico de Entidades ----------------------------------

export const getEntidades = async () => {
  const response = await api.get<EntidadeInfo[]>(`${resource}/entidades`);
  return response.data;
};

export const getColunasEntidade = async (nome: string) => {
  const response = await api.get<ColunaEntidade[]>(`${resource}/entidades/${nome}/colunas`);
  return response.data;
};

export const getRegistrosEntidade = async (nome: string) => {
  const response = await api.get<RegistroEntidade[]>(`${resource}/entidades/${nome}`);
  return response.data;
};

export const criarRegistroEntidade = async (nome: string, dados: RegistroEntidade) => {
  const response = await api.post<RegistroEntidade>(`${resource}/entidades/${nome}`, dados);
  return response.data;
};

export const atualizarRegistroEntidade = async (nome: string, registroId: string | number, dados: RegistroEntidade) => {
  const response = await api.put<RegistroEntidade>(`${resource}/entidades/${nome}/${registroId}`, dados);
  return response.data;
};

export const deletarRegistroEntidade = async (nome: string, registroId: string | number) => {
  await api.delete(`${resource}/entidades/${nome}/${registroId}`);
};
