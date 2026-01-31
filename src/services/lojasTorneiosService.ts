import { api } from "@/adapters/api";
import type { Tournament } from "@/types/Tournaments";
import axios from "axios";


const resource = "/lojas/torneios";

export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const response = await api.get<Tournament[]>(`${resource}/profile`)
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return []
    }
    throw error
  }
}