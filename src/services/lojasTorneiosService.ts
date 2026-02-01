import { api } from "@/adapters/api";
import type { Tournament } from "@/types/Tournaments";
import type { Round } from "@/types/Round";
import axios from "axios";


const resource = "/lojas/torneios";

export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const response = await api.get<Tournament[]>(`${resource}/`)
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return []
    }
    throw error
  }
}

export const createTournament = async (data: any): Promise<Tournament> => {
  const response = await api.post<Tournament>(`${resource}/criar`, data);
  return response.data;
};

// Busca os dados de um torneio específico para o console
export const getTournamentById = async (id: string): Promise<Tournament> => {
  const response = await api.get<Tournament>(`${resource}/${id}`);
  return response.data;
};

// Salva o resultado de uma partida (Round)
export const updateMatchResult = async (
  tournamentId: string, 
  matchData: Partial<Round>
): Promise<void> => {
  await api.put(`${resource}/${tournamentId}/matches`, matchData);
};

// Gera os pareamentos da próxima rodada (Suíço)
export const generateNextRound = async (tournamentId: string): Promise<void> => {
  await api.post(`${resource}/${tournamentId}/next-round`);
};

// Finaliza o torneio e define o vencedor
export const endTournament = async (tournamentId: string): Promise<void> => {
  await api.post(`${resource}/${tournamentId}/end`);
};