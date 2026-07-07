import axios from 'axios';
import { api } from '@/adapters/api';
import type { Categoria } from '@/types/Stock';

const resource = '/estoque/categoria';

export const getCategories = async (): Promise<Categoria[]> => {
  try {
    const res = await api.get<Categoria[]>(`${resource}/`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const updateCategory = async (id: number, updatedCategory: { nome: string }): Promise<Categoria> => {
  const res = await api.put<Categoria>(`${resource}/${id}`, updatedCategory);
  return res.data;
};

export const createCategory = async (createdCategory: Partial<Categoria>): Promise<Categoria> => {
  const res = await api.post<Categoria>(`${resource}/`, createdCategory);
  return res.data;
};

export const deleteCategory = async (id: number): Promise<Categoria> => {
  const res = await api.delete<Categoria>(`${resource}/${id}`);
  return res.data;
};
