import { api } from "@/adapters/api";
import type { Estoque } from "@/types/Stock";
import axios from "axios";


const resource = "/lojas/estoque";

export const getStock = async (): Promise<Estoque[]> => {
  try {
    const response = await api.get<Estoque[]>(`${resource}/`)
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return []
    }
    throw error
  }
}

export const updateStock = async (id: number, updatedStock: Estoque): Promise<Estoque> => {
    const response = await api.put<Estoque>(`${resource}/${id}`, updatedStock)
    return response.data
}

export const createStock = async (createdStock: Partial<Estoque>): Promise<Estoque> => {
    const response = await api.post<Estoque>(`${resource}/`, createdStock)
    return response.data
}

export const deleteStock = async (id: number): Promise<Estoque> => {
    const response = await api.delete<Estoque>(`${resource}/${id}`)
    return response.data
}