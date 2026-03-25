import { api } from "@/adapters/api";
import type { TcgOption } from "@/types/Enums";


const resource = "/tcgs";

export const obterTcgs = async () => {
    const res = await api.get<TcgOption[]>(`${resource}/`);
    return res.data;
};
