import { api } from "@/adapters/api";
import type { 
  LojaPublico, 
  LojaPublicoTorneios, 
  LojaCriar, 
  LojaAtualizar 
} from "@/types/Store";
import type { JogadorPublico, JogadorBase } from "@/types/Players";

const resource = "/lojas";

export const criarLoja = async (data: LojaCriar) => {
  const res = await api.post<LojaPublico>(`${resource}/`, data);
  return res.data;
};

export const listarLojas = async () => {
  const res = await api.get<LojaPublicoTorneios[]>(`${resource}/`);
  return res.data;
};

export const obterLojaPorId = async (id: number) => {
  const res = await api.get<LojaPublico>(`${resource}/${id}`);
  return res.data;
};

export const atualizarLoja = async (data: LojaAtualizar) => {
  const res = await api.put<LojaPublico>(`${resource}/`, data);
  return res.data;
};

// --- Uploads ---
export const uploadFotoLoja = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<LojaPublico>(`${resource}/upload_foto`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const uploadBannerLoja = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<LojaPublico>(`${resource}/upload_banner`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

// --- Jogador ---
export const criarTipoJogador = async (data: JogadorBase) => {
  const res = await api.post<JogadorPublico>(`${resource}/tipoJogador/`, data);
  return res.data;
};

export const listarTiposJogador = async () => {
  const res = await api.get<JogadorPublico[]>(`${resource}/tipoJogador/`);
  return res.data;
};