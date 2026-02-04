import { api } from "@/adapters/api";
import type { LojaCriarJogador } from "@/types/Player";
import type { Loja, LojaAtualizar } from "@/types/Store";

const resource = "/lojas";

export const getPerfilLoja = async () => {
  const res = await api.get<Loja>(`${resource}/`);
  return res.data;
};

export const criarJogadorLoja = async (novo_jogador: LojaCriarJogador) => {
  const res = await api.post<Loja>(`${resource}/criar-jogador`, novo_jogador);
  return res.data;
};


export const atualizarPerfilLoja = async (dados: LojaAtualizar) => {
  const res = await api.put<Loja>(`${resource}/`, dados);
  return res.data;
};

export const uploadFotoLoja = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`${resource}/upload_foto`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};