import { api } from "@/adapters/api";
import type { TcgOption } from "@/types/Enums";

const resource = "/tcgs";

export const getTcgs = async () => {
  const response = await api.get<TcgOption[]>(`${resource}/`);
  return response.data;
};
