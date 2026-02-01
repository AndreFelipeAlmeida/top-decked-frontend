import { api } from "@/adapters/api";
import type { Ranking, RankingPorLoja } from "@/types/Ranking";

const resource = "/ranking";

export const getRankingGeral = async () => {
  const res = await api.get<Ranking[]>(`${resource}/geral`);
  return res.data;
};

export const getRankingMinhaLoja = async (mes?: number) => {
  const params = mes ? { mes } : {};
  const res = await api.get<RankingPorLoja[]>(`${resource}/lojas`, { params });
  return res.data;
};