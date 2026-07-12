import { api } from "@/adapters/api";
import type { TemporadaCriar, TemporadaPublico } from "@/types/Temporada";

const resource = "/lojas/temporadas";

export const getTemporadas = async (tcg: string | undefined) => {
  const response = await api.get<TemporadaPublico[]>(`${resource}/`, {
    params: { tcg },
  });
  return response.data;
};

export const getTemporadasLoja = async (lojaId: number | undefined, tcg: string | undefined) => {
  const response = await api.get<TemporadaPublico[]>(`${resource}/loja/${lojaId}`, {
    params: { tcg },
  });
  return response.data;
};

export const createTemporada = async (dados: TemporadaCriar) => {
  const response = await api.post<TemporadaPublico>(`${resource}/`, dados);
  return response.data;
};

export const createTemporadaOrganizador = async (dados: TemporadaCriar & { loja_id: number }) => {
  const response = await api.post<TemporadaPublico>(`${resource}/organizador`, dados);
  return response.data;
};

export const deleteTemporada = async (id: number) => {
  await api.delete(`${resource}/${id}`);
};
