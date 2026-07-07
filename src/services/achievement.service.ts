import { api } from "@/adapters/api";
import type { HistoricoConquista, JogadorConquista } from "@/types/Achievement";

const resource = "/jogadores/conquistas";

export const getMyAchievements = async () => {
  const response = await api.get<JogadorConquista[]>(`${resource}`);
  return response.data;
};

export const getMyAchievementHistory = async () => {
  const response = await api.get<HistoricoConquista[]>(`${resource}/historico`);
  return response.data;
};

export const recalculateAchievements = async () => {
  const response = await api.post<JogadorConquista[]>(`${resource}/recalcular`);
  return response.data;
};
