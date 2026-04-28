import { api } from '@/adapters/api';
import type { Categoria } from '@/types/Stock';
import axios from 'axios';

const resource = '/estoque/categoria';

export const getCategories = async (): Promise<Categoria[]> => {
  try {
    const response = await api.get<Categoria[]>(`${resource}/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const updateCategory = async (
  id: number,
  updatedStock: {nome: string},
): Promise<Categoria> => {
  const response = await api.put<Categoria>(`${resource}/${id}`, updatedStock);
  return response.data;
};

export const createCategory = async (
  createdStock: Partial<Categoria>,
): Promise<Categoria> => {
  const response = await api.post<Categoria>(`${resource}/`, createdStock);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<Categoria> => {
  const response = await api.delete<Categoria>(`${resource}/${id}`);
  return response.data;
};
