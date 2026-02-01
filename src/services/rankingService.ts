import { api } from "@/adapters/api";
import type { Ranking, RankingPorLoja, RankingPorFormato } from "@/types/Rankings";

const resource = "/ranking";

export const getRankingGeral = async () => {
  const res = await api.get<Ranking[]>(`${resource}/geral`);
  return res.data;
};

export const getRankingPorLoja = async (mes?: number) => {
  const params = mes ? { mes } : {};
  const res = await api.get<RankingPorLoja[]>(`${resource}/lojas`, { params });
  return res.data;
};

export const getDesempenhoPessoal = async () => {
  const res = await api.get<RankingPorFormato[]>(`${resource}/desempenho`);
  return res.data;
};