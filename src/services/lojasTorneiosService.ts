import { api } from "@/adapters/api";
import type { TorneioPublico, TorneioAtualizar, TorneioBase } from "@/types/Tournaments";

const resource = "/lojas/torneios";

export const getTournaments = async () => {
  const res = await api.get<TorneioPublico[]>(`${resource}/loja`);
  return res.data;
};

export const getTorneioById = async (id: string) => {
  const res = await api.get<TorneioPublico>(`${resource}/${id}`);
  return res.data;
};

export const atualizarTorneio = async (id: string, dados: TorneioAtualizar) => {
  const res = await api.put<TorneioPublico>(`${resource}/${id}`, dados);
  return res.data;
};

export const importarResultadosTorneio = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("arquivo", file);
  const res = await api.post(`${resource}/${id}/importar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const criarTorneio = async (dados: TorneioBase) => {
  const res = await api.post<TorneioPublico>(`${resource}/criar`, dados);
  return res.data;
};