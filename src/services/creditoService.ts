import { api } from "@/adapters/api";
import type { Credito, CreditoUpdate } from "@/types/Credito";


const resource = "/creditos";

export const updateCredits = async (id: number, updatedStock: CreditoUpdate): Promise<Credito> => {
    const response = await api.put<Credito>(`${resource}/${id}`, updatedStock)
    return response.data
}
