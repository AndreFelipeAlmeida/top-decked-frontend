import axios from 'axios';
import { api } from '@/adapters/api';
import type { Estoque, EstoqueCadastro, EstoqueMovimentacao } from '@/types/Stock';

const resource = '/lojas/item';

export const getStock = async (): Promise<Estoque[]> => {
  try {
    const response = await api.get<Estoque[]>(`${resource}/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const getVendableStock = async (): Promise<Estoque[]> => {
  try {
    const response = await api.get<Estoque[]>(`${resource}/`, {
      params: { apenas_vendaveis: true },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const updateStock = async (
  id: number,
  updatedStock: EstoqueCadastro,
): Promise<Estoque> => {
  const response = await api.put<Estoque>(`${resource}/${id}`, updatedStock);
  return response.data;
};

export const updateItemCategory = async (
  id: number,
  categoria: number,
): Promise<Estoque> => {
  const response = await api.put<Estoque>(`${resource}/${id}`, { categoria });
  return response.data;
};

export const updateQuantity = async (
  id: number,
  updatedStock: EstoqueMovimentacao,
): Promise<Estoque> => {
  const response = await api.patch<Estoque>(`${resource}/${id}/movimentar`, updatedStock);
  return response.data;
};

export const createStock = async (
  createdStock: Partial<Estoque>,
): Promise<Estoque> => {
  const response = await api.post<Estoque>(`${resource}/`, createdStock);
  return response.data;
};

export const deleteStock = async (id: number): Promise<Estoque> => {
  const response = await api.delete<Estoque>(`${resource}/${id}`);
  return response.data;
};
