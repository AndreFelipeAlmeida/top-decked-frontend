import { api } from "@/adapters/api";
import type { LojaAtualizar, LojaPublico, LojaPublicoTorneios } from "@/types/Store";
import type { LojaJogadorOrganizadorTCG } from "@/types/Credito";

const resource = "/lojas";

export const getStores = async () => {
  const response = await api.get<LojaPublicoTorneios[]>(`${resource}/`);
  return response.data;
};

export const getStoreById = async (id: number) => {
  const response = await api.get<LojaPublico>(`${resource}/${id}`);
  return response.data;
};

export const updateMyStore = async (dados: LojaAtualizar) => {
  const response = await api.put<LojaPublico>(`${resource}/`, dados);
  return response.data;
};

export const uploadStorePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<LojaPublico>(`${resource}/upload_foto`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const uploadStoreBanner = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<LojaPublico>(`${resource}/upload_banner`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const promoteJogadorOrganizador = async (jogadorId: number, tcg: string) => {
  const response = await api.post<LojaJogadorOrganizadorTCG>(
    `${resource}/jogador/${jogadorId}/promover`,
    { tcg },
  );
  return response.data;
};

export const demoteJogadorOrganizador = async (jogadorId: number, tcg: string) => {
  const response = await api.delete<LojaJogadorOrganizadorTCG>(
    `${resource}/jogador/${jogadorId}/despromover`,
    { data: { tcg } },
  );
  return response.data;
};
