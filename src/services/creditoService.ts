import { api } from "@/adapters/api";
import type { Credito, CreditoJogador, CreditoUpdate } from "@/types/Credito";


const resource = "/creditos";

export const updateCredits = async (id: number, updatedStock: CreditoUpdate): Promise<Credito> => {
    const response = await api.put<Credito>(`${resource}/${id}`, updatedStock)
    return response.data
}


export const addCredits = async (id: number, addCredits: number): Promise<Credito> => {
    const response = await api.patch<Credito>(`${resource}/${id}/adicionar-credito`, 
                                            {novos_creditos: addCredits})
    return response.data
}

export const removeCredits = async (id: number, removeCredits: number): Promise<Credito> => {
    const response = await api.patch<Credito>(`${resource}/${id}/remover-credito`, 
                                            {retirar_creditos: removeCredits})
    return response.data
}

export const getPlayerCredits = async (): Promise<CreditoJogador[]> => {
    const response = await api.get<CreditoJogador[]>(`${resource}/jogador`)
    return response.data
}